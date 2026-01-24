'use server';

import { createClient } from "@/lib/supabase/server";

export interface CityStats {
    city: string;
    count: number;
}

export async function getCityRecordingsStats(): Promise<CityStats[]> {
    const supabase = await createClient();

    // Aggregate recordings by city
    // Note: requires city column in recordings table. 
    // We fetch all non-null cities and count them in application or use RPC if dataset is huge.
    // For now, simple fetch and aggregation is sufficient for < 10k items.

    const { data, error } = await supabase
        .from('recordings')
        .select('city')
        .not('city', 'is', null);

    if (error) {
        console.error('Error fetching city stats:', error);
        return [];
    }

    const cityCounts: Record<string, number> = {};
    data.forEach(row => {
        if (row.city) {
            const city = row.city.trim();
            cityCounts[city] = (cityCounts[city] || 0) + 1;
        }
    });

    return Object.entries(cityCounts)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count);
}

export async function getRecordingsByCity(city: string) {
    const supabase = await createClient();
    const cleanCity = city?.trim();

    const { data, error } = await supabase
        .from('recordings')
        .select(`
            *,
            reciter:reciters(id, name_ar, image_url),
            section:sections(id, name_ar, slug),
            media_files(archive_url, media_type)
        `)
        .ilike('city', `%${cleanCity}%`) // Use ilike for partial matching flexibility
        .order('play_count', { ascending: false }) // Popular first
        .limit(100);

    if (error) {
        console.error(`Error fetching recordings for city ${city}:`, error);
        return [];
    }

    return data;
}
