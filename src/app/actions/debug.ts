"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getBucketConfig(bucketId: string) {
    const supabase = createAdminClient();

    // We can't query available buckets directly via the storage API client easily for config details 
    // in the same way we do via SQL, but the storage.getBucket() might return info.

    const { data, error } = await supabase.storage.getBucket(bucketId);

    if (error) {
        console.error("Debug Bucket Error:", error);
        return { error: error.message };
    }

    return { data };
}
