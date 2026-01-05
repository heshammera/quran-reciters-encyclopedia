
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getCollections() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
}

export async function getCollection(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("collections")
        .select(`
            *,
            collection_items (
                id,
                recording_id,
                display_order,
                recordings (
                    id,
                    surah_number,
                    reciters (name_ar),
                    sections (name_ar)
                )
            )
        `)
        .eq("id", id)
        .single();

    if (error) throw new Error(error.message);

    // Sort items by display_order
    if (data.collection_items) {
        data.collection_items.sort((a: any, b: any) => a.display_order - b.display_order);
    }

    return data;
}

export async function createCollection(formData: FormData) {
    const supabase = await createClient();

    const payload = {
        title_ar: formData.get("title_ar") as string,
        slug: formData.get("slug") as string,
        description_ar: formData.get("description_ar") as string,
        cover_image_url: formData.get("cover_image_url") as string,
        is_published: formData.get("is_published") === "true",
        is_featured: formData.get("is_featured") === "true",
    };

    const { data, error } = await supabase
        .from("collections")
        .insert([payload])
        .select()
        .single();

    if (error) throw new Error(error.message);

    revalidatePath("/admin/collections");
    return { success: true, id: data.id };
}

export async function updateCollection(id: string, formData: FormData) {
    const supabase = await createClient();

    const payload = {
        title_ar: formData.get("title_ar") as string,
        slug: formData.get("slug") as string,
        description_ar: formData.get("description_ar") as string,
        cover_image_url: formData.get("cover_image_url") as string,
        is_published: formData.get("is_published") === "true",
        is_featured: formData.get("is_featured") === "true",
    };

    const { error } = await supabase
        .from("collections")
        .update(payload)
        .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/collections");
    revalidatePath(`/admin/collections/${id}`);
    revalidatePath(`/collections/${payload.slug}`);
    return { success: true };
}

export async function deleteCollection(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("collections")
        .delete()
        .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/collections");
    return { success: true };
}

// Item Management Actions
export async function addCollectionItem(collectionId: string, recordingId: string) {
    const supabase = await createClient();

    // Get max order
    const { data: maxOrderData } = await supabase
        .from("collection_items")
        .select("display_order")
        .eq("collection_id", collectionId)
        .order("display_order", { ascending: false })
        .limit(1)
        .single();

    const nextOrder = (maxOrderData?.display_order || 0) + 1;

    const { error } = await supabase
        .from("collection_items")
        .insert({
            collection_id: collectionId,
            recording_id: recordingId,
            display_order: nextOrder
        });

    if (error) throw new Error(error.message);

    revalidatePath(`/admin/collections/${collectionId}`);
    return { success: true };
}

export async function removeCollectionItem(itemId: string, collectionId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("collection_items")
        .delete()
        .eq("id", itemId);

    if (error) throw new Error(error.message);

    revalidatePath(`/admin/collections/${collectionId}`);
    return { success: true };
}

export async function reorderCollectionItems(items: { id: string, display_order: number }[], collectionId: string) {
    const supabase = await createClient();

    // Use upsert to update multiple rows
    const { error } = await supabase
        .from("collection_items")
        .upsert(items.map(item => ({
            id: item.id,
            display_order: item.display_order,
            collection_id: collectionId // Required for constraint/upsert but won't change
        })));

    if (error) throw new Error(error.message);

    revalidatePath(`/admin/collections/${collectionId}`);
    return { success: true };
}
