'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useTheme } from 'next-themes';
import { CityStats, getRecordingsByCity } from '@/app/actions/map';
import { getCityCoordinates } from '@/lib/cities-coordinates';
import { usePlayer } from '@/context/PlayerContext';

const fixIcons = () => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
};

// Component to handle smooth flying to target
const FlyToLocation = ({ coords }: { coords: [number, number] | null }) => {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.flyTo(coords, 6, {
                duration: 2.0,
                easeLinearity: 0.1
            });
        }
    }, [coords, map]);
    return null;
};

interface LeafletMapComponentProps {
    stats: CityStats[];
}

const LeafletMapComponent = ({ stats }: LeafletMapComponentProps) => {
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [cityRecordings, setCityRecordings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { dispatch } = usePlayer();
    const { resolvedTheme } = useTheme();
    const [dynamicCoords, setDynamicCoords] = useState<Record<string, [number, number]>>({});
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { fixIcons(); }, []);

    // Load cached coordinates
    useEffect(() => {
        try {
            const cached = localStorage.getItem('city_coords_cache');
            if (cached) setDynamicCoords(JSON.parse(cached));
        } catch (e) { }
    }, []);

    // Fetch missing coordinates
    useEffect(() => {
        const fetchMissingCoords = async () => {
            for (const stat of stats) {
                if (getCityCoordinates(stat.city) || dynamicCoords[stat.city]) continue;
                await new Promise(r => setTimeout(r, 1000));
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(stat.city)}&limit=1`, {
                        headers: { 'User-Agent': 'QuranRecitersMap/1.0' }
                    });
                    const data = await res.json();
                    if (data && data[0]) {
                        const newCoords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                        setDynamicCoords(prev => {
                            const updated = { ...prev, [stat.city]: newCoords };
                            localStorage.setItem('city_coords_cache', JSON.stringify(updated));
                            return updated;
                        });
                    }
                } catch (err) { }
            }
        };
        fetchMissingCoords();
    }, [stats]);

    const markers = useMemo(() => {
        return stats
            .map(stat => {
                const coords = getCityCoordinates(stat.city) || dynamicCoords[stat.city];
                if (!coords) return null;
                return { ...stat, coords };
            })
            .filter((m): m is (CityStats & { coords: [number, number] }) => m !== null);
    }, [stats, dynamicCoords]);

    // Dark Map NO LABELS (As requested)
    const tileUrl = "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png";
    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

    useEffect(() => {
        if (!selectedCity) return;
        const fetchRecs = async () => {
            setIsLoading(true);
            try {
                const data = await getRecordingsByCity(selectedCity);
                setCityRecordings(data || []);
            } catch (err) {
                console.error("Error fetching city recordings:", err);
                setCityRecordings([]);
            }
            setIsLoading(false);
        };
        fetchRecs();
    }, [selectedCity]);

    const handlePlay = (rec: any) => {
        const audioFile = rec.media_files?.find((f: any) => f.media_type === 'audio')?.archive_url;
        const validSrc = audioFile || rec.src || '';
        dispatch({
            type: 'PLAY_TRACK',
            payload: {
                id: rec.id, title: rec.title, reciterName: rec.reciter?.name_ar || 'قارئ',
                src: validSrc, surahNumber: rec.surah_number, reciterId: rec.reciter?.id || 'unknown'
            }
        });
        dispatch({
            type: 'SET_QUEUE',
            payload: cityRecordings.map((r: any) => {
                const rAudio = r.media_files?.find((f: any) => f.media_type === 'audio')?.archive_url;
                return {
                    id: r.id, title: r.title, reciterName: r.reciter?.name_ar || 'قارئ',
                    src: rAudio || r.src || '', surahNumber: r.surah_number, reciterId: r.reciter?.id || 'unknown'
                };
            })
        });
    };

    // "Light Beam" Marker Icon (Adjusted for better clickability)
    const getCityIcon = (count: number, cityName: string) => {
        const isSelected = selectedCity === cityName;

        // height calculation based on count
        const beamHeight = Math.min(Math.max(count * 5, 80), 200);
        const iconHeight = beamHeight + 50; // Total height including label/rings space

        return L.divIcon({
            className: 'custom-gps-marker',
            html: `
                <div class="relative flex flex-col items-center justify-end w-full h-full group">
                     <!-- The Beam (Clickable) -->
                    <div class="w-[6px] bg-gradient-to-t from-emerald-500 via-emerald-400/50 to-transparent shadow-[0_0_20px_#10b981] ${isSelected ? 'w-[8px] from-emerald-300' : 'opacity-80 group-hover:opacity-100'} transition-all duration-500 rounded-full" 
                         style="height: ${beamHeight}px; margin-bottom: 20px;"></div>
                    
                    <!-- The Base "Radar" Rings -->
                    <div class="absolute bottom-[20px] left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border border-emerald-500/50 animate-ping opacity-40"></div>
                    <div class="absolute bottom-[28px] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-emerald-400 blur-[2px] shadow-[0_0_15px_#10b981]"></div>
                    
                    <!-- Label (Always visible, bright white) -->
                    <div class="absolute bottom-0 whitespace-nowrap px-4 py-2 bg-black/80 backdrop-blur-md border border-emerald-500/40 rounded text-sm text-white font-bold tracking-wide shadow-[0_0_15px_rgba(0,0,0,0.8)] z-50 ${isSelected ? 'scale-110 text-emerald-300 border-emerald-300' : 'text-slate-100'} transition-all duration-300">
                        ${cityName}
                    </div>
                </div>
            `,
            iconSize: [80, iconHeight], // Wider hit box (80px)
            iconAnchor: [40, iconHeight - 10], // Anchor at bottom-center (relative to the whole box)
        });
    };

    const selectedCoords = useMemo(() => {
        return markers.find(m => m.city === selectedCity)?.coords || null;
    }, [selectedCity, markers]);

    return (
        <div className="relative w-full h-[calc(100vh-64px)] bg-[#050505] overflow-hidden font-sans" dir="rtl">

            {/* GPS HUD - Top Search */}
            <div className="absolute top-0 left-0 right-0 z-[400] p-6 pointer-events-none flex justify-center items-start bg-gradient-to-b from-black/90 to-transparent">
                <div className="pointer-events-auto relative group w-full max-w-md">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full opacity-20 group-hover:opacity-40 blur transition duration-200"></div>
                    <input
                        type="text"
                        placeholder="ابحث عن موقع تلاوة..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="relative w-full bg-black/60 backdrop-blur-xl border border-emerald-500/30 text-emerald-100 placeholder-emerald-500/50 px-12 py-3 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.1)] focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm font-medium tracking-wide text-right"
                    />
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 text-emerald-500 animate-pulse">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
            </div>

            {/* GPS HUD - Holographic Grid */}
            <div className="absolute inset-0 z-[300] pointer-events-none opacity-20"
                style={{
                    backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)',
                    backgroundSize: '100px 100px',
                    perspective: '1000px',
                    transform: 'rotateX(20deg) scale(1.2) translateY(50px)',
                    transformOrigin: 'bottom center',
                    maskImage: 'linear-gradient(to bottom, transparent, black)'
                }}>
            </div>

            {/* GPS HUD - Status Panel (Bottom Left RTL) */}
            <div className="absolute bottom-8 left-8 z-[400] text-left pointer-events-none hidden md:block">
                <div className="p-4 bg-black/40 backdrop-blur-md border border-emerald-500/20 rounded-lg relative overflow-hidden group hover:bg-black/60 transition-colors pointer-events-auto">
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-500"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-500"></div>

                    <div className="text-[10px] text-emerald-500/60 uppercase tracking-[0.2em] mb-2 font-bold dir-ltr">SYSTEM STATUS</div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono dir-rtl">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
                            <span>متصل بالقمر الصناعي</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono dir-rtl">
                            <span className="w-2 h-2 bg-emerald-500/50 rounded-full"></span>
                            <span>الإحداثيات: ٢٦.٨٢ ش، ٣٠.٨٠ ق</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-emerald-400/70 font-mono dir-rtl border-t border-emerald-500/10 pt-1 mt-1">
                            <span>النسخة: GPS_v3.3_FIXED</span>
                        </div>
                    </div>
                </div>
            </div>

            <MapContainer
                center={[26.8206, 30.8025]}
                zoom={5}
                style={{ height: '100%', width: '100%', background: '#050505' }}
                zoomControl={false}
                className="z-0"
            >
                <TileLayer attribution={attribution} url={tileUrl} />
                <FlyToLocation coords={selectedCoords} />

                {markers.filter(m => m.city.includes(searchQuery)).map((marker) => (
                    <Marker
                        key={marker.city}
                        position={marker.coords}
                        icon={getCityIcon(marker.count, marker.city)}
                        eventHandlers={{ click: () => setSelectedCity(marker.city) }}
                    />
                ))}
            </MapContainer>

            {/* Holographic Drawer - RIGHT SIDE (Fixed) */}
            {selectedCity && (
                <div className="absolute bottom-0 right-0 top-0 w-full md:w-[450px] bg-black/80 backdrop-blur-xl border-l border-emerald-500/30 z-[500] flex flex-col transform transition-transform duration-500 animate-in slide-in-from-right shadow-[-20px_0_100px_rgba(16,185,129,0.1)]">
                    {/* Header */}
                    <div className="relative p-6 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-900/40 to-transparent overflow-hidden">
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <div className="text-[10px] tracking-widest text-emerald-400 mb-1 font-mono">تم تحديد الهدف</div>
                                <h2 className="text-3xl font-black text-white flex items-center gap-3 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                                    {selectedCity}
                                </h2>
                            </div>
                            <button
                                onClick={() => setSelectedCity(null)}
                                className="w-10 h-10 rounded-full border border-emerald-500/30 flex items-center justify-center text-emerald-500 hover:bg-emerald-500/20 hover:border-emerald-500 transition-all hover:rotate-90 duration-300"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Recordings List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex flex-col gap-4 mt-20 items-center justify-center text-emerald-500/50">
                                <div className="relative w-16 h-16">
                                    <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                                <span className="text-xs tracking-[0.3em] animate-pulse">جاري المسح...</span>
                            </div>
                        ) : cityRecordings.length > 0 ? (
                            cityRecordings.map((rec, i) => (
                                <div
                                    key={rec.id}
                                    onClick={() => handlePlay(rec)}
                                    className="group relative flex gap-4 p-4 rounded bg-emerald-950/20 hover:bg-emerald-900/40 border border-emerald-500/10 hover:border-emerald-500/50 transition-all cursor-pointer overflow-hidden backdrop-blur-sm"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    {/* Holographic glow on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-l from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[100%] group-hover:translate-x-[-100%] transition-transform duration-1000"></div>

                                    <div className="w-14 h-14 rounded bg-black border border-emerald-500/20 overflow-hidden shrink-0 relative group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-shadow">
                                        {rec.reciter?.image_url ? (
                                            <img
                                                src={rec.reciter.image_url}
                                                alt={rec.reciter.name_ar}
                                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-emerald-800">🕌</div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col justify-center relative z-10">
                                        <h4 className="font-bold text-base text-emerald-100 truncate group-hover:text-emerald-400 transition-colors shadow-black drop-shadow-md">
                                            {rec.title}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="px-1.5 py-0.5 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400">
                                                {rec.reciter?.name_ar}
                                            </span>
                                            <span className="text-[10px] text-emerald-600 font-mono">
                                                ID: {rec.id.slice(0, 4)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center w-8 text-emerald-500/30 group-hover:text-emerald-400 group-hover:scale-110 transition-all">
                                        ▶
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 text-emerald-500/40 font-mono text-sm border border-dashed border-emerald-500/20 rounded">
                                لا توجد إشارات (تلاوات) ملتقطة في هذا النطاق
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeafletMapComponent;
