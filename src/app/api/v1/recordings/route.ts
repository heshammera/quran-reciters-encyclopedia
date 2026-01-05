
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const reciter_id = searchParams.get("reciter_id");
    const surah = searchParams.get("surah");
    const section = searchParams.get("section");
    const city = searchParams.get("city");

    const supabase = await createClient();

    let dbQuery = supabase
        .from("recordings")
        .select(`
            id,
            archival_id,
            surah_number,
            ayah_start,
            ayah_end,
            city,
            recording_date,
            duration_seconds,
            quality_level,
            rarity_classification,
            is_featured,
            reciter:reciters(id, name_ar),
            section:sections(id, name_ar, slug)
        `)
        .eq("is_published", true);

    if (reciter_id) dbQuery = dbQuery.eq("reciter_id", reciter_id);
    if (surah) dbQuery = dbQuery.eq("surah_number", parseInt(surah));
    if (section) dbQuery = dbQuery.eq("section_id", section);
    if (city) dbQuery = dbQuery.ilike("city", `%${city}%`);

    const { data, error } = await dbQuery
        .order("created_at", { ascending: false })
        .limit(100);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        count: data.length,
        results: data,
        note: "API is read-only. File URLs are not provided via public API for bandwidth protection."
    });
}
