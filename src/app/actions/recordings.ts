'use server'

import { createClient } from "@/lib/supabase/server";

export async function incrementPlayCount(recordingId: string) {
    try {
        const supabase = await createClient();
        const { error } = await supabase.rpc('increment_play_count', { rec_id: recordingId });

        if (error) {
            console.error('Error incrementing play count:', error);
            return { success: false, error };
        }

        return { success: true };
    } catch (error) {
        console.error('Exception incrementing play count:', error);
        return { success: false, error };
    }
}
