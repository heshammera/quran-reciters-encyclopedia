'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
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

interface LeafletMapComponentProps {
    stats: CityStats[];
}

const LeafletMapComponent = ({ stats }: LeafletMapComponentProps) => {
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [cityRecordings, setCityRecordings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { dispatch } = usePlayer();
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        fixIcons();
    }, []);

    const markers = useMemo(() => {
        return stats
            .map(stat => {
                const coords = getCityCoordinates(stat.city);
                if (!coords) return null;
                return { ...stat, coords };
            })
            .filter((m): m is (CityStats & { coords: [number, number] }) => m !== null);
    }, [stats]);

    // Always use OSM for Arabic support
    const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

    // Apply dark filter class if needed
    const mapClassName = resolvedTheme === 'dark' ? "z-0 dark-map-tiles" : "z-0";

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
        // Extract audio URL
        const audioFile = rec.media_files?.find((f: any) => f.media_type === 'audio')?.archive_url;
        const validSrc = audioFile || rec.src || '';

        dispatch({
            type: 'PLAY_TRACK',
            payload: {
                id: rec.id,
                title: rec.title,
                reciterName: rec.reciter?.name_ar || 'قارئ',
                src: validSrc,
                surahNumber: rec.surah_number,
                reciterId: rec.reciter?.id || 'unknown'
            }
        });
        dispatch({
            type: 'SET_QUEUE',
            payload: cityRecordings.map((r: any) => {
                const rAudio = r.media_files?.find((f: any) => f.media_type === 'audio')?.archive_url;
                return {
                    id: r.id,
                    title: r.title,
                    reciterName: r.reciter?.name_ar || 'قارئ',
                    src: rAudio || r.src || '',
                    surahNumber: r.surah_number,
                    reciterId: r.reciter?.id || 'unknown'
                };
            })
        });
    };

    const getCityIcon = (count: number) => {
        const size = count > 50 ? 40 : count > 20 ? 32 : 24;
        return L.divIcon({
            className: 'custom-city-marker',
            html: `
                <div style="
                    background: linear-gradient(135deg, #10b981, #065f46);
                    border: 2px solid #fbbf24;
                    border-radius: 50%;
                    width: ${size}px;
                    height: ${size}px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    font-weight: bold;
                    font-family: sans-serif;
                    font-size: ${size * 0.4}px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                ">${count}</div>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            popupAnchor: [0, -size / 2]
        });
    };

    return (
        <div className="relative w-full h-[calc(100vh-64px)] bg-slate-100 dark:bg-slate-900 overflow-hidden">
            <div className="absolute inset-0 z-0 h-full w-full">
                <MapContainer
                    center={[26.8206, 30.8025]}
                    zoom={6}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    className={mapClassName}
                >
                    <TileLayer attribution={attribution} url={tileUrl} />
                    {markers.map((marker) => (
                        <Marker
                            key={marker.city}
                            position={marker.coords}
                            icon={getCityIcon(marker.count)}
                            eventHandlers={{ click: () => setSelectedCity(marker.city) }}
                        />
                    ))}
                </MapContainer>
            </div>

            {/* Drawer Logic... (Kept same) */}
            {selectedCity && (
                <div className="absolute bottom-0 left-0 right-0 md:top-0 md:left-auto md:w-[400px] md:h-full bg-white dark:bg-slate-900 shadow-2xl z-[500] 
                    rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none flex flex-col transition-transform duration-300 animate-in slide-in-from-bottom md:slide-in-from-right h-[60vh] md:h-auto border-t md:border-l border-slate-200 dark:border-slate-800">

                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                        <div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="text-emerald-500">📍</span>
                                {selectedCity}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {isLoading ? 'جاري التحميل...' : `${cityRecordings.length} تلاوة مختارة`}
                            </p>
                        </div>
                        <button
                            onClick={() => setSelectedCity(null)}
                            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : cityRecordings.length > 0 ? (
                            cityRecordings.map((rec) => (
                                <div
                                    key={rec.id}
                                    onClick={() => handlePlay(rec)}
                                    className="group flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-all cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 relative">
                                        {rec.reciter?.image_url ? (
                                            <img
                                                src={rec.reciter.image_url}
                                                alt={rec.reciter.name_ar}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">🕌</div>
                                        )}
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-lg">▶</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                            {rec.title}
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                                            {rec.reciter?.name_ar || 'قارئ'} • {rec.recording_date?.year || 'غير مؤرخ'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-slate-500">
                                لا توجد تلاوات مسجلة في هذه المدينة حالياً.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeafletMapComponent;
