"use client";

import Link from "next/link";
import { formatDualYear } from "@/lib/date-utils";
import PlayButton from "@/components/player/PlayButton";
import DownloadButton from "@/components/offline/DownloadButton";
import { Track } from "@/types/player";

interface RecordingSidebarProps {
    recording: any;
    displayTitle: string;
    track: Track; // Pre-formatted track object for player
    contextTracks: Track[];
}

export default function RecordingSidebar({ recording, displayTitle, track, contextTracks }: RecordingSidebarProps) {
    return (
        // Mobile: w-full, auto height, natural flow. Desktop: Fixed width, full height scrollable.
        <aside className="w-full lg:w-[400px] xl:w-[450px] bg-white dark:bg-[#0f172a] border-b lg:border-b-0 lg:border-l border-slate-200 dark:border-white/10 flex flex-col p-6 lg:p-10 lg:h-full lg:overflow-y-auto relative z-20 shadow-sm dark:shadow-[10px_0_30px_rgba(0,0,0,0.3)] shrink-0 transition-colors duration-300">

            {/* 1. Cover Art (Reciter Image) */}
            {/* Fixed constraints: max-w on mobile/desktop to prevent it from being huge */}
            <div className="w-48 h-48 md:w-56 md:h-56 mx-auto mb-6 lg:mb-8 relative shrink-0">
                {recording.reciter.image_url ? (
                    <img
                        src={recording.reciter.image_url}
                        alt={recording.reciter.name_ar}
                        className="w-full h-full object-cover rounded-2xl shadow-xl dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] border border-slate-100 dark:border-white/10"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-4xl shadow-inner">
                        🎙️
                    </div>
                )}
            </div>

            {/* 2. Typography */}
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white text-center mb-2 leading-snug">
                {displayTitle}
            </h1>

            <div className="flex items-center justify-center gap-2 mb-6">
                <Link href={`/reciters/${recording.reciter.id}`} className="text-base md:text-lg font-bold text-emerald-600 dark:text-emerald-500 hover:underline">
                    الشيخ {recording.reciter.name_ar}
                </Link>
                <span className="text-amber-500 text-base md:text-lg">★</span>
            </div>

            {/* 3. Tags Grid */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
                {recording.recording_date?.year && (
                    <Link href={`/reciters/${recording.reciter.id}/filter?type=year&value=${recording.recording_date.year}`}>
                        <span className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                            📅 {formatDualYear(recording.recording_date.year)}
                        </span>
                    </Link>
                )}
                {recording.city && (
                    <Link href={`/reciters/${recording.reciter.id}/filter?type=city&value=${encodeURIComponent(recording.city)}`}>
                        <span className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                            📍 {recording.city}
                        </span>
                    </Link>
                )}
                <Link href={`/reciters/${recording.reciter.id}/${recording.section?.slug}`}>
                    <span className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                        📂 {recording.section?.name_ar || 'تلاوة'}
                    </span>
                </Link>
                {recording.album && (
                    <span className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400">
                        💿 {recording.album}
                    </span>
                )}
            </div>

            {/* 4. Action Buttons (Stacked) */}
            <div className="flex flex-col gap-4 mt-auto w-full max-w-sm mx-auto lg:max-w-none">
                <div className="w-full">
                    <PlayButton
                        track={track}
                        contextTracks={contextTracks}
                        label={typeof window !== 'undefined' ? "تشغيل الآن" : "تشغيل الآن"}
                        className="w-full py-3.5 md:py-4 text-base rounded-xl !bg-emerald-500 !text-white hover:!bg-emerald-600 shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)]"
                        size="lg"
                    />
                </div>

                <div className="w-full">
                    <DownloadButton
                        trackId={track.id}
                        title={track.title}
                        reciterName={track.reciterName || ''}
                        audioUrl={track.src}
                        surahNumber={recording.surah_number}
                        fullWidth
                        className="py-3.5 md:py-4 text-base rounded-xl !bg-transparent !border-2 !border-slate-200 dark:!border-slate-700 !text-slate-600 dark:!text-slate-400 hover:!border-slate-400 hover:!text-slate-900 dark:hover:!text-white"
                    />
                </div>
            </div>

        </aside>
    );
}
