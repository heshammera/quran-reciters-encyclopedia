'use client';

import dynamic from 'next/dynamic';
import { CityStats } from '@/app/actions/map';

const LeafletMapComponent = dynamic(
    () => import('./LeafletMapComponent'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-[calc(100vh-64px)] bg-slate-100 dark:bg-slate-900 animate-pulse flex items-center justify-center">
                <span className="text-emerald-600 font-bold">جاري تحميل الخريطة...</span>
            </div>
        )
    }
);

interface InteractiveMapProps {
    stats: CityStats[];
}

export default function InteractiveMap({ stats }: InteractiveMapProps) {
    return <LeafletMapComponent stats={stats} />;
}
