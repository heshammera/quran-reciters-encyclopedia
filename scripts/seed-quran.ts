
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { normalizeArabicText, getSurahName } from '../src/lib/quran/normalize';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Trying a very standard, high-availability source
const QURAN_JSON_URL = 'https://raw.githubusercontent.com/risan/quran-json/master/dist/quran.json';

interface QuranChapter {
    id: number;
    name: string;
    transliteration: string;
    translation: string;
    type: string;
    total_verses: number;
    verses: {
        id: number;
        text: string;
        translation: string;
    }[];
}

async function seedQuran() {
    console.log('Fetching Quran JSON from GitHub Raw...');
    const response = await fetch(QURAN_JSON_URL);
    if (!response.ok) {
        throw new Error(`Failed to fetch Quran JSON: ${response.statusText} (${response.status}) - ${QURAN_JSON_URL}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json();

    // Risan's format is typically an object {"1": {...}, "2": {...}} or array. 
    // Let's handle both.
    const chapters: QuranChapter[] = Array.isArray(data) ? data : Object.values(data);

    console.log(`Processing ${chapters.length} chapters...`);

    const rows = [];
    for (const chapter of chapters) {
        for (const verse of chapter.verses) {
            rows.push({
                surah_number: chapter.id,
                ayah_number: verse.id,
                text_original: verse.text,
                text_normalized: normalizeArabicText(verse.text),
                surah_name_ar: getSurahName(chapter.id)
            });
        }
    }

    console.log(`Prepared ${rows.length} ayahs.`);

    // Batch insert
    const BATCH_SIZE = 500;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('quran_index').upsert(batch, { onConflict: 'surah_number,ayah_number' });

        if (error) {
            console.error(`Error inserting batch ${i}:`, error);
        } else {
            console.log(`Inserted batch ${i} - ${Math.min(i + BATCH_SIZE, rows.length)}`);
        }
    }

    console.log('Seeding complete!');
}

seedQuran().catch(console.error);
