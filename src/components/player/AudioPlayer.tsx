"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/hooks/usePlayer";
import { formatTime } from "@/lib/utils";
import { useLeanMode } from "@/context/LeanModeContext";

import PlayerQueue from "./PlayerQueue";

export default function AudioPlayer() {
    const { state, dispatch } = usePlayer();
    const { currentTrack, isPlaying, volume } = state;
    const { isLean } = useLeanMode();
    const audioRef = useRef<HTMLAudioElement>(null);

    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showQueue, setShowQueue] = useState(false);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.code) {
                case "Space":
                    e.preventDefault();
                    if (currentTrack) dispatch({ type: "TOGGLE_PLAY_PAUSE" });
                    break;
                case "ArrowRight":
                    if (audioRef.current) audioRef.current.currentTime += 5;
                    break;
                case "ArrowLeft":
                    if (audioRef.current) audioRef.current.currentTime -= 5;
                    break;
                case "Escape":
                    if (showQueue) setShowQueue(false);
                    else dispatch({ type: "STOP_PLAYER" });
                    break;
                case "KeyQ": // 'Q' to toggle queue
                    setShowQueue(prev => !prev);
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentTrack, dispatch, showQueue]);

    // Unified Playback Control
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentTrack) return;

        const handlePlayback = async () => {
            // Normalize URLs to avoid redundant loads
            // Using a try-catch for URL construction to handle relative paths safely
            let normalizedTarget = currentTrack.src;
            try {
                normalizedTarget = new URL(currentTrack.src, window.location.origin).href;
            } catch (e) { }

            const normalizedCurrent = audio.src ? new URL(audio.src, window.location.origin).href : '';

            // 1. Update Source if different
            if (normalizedCurrent !== normalizedTarget) {
                audio.src = currentTrack.src;
                audio.load(); // Force load new source
            } else if (isPlaying && audio.ended) {
                // If same source but ended, reset to start
                audio.currentTime = 0;
            }

            // 2. Manage Playback State
            if (isPlaying) {
                try {
                    await audio.play();
                } catch (err: any) {
                    if (err.name !== "AbortError") {
                        console.error("Audio playback error:", err);
                    }
                }
            } else {
                audio.pause();
            }
        };

        handlePlayback();
    }, [currentTrack?.id, isPlaying]); // Depend on ID to catch same-src replay attempts

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume])

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
        }
    };

    const handleEnded = () => {
        dispatch({ type: "NEXT_TRACK" });
    };

    const togglePlay = () => {
        dispatch({ type: "TOGGLE_PLAY_PAUSE" });
    };

    // Load volume from preferences on mount
    useEffect(() => {
        const loadPrefs = async () => {
            const { getUserPreferences } = await import("@/app/actions/user-preferences");
            const prefs = await getUserPreferences();
            if (prefs?.audio_volume !== undefined) {
                dispatch({ type: "SET_VOLUME", payload: prefs.audio_volume });
            }
        };
        loadPrefs();
    }, [dispatch]);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setProgress(time);
        }
    }

    if (!currentTrack) return null;

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-50 transition-colors duration-300 ${isLean
            ? "bg-slate-900 border-t border-slate-700 text-white"
            : "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
            }`}>

            {/* Queue UI Popup */}
            {showQueue && (
                <div className="container mx-auto px-4 relative">
                    <PlayerQueue />
                </div>
            )}

            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onLoadedMetadata={handleTimeUpdate}
            />

            {/* Progress Bar (at very top) */}
            <div className={`w-full h-1 cursor-pointer group ${isLean ? "bg-slate-800" : "bg-slate-200 dark:bg-slate-800"}`}>
                <div
                    className="h-full bg-emerald-500 relative transition-all duration-100 ease-linear"
                    style={{ width: `${(progress / duration) * 100}%` }}
                >
                    {!isLean && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                </div>
                {/* Invisible Range Input for Interaction */}
                <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={progress}
                    onChange={handleSeek}
                    className="absolute top-0 w-full h-1 opacity-0 cursor-pointer z-10"
                />
            </div>

            <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">

                {/* Track Info */}
                <div className="flex items-center gap-3 w-5/12 md:w-1/3 min-w-0">
                    <div className={`hidden lg:flex w-10 h-10 rounded-lg items-center justify-center font-bold text-xs shrink-0 ${isLean ? "bg-slate-800 text-emerald-400" : "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                        }`}>
                        {currentTrack.surahNumber || "🔊"}
                    </div>
                    <div className="min-w-0 overflow-hidden">
                        <h4 className={`font-bold truncate text-xs md:text-base ${isLean ? "text-white" : "text-slate-900 dark:text-white"}`}>
                            {currentTrack.title}
                        </h4>
                        <p className={`text-[10px] md:text-xs truncate ${isLean ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}>
                            {currentTrack.reciterName}
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 md:gap-6 w-1/3 shrink-0">
                    <button
                        onClick={() => dispatch({ type: "PREV_TRACK" })}
                        className={`transition-colors ${isLean ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                        title="السابق"
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                    </button>

                    <button
                        onClick={togglePlay}
                        className="w-10 h-10 md:w-12 md:h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
                        title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
                    >
                        {isPlaying ? (
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                        ) : (
                            <svg className="w-5 h-5 md:w-6 md:h-6 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        )}
                    </button>

                    <button
                        onClick={() => dispatch({ type: "NEXT_TRACK" })}
                        className={`transition-colors ${isLean ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                        title="التالي"
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                    </button>
                </div>

                {/* Extra & Volume & Close */}
                <div className="w-1/3 flex items-center justify-end gap-2 md:gap-4 min-w-0">
                    <span className={`text-xs font-mono hidden md:block ${isLean ? "text-slate-500" : "text-slate-500"}`}>
                        {formatTime(progress)} / {formatTime(duration)}
                    </span>

                    {/* Queue Toggle Button */}
                    <button
                        onClick={() => setShowQueue(!showQueue)}
                        className={`p-2 transition-colors rounded-full ${showQueue
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400"
                            : isLean ? "text-slate-500 hover:text-emerald-400" : "text-slate-400 hover:text-emerald-600"
                            }`}
                        title="قائمة التشغيل (Q)"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <div className="hidden md:flex items-center gap-2 group relative">
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                        <div className={`w-24 h-1 rounded-full relative ${isLean ? "bg-slate-700" : "bg-slate-200 dark:bg-slate-700"}`}>
                            <div
                                className="h-full bg-slate-500 group-hover:bg-emerald-500 transition-colors"
                                style={{ width: `${volume * 100}%` }}
                            />
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={volume}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    dispatch({ type: "SET_VOLUME", payload: val });
                                    // Debounced sync would be better, but simple call for now
                                    import("@/app/actions/user-preferences").then(m => m.updatePreferences({ audio_volume: val }));
                                }}
                                className="absolute top-0 w-full h-1 opacity-0 cursor-pointer z-10"
                            />
                        </div>
                    </div>

                    {/* Download */}
                    <a
                        href={currentTrack.src}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hidden sm:block p-2 transition-colors ${isLean ? "text-slate-500 hover:text-emerald-400" : "text-slate-400 hover:text-emerald-600"}`}
                        title="تحميل الملف"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </a>

                    {/* Close Button */}
                    <button
                        onClick={() => dispatch({ type: "STOP_PLAYER" })}
                        className={`p-2 transition-colors rounded-full ${isLean ? "text-red-400 hover:bg-slate-800" : "text-red-500 hover:bg-red-50 dark:hover:bg-slate-800"}`}
                        title="إغلاق المشغل"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
