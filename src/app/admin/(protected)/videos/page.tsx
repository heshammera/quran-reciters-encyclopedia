import Link from "next/link";
import { getReciters, getSections } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import VideoCardActions from "@/components/admin/VideoCardActions";
import { SURAHS } from "@/lib/quran/metadata";

export default async function VideosPage() {
    const supabase = await createClient();

    // Fetch videos
    const { data: videos } = await supabase
        .from('recordings')
        .select(`
            *,
            reciter:reciters(name_ar),
            section:sections(name_ar),
            recording_coverage(*)
        `)
        .eq('type', 'video')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        مكتبة المرئيات
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        إدارة الفيديوهات والنوادر المرئية
                    </p>
                </div>
                <Link
                    href="/admin/videos/add"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-emerald-500/20"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    إضافة فيديو جديد
                </Link>
            </div>

            {/* Video Grid (Mobile Friendly) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos?.map((video) => {
                    return (
                        <div key={video.id} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow group">
                            {/* Thumbnail */}
                            <div className="relative aspect-video bg-black">
                                {video.video_thumbnail ? (
                                    <img
                                        src={video.video_thumbnail}
                                        alt={video.source_description}
                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                    {video.reciter?.name_ar}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-1 truncate">
                                    {video.title || (video.surah_number ? `سورة ${SURAHS.find(s => s.number === video.surah_number)?.name}` : 'فيديو عام')}
                                </h3>

                                {/* Multi-segment display */}
                                {video.recording_coverage && video.recording_coverage.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {video.recording_coverage.map((seg: any, idx: number) => (
                                            <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                                                {SURAHS.find(s => s.number === seg.surah_number)?.name} ({seg.ayah_start}-{seg.ayah_end})
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-xs text-slate-500 mb-2">
                                        آيات ({video.ayah_start}-{video.ayah_end})
                                    </div>
                                )}

                                <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-3">
                                    {video.section?.name_ar}
                                </p>

                                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-3">
                                    <span>{new Date(video.created_at).toLocaleDateString('ar-EG')}</span>
                                    <VideoCardActions videoId={video.id} />
                                </div>
                            </div>
                        </div>
                    );
                })}

                {(!videos || videos.length === 0) && (
                    <div className="col-span-full py-20 text-center text-slate-400">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p className="text-lg">لا توجد فيديوهات مضافة بعد</p>
                        <Link href="/admin/videos/add" className="text-emerald-600 hover:underline mt-2 inline-block">
                            إضافة أول فيديو
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
