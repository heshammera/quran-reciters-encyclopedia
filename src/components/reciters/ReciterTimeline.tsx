"use client";

import { formatDualYear } from "@/lib/date-utils";
import { useMemo, useState } from "react";
import Link from "next/link";
import PlayButton from "@/components/player/PlayButton";
import VideoModal from "@/components/player/VideoModal";
import { Track } from "@/types/player";
import { useLeanMode } from "@/context/LeanModeContext";
import { getSurahName } from "@/lib/quran-helpers";
import QueueButton from "@/components/player/QueueButton";
import DownloadButton from "@/components/offline/DownloadButton";


interface TimelineRecording {
    id: string;
    title?: string;
    surah_number: number;
    ayah_start: number;
    ayah_end: number;
    recording_date: {
        year: number;
        month?: number;
        day?: number;
        approximate: boolean;
    };
    created_at: string;
    section: {
        name_ar: string;
        slug: string;
    };
    city?: string;
    src?: string;
    reciterName?: string;
    reciterId?: string;
    duration?: string;
    type?: 'audio' | 'video';
    videoUrl?: string;
    videoThumbnail?: string;
    recording_coverage?: {
        surah_number: number;
        ayah_start: number;
        ayah_end: number;
    }[];
    play_count?: number;
}


interface ReciterTimelineProps {
    recordings: TimelineRecording[];
}

export default function ReciterTimeline({ recordings }: ReciterTimelineProps) {
    const { isLean } = useLeanMode();
    const [selectedVideo, setSelectedVideo] = useState<any>(null);

    // Group recordings by Year
    const groupedByYear = useMemo(() => {
        const groups: Record<number, TimelineRecording[]> = {};

        recordings.forEach(rec => {
            const year = rec.recording_date?.year || 0;
            if (!groups[year]) {
                groups[year] = [];
            }
            groups[year].push(rec);
        });

        // Sort years descending
        return Object.entries(groups)
            .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA));
    }, [recordings]);

    if (recordings.length === 0) {
        return (
            <div className="text-center py-10 opacity-60">
                لا توجد بيانات زمنية متاحة للتلاوات.
            </div>
        );
    }

    return (
        <div className={`relative ${isLean ? 'space-y-6' : 'space-y-12'} pb-12`}>
            {/* Main Timeline Line */}
            <div className="absolute right-8 top-4 bottom-0 w-px bg-gradient-to-b from-emerald-500/50 via-slate-200 dark:via-slate-700 to-transparent"></div>

            {groupedByYear.map(([year, groupRecordings]) => (
                <div key={year} className="relative pr-20">
                    {/* Year Marker (Milestone Capsule) */}
                    <div className="absolute right-0 top-0 flex items-center justify-center">
                        <div className="relative z-10 bg-white dark:bg-slate-900 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1 rounded-full text-sm shadow-sm ring-4 ring-emerald-50 dark:ring-emerald-900/20">
                            {year === "0" ? "غير مؤرخ" : year}
                        </div>
                    </div>

                    <div className={`grid grid-cols-1 ${isLean ? 'gap-3 mt-8' : 'md:grid-cols-2 gap-6 mt-2'}`}>
                        {groupRecordings.map(rec => {
                            const track: Track = {
                                id: rec.id,
                                title: rec.title || (rec.surah_number ? `سورة ${getSurahName(rec.surah_number)}` : 'تسجيل عام'),
                                reciterName: rec.reciterName || 'Unknown',
                                src: rec.src || '',
                                surahNumber: rec.surah_number,
                                reciterId: rec.reciterId || 'unknown'
                            };

                            return (
                                <div key={rec.id} className="relative group">
                                    {/* Connector Line (Horizontal) */}
                                    <div className="absolute right-[-33px] top-6 w-8 h-px bg-emerald-500/30 hidden md:block"></div>
                                    {/* Connector Dot */}
                                    <div className="absolute right-[-37px] top-[22px] w-2 h-2 bg-emerald-500 rounded-full hidden md:block opacity-50"></div>

                                    <div className={`bg-white dark:bg-slate-800 rounded-xl transition-all duration-300 ${isLean
                                        ? 'p-3 border border-slate-200 dark:border-slate-700'
                                        : 'p-5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 border border-transparent hover:border-emerald-500/20'
                                        }`}>

                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <Link href={`/recordings/${rec.id}`} className="block">
                                                    <h4 className={`font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-base flex items-center gap-2 flex-wrap`}>
                                                        {rec.title || (rec.surah_number ? `سورة ${getSurahName(rec.surah_number)}` : 'تسجيل عام')}
                                                        {rec.type === 'video' && (
                                                            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
                                                                فيديو
                                                            </span>
                                                        )}
                                                    </h4>
                                                </Link>

                                                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-50 dark:border-slate-700/50">
                                                    <span className="bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                                                        {rec.section?.name_ar}
                                                    </span>
                                                    {rec.city && (
                                                        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 ms-2">
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <span>{rec.city}</span>
                                                        </span>
                                                    )}
                                                    {(rec.play_count !== undefined && rec.play_count !== null) && (
                                                        <span className="flex items-center gap-1" title="مرات الاستماع">
                                                            <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                                            </svg>
                                                            {Number(rec.play_count || 0).toLocaleString('ar-EG')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="shrink-0 pt-1 flex items-center gap-2">
                                                {rec.type === 'video' ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setSelectedVideo(rec);
                                                        }}
                                                        className={`rounded-full bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-all flex items-center justify-center shadow-sm ${isLean ? 'w-8 h-8' : 'w-10 h-10'}`}
                                                    >
                                                        <svg className={isLean ? 'w-4 h-4' : 'w-5 h-5'} fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M8 5v14l11-7z" />
                                                        </svg>
                                                    </button>
                                                ) : rec.src && (
                                                    <div className="flex items-center gap-1">
                                                        <PlayButton track={track} size={isLean ? "sm" : "md"} className="shadow-sm" />
                                                        <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            <QueueButton
                                                                track={track}
                                                                variant="icon"
                                                                size="sm"
                                                                className="w-8 h-8 bg-slate-50 dark:bg-slate-700"
                                                            />
                                                            <DownloadButton
                                                                trackId={rec.id}
                                                                title={track.title}
                                                                reciterName={track.reciterName}
                                                                audioUrl={rec.src}
                                                                surahNumber={rec.surah_number}
                                                                minimal={true}
                                                                className="scale-90 bg-slate-50 dark:bg-slate-700"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
            {/* Video Modal */}
            {selectedVideo && (
                <VideoModal
                    video={{
                        video_url: selectedVideo.videoUrl || "",
                        title: selectedVideo.title || "",
                        reciter: { name_ar: selectedVideo.reciterName },
                        section: selectedVideo.section
                    }}
                    onClose={() => setSelectedVideo(null)}
                />
            )}
        </div>
    );
}
