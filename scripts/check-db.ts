import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log("Checking DB Connection...");

    // 1. Check if 'مصر' exists exactly
    const { data: exact, error: err1 } = await supabase
        .from('recordings')
        .select('city')
        .eq('city', 'مصر')
        .limit(5);

    console.log("Exact match 'مصر':", exact?.length, err1 ? err1 : "OK");

    // 2. Check ilike with unicode
    const term = 'مصر';
    const { data: fuzzy, error: err2 } = await supabase
        .from('recordings')
        .select('city')
        .ilike('city', `%${term}%`)
        .limit(5);

    console.log(`Fuzzy match '%${term}%':`, fuzzy?.length, err2 ? err2 : "OK");

    if (fuzzy && fuzzy.length > 0) {
        console.log("Sample city val:", fuzzy[0].city);
        console.log("Sample hex:", Buffer.from(fuzzy[0].city).toString('hex'));
    }
}

checkData();
