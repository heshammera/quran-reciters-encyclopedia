"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Delete a reciter by ID
 */
export async function deleteReciter(id: string) {
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
