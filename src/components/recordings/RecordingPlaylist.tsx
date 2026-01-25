"use client";

import Link from "next/link";
import PlayButton from "@/components/player/PlayButton";
import QueueButton from "@/components/player/QueueButton";
import DownloadButton from "@/components/offline/DownloadButton";
import { Track } from "@/types/player";
import { useState } from "react";

interface SimilarRecording {
    id: string;
    title: string;
    reciterName: string;
    reciterId: string;
    reciterImage?: string | null;
    sectionName?: string;
    src?: string;
    surahNumber?: number;
}

interface RecordingPlaylistProps {
    currentRecordingId: string;
    tracks: SimilarRecording[];
    displayCount?: number;
}

export default function RecordingPlaylist({ currentRecordingId, tracks, displayCount = 4 }: RecordingPlaylistProps) {
    const [limit, setLimit] = useState(displayCount);

    const visibleTracks = tracks.slice(0, limit);
    const hasMore = tracks.length > limit;

    const handleShowMore = () => {
        setLimit(prev => prev + 5);
    };

    if (tracks.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-white/5">
                <p className="text-slate-500 dark:text-slate-400">لا توجد تلاوات مقترحة حالياً</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {visibleTracks.map((track) => {
                const trackData: Track = {
                    id: track.id,
                    title: track.title,
                    reciterName: track.reciterName,
                    src: track.src || '',
                    surahNumber: track.surahNumber,
                    reciterId: track.reciterId,
                };

                return (
                    <div
                        key={track.id}
                        className={`
                            group relative flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border transition-all duration-200
                            bg-white dark:bg-[#0f172a] 
                            border-slate-100 dark:border-white/5 
                            hover:bg-slate-50 dark:hover:bg-[#1e293b] 
                            hover:border-slate-200 dark:hover:border-white/10
                            hover:shadow-md dark:hover:shadow-none
                            ${track.id === currentRecordingId ? 'ring-2 ring-emerald-500 bg-emerald-50/50' : ''}
                        `}
                    >
                        <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                            {/* Image */}
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-700 shadow-sm">
                                {track.reciterImage ? (
                                    <img src={track.reciterImage} alt={track.reciterName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xl">🎙️</div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-1 leading-snug break-words group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {track.title}
                                </h4>
                                <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                                    <span>{track.reciterName}</span>
                                    {track.sectionName && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                            <span>{track.sectionName}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="relative z-20 flex sm:flex-col lg:flex-row items-center gap-2 self-end sm:self-auto w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-white/5">
                            <PlayButton
                                track={trackData}
                                size="md"
                                className="flex-1 sm:flex-none bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:bg-emerald-500/10 dark:text-emerald-500 dark:hover:bg-emerald-500 dark:hover:text-white"
                            />

                            <QueueButton
                                track={trackData}
                                variant="ghost"
                                className="flex-1 sm:flex-none"
                            />

                            {track.src && (
                                <DownloadButton
                                    trackId={track.id}
                                    title={track.title}
                                    reciterName={track.reciterName}
                                    audioUrl={track.src}
                                    surahNumber={track.surahNumber}
                                    className="flex-1 sm:flex-none"
                                />
                            )}
                        </div>

                        {/* Global Link Overlay */}
                        <Link
                            href={`/recordings/${track.id}`}
                            className="absolute inset-0 z-10"
                            aria-label={`انتقل إلى ${track.title}`}
                        />
                    </div>
                );
            })}

            {hasMore && (
                <button
                    onClick={handleShowMore}
                    className="w-full py-3 mt-4 text-sm font-bold text-slate-500 dark:text-slate-400 border-2 border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                    عرض المزيد ({tracks.length - limit})
                </button>
            )}
        </div>
    );
}
