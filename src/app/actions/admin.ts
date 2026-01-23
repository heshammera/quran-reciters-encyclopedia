"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { hasPermission } from "@/lib/permissions";
import { getCurrentAdminUser } from "@/lib/auth";

/**
 * Delete a reciter by ID
 */
export async function deleteReciter(id: string) {
    const user = await getCurrentAdminUser();

    if (!hasPermission(user, 'reciters', 'delete')) {
        throw new Error("ليس لديك صلاحية لحذف القراء");
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from("reciters")
        .delete()
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/reciters");
    return { success: true };
}

/**
 * Delete a recording by ID
 */
export async function deleteRecording(id: string) {
    const user = await getCurrentAdminUser();

    if (!hasPermission(user, 'recordings', 'delete')) {
        throw new Error("ليس لديك صلاحية لحذف التسجيلات");
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from("recordings")
        .delete()
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }


    revalidatePath("/admin/recordings");
    revalidatePath("/admin/videos");
    return { success: true };
}

/**
 * Get usage count for a section
 */
export async function getSectionUsageCount(id: string) {
    const supabase = await createClient();
    const { count, error } = await supabase
        .from("recordings")
        .select("*", { count: 'exact', head: true })
        .eq("section_id", id);

    if (error) throw new Error(error.message);
    return count || 0;
}

/**
 * Delete a section with optional recording migration
 */
export async function deleteSection(id: string, migrateToSectionId?: string) {
    const user = await getCurrentAdminUser();

    if (!hasPermission(user, 'sections', 'delete')) {
        throw new Error("ليس لديك صلاحية لحذف الأقسام");
    }

    const supabase = await createClient();

    // 1. Check if safe to delete
    if (!migrateToSectionId) {
        const usage = await getSectionUsageCount(id);
        if (usage > 0) {
            throw new Error(`لا يمكن حذف القسم لأنه يحتوي على ${usage} تسجيلات. يرجى نقلها أولاً.`);
        }
    } else {
        // 2. Migrate recordings if target provided
        const { error: migrationError } = await supabase
            .from("recordings")
            .update({ section_id: migrateToSectionId })
            .eq("section_id", id);

        if (migrationError) throw new Error("فشل نقل التسجيلات: " + migrationError.message);
    }

    // 3. Delete the section
    const { error } = await supabase
        .from("sections")
        .delete()
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/sections");
    return { success: true };
}
