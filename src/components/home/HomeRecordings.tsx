"use client";

import Link from "next/link";
import { useLeanMode } from "@/context/LeanModeContext";
import { SURAHS } from "@/lib/quran/metadata";
import { getSurahName } from "@/lib/quran-helpers";
import QueueButton from "@/components/player/QueueButton";
import PlayButton from "@/components/player/PlayButton";
import DownloadButton from "@/components/offline/DownloadButton";

export default function HomeRecordings({ featured, latest }: { featured: any[], latest: any[] }) {
    const { isLean } = useLeanMode();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Rarities (2/3) */}
            <div className="lg:col-span-2 space-y-8">
                <h2 className={`font-bold text-slate-900 dark:text-white flex items-center gap-3 ${isLean ? 'text-xl' : 'text-2xl'}`}>
                    {!isLean && <span className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600">★</span>}
                    تلاوات نادرة ومميزة
                </h2>
                <div className={`grid grid-cols-1 ${isLean ? 'gap-2' : 'md:grid-cols-2 gap-4'}`}>
                    {featured?.map((recording: any) => (
                        <Link
                            key={recording.id}
                            href={`/recordings/${recording.id}`}
                            className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all group ${isLean ? 'p-3 rounded-lg shadow-sm' : 'p-5 rounded-xl hover:border-emerald-500 hover:shadow-md'}`}
                        >
                            <div className="flex items-start gap-4 h-full">
                                {!isLean && (
                                    <div className="flex flex-col items-center gap-2 mt-1">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shrink-0">
                                            📜
                                        </div>
                                        {(recording.play_count !== undefined && recording.play_count !== null) && (
                                            <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded text-[10px] text-slate-500 font-medium">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                                </svg>
                                                {Number(recording.play_count || 0).toLocaleString('ar-EG')}
                                            </span>
                                        )}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0 flex flex-col justify-between h-full gap-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-1">
                                            <p className={`font-bold text-slate-900 dark:text-white transition-colors leading-snug ${isLean ? 'text-sm group-active:text-emerald-600' : 'group-hover:text-emerald-600'}`}>
                                                {recording.reciters?.name_ar}
                                            </p>
                                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                                <span>{recording.title || (recording.surah_number ? `سورة ${getSurahName(recording.surah_number)}` : 'تسجيل عام')} {recording.city && `• ${recording.city}`}</span>
                                            </div>
                                        </div>
                                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity pt-1 flex items-center gap-1">
                                            <PlayButton
                                                size="sm"
                                                track={{
                                                    id: recording.id,
                                                    title: recording.title || (recording.surah_number ? `سورة ${getSurahName(recording.surah_number)}` : 'تسجيل عام'),
                                                    reciterName: recording.reciters?.name_ar,
                                                    src: recording.media_files?.[0]?.archive_url || "",
                                                    surahNumber: recording.surah_number,
                                                    reciterId: recording.reciters?.id,
                                                }}
                                                contextTracks={[]}
                                            />
                                            <QueueButton
                                                variant="icon"
                                                track={{
                                                    id: recording.id,
                                                    title: recording.title || (recording.surah_number ? `سورة ${getSurahName(recording.surah_number)}` : 'تسجيل عام'),
                                                    reciterName: recording.reciters?.name_ar,
                                                    src: recording.media_files?.[0]?.archive_url || "",
                                                    surahNumber: recording.surah_number,
                                                    reciterId: recording.reciters?.id,
                                                }}
                                            />
                                            <DownloadButton
                                                trackId={recording.id}
                                                title={recording.title || (recording.surah_number ? `سورة ${getSurahName(recording.surah_number)}` : 'تسجيل عام')}
                                                reciterName={recording.reciters?.name_ar}
                                                audioUrl={recording.media_files?.[0]?.archive_url || ""}
                                                surahNumber={recording.surah_number}
                                                minimal={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Latest Additions (1/3) */}
            <div className="space-y-8">
                <h2 className={`font-bold text-slate-900 dark:text-white flex items-center gap-3 ${isLean ? 'text-xl' : 'text-2xl'}`}>
                    {!isLean && <span className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">🕒</span>}
                    أُضيف حديثاً
                </h2>
                <div className={isLean ? 'space-y-1' : 'space-y-3'}>
                    {latest?.map((recording: any) => (
                        <Link
                            key={recording.id}
                            href={`/recordings/${recording.id}`}
                            className={`flex items-center gap-3 transition-all duration-300 border ${isLean
                                ? 'p-2 bg-white dark:bg-slate-800 rounded-lg border-transparent shadow-sm'
                                : 'p-3 bg-white dark:bg-slate-900 rounded-xl border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 hover:shadow-sm group'
                                }`}
                        >
                            <div className={`rounded-full flex items-center justify-center shrink-0 font-bold ${isLean
                                ? 'w-8 h-8 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px]'
                                : 'w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-xs'
                                }`}>
                                {recording.surah_number ? getSurahName(recording.surah_number) : "🔊"}
                            </div>
                            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                <div>
                                    <p className={`font-bold text-slate-800 dark:text-slate-200 line-clamp-2 ${isLean ? 'text-xs' : 'text-sm'}`}>
                                        {recording.reciters?.name_ar}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 font-medium">
                                        {recording.title || (recording.surah_number ? `سورة ${getSurahName(recording.surah_number)}` : (recording.sections?.name_ar || 'تلاوة'))}
                                    </p>
                                    {(recording.play_count !== undefined && recording.play_count !== null) && (
                                        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                            </svg>
                                            {Number(recording.play_count || 0).toLocaleString('ar-EG')}
                                        </div>
                                    )}
                                </div>
                                <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    <PlayButton
                                        size="xs"
                                        track={{
                                            id: recording.id,
                                            title: recording.title || (recording.surah_number ? `سورة ${getSurahName(recording.surah_number)}` : 'تسجيل عام'),
                                            reciterName: recording.reciters?.name_ar,
                                            src: recording.media_files?.[0]?.archive_url || "",
                                            surahNumber: recording.surah_number,
                                            reciterId: recording.reciters?.id,
                                        }}
                                        contextTracks={[]}
                                    />
                                    <QueueButton
                                        variant="icon"
                                        size="sm"
                                        track={{
                                            id: recording.id,
                                            title: recording.title || (recording.surah_number ? `سورة ${getSurahName(recording.surah_number)}` : 'تسجيل عام'),
                                            reciterName: recording.reciters?.name_ar,
                                            src: recording.media_files?.[0]?.archive_url || "",
                                            surahNumber: recording.surah_number,
                                            reciterId: recording.reciters?.id,
                                        }}
                                    />
                                    <DownloadButton
                                        trackId={recording.id}
                                        title={recording.title || (recording.surah_number ? `سورة ${getSurahName(recording.surah_number)}` : 'تسجيل عام')}
                                        reciterName={recording.reciters?.name_ar}
                                        audioUrl={recording.media_files?.[0]?.archive_url || ""}
                                        surahNumber={recording.surah_number}
                                        minimal={true}
                                        className="scale-90"
                                    />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
