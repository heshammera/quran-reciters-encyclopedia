import { notFound } from "next/navigation";
import Link from "next/link";
import {
    getReciter,
    getReciterPhases,
    getSections,
    getReciterTimeline,
    getReciterVideos,
    getReciterSectionStats
} from "@/lib/supabase/queries";
import ReciterSidebar from "@/components/reciters/ReciterSidebar";
import CollectionCard from "@/components/reciters/CollectionCard";
import ReciterVideos from "@/components/reciters/ReciterVideos";
import ReciterTimeline from "@/components/reciters/ReciterTimeline";
import { getSurahName } from "@/lib/quran-helpers";
import SectionGrid from "@/components/reciters/SectionGrid";

interface ReciterPageProps {
    params: Promise<{
        reciterId: string;
    }>;
    searchParams: Promise<{
        view?: string;
        tab?: string;
    }>;
}

export default async function ReciterPage({ params, searchParams }: ReciterPageProps) {
    const { reciterId } = await params;
    const { view, tab } = await searchParams;

    const activeTab = tab === 'visuals' ? 'visuals' : 'audio';

    const reciter = await getReciter(reciterId);

    if (!reciter) {
        notFound();
    }

    // Fetch data
    const [phases, sectionsData, videos, statsMap] = await Promise.all([
        getReciterPhases(reciter.id),
        getSections(),
        activeTab === 'visuals' ? getReciterVideos(reciter.id) : [],
        getReciterSectionStats(reciter.id)
    ]);

    // Timeline only if requested
    const timelineData = (view === 'timeline' && activeTab === 'audio') ? await getReciterTimeline(reciter.id) : [];

    // Filter sections that have recordings
    const sectionsWithRecordings = sectionsData.map(section => ({
        section,
        count: statsMap.get(section.id) || 0
    })).filter(item => item.count > 0);

    const isTimelineView = view === 'timeline';

    return (
        <div className="p-5 lg:p-10">
            {/* 1. Header & Tabs */}
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">📚</span>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        المكتبة <span className="text-emerald-500">الصوتية</span>
                    </h2>
                </div>

                {/* Segmented Control Pill Style */}
                <div className="bg-[#0f172a] p-1.5 rounded-full border border-white/10 flex w-full max-w-md mx-auto shadow-lg relative z-10">
                    <Link
                        href={`/reciters/${reciterId}?tab=audio`}
                        className={`flex-1 text-center py-3 rounded-full font-bold text-sm transition-all duration-300 ${activeTab === 'audio'
                            ? 'bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.4)]'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        التلاوات الصوتية
                    </Link>
                    <Link
                        href={`/reciters/${reciterId}?tab=visuals`}
                        className={`flex-1 text-center py-3 rounded-full font-bold text-sm transition-all duration-300 ${activeTab === 'visuals'
                            ? 'bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.4)]'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        المرئيات
                    </Link>
                </div>
            </div>

            {/* Content based on Tab */}
            {activeTab === 'visuals' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ReciterVideos videos={videos} />
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* 2. Secondary Navigation */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 opacity-80">
                            {isTimelineView ? 'المخطط الزمني' : 'الأقسام المتاحة'}
                        </h3>

                        <div className="flex gap-1 bg-white dark:bg-[rgba(255,255,255,0.03)] p-1 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
                            <Link
                                href={`/reciters/${reciterId}?tab=audio`}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${!isTimelineView
                                    ? 'bg-slate-100 dark:bg-[#1e293b] text-emerald-600 dark:text-emerald-500 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                الأقسام
                            </Link>
                            <Link
                                href={`/reciters/${reciterId}?tab=audio&view=timeline`}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${isTimelineView
                                    ? 'bg-slate-100 dark:bg-[#1e293b] text-emerald-600 dark:text-emerald-500 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                الزمني
                            </Link>
                        </div>
                    </div>

                    {isTimelineView ? (
                        <div className="max-w-4xl mx-auto">
                            <div className="mb-6 text-center">
                                <p className="text-slate-600 dark:text-slate-400 text-sm">استعرض تلاوات {reciter.name_ar} مرتبة تاريخياً</p>
                            </div>
                            <ReciterTimeline
                                recordings={timelineData.map((t: any) => ({
                                    id: t.id,
                                    title: t.title || (t.surah_number ? `سورة ${getSurahName(t.surah_number)}` : 'تسجيل عام'),
                                    surah_number: t.surah_number,
                                    ayah_start: t.ayah_start,
                                    ayah_end: t.ayah_end,
                                    recording_date: t.recording_date,
                                    created_at: t.created_at,
                                    section: t.section,
                                    reciterName: t.reciter?.name_ar || 'Unknown',
                                    src: t.media_files?.[0]?.archive_url || '',
                                    city: t.city,
                                    duration: t.duration,
                                    reciterId: reciter.id,
                                    recording_coverage: t.recording_coverage,
                                    type: t.type,
                                    videoUrl: t.video_url,
                                    videoThumbnail: t.video_thumbnail,
                                    play_count: t.play_count
                                }))}
                            />
                        </div>
                    ) : (
                        <div>
                            {sectionsWithRecordings.length === 0 ? (
                                <div className="text-center py-20 bg-white dark:bg-[#0f172a] rounded-2xl border border-dashed border-slate-200 dark:border-white/5">
                                    <div className="text-4xl mb-4">📂</div>
                                    <p className="text-xl text-slate-600 dark:text-slate-400 font-medium">
                                        لم تُضاف تلاوات لهذا القارئ بعد
                                    </p>
                                </div>
                            ) : (
                                <SectionGrid
                                    sections={sectionsWithRecordings}
                                    reciterId={reciter.id}
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
