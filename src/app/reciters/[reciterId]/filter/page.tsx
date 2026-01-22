"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
    getReciter,
    getRecordingsByCity,
    getRecordingsByYear,
    getRecordingsByAlbum
} from "@/lib/supabase/queries";
import RecordingItem from "@/components/reciters/RecordingItem";
import { Track } from "@/types/player";
import { getSurahName } from "@/lib/quran-helpers";
import { formatDualYear } from "@/lib/date-utils";

interface FilterPageProps {
    params: Promise<{
        reciterId: string;
    }>;
    searchParams: Promise<{
        type?: string;
        value?: string;
    }>;
}

export default function FilterPage({ params, searchParams }: FilterPageProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const { reciterId } = await params;
            const { type, value } = await searchParams;

            if (!type || !value) {
                notFound();
            }

            const reciter = await getReciter(reciterId);
            if (!reciter) {
                notFound();
            }

            let recordings = [];
            let filterTitle = "";

            switch (type) {
                case "city":
                    recordings = await getRecordingsByCity(reciterId, value);
                    filterTitle = `تلاوات ${value}`;
                    break;
                case "year":
                    const year = parseInt(value);
                    recordings = await getRecordingsByYear(reciterId, year);
                    filterTitle = `تلاوات عام ${formatDualYear(year)}`;
                    break;
                case "album":
                    recordings = await getRecordingsByAlbum(reciterId, value);
                    filterTitle = `تلاوات ألبوم ${value}`;
                    break;
                default:
                    notFound();
            }

            const queueTracks: Track[] = recordings
                .filter((r: any) => r.type !== 'video')
                .map((recording: any) => ({
                    id: recording.id,
                    title: recording.title || (recording.surah_number ? `سورة ${getSurahName(recording.surah_number)}` : 'تسجيل عام'),
                    reciterName: reciter.name_ar,
                    src: recording.media_files?.[0]?.archive_url || "",
                    surahNumber: recording.surah_number,
                    ayahStart: recording.ayah_start,
                    ayahEnd: recording.ayah_end,
                    reciterId: reciter.id,
                    sectionSlug: recording.section?.slug,
                }))
                .filter((t: Track) => t.src && t.src.trim() !== '');

            setData({ reciter, recordings, queueTracks, filterTitle, type, value });
            setLoading(false);
        }

        fetchData();
    }, [params, searchParams]);

    if (loading || !data) {
        return <div className="container mx-auto px-4 py-8 text-center">جاري التحميل...</div>;
    }

    const { reciter, recordings, queueTracks, filterTitle } = data;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
                <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400">الرئيسية</Link>
                <span>/</span>
                <Link href={`/reciters/${reciter.id}`} className="hover:text-emerald-600 dark:hover:text-emerald-400">{reciter.name_ar}</Link>
                <span>/</span>
                <span className="text-slate-900 dark:text-white font-bold">{filterTitle}</span>
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{filterTitle}</h1>
                <p className="text-slate-600 dark:text-slate-400">
                    للقارئ الشيخ {reciter.name_ar}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                    {recordings.length} تلاوة
                </p>
            </div>

            {/* Recordings List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700">
                {recordings.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {recordings.map((recording: any) => {
                            const isVideo = recording.type === 'video';

                            const track: Track | null = isVideo ? null : {
                                id: recording.id,
                                title: recording.title || (recording.surah_number ? `سورة ${getSurahName(recording.surah_number)}` : 'تسجيل عام'),
                                reciterName: reciter.name_ar,
                                src: recording.media_files?.[0]?.archive_url || "",
                                surahNumber: recording.surah_number,
                                ayahStart: recording.ayah_start,
                                ayahEnd: recording.ayah_end,
                                reciterId: reciter.id,
                                sectionSlug: recording.section?.slug,
                            };

                            if (!isVideo && (!track?.src || track.src.trim() === '')) return null;

                            return (
                                <RecordingItem
                                    key={recording.id}
                                    recording={recording}
                                    track={track}
                                    contextTracks={queueTracks}
                                    reciter={reciter}
                                    section={recording.section}
                                    onVideoSelect={() => { }}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </div>
                        <p>لا توجد تلاوات بهذا الفلتر</p>
                    </div>
                )}
            </div>
        </div>
    );
}
