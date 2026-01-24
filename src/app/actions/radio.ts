'use server';

import { createClient } from "@/lib/supabase/server";

export interface RadioFilters {
    reciterId?: string;
    sectionSlug?: string; // 'murattal', 'mujawwad'
    surahNumber?: number;
}

export async function getRadioTracks(limit: number = 10, filters?: RadioFilters) {
    const supabase = await createClient();

    // Try RPC first (Fast Random)
    const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_random_recordings', {
            limit_count: limit,
            filter_reciter_id: filters?.reciterId || null,
            filter_section_slug: filters?.sectionSlug || null
        })
        .select(`
            *,
            reciter:reciters(id, name_ar, image_url),
            section:sections(id, name_ar, slug),
            media_files(archive_url, media_type)
        `);

    if (!rpcError && rpcData && rpcData.length > 0) {
        return rpcData;
    }

    if (rpcError) {
        // Log silently as it might be missing migration
        console.warn("RPC get_random_recordings failed, falling back to basic query.", rpcError.message);
    }

    // Fallback: Basic Fetch + Shuffle
    return getRadioTracksFallback(limit, filters);
}

// Fallback implementation for safety (e.g. if RPC missing)
async function getRadioTracksFallback(limit: number, filters?: RadioFilters) {
    const supabase = await createClient();
    let query = supabase
        .from('recordings')
        .select(`
            *,
            reciter:reciters(id, name_ar, image_url),
            section:sections(id, name_ar, slug),
            media_files(archive_url, media_type)
        `)
        .eq('is_published', true)
        .limit(50); // Fetch pool

    if (filters?.reciterId) query = query.eq('reciter_id', filters.reciterId);
    // Note: Filtering by section slug directly on recordings table joining sections impossible in simple fluent syntax without !inner
    // Simplified fallback ignores section filter or requires section_id.

    const { data } = await query;

    // JS Shuffle
    return (data || []).sort(() => 0.5 - Math.random()).slice(0, limit);
}
