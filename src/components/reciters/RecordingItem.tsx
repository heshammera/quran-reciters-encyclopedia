"use client";

import Link from "next/link";
import { Track } from "@/types/player";
import PlayButton from "@/components/player/PlayButton";
import QueueButton from "@/components/player/QueueButton";
import DownloadButton from "@/components/offline/DownloadButton";
import { getSurahName } from "@/lib/quran-helpers";
import { useEffect, useState } from "react";
import { usePlayer } from "@/hooks/usePlayer";
import { getLastPosition } from "@/lib/history-utils";
import { formatTime } from "@/lib/utils";
import { formatDualYear } from "@/lib/date-utils";
import { formatRecordingDate } from "@/lib/format-date";

interface RecordingItemProps {
    recording: any;
    track: Track | null;
    contextTracks: Track[];
    reciter: any;
    section: any;
    onVideoSelect?: (recording: any) => void;
    showReciterName?: boolean;
}

export default function RecordingItem({
    recording,
    track,
    contextTracks,
    reciter,
    section,
    onVideoSelect,
    showReciterName = false
}: RecordingItemProps) {
    const { state } = usePlayer();
    const isVideo = recording.type === 'video';
    const [progress, setProgress] = useState(0);

    const isCurrentTrack = !isVideo && track && state.currentTrack?.id === track.id;
    const isPlaying = isCurrentTrack && state.isPlaying;

    useEffect(() => {
        if (!isVideo && track) {
            const pos = getLastPosition(track.id);
            if (pos > 0) setProgress(pos);
        }
    }, [isVideo, track]);

    return (
        <div className={`p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 group transition-all border-b last:border-0 relative overflow-hidden ${isCurrentTrack
            ? "bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-500/50 dark:border-emerald-500/30 shadow-sm"
            : "hover:bg-slate-50 dark:hover:bg-slate-700/50 border-slate-100 dark:border-slate-700/50"
            }`}>
            {/* Active Indicator Strip */}
            {isCurrentTrack && (
                <div className={`absolute top-0 right-0 bottom-0 w-1 bg-emerald-500 ${isPlaying ? 'animate-pulse' : ''}`} />
            )}
            {/* Main Content Area */}
            <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center gap-3">
                    {/* Video/Audio Indicator Icon */}
                    <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center transition-colors ${isVideo
                        ? "bg-red-100 dark:bg-red-900/30 text-red-600"
                        : isCurrentTrack
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                            : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                        }`}>
                        {isVideo ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" /></svg>
                        ) : isPlaying ? (
                            // Animated Equalizer (CSS in globals.css)
                            <div className="flex items-end gap-[3px] h-4 mb-1 justify-center">
                                <div className="w-1 bg-white rounded-full animate-equalizer" style={{ animationDuration: '0.8s' }} />
                                <div className="w-1 bg-white rounded-full animate-equalizer" style={{ animationDelay: '0.2s', animationDuration: '1s' }} />
                                <div className="w-1 bg-white rounded-full animate-equalizer" style={{ animationDelay: '0.4s', animationDuration: '0.7s' }} />
                            </div>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="block group/link">
                            <h4 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover/link:text-emerald-600 dark:group-hover/link:text-emerald-400 transition-colors">
                                {recording.title || (recording.surah_number ? `سورة ${getSurahName(recording.surah_number)}` : 'تسجيل عام')}
                                {isVideo && <span className="mr-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded-full">فيديو</span>}
                            </h4>

                            {showReciterName && reciter?.name_ar && (
                                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                                    القارئ: {reciter.name_ar}
                                </p>
                            )}

                            {recording.recording_coverage && recording.recording_coverage.length > 0 ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {recording.recording_coverage.map((seg: any, idx: number) => (
                                        <span key={idx} className="text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                                            سورة {getSurahName(seg.surah_number)} ({seg.ayah_start}-{seg.ayah_end})
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                recording.surah_number && (
                                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">
                                        سورة {getSurahName(recording.surah_number)} ({recording.ayah_start}-{recording.ayah_end})
                                    </p>
                                )
                            )}

                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm">
                                {/* عدد مرات الاستماع */}
                                {recording.play_count !== undefined && recording.play_count !== null && (
                                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1" title="عدد مرات الاستماع">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        </svg>
                                        {Number(recording.play_count || 0).toLocaleString('ar-EG')}
                                    </span>
                                )}
                                {/* التاريخ */}
                                {recording.recording_date && (
                                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {formatRecordingDate(
                                            recording.recording_date.year,
                                            recording.recording_date.month,
                                            recording.recording_date.day,
                                            recording.recording_date.time_period
                                        )}
                                    </span>
                                )}
                                {/* المكان التفصيلي */}
                                {recording.venue && (
                                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        {recording.venue}
                                    </span>
                                )}
                                {/* الدولة */}
                                {recording.city && (
                                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {recording.city}
                                    </span>
                                )}
                                {/* الناشر */}
                                {recording.publisher && (
                                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                        </svg>
                                        {recording.publisher}
                                    </span>
                                )}
                                {/* الألبوم */}
                                {recording.album && (
                                    <span className="text-xs text-slate-700 dark:text-slate-300 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                        </svg>
                                        {recording.album}
                                    </span>
                                )}
                            </div>

                        </div>

                        {/* Progress Bar - Moved outside Link for better layout stability */}
                        {progress > 0 && (
                            <div className="mt-2 w-full max-w-[200px]">
                                <div className="flex items-center justify-between text-sm text-emerald-600 dark:text-emerald-400 mb-1 font-medium">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        متابعة من {formatTime(progress)}
                                    </span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full"
                                        style={{ width: '15%' }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions Area - Mobile Column, Desktop Row */}
            <div className="relative z-20 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0 mt-3 sm:mt-0">
                {isVideo ? (
                    <button
                        onClick={() => onVideoSelect?.(recording)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-colors text-sm font-bold min-w-[140px]"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        مشاهدة الفيديو
                    </button>
                ) : (
                    <>
                        {/* Desktop: Single Row | Mobile: Two Rows (Play/Queue + Download) */}
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <PlayButton
                                    track={track!}
                                    contextTracks={contextTracks}
                                    label="استماع"
                                    className="flex-1 sm:flex-none sm:min-w-[120px]"
                                />
                                <QueueButton
                                    track={track!}
                                    variant="outline"
                                    label="للقائمة"
                                    className="flex-1 sm:flex-none sm:min-w-[120px]"
                                />
                            </div>

                            {/* Save Offline */}
                            {recording.media_files?.[0]?.archive_url && (
                                <DownloadButton
                                    trackId={track!.id}
                                    title={track!.title}
                                    reciterName={track!.reciterName}
                                    audioUrl={track!.src}
                                    surahNumber={track!.surahNumber}
                                    fullWidth
                                    className="sm:w-auto sm:min-w-[140px]"
                                />
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Global Link Overlay */}
            <Link
                href={`/recordings/${recording.id}`}
                className="absolute inset-0 z-10"
                aria-label={recording.title || 'عرض تفاصيل التلاوة'}
            />
        </div>
    );
}
