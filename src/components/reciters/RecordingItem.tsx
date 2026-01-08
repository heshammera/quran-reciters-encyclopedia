"use client";

import Link from "next/link";
import { Track } from "@/types/player";
import PlayButton from "@/components/player/PlayButton";
import QueueButton from "@/components/player/QueueButton";
import DownloadButton from "@/components/offline/DownloadButton";
import { getSurahName } from "@/lib/quran-helpers";

interface RecordingItemProps {
    recording: any;
    track: Track | null;
    contextTracks: Track[];
    reciter: any;
    section: any;
    onVideoSelect?: (recording: any) => void;
}

export default function RecordingItem({
    recording,
    track,
    contextTracks,
    reciter,
    section,
    onVideoSelect
}: RecordingItemProps) {
    const isVideo = recording.type === 'video';

    return (
        <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0">
            {/* Main Content Area */}
            <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center gap-3">
                    {/* Video/Audio Indicator Icon */}
                    <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${isVideo ? "bg-red-100 dark:bg-red-900/30 text-red-600" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                        }`}>
                        {isVideo ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <Link href={`/recordings/${recording.id}`} className="block hover:no-underline group/link">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover/link:text-emerald-600 dark:group-hover/link:text-emerald-400 transition-colors">
                                {recording.title || (recording.surah_number ? `سورة ${getSurahName(recording.surah_number)}` : 'تسجيل عام')}
                                {isVideo && <span className="mr-2 text-[10px] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded-full">فيديو</span>}
                            </h4>

                            {recording.recording_coverage && recording.recording_coverage.length > 0 ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {recording.recording_coverage.map((seg: any, idx: number) => (
                                        <span key={idx} className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                                            سورة {getSurahName(seg.surah_number)} ({seg.ayah_start}-{seg.ayah_end})
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                recording.surah_number && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        سورة {getSurahName(recording.surah_number)} ({recording.ayah_start}-{recording.ayah_end})
                                    </p>
                                )
                            )}

                            <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                                {recording.recording_date?.year && <span>📅 {recording.recording_date.year}</span>}
                                {recording.city && <span>📍 {recording.city}</span>}
                                {recording.reciter_phases?.phase_name_ar && (
                                    <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                                        {recording.reciter_phases.phase_name_ar}
                                    </span>
                                )}
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Actions Area - Mobile Column, Desktop Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0 mt-3 sm:mt-0">
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
        </div>
    );
}
