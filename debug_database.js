const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
let url = null;
let key = null;

try {
    const env = fs.readFileSync(envPath, 'utf8');
    url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1].trim();
    key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1].trim();
} catch (e) {
    console.log("Could not read .env.local");
}

if (!url || !key) {
    console.log("Supabase credentials not found");
    process.exit(1);
}

const supabase = createClient(url, key);

async function debugSearch() {
    console.log("--- Checking Reciters ---");
    const { data: reciters, error } = await supabase
        .from('reciters')
        .select('id, name_ar')
        .limit(20);

    if (error) console.error("Error fetching reciters:", error);
    else {
        reciters.forEach(r => console.log(`- ID: ${r.id}, Name: ${r.name_ar}`));
    }

    console.log("\n--- Searching for 'محمود علي البنا' ---");
    const { data: search1 } = await supabase
        .from('reciters')
        .select('id, name_ar')
        .ilike('name_ar', '%محمود%');
    console.log("Match '%محمود%':", search1);

    const { data: search2 } = await supabase
        .from('reciters')
        .select('id, name_ar')
        .ilike('name_ar', '%البنا%');
    console.log("Match '%البنا%':", search2);
}

debugSearch();
