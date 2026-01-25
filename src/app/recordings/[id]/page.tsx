import { notFound } from "next/navigation";
import { getRecording, getSimilarRecordings } from "@/lib/supabase/queries";
import { Metadata } from "next";
import { getSurahName } from "@/lib/quran-helpers";
import RecordingSidebar from "@/components/recordings/RecordingSidebar";
import RecordingPlaylist from "@/components/recordings/RecordingPlaylist";

import { formatDualYear } from "@/lib/date-utils";

interface RecordingPageProps {
    params: Promise<{
        id: string;
    }>;
}

export async function generateMetadata({ params }: RecordingPageProps): Promise<Metadata> {
    const { id } = await params;
    const recording = await getRecording(id);
    if (!recording) return { title: "تلاوة غير موجودة" };

    let displayTitle = recording.title;

    if (!displayTitle) {
        const surahName = recording.surah_number ? getSurahName(recording.surah_number) : "عامة";
        displayTitle = recording.surah_number ? `سورة ${surahName} - ${recording.reciter.name_ar}` : `${recording.reciter.name_ar}`;
    }

    return {
        title: `${displayTitle} | موسوعة القراء`,
        description: `استمع لتلاوة ${displayTitle} بصوت القارئ ${recording.reciter.name_ar}.`
    };
}

export default async function RecordingPage({ params }: RecordingPageProps) {
    const { id } = await params;
    const recording = await getRecording(id);
    if (!recording) notFound();

    // Fetch context tracks (all recordings in the same section for the same reciter)
    const { getRecordings } = await import("@/lib/supabase/queries");
    const sectionRecordings = await getRecordings(recording.reciter_id, recording.section_id);

    // Transform to Track format
    const contextTracks = sectionRecordings.map((rec: any) => ({
        id: rec.id,
        title: rec.title || (rec.surah_number ? `سورة ${getSurahName(rec.surah_number)}` : 'تسجيل عام'),
        reciterName: recording.reciter.name_ar,
        src: rec.media_files?.[0]?.archive_url || "",
        surahNumber: rec.surah_number,
        ayahStart: rec.ayah_start,
        ayahEnd: rec.ayah_end,
        reciterId: recording.reciter.id,
        sectionSlug: recording.section.slug,
    })).filter((t: { src: any; }) => t.src);

    // Similar Recordings logic
    const surahNumbers = new Set<number>();
    if (recording.surah_number) surahNumbers.add(recording.surah_number);
    if (recording.recording_coverage) {
        recording.recording_coverage.forEach((c: any) => {
            if (c.surah_number) surahNumbers.add(c.surah_number);
        });
    }
    const uniqueSurahArray = Array.from(surahNumbers);
    const similarRecordings = uniqueSurahArray.length > 0 ? await getSimilarRecordings(recording.id, uniqueSurahArray, 10) : [];

    // Construct display title
    let displayTitle = recording.title;
    if (!displayTitle) {
        if (recording.recording_coverage && recording.recording_coverage.length > 1) {
            const uniqueSurahs = Array.from(new Set(recording.recording_coverage.map((seg: any) => seg.surah_number)));
            const surahNames = uniqueSurahs
                .map((num: any) => getSurahName(num))
                .join(" و");
            displayTitle = `سورة ${surahNames}`;
        } else {
            const surahName = recording.surah_number ? getSurahName(recording.surah_number) : "عامة";
            displayTitle = recording.surah_number ? `سورة ${surahName}` : 'تسجيل عام';
        }
    }

    // Prepare current track object
    const currentTrack = {
        id: recording.id,
        title: displayTitle,
        reciterName: recording.reciter.name_ar,
        src: recording.media_files?.find((m: any) => m.media_type === 'audio')?.archive_url || '',
        duration: recording.duration_seconds,
        isVideo: recording.type === 'video',
        videoUrl: recording.video_url,
    };

    // Prepare Playlist Tracks
    const playlistTracks = similarRecordings.map((sim: any) => ({
        id: sim.id,
        title: sim.title || (sim.surah_number ? `سورة ${getSurahName(sim.surah_number)}` : (sim.sections?.name_ar || 'تلاوة')),
        reciterName: sim.reciter?.name_ar || 'Unknown',
        reciterId: sim.reciter?.id,
        reciterImage: sim.reciter?.image_url,
        sectionName: sim.section?.name_ar,
        src: sim.media_files?.[0]?.archive_url,
        surahNumber: sim.surah_number
    }));

    return (
        // Layout: Mobile is min-h-screen (natural scroll). Desktop is h-screen with fixed containers.
        <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden bg-white dark:bg-[#020617] text-slate-900 dark:text-white font-sans transition-colors duration-300" dir="rtl">

            {/* Sidebar: In mobile (col), it comes naturally first. */}
            <RecordingSidebar
                recording={recording}
                displayTitle={displayTitle}
                track={currentTrack}
                contextTracks={contextTracks}
            />

            {/* Main Content Area */}
            {/* Mobile: auto height. Desktop: full height, scrollable */}
            <main className="flex-1 lg:overflow-y-auto bg-slate-50 dark:bg-gradient-to-b dark:from-[#0f172a] dark:to-[#020617] relative p-6 lg:p-10">

                {/* Section Header */}
                <div className="mb-6 lg:mb-8 flex items-center gap-3">
                    <span className="text-xl lg:text-2xl text-amber-500">✨</span>
                    <h2 className="text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white">
                        تلاوات أخرى <span className="text-slate-400">مقترحة</span>
                    </h2>
                </div>

                <div className="max-w-3xl">
                    <RecordingPlaylist
                        currentRecordingId={recording.id}
                        tracks={playlistTracks}
                    />
                </div>

                {/* Info Panel Details */}
                <div className="mt-8 lg:mt-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden max-w-3xl shadow-sm dark:shadow-none">
                    <details className="group border-b border-slate-100 dark:border-white/5 last:border-0" open>
                        <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors select-none">
                            <span className="font-bold text-slate-600 dark:text-slate-300 group-open:text-emerald-600 dark:group-open:text-emerald-500 flex items-center gap-2">
                                ℹ️ تفاصيل ومصدر التسجيل
                            </span>
                            <span className="text-xl group-open:rotate-180 transition-transform text-slate-400">
                                ⌄
                            </span>
                        </summary>
                        <div className="p-5 pt-0 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            {recording.recording_details || "لا توجد تفاصيل إضافية متاحة."}
                            <br /><br />
                            {recording.source_description && (
                                <div className="bg-slate-50 dark:bg-black/20 p-3 rounded-lg border border-slate-100 dark:border-white/5">
                                    <strong>المصدر:</strong> {recording.source_description}
                                </div>
                            )}
                        </div>
                    </details>

                    <details className="group border-b border-white/5 last:border-0">
                        <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors select-none">
                            <span className="font-bold text-slate-600 dark:text-slate-300 group-open:text-emerald-600 dark:group-open:text-emerald-500 flex items-center gap-2">
                                📚 البيانات التقنية
                            </span>
                            <span className="text-xl group-open:rotate-180 transition-transform text-slate-400">
                                ⌄
                            </span>
                        </summary>
                        <div className="p-5 pt-0 text-slate-500 dark:text-slate-400 text-sm leading-relaxed space-y-2">
                            <div><strong>المعرف:</strong> <span className="font-mono bg-slate-100 dark:bg-white/5 px-2 rounded text-xs text-slate-600 dark:text-slate-300">{recording.id.split('-')[0]}...</span></div>
                            {recording.recording_date?.year && <div><strong>السنة:</strong> {formatDualYear(recording.recording_date.year)}</div>}
                            {recording.publisher && <div><strong>الناشر:</strong> {recording.publisher}</div>}
                        </div>
                    </details>
                </div>

            </main>
        </div>
    );
}
