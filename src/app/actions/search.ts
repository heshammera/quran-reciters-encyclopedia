"use server";

import { createClient } from "@/lib/supabase/server";

export type SearchResult = {
    type: "reciter" | "recording" | "ayah";
    id: string;
    title: string;
    subtitle?: string;
    url: string;
    image_url?: string | null;
    meta?: any; // Extra metadata like surah/ayah number for logic
};

export async function searchGlobal(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) return [];

    const supabase = await createClient();
    const searchTerm = `%${query.trim()}%`;

    // 1. Search Reciters
    const { data: reciters } = await supabase
        .from("reciters")
        .select("id, name_ar, image_url")
        .ilike("name_ar", searchTerm)
        .limit(5);

    // 2. Search Recordings (Surah number, city, or year for now - simple implementation)
    // Note: A more advanced implementation would use a text search index or join with surah names.
    // For MVP, we search reciter name via join or common fields if possible, or just surah number if numeric.

    let recordingsQuery = supabase
        .from("recordings")
        .select(`
            id, 
            surah_number, 
            city, 
            recording_date, 
            reciter:reciters!inner(name_ar),
            section:sections(name_ar, slug)
        `)
        .eq("is_published", true)
        .limit(10);

    // Check if query is numeric (Surah search)
    const isNumeric = /^\d+$/.test(query.trim());
    if (isNumeric) {
        recordingsQuery = recordingsQuery.eq("surah_number", parseInt(query.trim()));
    } else {
        // Text search on city or reciter name
        // Supabase PostgREST doesn't support OR across different tables easily in one go without raw SQL or views.
        // We will stick to City match OR Reciter Name match (via inner join filtering)
        // complex OR logic in Supabase JS: .or('city.ilike.%query%,reciter.name_ar.ilike.%query%') is tricky with joins.
        // For MVP: Search City directly.
        recordingsQuery = recordingsQuery.ilike("city", searchTerm);
    }

    const { data: recordings } = await recordingsQuery;

    // Formatting Results
    const results: SearchResult[] = [];

    if (reciters) {
        reciters.forEach(r => {
            results.push({
                type: "reciter",
                id: r.id,
                title: r.name_ar,
                subtitle: "قارئ",
                url: `/reciters/${r.id}`,
                image_url: r.image_url
            });
        });
    }

    if (recordings) {
        recordings.forEach((r: any) => {
            results.push({
                type: "recording",
                id: r.id,
                title: `سورة ${r.surah_number}`,
                subtitle: `${r.reciter.name_ar} - ${r.city || r.recording_date?.year || 'تلاوة'}`,
                url: `/reciters/${r.reciter.id}/${r.section?.slug || 'all'}`,
                image_url: null // Recordings don't have images usually
            });
        });
    }

    return results;
}
