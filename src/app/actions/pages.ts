
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type StaticPage = {
    id: string;
    slug: string;
    title_ar: string;
    content_markdown: string;
    is_published: boolean;
    updated_at: string;
};

export async function getStaticPages() {
    const supabase = await createClient();

    // Only admins/editors can see this via RLS, but let's be safe
    const { data: pages, error } = await supabase
        .from("static_pages")
        .select("*")
        .order("title_ar");

    if (error) throw new Error(error.message);
    return pages as StaticPage[];
}

export async function getStaticPageBySlug(slug: string) {
    const supabase = await createClient();

    const { data: page, error } = await supabase
        .from("static_pages")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) return null;
    return page as StaticPage;
}

export async function updateStaticPage(id: string, data: Partial<StaticPage>) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("static_pages")
        .update({
            ...data,
            last_updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/pages");
    revalidatePath(`/${data.slug}`); // Revalidate public page if slug changed or content updated
    return { success: true };
}

export async function createStaticPage(data: Omit<StaticPage, "id" | "updated_at">) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("static_pages")
        .insert({
            ...data,
            last_updated_by: (await supabase.auth.getUser()).data.user?.id
        });

    if (error) throw new Error(error.message);

    revalidatePath("/admin/pages");
    return { success: true };
}
