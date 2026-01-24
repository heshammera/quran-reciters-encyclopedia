'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayer } from '@/context/PlayerContext';
import { getRadioTracks, RadioFilters } from '@/app/actions/radio';
import Link from 'next/link';
import SiriWaveVisualizer from './SiriWaveVisualizer';

export default function FloatingRadioWidget() {
    const { state, dispatch } = usePlayer();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Persistence Logic: Save Radio Session whenever radio is playing or queue exists
    useEffect(() => {
        // Only save if it's a radio track
        if (state.currentTrack && state.currentTrack.isRadio && state.queue.length > 0) {
            const session = {
                track: state.currentTrack,
                queue: state.queue,
                timestamp: Date.now()
            };
            localStorage.setItem('radio_session', JSON.stringify(session));
        }
    }, [state.currentTrack, state.queue]);

    const startRadio = async (reset: boolean = false, filter: RadioFilters = {}) => {
        setIsLoading(true);

        // Try restoring session first if not resetting
        if (!reset) {
            const saved = localStorage.getItem('radio_session');
            if (saved) {
                try {
                    const session = JSON.parse(saved);
                    // Check if track is compatible (optional version check)
                    console.log("Restoring radio session...");
                    dispatch({ type: 'SET_QUEUE', payload: session.queue });
                    dispatch({ type: 'PLAY_TRACK', payload: session.track });
                    setIsLoading(false);
                    return;
                } catch (e) {
                    console.error("Failed to restore radio session", e);
                }
            }
        }

        if (reset) dispatch({ type: 'SET_QUEUE', payload: [] });

        const tracks = await getRadioTracks(10, filter);
        if (tracks.length > 0) {
            const formatted = tracks.map((t: any) => ({
                id: t.id,
                title: t.title,
                reciterName: t.reciter?.name_ar || 'قارئ',
                src: t.media_files?.find((f: any) => f.media_type === 'audio')?.archive_url || t.src || '',
                reciterId: t.reciter?.id,
                surahNumber: t.surah_number,
                raw: t,
                isRadio: true
            }));

            dispatch({ type: 'SET_QUEUE', payload: formatted });
            dispatch({ type: 'PLAY_TRACK', payload: formatted[0] });
        }
        setIsLoading(false);
    };

    const togglePlay = () => {
        const isRadioActive = state.currentTrack?.isRadio;

        if (state.isPlaying && isRadioActive) {
            dispatch({ type: 'TOGGLE_PLAY_PAUSE' });
        } else if (state.currentTrack && isRadioActive) {
            dispatch({ type: 'TOGGLE_PLAY_PAUSE' });
        } else {
            // Logic: Switch to Radio Mode
            // If main player was playing something else, it will stop automatically via audio logic
            startRadio(false);
        }
    };

    const nextStation = () => startRadio(true);

    return (
        <>
            <AnimatePresence>
                {/* Main Floating Bubble */}
                <motion.div
                    drag
                    dragMomentum={false}
                    whileHover={{ scale: 1.05 }}
                    whileDrag={{ scale: 1.1 }}
                    className={`fixed bottom-6 right-6 z-[100] cursor-pointer group`}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* The Icon / Visualizer */}
                    <div
                        onClick={() => setIsOpen(!isOpen)}
                        className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl backdrop-blur-md border border-white/20 transition-all duration-300 overflow-hidden
                            ${state.isPlaying && state.currentTrack?.isRadio
                                ? 'bg-black/90 border-emerald-500/50 shadow-emerald-500/40'
                                : 'bg-slate-900/40 hover:bg-slate-900/60 border-slate-700/50'
                            }
                            ${(!state.isPlaying || !state.currentTrack?.isRadio) && !isHovered && !isOpen ? 'opacity-70 grayscale' : 'opacity-100'}
                        `}
                    >
                        {state.isPlaying && state.currentTrack?.isRadio ? (
                            <div className="w-full h-full scale-125 opacity-90">
                                <SiriWaveVisualizer />
                            </div>
                        ) : (
                            <span className="text-2xl filter drop-shadow-md z-10 transition-transform group-hover:scale-110">📻</span>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* EXPANDED CONTROL PANEL (Popup) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
                        className="fixed bottom-24 right-8 z-[99] w-72 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden font-tajawal"
                    >
                        {/* Cover Art Background Header */}
                        <div className="relative h-24 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            {(state.currentTrack as any)?.raw?.reciter?.image_url && (
                                <img
                                    src={(state.currentTrack as any).raw.reciter.image_url}
                                    className="w-full h-full object-cover opacity-50 blur-sm"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 to-transparent"></div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-2 right-2 w-8 h-8 bg-black/20 hover:bg-red-500/80 text-white rounded-full flex items-center justify-center transition-colors z-10"
                            >✕</button>
                        </div>

                        <div className="-mt-10 px-5 pb-5 relative flex flex-col items-center text-center">
                            {/* Circle Avatar */}
                            <div className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-900 shadow-lg overflow-hidden bg-slate-200">
                                {(state.currentTrack as any)?.raw?.reciter?.image_url ? (
                                    <img src={(state.currentTrack as any).raw.reciter.image_url} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-emerald-500 text-2xl">📻</div>
                                )}
                            </div>

                            <div className="mt-2 w-full">
                                <h3 className="font-bold text-slate-900 dark:text-white truncate">
                                    {state.currentTrack?.title || 'الراديو جاهز'}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {state.currentTrack?.reciterName || 'اضغط تشغيل للبدء'}
                                </p>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-4 mt-4 w-full justify-center">
                                <button
                                    onClick={nextStation}
                                    className="p-3 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    title="تغيير المحطة"
                                >
                                    ↻
                                </button>

                                <button
                                    onClick={togglePlay}
                                    className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center text-2xl pl-1 transition-transform active:scale-95"
                                >
                                    {state.isPlaying && state.currentTrack?.isRadio ? '⏸' : '▶'}
                                </button>

                                <Link
                                    href="/radio"
                                    onClick={() => setIsOpen(false)}
                                    className="p-3 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    title="فتح الراديو الكامل"
                                >
                                    ↗
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
