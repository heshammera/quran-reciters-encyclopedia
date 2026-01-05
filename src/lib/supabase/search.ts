import { supabase } from "./client";

export interface SearchResults {
    reciters: any[];
    recordings: any[];
    sections: any[];
}

export async function searchContent(query: string): Promise<SearchResults> {
    if (!query || query.trim().length === 0) {
        return { reciters: [], recordings: [], sections: [] };
    }

    const searchTerm = `%${query.trim()}%`;

    // 1. Search Reciters
    const { data: reciters } = await supabase
        .from("reciters")
        .select("*")
        .or(`name_ar.ilike.${searchTerm},biography_ar.ilike.${searchTerm}`)
        .limit(5);

    // 2. Search Sections
    const { data: sections } = await supabase
        .from("sections")
        .select("*")
        .ilike("name_ar", searchTerm)
        .limit(5);

    // 3. Search Recordings
    // Searching recordings is trickier because we want to search by Surah name too.
    // For now, let's search by city, source_description, or joined reciter name (if possible, but client-side join is hard).
    // Let's stick to direct text fields on recordings first.
    // We can also check if query is a number (Surah Number).

    let recordingQuery = supabase
        .from("recordings")
        .select(`
            *,
            reciters (name_ar),
            sections (name_ar, slug),
            media_files (archive_url)
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(20);

    const isNumber = !isNaN(parseInt(query));
    if (isNumber) {
        recordingQuery = recordingQuery.eq("surah_number", parseInt(query));
    } else {
        recordingQuery = recordingQuery.or(`city.ilike.${searchTerm},source_description.ilike.${searchTerm},quality_level.ilike.${searchTerm}`);
    }

    const { data: recordings } = await recordingQuery;

    return {
        reciters: reciters || [],
        sections: sections || [],
        recordings: recordings || [],
    };
}
