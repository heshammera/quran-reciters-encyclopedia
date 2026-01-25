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

    // Format metadata to show in the bottom row
    const playCount = recording.play_count ? Number(recording.play_count).toLocaleString('ar-EG') : null;
    const dateStr = recording.recording_date ? formatRecordingDate(recording.recording_date.year, recording.recording_date.month, recording.recording_date.day, recording.recording_date.time_period) : null;

    return (
        <div className={`p-5 flex flex-col gap-4 group transition-all border-b-2 last:border-0 relative overflow-hidden ${isCurrentTrack
            ? "bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-500/50 dark:border-emerald-500/30 shadow-sm"
            : "hover:bg-slate-50 dark:hover:bg-slate-700/50 border-slate-200 dark:border-slate-700/50"
            }`}>

            {/* Active Indicator Strip */}
            {isCurrentTrack && (
                <div className={`absolute top-0 right-0 bottom-0 w-1.5 bg-emerald-500 ${isPlaying ? 'animate-pulse' : ''}`} />
            )}

            {/* Row 1: Title & icon */}
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-11 h-11 rounded-full shrink-0 flex items-center justify-center transition-colors ${isVideo
                    ? "bg-red-100 dark:bg-red-900/30 text-red-600"
                    : isCurrentTrack
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                    }`}>
                    {isVideo ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" /></svg>
                    ) : isPlaying ? (
                        <div className="flex items-end gap-[3px] h-4 mb-1 justify-center">
                            <div className="w-1 bg-white rounded-full animate-equalizer" style={{ animationDuration: '0.8s' }} />
                            <div className="w-1 bg-white rounded-full animate-equalizer" style={{ animationDelay: '0.2s', animationDuration: '1s' }} />
                            <div className="w-1 bg-white rounded-full animate-equalizer" style={{ animationDelay: '0.4s', animationDuration: '0.7s' }} />
                        </div>
                    ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                    )}
                </div>

                {/* Title Text */}
                <div className="flex-1 pt-1.5">
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed w-full">
                        {recording.title || (recording.surah_number ? `سورة ${getSurahName(recording.surah_number)}` : 'تسجيل عام')}
                        {isVideo && <span className="mr-2 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full align-middle">فيديو</span>}
                    </h4>

                    {/* Secondary Info directly under title (like Reciter Name or Surah Details) */}
                    <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-slate-600 dark:text-slate-400">
                        {showReciterName && reciter?.name_ar && <span>القارئ: {reciter.name_ar}</span>}
                        {recording.surah_number && !recording.title && <span>({recording.ayah_start}-{recording.ayah_end})</span>}
                    </div>

                    {/* Progress Bar (if exists) */}
                    {progress > 0 && (
                        <div className="mt-2 w-full max-w-[200px]">
                            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>متابعة من {formatTime(progress)}</span>
                            </div>
                            <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full w-[15%]" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Row 2: Actions (Left) & Detailed Metadata (Right) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-1 pl-0 sm:pl-[60px]"> {/* Indent to align with text */}

                {/* Metadata (Right Side in RTL) */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 w-full sm:w-auto order-2 sm:order-1 justify-start">

                    {/* Play Count */}
                    {playCount && (
                        <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-100 dark:border-white/5">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                            {playCount}
                        </span>
                    )}

                    {/* Date */}
                    {dateStr && (
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {dateStr}
                        </span>
                    )}

                    {/* Venue/City */}
                    {(recording.venue || recording.city) && (
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {recording.venue || recording.city}
                        </span>
                    )}
                </div>

                {/* Buttons (Left Side in RTL) */}
                <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2 justify-end relative z-20">
                    {isVideo ? (
                        <button
                            onClick={() => onVideoSelect?.(recording)}
                            className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm hover:shadow transition-all text-sm font-bold w-full sm:w-auto justify-center"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            مشاهدة
                        </button>
                    ) : (
                        <>
                            {/* Desktop: Buttons Row */}
                            <PlayButton
                                track={track!}
                                contextTracks={contextTracks}
                                label="استماع"
                                className="flex-1 sm:flex-none sm:min-w-[100px] shadow-sm"
                            />
                            <QueueButton
                                track={track!}
                                variant="outline"
                                label="للقائمة"
                                className="flex-1 sm:flex-none sm:min-w-[100px] bg-white dark:bg-transparent"
                            />
                            {recording.media_files?.[0]?.archive_url && (
                                <DownloadButton
                                    trackId={track!.id}
                                    title={track!.title}
                                    reciterName={track!.reciterName}
                                    audioUrl={track!.src}
                                    surahNumber={track!.surahNumber}
                                    className="sm:w-auto"
                                    iconOnly
                                />
                            )}
                        </>
                    )}
                </div>

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
