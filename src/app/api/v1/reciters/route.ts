
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    const supabase = await createClient();

    let dbQuery = supabase
        .from("reciters")
        .select("id, name_ar, biography_ar, image_url, birth_date, death_date, created_at");

    if (query) {
        dbQuery = dbQuery.ilike("name_ar", `%${query}%`);
    }

    const { data, error } = await dbQuery.order("name_ar");

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        count: data.length,
        results: data
    });
}
