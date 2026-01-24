'use client';

import { useEffect, useState } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { getRadioTracks, RadioFilters } from '@/app/actions/radio';
import Link from 'next/link';
import RadioVisualizer from '@/components/radio/RadioVisualizer';

export default function RadioPage() {
    const { state, dispatch } = usePlayer();
    const [isLoading, setIsLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState<RadioFilters>({}); // Default: Mix

    // Initialize Radio on mount if queue is empty or explicit request?
    // Let's just have a "Start Radio" button or auto-start if query param exists.

    const startRadio = async (reset: boolean = false) => {
        setIsLoading(true);
        // Clear queue if reset requested
        if (reset) {
            dispatch({ type: 'SET_QUEUE', payload: [] });
        }

        const tracks = await getRadioTracks(10, activeFilter);

        if (tracks.length > 0) {
            const formattedTracks = tracks.map((t: any) => {
                const audio = t.media_files?.find((f: any) => f.media_type === 'audio')?.archive_url;
                return {
                    id: t.id,
                    title: t.title,
                    reciterName: t.reciter?.name_ar || 'قارئ',
                    src: audio || t.src || '', // Fallback
                    reciterId: t.reciter?.id,
                    surahNumber: t.surah_number,
                    raw: t, // Keep raw for image access in radio UI if needed
                    isRadio: true
                };
            });

            if (reset) {
                // If reset, play first track immediately
                dispatch({ type: 'SET_QUEUE', payload: formattedTracks });
                dispatch({ type: 'PLAY_TRACK', payload: formattedTracks[0] });
            } else {
                // Append (Future feature: infinite scroll logic would call this)
                // For now, simple "New Mix" button
                dispatch({ type: 'SET_QUEUE', payload: formattedTracks });
                dispatch({ type: 'PLAY_TRACK', payload: formattedTracks[0] });
            }
        }
        setIsLoading(false);
    };

    const isPlaying = state.isPlaying && !isLoading;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-gray-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-tajawal">

            {/* Dynamic Background */}
            <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${isPlaying ? 'opacity-40' : 'opacity-10'} pointer-events-none`}>
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/30 blur-[150px] rounded-full animate-pulse" style={{ animationDuration: '8s' }}></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center space-y-10">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-2xl shadow-emerald-500/30 mb-4 ring-4 ring-white dark:ring-slate-800">
                        <span className="text-4xl">📻</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black font-aref text-slate-800 dark:text-white drop-shadow-sm tracking-wide">
                        الراديو الذكي
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                        اختر موجتك المفضلة، واستمتع بتدفق لا نهائي من التلاوات المختارة
                    </p>
                </div>

                {/* VISUALIZER & STATUS */}
                <div className="h-24 w-full flex items-center justify-center">
                    {isPlaying ? (
                        <RadioVisualizer isPlaying={true} />
                    ) : (
                        <div className="h-1 w-32 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                    )}
                </div>

                {/* CONTROLS CONTAINER */}
                <div className="w-full bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col items-center gap-8">

                    {/* Filters: Horizontal on Desktop */}
                    <div className="flex flex-col md:flex-row flex-wrap justify-center gap-4 w-full">
                        {[
                            { label: '🎲 كوكتيل عشوائي', filter: {}, color: 'from-purple-500 to-indigo-600' },
                            { label: '🕌 تلاوات مجودة', filter: { sectionSlug: 'mujawwad' }, color: 'from-amber-500 to-orange-600' },
                            { label: '📖 تلاوات مرتلة', filter: { sectionSlug: 'murattal' }, color: 'from-emerald-500 to-teal-600' },
                        ].map((station, idx) => {
                            const isActive = JSON.stringify(activeFilter) === JSON.stringify(station.filter);
                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setActiveFilter(station.filter);
                                        startRadio(true);
                                    }}
                                    className={`relative group overflow-hidden flex-1 md:flex-none px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg
                                        ${isActive
                                            ? `bg-gradient-to-r ${station.color} text-white shadow-md ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900`
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <span className="relative z-10">{station.label}</span>
                                    {isActive && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                                </button>
                            );
                        })}
                    </div>

                    {/* NOW PLAYING DISPLAY */}
                    {state.currentTrack && isPlaying ? (
                        <div className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-4">
                            {/* Album Art */}
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg shrink-0 animate-spin-slow" style={{ animationDuration: '20s' }}>
                                {(state.currentTrack as any).raw?.reciter?.image_url ? (
                                    <img src={(state.currentTrack as any).raw.reciter.image_url} className="w-full h-full object-cover" alt="Reciter" />
                                ) : (
                                    <div className="w-full h-full bg-emerald-800 flex items-center justify-center text-4xl">🕌</div>
                                )}
                            </div>

                            <div className="text-center md:text-right flex-1 space-y-2">
                                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-1">
                                    جاري البث المباشر •
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white line-clamp-1">
                                    {state.currentTrack.title}
                                </h2>
                                <h3 className="text-xl text-slate-500 dark:text-slate-400 font-serif">
                                    القارئ {state.currentTrack.reciterName}
                                </h3>
                            </div>

                            <button
                                onClick={() => startRadio(true)}
                                className="h-14 w-14 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all transform hover:rotate-180 duration-500"
                                title="تغيير المحطة"
                            >
                                <span className="text-2xl">↻</span>
                            </button>
                        </div>
                    ) : (
                        /* START BUTTON STATE */
                        <div className="w-full py-8 text-center">
                            {!isLoading ? (
                                <button
                                    onClick={() => startRadio(true)}
                                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xl md:text-2xl font-black py-6 px-16 rounded-full shadow-2xl hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all w-full md:w-auto"
                                >
                                    تشغيل الراديو ▶
                                </button>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">جاري ضبط التردد...</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <p className="text-xs text-slate-400 dark:text-slate-600 text-center max-w-md">
                    يتم اختيار التلاوات باستخدام خوارزمية ذكية لضمان التنوع بين كبار القراء والنوادر.
                </p>
            </div>
        </div>
    );
}
