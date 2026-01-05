
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ChangeLog = {
    id: string;
    version: string;
    title: string;
    description_markdown: string;
    release_date: string;
    change_type: 'major' | 'minor' | 'patch' | 'feature' | 'fix';
    is_published: boolean;
    created_at: string;
};

export async function getChangeLogs(publishedOnly = true) {
    const supabase = await createClient();

    let query = supabase
        .from("change_logs")
        .select("*")
        .order("release_date", { ascending: false });

    if (publishedOnly) {
        query = query.eq("is_published", true);
    }

    const { data: logs, error } = await query;

    if (error) throw new Error(error.message);
    return logs as ChangeLog[];
}

export async function createChangeLog(data: Omit<ChangeLog, "id" | "created_at">) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("change_logs")
        .insert({
            ...data,
            created_by: (await supabase.auth.getUser()).data.user?.id
        });

    if (error) throw new Error(error.message);

    revalidatePath("/changelog");
    return { success: true };
}
