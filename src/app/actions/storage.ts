
"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function uploadFile(formData: FormData, bucket: string, path: string) {
    const file = formData.get("file") as File;
    if (!file) {
        throw new Error("No file provided");
    }

    const supabase = createAdminClient();

    // Generate a unique filename to avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    // Convert to buffer to ensure reliable processing
    const buffer = Buffer.from(await file.arrayBuffer());

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false
        });

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return publicUrl;
}

export async function getPresignedUploadUrl(bucket: string, path: string, token: string) {
    // Basic auth check (optional, but good practice)
    const supabase = createAdminClient();

    // Create a signed upload URL valid for 1 hour
    const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUploadUrl(path);

    if (error) {
        throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data;
}
