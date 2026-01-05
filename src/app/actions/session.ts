
"use server";

import { createClient } from "@/lib/supabase/server";

export type SessionParams = {
    reciterId?: string;
    targetDurationMinutes: number; // e.g. 30, 60, 90
    surahNumber?: number; // Optional filter
};

export async function generateSession(params: SessionParams) {
    const supabase = await createClient();

    // 1. Build Query - Include media_files to get archive_url
    let query = supabase
        .from("recordings")
        .select(`
            *,
            reciters (name_ar, image_url),
            sections (name_ar, slug),
            media_files!inner (archive_url)
        `)
        .eq("is_published", true)
        .not("media_files.archive_url", "is", null) // Only recordings with valid URLs
        .eq("media_files.is_primary", true); // Only primary media file

    if (params.reciterId) {
        query = query.eq("reciter_id", params.reciterId);
    }

    if (params.surahNumber) {
        query = query.eq("surah_number", params.surahNumber);
    }

    // We fetch more than we need to shuffle. 
    // Optimization: If DB is huge, use .limit() or random sampling methods.
    // For now, fetching 100 candidates is fine.
    const { data: candidates, error } = await query.limit(100);

    if (error) {
        console.error("Session generation error:", error);
        throw new Error(error.message);
    }

    if (!candidates || candidates.length === 0) {
        console.warn("No recordings found for session params:", params);
        return [];
    }

    console.log(`Found ${candidates.length} candidates for session`);

    // 2. Shuffle (Fisher-Yates)
    const shuffled = [...candidates];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 3. Select tracks to fill duration
    const selected = [];
    let currentDuration = 0;
    const targetSeconds = params.targetDurationMinutes * 60;

    for (const track of shuffled) {
        if (!track.duration_seconds) continue;

        // Extract archive_url from media_files array
        const archiveUrl = Array.isArray(track.media_files) && track.media_files.length > 0
            ? track.media_files[0].archive_url
            : null;

        if (!archiveUrl) continue; // Skip tracks without valid URLs

        selected.push({
            ...track,
            archive_url: archiveUrl // Add archive_url to recording object
        });
        currentDuration += track.duration_seconds;

        if (currentDuration >= targetSeconds) break;
    }

    console.log(`Selected ${selected.length} tracks for session (${Math.round(currentDuration / 60)} minutes)`);
    return selected;
}
