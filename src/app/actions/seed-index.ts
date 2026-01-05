"use server";

import { createClient } from "@/lib/supabase/server";
import { normalizeQuranText, getSurahName } from "@/lib/quran-helpers";

interface QuranAyahSource {
    number: number;
    text: string;
    surah: {
        number: number;
        name: string;
    };
    numberInSurah: number;
}

export async function seedQuranIndex() {
    const supabase = await createClient(); // Use createClient wrapper

    // Check if index is already populated (simple check)
    const { count, error: countError } = await supabase
        .from('quran_index')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error("Error checking quran_index:", countError);
        return { success: false, message: "Database error checking index." };
    }

    if (count && count > 6000) {
        return { success: true, message: "Quran index already appears populated.", count };
    }

    try {
        // Fetch Quran Text (Hafs readings)
        // Using api.alquran.cloud which is stable and free
        console.log("Fetching Quran text...");
        const response = await fetch("http://api.alquran.cloud/v1/quran/quran-simple", {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch Quran text: ${response.statusText}`);
        }

        const data = await response.json();
        const surahs = data.data.surahs;

        console.log("Processing Quran text...");
        const records = [];

        for (const surah of surahs) {
            const surahName = getSurahName(surah.number);

            for (const ayah of surah.ayahs) {
                // Remove Bismillah from text if it's not the first ayah of Fatiha.
                // The API usually includes Bismillah in the text for the first ayah of every surah (except Tawbah).
                // We typically want the raw ayah text for search.
                // However, for simplest search, we can just use the text as provided, or clean it.
                // Let's use the provided text but also normalize it.

                const textOriginal = ayah.text;
                const textNormalized = normalizeQuranText(textOriginal);

                records.push({
                    surah_number: surah.number,
                    ayah_number: ayah.numberInSurah,
                    text_original: textOriginal,
                    text_normalized: textNormalized,
                    surah_name_ar: surahName
                });
            }
        }

        console.log(`Prepared ${records.length} records. Inserting into Supabase...`);

        // Insert in chunks to avoid request size limits
        const chunkSize = 100;
        for (let i = 0; i < records.length; i += chunkSize) {
            const chunk = records.slice(i, i + chunkSize);
            const { error } = await supabase.from('quran_index').upsert(chunk, {
                onConflict: 'surah_number,ayah_number' // Check your schema unique constraint
            });

            if (error) {
                console.error(`Error inserting chunk ${i}:`, error);
                throw error;
            }
        }

        return { success: true, message: "Successfully seeded Quran index.", count: records.length };

    } catch (error: any) {
        console.error("Seeding error:", error);
        return { success: false, message: error.message };
    }
}
