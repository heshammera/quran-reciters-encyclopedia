
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function setReferenceTrack(
    reciterId: string,
    sectionId: string,
    surahNumber: number,
    recordingId: string,
    reason: string
) {
    const supabase = await createClient();

    // Upsert logic: Since we have a UNIQUE constraint on (reciter_id, section_id, surah_number),
    // we can use upsert to replace any existing reference for this slot.
    const { error } = await supabase
        .from("reference_tracks")
        .upsert({
            reciter_id: reciterId,
            section_id: sectionId,
            surah_number: surahNumber,
            reference_recording_id: recordingId,
            reason_ar: reason
        }, {
            onConflict: 'reciter_id, section_id, surah_number'
        });

    if (error) throw new Error(error.message);

    revalidatePath(`/admin/reciters/${reciterId}`);
    return { success: true };
}

export async function removeReferenceTrack(referenceId: string, reciterId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("reference_tracks")
        .delete()
        .eq("id", referenceId);

    if (error) throw new Error(error.message);

    revalidatePath(`/admin/reciters/${reciterId}`);
    return { success: true };
}
