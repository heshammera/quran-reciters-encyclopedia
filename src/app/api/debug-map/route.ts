import { NextRequest, NextResponse } from 'next/server';
import { getCityRecordingsStats, getRecordingsByCity } from '@/app/actions/map';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const city = searchParams.get('city');

        if (city) {
            const recordings = await getRecordingsByCity(city);
            return NextResponse.json({
                query: city,
                count: recordings.length,
                data: recordings,
                check_time: new Date().toISOString()
            });
        }

        const stats = await getCityRecordingsStats();
        return NextResponse.json({
            mode: 'stats',
            count: stats.length,
            data: stats,
            check_time: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
