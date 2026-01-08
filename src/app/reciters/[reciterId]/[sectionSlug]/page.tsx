"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getReciter, getSection, getRecordings, getReciterPhases } from "@/lib/supabase/queries";
import PhaseFilter from "@/components/reciters/PhaseFilter";
import PlayButton from "@/components/player/PlayButton";
import QueueButton from "@/components/player/QueueButton";
import AutoPlayer from "@/components/player/AutoPlayer";
import VideoModal from "@/components/player/VideoModal";
import DownloadButton from "@/components/offline/DownloadButton";
import RecordingItem from "@/components/reciters/RecordingItem";
import { Track } from "@/types/player";
import { SURAHS } from "@/lib/quran/metadata";
import { getSurahName } from "@/lib/quran-helpers";

interface SectionPageProps {
    params: Promise<{
        reciterId: string;
        sectionSlug: string;
    }>;
    searchParams: Promise<{
        phase?: string;
    }>;
}

export default function SectionPage({ params, searchParams }: SectionPageProps) {
    const [data, setData] = useState<any>(null);
    const [selectedVideo, setSelectedVideo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const { reciterId, sectionSlug } = await params;
            const { phase } = await searchParams;

            const [reciter, section] = await Promise.all([
                getReciter(reciterId),
                getSection(sectionSlug),
            ]);

            if (!reciter || !section) {
                notFound();
            }

            const [phases, recordings] = await Promise.all([
                getReciterPhases(reciterId),
                getRecordings(reciterId, section.id, phase),
            ]);

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
                    sectionSlug: section.slug,
                }))
                .filter((t: Track) => t.src);

            setData({ reciter, section, phases, recordings, queueTracks });
            setLoading(false);
        }

        fetchData();
    }, [params, searchParams]);

    if (loading || !data) {
        return <div className="container mx-auto px-4 py-8 text-center">جاري التحميل...</div>;
    }

    const { reciter, section, phases, recordings, queueTracks } = data;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
                <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400">الرئيسية</Link>
                <span>/</span>
                <Link href={`/reciters/${reciter.id}`} className="hover:text-emerald-600 dark:hover:text-emerald-400">{reciter.name_ar}</Link>
                <span>/</span>
                <span className="text-slate-900 dark:text-white font-bold">{section.name_ar}</span>
            </div>

            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{section.name_ar}</h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        تلاوات القارئ {reciter.name_ar}
                    </p>
                </div>
                <div className="shrink-0">
                    <QueueButton
                        tracks={queueTracks}
                        label="إضافة القسم كاملاً لقائمة التشغيل"
                        variant="solid"
                    />
                </div>
            </div>

            {/* AutoPlayer for Assistant Links */}
            <AutoPlayer queueTracks={queueTracks} />

            {/* Phase Filter */}
            <PhaseFilter phases={phases} />

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
                                sectionSlug: section.slug,
                            };

                            if (!isVideo && !track?.src) return null;

                            return (
                                <RecordingItem
                                    key={recording.id}
                                    recording={recording}
                                    track={track}
                                    contextTracks={queueTracks}
                                    reciter={reciter}
                                    section={section}
                                    onVideoSelect={setSelectedVideo}
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
                        <p>لا توجد تلاوات في هذا القسم حالياً</p>
                    </div>
                )}
            </div>

            {selectedVideo && (
                <VideoModal
                    video={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                />
            )}
        </div>
    );
}
