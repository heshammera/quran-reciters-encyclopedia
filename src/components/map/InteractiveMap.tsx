'use client';

import dynamic from 'next/dynamic';
import { CityStats } from '@/app/actions/map';

const LeafletMapComponent = dynamic(
    () => import('./LeafletMapComponent'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-[calc(100vh-64px)] bg-[#09090b] flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                </div>
                <div className="text-emerald-500 font-mono flex flex-col items-center gap-4 z-10">
                    <div className="w-12 h-12 border-4 border-emerald-900 border-t-emerald-500 rounded-full animate-spin"></div>
                    <span className="animate-pulse tracking-[0.2em] text-sm">INITIALIZING SATELLITE LINK...</span>
                </div>
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
