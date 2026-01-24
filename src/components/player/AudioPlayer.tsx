"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePlayer } from "@/hooks/usePlayer";
import { formatTime } from "@/lib/utils";
import { useLeanMode } from "@/context/LeanModeContext";
import { addToHistory, updateLastPosition, getLastPosition } from "@/lib/history-utils";
import { getSurahName } from "@/lib/quran-helpers";
import { incrementPlayCount } from "@/app/actions/recordings";


import PlayerQueue from "./PlayerQueue";
import DownloadButton from "../offline/DownloadButton";
import WaveformVisualizer from "./WaveformVisualizer";

export default function AudioPlayer() {
    const { state, dispatch } = usePlayer();
    const { currentTrack, isPlaying, volume, sleepTimer, playbackRate, repeatMode, shuffle, isMinimized } = state;
    const { isLean } = useLeanMode();
    const audioRef = useRef<HTMLAudioElement>(null);

    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showQueue, setShowQueue] = useState(false);
    const [showSleepMenu, setShowSleepMenu] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    // Moved sleepTimerEndTimeRef down to avoid conflict
    const [showEqualizer, setShowEqualizer] = useState(false);
    const [eqGains, setEqGains] = useState({ bass: 0, mid: 0, treble: 0 });
    const [crossfadeEnabled, setCrossfadeEnabled] = useState(true); // Default enabled


    // Web Audio API Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null); // New Analyser Ref
    const bassFilterRef = useRef<BiquadFilterNode | null>(null);
    const midFilterRef = useRef<BiquadFilterNode | null>(null);
    const trebleFilterRef = useRef<BiquadFilterNode | null>(null);

    const sleepTimerEndTimeRef = useRef<number | null>(null);
    const lastSaveTimeRef = useRef<number>(0);

    const volumeFadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastIncrementedTrackIdRef = useRef<string | null>(null);



    // Helper: Fade Audio (Component Level)
    const fadeAudio = (targetVolume: number, duration: number = 500): Promise<void> => {
        return new Promise((resolve) => {
            const audio = audioRef.current;
            if (!audio) { resolve(); return; }

            if (volumeFadeIntervalRef.current) clearInterval(volumeFadeIntervalRef.current);
            if (!crossfadeEnabled) {
                audio.volume = targetVolume;
                resolve();
                return;
            }

            const startVolume = audio.volume;
            const steps = 20;
            const stepTime = duration / steps;
            const volumeStep = (targetVolume - startVolume) / steps;
            let currentStep = 0;

            volumeFadeIntervalRef.current = setInterval(() => {
                currentStep++;
                const newVolume = startVolume + (volumeStep * currentStep);
                // Clamp volume between 0 and 1
                audio.volume = Math.max(0, Math.min(1, newVolume));

                if (currentStep >= steps) {
                    if (volumeFadeIntervalRef.current) clearInterval(volumeFadeIntervalRef.current);
                    audio.volume = targetVolume; // Ensure final value is exact
                    resolve();
                }
            }, stepTime);
        });
    };


    // Initialize Audio Context and Filters
    useEffect(() => {
        // ... (existing context init code) ...
    }, []);

    // Check for Offline Handoff (Resume playback from offline.html)
    useEffect(() => {
        const resumeFromHandoff = async () => {
            try {
                const handoffStr = localStorage.getItem('offline_handoff');
                if (!handoffStr) return;

                const handoff = JSON.parse(handoffStr);
                console.log("📥 Offline Handoff detected:", handoff);

                // Show a toast if possible (we need to trigger it from outside or import context properly)
                // For now, let's rely on the fact that dispatching PLAY_TRACK will show the player.

                // Clear immediately
                localStorage.removeItem('offline_handoff');

                // Check if recent (10 minutes)
                // Extended timeout to ensure handoff works even on slow connections
                if (Date.now() - handoff.timestamp > 600000) {
                    console.log("⏰ Handoff expired");
                    return;
                }

                // Dispatch track
                dispatch({ type: 'PLAY_TRACK', payload: handoff.track });

                // IMPORT TOAST
                // We'd need to import useToast hook in the component to use it.
                // But we are in useEffect, so we can't switch hooks now.
                // Assuming AudioPlayer doesn't have useToast yet? It has usePlayer.
                // Let's rely on console for now, but if possible, trigger a UI event.
                // Actually, let's keep it simple. If dispatch works, player appears.

                // Wait for audio to be ready
                const waitForAudio = setInterval(() => {
                    if (audioRef.current && audioRef.current.readyState >= 2) {
                        clearInterval(waitForAudio);
                        console.log("🎵 Resuming at", handoff.currentTime);

                        // Force update currentTime again just to be safe
                        audioRef.current.currentTime = handoff.currentTime;

                        if (handoff.isPlaying) {
                            const playPromise = audioRef.current.play();
                            if (playPromise !== undefined) {
                                playPromise
                                    .then(() => console.log("✅ Resumed"))
                                    .catch(e => {
                                        console.error("❌ Play failed (Autoplay policy?)", e);
                                        // If play fails, at least we are at the right time and paused.
                                        // Player UI should show "Play" button.
                                    });
                            }
                        }
                    }
                }, 100);

                // Cleanup after 5s
                setTimeout(() => clearInterval(waitForAudio), 5000);
            } catch (e) {
                console.error("❌ Handoff error:", e);
                localStorage.removeItem('offline_handoff');
            }
        };

        resumeFromHandoff();
    }, [dispatch]);

    useEffect(() => {
        if (!audioRef.current || sourceNodeRef.current) return;

        try {
            console.log('🎛️ Initializing Web Audio API and Equalizer...');
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) {
                console.warn('⚠️ Web Audio API not supported in this browser');
                return;
            }

            const ctx = new AudioContext();
            audioContextRef.current = ctx;
            console.log('✅ AudioContext created, state:', ctx.state);

            const source = ctx.createMediaElementSource(audioRef.current);
            sourceNodeRef.current = source;

            // Create Filters
            const bass = ctx.createBiquadFilter();
            bass.type = 'lowshelf';
            bass.frequency.value = 200; // Bass below 200Hz
            bass.gain.value = 0; // Start at 0dB

            const mid = ctx.createBiquadFilter();
            mid.type = 'peaking';
            mid.frequency.value = 1000; // Mid around 1kHz
            mid.Q.value = 1;
            mid.gain.value = 0; // Start at 0dB

            const treble = ctx.createBiquadFilter();
            treble.type = 'highshelf';
            treble.frequency.value = 3000; // Treble above 3kHz
            treble.gain.value = 0; // Start at 0dB

            // Create Analyser
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64; // Small size for visualizer
            analyserRef.current = analyser;

            // Share Analyser with Context
            dispatch({ type: "SET_ANALYSER", payload: analyser });

            // Connect Graph: Source -> Analyser -> Bass -> Mid -> Treble -> Destination
            // Note: Analyser can be anywhere, but putting it early catches raw audio (pre-EQ) or after (post-EQ).
            // Let's put it pre-EQ for consistent visual even if EQ changes.
            source.connect(analyser); // Connect source to analyser
            analyser.connect(bass); // Connect analyser to rest of chain

            // source.connect(bass); // OLD connection
            bass.connect(mid);
            mid.connect(treble);
            treble.connect(ctx.destination);

            bassFilterRef.current = bass;
            midFilterRef.current = mid;
            trebleFilterRef.current = treble;

            console.log('✅ Audio filters created and connected:', {
                bass: bass.frequency.value + 'Hz',
                mid: mid.frequency.value + 'Hz',
                treble: treble.frequency.value + 'Hz'
            });

        } catch (error) {
            console.error("❌ Web Audio API Error:", error);
        }
    }, []); // Run once on mount

    // Update Filter Gains when state changes
    useEffect(() => {
        if (bassFilterRef.current) {
            bassFilterRef.current.gain.value = eqGains.bass;
            console.log('🎚️ Bass gain updated to:', eqGains.bass, 'dB');
        }
        if (midFilterRef.current) {
            midFilterRef.current.gain.value = eqGains.mid;
            console.log('🎚️ Mid gain updated to:', eqGains.mid, 'dB');
        }
        if (trebleFilterRef.current) {
            trebleFilterRef.current.gain.value = eqGains.treble;
            console.log('🎚️ Treble gain updated to:', eqGains.treble, 'dB');
        }
    }, [eqGains]);

    // Resume AudioContext on Play (Browser Autoplay Policy)
    useEffect(() => {
        if (isPlaying && audioContextRef.current?.state === 'suspended') {
            console.log('▶️ Resuming suspended AudioContext...');
            audioContextRef.current.resume();
        }
    }, [isPlaying]);

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
    // Unified Playback Control
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentTrack) return;



        const handlePlayback = async () => {
            // Normalize URLs to avoid redundant loads
            // Using a try-catch for URL construction to handle relative paths safely
            let normalizedTarget = currentTrack.src;
            if (normalizedTarget.startsWith('//')) {
                normalizedTarget = window.location.protocol + normalizedTarget;
            }

            try {
                normalizedTarget = new URL(normalizedTarget, window.location.origin).href;
            } catch (e) { }

            const normalizedCurrent = audio.src ? new URL(audio.src, window.location.origin).href : '';

            // 1. Update Source if different
            if (normalizedCurrent !== normalizedTarget) {
                if (!currentTrack.src) {
                    console.warn("AudioPlayer: Empty source received for track:", currentTrack.id);
                    return;
                }

                // Fade out old track if playing
                if (!audio.paused && crossfadeEnabled) {
                    // Quick fade out old source doesn't work well because source changes immediately
                    // But we can ensure volume starts at 0 for new track
                }

                // Check if we're offline and if audio is cached
                // Check for cached audio (Offline-First Strategy)
                let sourceToUse = normalizedTarget;

                try {
                    const { getOfflineAudioUrl, isAudioCached } = await import('@/lib/download-manager');
                    const isCached = await isAudioCached(currentTrack.src);

                    if (isCached) {
                        const cachedUrl = await getOfflineAudioUrl(currentTrack.src);
                        if (cachedUrl) {
                            sourceToUse = cachedUrl;
                            console.log("AudioPlayer: Using cached audio (blob URL) - Offline ready");
                        }
                    }
                } catch (err) {
                    console.warn("AudioPlayer: Error checking cache:", err);
                }

                console.log("AudioPlayer: Changing source to:", sourceToUse);
                audio.src = sourceToUse;
                audio.load(); // Force load new source

                // Check history for resume position
                const lastPos = getLastPosition(currentTrack.id);
                if (lastPos > 5) { // Only resume if > 5 seconds in
                    audio.currentTime = lastPos;
                }

                // Start with 0 volume for fade in
                if (crossfadeEnabled && isPlaying) {
                    audio.volume = 0;
                }

            } else if (isPlaying && audio.ended) {
                // If same source but ended, reset to start
                audio.currentTime = 0;
                if (crossfadeEnabled) audio.volume = 0;
            }

            // 2. Manage Playback State
            if (isPlaying) {
                try {
                    // If previously paused or just loaded, we want to play
                    if (audio.paused) {
                        await audio.play();
                        // Fade In to target volume
                        fadeAudio(volume, 1000);
                    } else {
                        // Already playing, just ensure volume is correct
                        fadeAudio(volume, 500);
                    }
                } catch (err: any) {
                    if (err.name !== "AbortError") {
                        console.error("Audio playback error:", err);
                    }
                }
            } else {
                // We want to pause
                if (!audio.paused) {
                    await fadeAudio(0, 400);
                    audio.pause();
                }
            }
        };

        handlePlayback();
    }, [currentTrack?.id, isPlaying]); // Depend on ID to catch same-src replay attempts

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume])

    // Apply Playback Rate
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);

            // Robust Sleep Timer Hard-Stop
            if (sleepTimerEndTimeRef.current && Date.now() >= sleepTimerEndTimeRef.current) {
                sleepTimerEndTimeRef.current = null;
                dispatch({ type: "STOP_PLAYER" });
                dispatch({ type: "CLEAR_SLEEP_TIMER" });
            }

            // Save Progress Periodically (every 2 seconds)
            if (currentTrack && Date.now() - lastSaveTimeRef.current > 2000) {
                updateLastPosition(currentTrack.id, audioRef.current.currentTime);
                lastSaveTimeRef.current = Date.now();
            }
        }
    };

    const handleEnded = () => {
        dispatch({ type: "NEXT_TRACK" });
    };

    const togglePlay = () => {
        dispatch({ type: "TOGGLE_PLAY_PAUSE" });
    };

    // Smart Navigation Handlers with Fade Out
    const handleNextTrack = async () => {
        if (isPlaying && crossfadeEnabled) {
            await fadeAudio(0, 500);
        }
        dispatch({ type: "NEXT_TRACK" });
    };

    const handlePrevTrack = async () => {
        if (isPlaying && crossfadeEnabled) {
            await fadeAudio(0, 500);
        }
        dispatch({ type: "PREV_TRACK" });
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

    // Sleep Timer UI Sync Logic
    useEffect(() => {
        if (!sleepTimer) {
            setTimeRemaining(null);
            sleepTimerEndTimeRef.current = null;
            return;
        }

        // Set the end time once when sleepTimer is changed
        const endTime = Date.now() + sleepTimer * 60 * 1000;
        sleepTimerEndTimeRef.current = endTime;
        setTimeRemaining(sleepTimer);

        const interval = setInterval(() => {
            if (!sleepTimerEndTimeRef.current) {
                clearInterval(interval);
                return;
            }
            const remaining = Math.ceil((sleepTimerEndTimeRef.current - Date.now()) / 1000 / 60);
            if (remaining <= 0) {
                setTimeRemaining(null);
                clearInterval(interval);
            } else {
                setTimeRemaining(remaining);
            }
        }, 1000 * 30); // Update UI every 30 seconds

        return () => clearInterval(interval);
    }, [sleepTimer]);

    // Add to History when track starts playing & Increment Play Count
    useEffect(() => {
        if (currentTrack && isPlaying) {
            addToHistory({
                trackId: currentTrack.id,
                title: currentTrack.title,
                reciterName: currentTrack.reciterName,
                surahNumber: currentTrack.surahNumber,
                src: currentTrack.src
            });

            // Increment Play Count (Once per track session)
            if (lastIncrementedTrackIdRef.current !== currentTrack.id) {
                incrementPlayCount(currentTrack.id);
                lastIncrementedTrackIdRef.current = currentTrack.id;
            }
        }
    }, [currentTrack?.id, isPlaying]);


    // Media Session API - Update metadata for mobile lock screen
    useEffect(() => {
        if (!currentTrack || !('mediaSession' in navigator)) return;

        try {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentTrack.title,
                artist: currentTrack.reciterName,
                album: currentTrack.surahNumber ? `سورة ${getSurahName(currentTrack.surahNumber)}` : 'موسوعة القراء',
                artwork: [
                    { src: '/logo.png', sizes: '192x192', type: 'image/png' },
                    { src: '/logo.png', sizes: '512x512', type: 'image/png' }
                ]
            });

            // Set action handlers
            navigator.mediaSession.setActionHandler('play', () => {
                dispatch({ type: "TOGGLE_PLAY_PAUSE" });
            });

            navigator.mediaSession.setActionHandler('pause', () => {
                dispatch({ type: "TOGGLE_PLAY_PAUSE" });
            });

            navigator.mediaSession.setActionHandler('previoustrack', () => {
                dispatch({ type: "PREV_TRACK" });
            });

            navigator.mediaSession.setActionHandler('nexttrack', () => {
                dispatch({ type: "NEXT_TRACK" });
            });

        } catch (error) {
            console.warn('[MediaSession] Error setting metadata:', error);
        }
    }, [currentTrack, dispatch]);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setProgress(time);
        }
    }

    if (!currentTrack) return null;

    // Radio Mode: Hide Main Player UI, keep Audio Element active
    if (currentTrack.isRadio) {
        return (
            <audio
                key="radio-audio"
                ref={audioRef}
                crossOrigin="anonymous"
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onLoadedMetadata={handleTimeUpdate}
                onError={(e) => {
                    console.error("Audio error", e);
                }}
            />
        );
    }

    return (
        <>
            <audio
                key="persistent-audio"
                ref={audioRef}
                crossOrigin="anonymous"
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onLoadedMetadata={handleTimeUpdate}
                onError={(e) => {
                    const audio = e.currentTarget;
                    console.error("AudioPlayer: <audio> error event:", {
                        code: audio.error?.code,
                        message: audio.error?.message,
                        src: audio.src
                    });
                }}
            />

            {isMinimized ? (
                <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 md:w-auto md:min-w-[300px] pointer-events-none flex justify-center md:justify-end">
                    <div className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 flex items-center gap-3 w-full md:w-auto relative overflow-hidden transition-all duration-300 group">
                        {/* Progress Bar Background */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-300"
                                style={{ width: `${(progress / duration) * 100}%` }}
                            />
                        </div>

                        {/* Icon */}
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 pr-2">
                            <h3 className="font-bold text-xs truncate text-slate-900 dark:text-slate-100">{currentTrack.title}</h3>
                            <p className="text-[10px] text-slate-500 truncate">{currentTrack.reciterName}</p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => dispatch({ type: "TOGGLE_PLAY_PAUSE" })}
                                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                            >
                                {isPlaying ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    </svg>
                                )}
                            </button>

                            <button
                                onClick={() => dispatch({ type: "TOGGLE_MINIMIZED" })}
                                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                                title="توسيع المشغل"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            </button>

                            <button
                                onClick={() => dispatch({ type: "STOP_PLAYER" })}
                                className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={`fixed bottom-0 left-0 right-0 z-50 transition-colors duration-300 ${isLean
                    ? "bg-slate-900 border-t border-slate-700 text-white"
                    : "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
                    }`}>

                    {/* Ambient Visualizer Background */}
                    <div className="absolute inset-0 z-0 opacity-35 pointer-events-none flex items-center justify-center">
                        <WaveformVisualizer
                            analyser={analyserRef.current}
                            isPlaying={isPlaying}
                            color={isLean ? "#34d399" : "#10b981"}
                            allowSimulation={true}
                        />
                    </div>

                    {/* Queue UI Popup */}
                    {showQueue && (
                        <div className="container mx-auto px-4 relative z-20">
                            <div className="absolute bottom-0 right-0 left-0">
                                <PlayerQueue onClose={() => setShowQueue(false)} />
                            </div>
                        </div>
                    )}


                    {/* REWRITING THE ABOVE SECTION WITH PROPER LOGIC */}
                    <div className="w-full relative z-10 group -mt-1 pt-1 mb-1">
                        <div className={`w-full h-1.5 md:h-2 cursor-pointer relative rounded-full overflow-hidden transition-all duration-300 ${isLean ? "bg-slate-800" : "bg-slate-200 dark:bg-slate-800"
                            }`}>
                            {/* Background Track */}
                            <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700/50 opacity-50"></div>

                            {/* Progress Fill - Using margin-inline-end for RTL support naturally? No, width grows from start. In RTL start is Right. */}
                            <div
                                className="h-full bg-emerald-500 relative transition-all duration-100 ease-linear rounded-full"
                                style={{ width: `${(progress / duration) * 100}%` }}
                            >
                                {/* Highlight Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                            </div>
                        </div>

                        {/* Thumb - Use inset-inline-start (CSS logical property) for auto RTL/LTR flip */}
                        <div
                            className="absolute top-1/2 -translate-y-[calc(50%-2px)] w-4 h-4 bg-white border-2 border-emerald-500 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                            style={{
                                insetInlineStart: `${(progress / duration) * 100}%`,
                                transform: `translate(-50%, -50%)` // Actually standard translate(-50%) centers it. In RTL 50% means rightwards?
                                // Let's simplify: Just center on the point.
                            }}
                        >
                            {/* Inner Dot */}
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                        </div>

                        {/* Invisible Range Input - Browser handles RTL automatically for range inputs */}
                        <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            value={progress}
                            onChange={handleSeek}
                            className="absolute top-0 left-0 right-0 w-full h-4 -mt-1 opacity-0 cursor-pointer z-20"
                            style={{ direction: 'inherit' }} // Inherit RTL from body
                        />
                    </div>

                    <div className="container mx-auto px-4 py-2 md:py-3 relative z-10">
                        {/* Mobile Layout: 2 Rows to prevent crushing */}
                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">

                            {/* Row 1 (Mobile): Info & Time */}
                            <div className="flex items-center gap-3 w-full md:w-1/3 min-w-0">
                                <div className={`flex w-12 h-12 md:w-14 md:h-14 rounded-xl items-center justify-center font-bold text-sm shrink-0 relative overflow-hidden shadow-sm ${isLean ? "bg-slate-800 text-emerald-400" : "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                                    }`}>
                                    <div className="absolute inset-x-0 bottom-0 top-0 z-0">
                                        <WaveformVisualizer
                                            analyser={analyserRef.current}
                                            isPlaying={isPlaying}
                                            color={isLean ? "#34d399" : "#10b981"}
                                        />
                                    </div>
                                    <span className="relative z-10 drop-shadow-sm font-bold">
                                        {currentTrack.surahNumber || "🔊"}
                                    </span>
                                </div>

                                <div className="min-w-0 flex-1 overflow-hidden flex flex-col justify-center">
                                    <h4 className={`font-bold text-sm md:text-lg leading-tight truncate ${isLean ? "text-white" : "text-slate-900 dark:text-white"}`}>
                                        {currentTrack.title}
                                    </h4>
                                    <p className={`text-xs md:text-sm font-medium truncate ${isLean ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}>
                                        {currentTrack.reciterName}
                                    </p>
                                </div>

                                {/* Time Display (Mobile - Compact) */}
                                <div className="flex md:hidden flex-col items-end shrink-0 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                    <span className="text-emerald-600 dark:text-emerald-400">{formatTime(progress)}</span>
                                    <span className="opacity-50 text-[10px]">{formatTime(duration)}</span>
                                </div>
                            </div>

                            {/* Main Controls (Desktop & Mobile Unified) */}
                            <div className="flex items-center justify-between md:justify-center gap-4 md:gap-8 w-full md:w-1/3">
                                {/* Mobile-only: Secondary Controls placed left of main controls */}
                                <div className="flex md:hidden items-center gap-2">
                                    <button
                                        onClick={() => setShowQueue(!showQueue)}
                                        className="p-2 text-slate-400 hover:text-emerald-500"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                    </button>
                                </div>

                                <div className="flex items-center justify-center gap-4 md:gap-6 flex-1 md:flex-none">
                                    <button
                                        onClick={handlePrevTrack}
                                        className={`transition-colors p-1 ${isLean ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                                    >
                                        <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                                    </button>

                                    <button
                                        onClick={togglePlay}
                                        className="w-12 h-12 md:w-14 md:h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
                                    >
                                        {isPlaying ? (
                                            <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                        ) : (
                                            <svg className="w-6 h-6 md:w-7 md:h-7 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                        )}
                                    </button>

                                    <button
                                        onClick={handleNextTrack}
                                        className={`transition-colors p-1 ${isLean ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                                    >
                                        <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                                    </button>
                                </div>

                                {/* Mobile-only: More Utilities */}
                                <div className="flex md:hidden items-center gap-2">
                                    <DownloadButton
                                        trackId={currentTrack.id}
                                        title={currentTrack.title}
                                        reciterName={currentTrack.reciterName}
                                        audioUrl={currentTrack.src}
                                        surahNumber={currentTrack.surahNumber}
                                        minimal={true}
                                    />
                                </div>
                            </div>


                            {/* Extra & Volume & Close - Desktop Only (Mobile has its own scattered controls) */}
                            <div className="hidden md:flex w-1/3 flex-row items-center justify-end gap-2">
                                {/* Time Display (Desktop) */}
                                <div className={`flex flex-col items-end mx-2 ${isLean ? "text-slate-400" : "text-slate-600 dark:text-slate-300"}`}>
                                    <span className="text-sm font-bold font-mono tracking-wider">{formatTime(progress)}</span>
                                    <span className="text-[10px] opacity-70">{formatTime(duration)}</span>
                                </div>

                                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

                                {/* Utilities Group */}
                                <div className="flex items-center gap-1">
                                    <button onClick={() => dispatch({ type: "TOGGLE_SHUFFLE" })} className={`p-1.5 rounded-lg ${shuffle ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "text-slate-400 hover:text-slate-600"}`}>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                    </button>

                                    {/* Repeat */}
                                    {/* ... (Repeat Logic same as before) ... */}
                                    <button
                                        onClick={() => {
                                            const modes: Array<'off' | 'one' | 'all'> = ['off', 'one', 'all'];
                                            const currentIdx = modes.indexOf(repeatMode);
                                            const nextMode = modes[(currentIdx + 1) % modes.length];
                                            dispatch({ type: "SET_REPEAT_MODE", payload: nextMode });
                                        }}
                                        className={`p-1.5 rounded-lg ${repeatMode !== 'off' ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "text-slate-400 hover:text-slate-600"}`}
                                    >
                                        {repeatMode === 'one' ? (
                                            <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                <text x="12" y="16" fontSize="10" textAnchor="middle" fill="currentColor" fontWeight="bold">1</text>
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                        )}
                                    </button>

                                    {/* Volume */}
                                    <div className="flex items-center gap-2 group ml-2">
                                        <svg className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        </svg>
                                        <div className="w-20 h-1 bg-slate-200 dark:bg-slate-700 rounded-full relative overflow-hidden">
                                            <div className="h-full bg-emerald-500" style={{ width: `${volume * 100}%` }}></div>
                                            <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                dispatch({ type: "SET_VOLUME", payload: val });
                                                import("@/app/actions/user-preferences").then(m => m.updatePreferences({ audio_volume: val }));
                                            }} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                    </div>

                                    {/* Close */}
                                    <button onClick={() => dispatch({ type: "STOP_PLAYER" })} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg ml-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* Second Row for Mobile (Utilities) - Hidden on Desktop */}
                        <div className="flex md:hidden items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                            {/* Shuffle */}
                            <button
                                onClick={() => dispatch({ type: "TOGGLE_SHUFFLE" })}
                                className={`p-1.5 transition-all duration-200 rounded-lg ${shuffle
                                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 scale-110"
                                    : "text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:scale-105"
                                    }`}
                                title={shuffle ? 'إلغاء العشوائي' : 'تشغيل عشوائي'}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </button>

                            {/* Repeat */}
                            <button
                                onClick={() => {
                                    const modes: Array<'off' | 'one' | 'all'> = ['off', 'one', 'all'];
                                    const currentIdx = modes.indexOf(repeatMode);
                                    const nextMode = modes[(currentIdx + 1) % modes.length];
                                    dispatch({ type: "SET_REPEAT_MODE", payload: nextMode });
                                }}
                                className={`p-1.5 transition-all duration-200 rounded-lg ${repeatMode !== 'off'
                                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 scale-110"
                                    : "text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:scale-105"
                                    }`}
                                title={repeatMode === 'one' ? 'تكرار التلاوة' : repeatMode === 'all' ? 'تكرار الكل' : 'بدون تكرار'}
                            >
                                {repeatMode === 'one' ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        <text x="12" y="16" fontSize="10" textAnchor="middle" fill="currentColor" fontWeight="bold">1</text>
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                )}
                            </button>

                            {/* Equalizer Button */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowEqualizer(!showEqualizer)}
                                    className={`p-1.5 rounded-lg transition-all duration-200 ${showEqualizer ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 scale-110" : "text-slate-400 hover:text-emerald-500 hover:scale-105"}`}
                                    title="المعادل الصوتي"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                </button>

                                {/* EQ Popup - Positioned carefully */}
                                {showEqualizer && (
                                    <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 w-48 z-50">
                                        <h4 className="text-center font-bold text-sm mb-3">المعادل الصوتي</h4>
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] text-slate-500">
                                                    <span>Bass</span>
                                                    <span>{eqGains.bass}dB</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="-10"
                                                    max="10"
                                                    value={eqGains.bass}
                                                    onChange={(e) => setEqGains(p => ({ ...p, bass: Number(e.target.value) }))}
                                                    className="w-full accent-emerald-500 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] text-slate-500">
                                                    <span>Mid</span>
                                                    <span>{eqGains.mid}dB</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="-10"
                                                    max="10"
                                                    value={eqGains.mid}
                                                    onChange={(e) => setEqGains(p => ({ ...p, mid: Number(e.target.value) }))}
                                                    className="w-full accent-emerald-500 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] text-slate-500">
                                                    <span>Treble</span>
                                                    <span>{eqGains.treble}dB</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="-10"
                                                    max="10"
                                                    value={eqGains.treble}
                                                    onChange={(e) => setEqGains(p => ({ ...p, treble: Number(e.target.value) }))}
                                                    className="w-full accent-emerald-500 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                            <button
                                                onClick={() => setEqGains({ bass: 0, mid: 0, treble: 0 })}
                                                className="w-full py-1 text-xs text-slate-400 hover:text-emerald-500 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                            >
                                                إعادة ضبط (Reset)
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Speed Dropdown */}
                            <div className="relative group">
                                <select
                                    value={playbackRate}
                                    onChange={(e) => dispatch({ type: "SET_PLAYBACK_RATE", payload: parseFloat(e.target.value) })}
                                    className="appearance-none bg-transparent text-[10px] font-bold px-1 py-0.5 rounded cursor-pointer hover:text-emerald-500 transition-colors text-slate-500"
                                    title="سرعة التشغيل"
                                >
                                    <option value="0.5">0.5</option>
                                    <option value="0.75">0.75</option>
                                    <option value="1">1.0</option>
                                    <option value="1.25">1.25</option>
                                    <option value="1.5">1.5</option>
                                    <option value="2">2.0</option>
                                </select>
                            </div>

                            {/* History */}
                            <Link
                                href="/history"
                                className="p-1.5 transition-colors rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                                title="سجل الاستماع"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </Link>

                            {/* Sleep Timer */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSleepMenu(!showSleepMenu)}
                                    className={`p-1.5 transition-colors rounded-lg ${sleepTimer
                                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                                        : "text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                                        }`}
                                    title={sleepTimer ? `مؤقت: ${timeRemaining}د` : "مؤقت النوم"}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                </button>

                                {showSleepMenu && (
                                    <div className="absolute bottom-full right-0 md:right-auto md:left-0 mb-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-2 min-w-[140px] z-[100]">
                                        <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-2 py-1 mb-1 border-b border-slate-100 dark:border-slate-700">مؤقت النوم</div>
                                        {[15, 30, 45, 60, 90].map((minutes) => (
                                            <button
                                                key={minutes}
                                                onClick={() => {
                                                    dispatch({ type: "SET_SLEEP_TIMER", payload: minutes });
                                                    setShowSleepMenu(false);
                                                    // Feedback for mobile
                                                    if (window.innerWidth < 768) {
                                                        alert(`تم ضبط مؤقت النوم بعد ${minutes} دقيقة`);
                                                    }
                                                }}
                                                className="w-full text-right px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 rounded transition-colors text-slate-700 dark:text-slate-300 flex justify-between items-center"
                                            >
                                                <span>{minutes} دقيقة</span>
                                                {sleepTimer === minutes && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
                                            </button>
                                        ))}
                                        {sleepTimer && (
                                            <button
                                                onClick={() => {
                                                    dispatch({ type: "CLEAR_SLEEP_TIMER" });
                                                    setShowSleepMenu(false);
                                                }}
                                                className="w-full text-right px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors text-red-600 dark:text-red-400 border-t border-slate-100 dark:border-slate-700 mt-2 pt-2 font-bold"
                                            >
                                                إلغاء المؤقت
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Mobile Minimize */}
                            <button
                                onClick={() => dispatch({ type: "TOGGLE_MINIMIZED" })}
                                className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title="تصغير"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
