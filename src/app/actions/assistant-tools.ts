"use server";

import { supabase } from "@/lib/supabase/client";
import { normalizeQuranText } from "@/lib/quran-helpers";
import { normalizeArabicSearch } from "@/lib/search-helpers";
import { getSurahName, findSurahNumber } from "@/lib/quran/normalize";

/**
 * Tool 1: Search for Ayahs by text snippet
 */
export async function searchAyahSnippet(text: string) {
    const normalized = normalizeQuranText(text);

    const { data } = await supabase
        .from("quran_index")
        .select("*")
        .textSearch("text_normalized", normalized, { config: "simple" })
        .limit(10);

    return data || [];
}

/**
 * Tool 2: Find recordings that contain a specific Ayah
 */
export async function findTracksByAyah(
    surahNumber: number,
    ayahNumber: number,
    filters?: { reciterId?: string; city?: string }
) {
    // Query recordings that cover this ayah
    let query = supabase
        .from("recordings")
        .select(`
            *,
            reciter:reciters(name_ar, image_url),
            section:sections(name_ar)
        `)
        .eq("surah_number", surahNumber)
        .lte("ayah_start", ayahNumber)
        .gte("ayah_end", ayahNumber)
        .eq("is_published", true);

    if (filters?.reciterId) {
        query = query.eq("reciter_id", filters.reciterId);
    }

    if (filters?.city) {
        query = query.eq("city", filters.city);
    }

    const { data } = await query.limit(20);
    return data || [];
}

/**
 * Tool 3: Find rare recordings by Surah
 */
export async function findRareBySurah(surahNumber: number, reciterId?: string) {
    let query = supabase
        .from("recordings")
        .select(`
            *,
            reciter:reciters(name_ar, image_url),
            section:sections(name_ar)
        `)
        .eq("surah_number", surahNumber)
        .in("rarity_classification", ["rare", "very_rare"])
        .eq("is_published", true);

    if (reciterId) {
        query = query.eq("reciter_id", reciterId);
    }

    const { data } = await query.limit(10);
    return data || [];
}

/**
 * Tool 4: Get reciter information
 */
export async function getReciterInfoTool(reciterId: string) {
    const { data: reciter } = await supabase
        .from("reciters")
        .select("*")
        .eq("id", reciterId)
        .single();

    if (!reciter) return null;

    // Get phases
    const { data: phases } = await supabase
        .from("reciter_phases")
        .select(`
            id,
            recording_count,
            section:sections(id, name_ar, slug)
        `)
        .eq("reciter_id", reciterId)
        .order("display_order");

    // Get recording count
    const { count } = await supabase
        .from("recordings")
        .select("*", { count: "exact", head: true })
        .eq("reciter_id", reciterId)
        .eq("is_published", true);

    return {
        ...reciter,
        phases: phases?.map((p: any) => ({
            ...p,
            url: `/reciters/${reciter.id}/${p.section.slug}`
        })) || [],
        recording_count: count || 0,
        url: `/reciters/${reciter.id}`
    };
}

/**
 * Tool 4.1: Get actual recordings for a reciter
 */
export async function getRecordingsTool(reciterId: string, limit: number = 5) {
    console.log(`>>> [getRecordingsTool] Fetching for ID: ${reciterId}`);

    const { data: recordings, error } = await supabase
        .from("recordings")
        .select(`
            id,
            surah_number,
            ayah_start,
            ayah_end,
            reciter:reciters(id, name_ar),
            section:sections(id, name_ar, slug),
            media_files(archive_url)
        `)
        .eq("reciter_id", reciterId)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error(`>>> [getRecordingsTool] Error:`, error);
        return [];
    }

    console.log(`>>> [getRecordingsTool] Found ${recordings?.length || 0} recordings`);

    return recordings
        ?.filter((r: any) => r.media_files?.[0]?.archive_url) // Skip if no audio
        .map((r: any) => {
            const baseUrl = `/reciters/${r.reciter.id}/${r.section.slug}?play=${r.id}`;
            const audioSrc = r.media_files?.[0]?.archive_url;
            const surahName = getSurahName(r.surah_number);
            const reciterName = r.reciter.name_ar;

            return {
                id: r.id,
                url: baseUrl,
                playUrl: `${baseUrl}&audio=${encodeURIComponent(audioSrc)}&title=${encodeURIComponent(surahName)}&reciter=${encodeURIComponent(reciterName)}`,
                audioSrc,
                reciterName,
                surahName,
                sectionName: r.section.name_ar
            };
        }) || [];
}

/**
 * Tool 4.2: Get featured/latest recordings from all reciters
 */
export async function getFeaturedRecordingsTool() {
    const { data: recordings, error } = await supabase
        .from("recordings")
        .select(`
            id,
            surah_number,
            ayah_start,
            ayah_end,
            reciter:reciters(id, name_ar),
            section:sections(id, name_ar, slug),
            media_files(archive_url)
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(10);

    if (error) {
        console.error(`>>> [getFeaturedRecordingsTool] Error:`, error);
        return [];
    }

    return recordings
        ?.filter((r: any) => r.media_files?.[0]?.archive_url)
        .map((r: any) => {
            const baseUrl = `/reciters/${r.reciter.id}/${r.section.slug}?play=${r.id}`;
            const audioSrc = r.media_files?.[0]?.archive_url;
            const surahName = getSurahName(r.surah_number);
            const reciterName = r.reciter.name_ar;

            return {
                id: r.id,
                url: baseUrl,
                playUrl: `${baseUrl}&audio=${encodeURIComponent(audioSrc)}&title=${encodeURIComponent(surahName)}&reciter=${encodeURIComponent(reciterName)}`,
                audioSrc,
                reciterName,
                surahName,
                sectionName: r.section.name_ar
            };
        }) || [];
}

/**
 * Tool 5: Search site pages (reciters, sections)
 */
export async function sitePagesSearch(query: string) {
    console.log(">>> [sitePagesSearch] Input query:", query);
    if (!query || query === "undefined") {
        return { reciters: [], sections: [] };
    }
    const normalized = normalizeArabicSearch(query);
    const words = normalized.split(' ').filter(w => w.length > 1);

    // Function to create a pattern that matches both ي/ى and ه/ة
    const getPattern = (word: string) => {
        return word
            .replace(/[يى]/g, '_')
            .replace(/[هة]/g, '_');
    };

    // Filter out common words that aren't part of a reciter's name
    const stopWords = ['تلاوه', 'تلاوة', 'سوره', 'سورة', 'الشيخ', 'القاري', 'القارئ', 'نوادر', 'مقطع', 'تجويد', 'ترتيل'];
    const filteredWords = words.filter(w => !stopWords.includes(w));

    // Remove "ال" definite article from words to improve matching
    const cleanedWords = filteredWords.map(w => {
        // If word starts with "ال" and has more characters after it, remove "ال"
        if (w.startsWith('ال') && w.length > 2) {
            return w.substring(2);
        }
        return w;
    });

    // If we filtered everything (e.g. user just said "تلاوة"), revert to words to avoid empty search
    const wordsToSearch = cleanedWords.length > 0 ? cleanedWords : words;

    console.log(">>> [sitePagesSearch] Input:", query, "| After cleaning:", wordsToSearch);

    // Search reciters
    let reciterQuery = supabase.from("reciters").select("id, name_ar, birth_date, death_date, biography_ar");

    if (wordsToSearch.length > 0) {
        for (const word of wordsToSearch) {
            const pattern = getPattern(word);
            reciterQuery = reciterQuery.ilike("name_ar", `%${pattern}%`);
        }
    } else {
        const pattern = getPattern(normalized);
        reciterQuery = reciterQuery.ilike("name_ar", `%${pattern}%`);
    }

    const { data: reciters } = await reciterQuery.limit(5);
    console.log(`>>> [sitePagesSearch] Reciters found length: ${reciters?.length || 0}`);

    // Search sections
    let sectionQuery = supabase.from("sections").select("id, name_ar, slug");
    if (words.length > 0) {
        for (const word of words) {
            const pattern = getPattern(word);
            sectionQuery = sectionQuery.ilike("name_ar", `%${pattern}%`);
        }
    } else {
        const pattern = getPattern(normalized);
        sectionQuery = sectionQuery.ilike("name_ar", `%${pattern}%`);
    }

    const { data: sections } = await sectionQuery.limit(5);

    console.log(`>>> [sitePagesSearch] Query: "${query}" | Normalized: "${normalized}"`);
    console.log(`>>> [sitePagesSearch] Reciters Found:`, reciters?.map(r => r.name_ar));

    return {
        reciters: reciters?.map(r => ({ ...r, url: `/reciters/${r.id}` })) || [],
        sections: sections?.map(s => ({ ...s, url: `/search?section=${s.id}` })) || []
    };
}

/**
 * Tool 6: Search for Surah by name and find recordings
 */
export async function surahSearch(query: string) {
    if (!query || query === "undefined") return null;

    // Resolve Surah number locally first (robust)
    const surahNumber = findSurahNumber(query);
    if (!surahNumber) return null;

    const surahName = getSurahName(surahNumber);

    // Get a few recordings for this surah
    const { data: recordings, error } = await supabase
        .from("recordings")
        .select(`
            id,
            surah_number,
            ayah_start,
            ayah_end,
            reciter:reciters(id, name_ar),
            section:sections(id, name_ar, slug),
            media_files(archive_url)
        `)
        .eq("surah_number", surahNumber)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(10);

    if (error) {
        console.error(`>>> [surahSearch] Error:`, error);
        return { surah: { number: surahNumber, name: surahName }, recordings: [] };
    }

    return {
        surah: {
            number: surahNumber,
            name: surahName
        },
        recordings: recordings
            ?.filter((r: any) => r.media_files?.[0]?.archive_url)
            .map((r: any) => {
                const baseUrl = `/reciters/${r.reciter.id}/${r.section.slug}?play=${r.id}`;
                const audioSrc = r.media_files?.[0]?.archive_url;
                const surahName = getSurahName(surahNumber);
                const reciterName = r.reciter.name_ar;

                return {
                    id: r.id,
                    url: baseUrl,
                    playUrl: `${baseUrl}&audio=${encodeURIComponent(audioSrc)}&title=${encodeURIComponent(surahName)}&reciter=${encodeURIComponent(reciterName)}`,
                    audioSrc,
                    reciterName,
                    sectionName: r.section.name_ar,
                    ayahStart: r.ayah_start,
                    ayahEnd: r.ayah_end
                };
            }) || []
    };
}
