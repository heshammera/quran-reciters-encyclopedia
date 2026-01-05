
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CollectionPlayButton from "@/components/collections/CollectionPlayButton";
import Link from "next/link";
import type { Metadata } from "next";

interface CollectionDetailsPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: CollectionDetailsPageProps): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();
    const { data } = await supabase.from("collections").select("title_ar, description_ar").eq("slug", slug).single();

    if (!data) return { title: "مجموعة غير موجودة" };

    return {
        title: `${data.title_ar} | مجموعات مختارة`,
        description: data.description_ar?.slice(0, 160) || "مجموعة مميزة من التلاوات المختارة.",
    };
}

export default async function CollectionDetailsPage({ params }: CollectionDetailsPageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // Fetch collection info
    const { data: collection } = await supabase
        .from("collections")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

    if (!collection) notFound();

    // Fetch items with details (sorted by display_order)
    const { data: items } = await supabase
        .from("collection_items")
        .select(`
            id,
            display_order,
            recordings (
                id,
                surah_number,
                ayah_start,
                ayah_end,
                duration_seconds,
                quality_level,
                reciters (id, name_ar),
                sections (id, name_ar, slug),
                media_files (archive_url)
            )
        `)
        .eq("collection_id", collection.id)
        .order("display_order", { ascending: true });

    const tracks = items?.map((item: any) => item.recordings) || [];

    // Format tracks for the player
    const playlist = tracks.map((track: any) => ({
        id: track.id,
        title: `سورة ${track.surah_number}`,
        reciterId: track.reciters.id,
        reciterName: track.reciters.name_ar,
        surahNumber: track.surah_number,
        slug: track.sections.slug,
        duration: track.duration_seconds,
        src: track.media_files?.[0]?.archive_url || ""
    }));

    return (
        <div className="pb-20">
            {/* Header / Hero */}
            <div className="bg-slate-900 text-white relative overflow-hidden">
                {/* Background Image handling could be better with Next/Image but keeping it simple */}
                {collection.cover_image_url && (
                    <div className="absolute inset-0 opacity-20">
                        <img
                            src={collection.cover_image_url}
                            alt=""
                            className="w-full h-full object-cover blur-sm"
                        />
                    </div>
                )}

                <div className="container mx-auto px-4 py-16 md:py-24 relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
                    {/* Cover Card */}
                    <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 bg-white/10 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-white/20">
                        {collection.cover_image_url ? (
                            <img
                                src={collection.cover_image_url}
                                alt={collection.title_ar}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/30">
                                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-right space-y-4">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm mb-2 border border-emerald-500/30">
                            مجموعة مختارة
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                            {collection.title_ar}
                        </h1>
                        <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                            {collection.description_ar}
                        </p>

                        <div className="flex items-center gap-4 justify-center md:justify-start pt-4">
                            <CollectionPlayButton playlist={playlist} />

                            <div className="text-sm text-slate-400">
                                {tracks.length} تسجيل
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tracks List */}
            <div className="container mx-auto px-4 py-12">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {tracks.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            هذه المجموعة فارغة حالياً.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {tracks.map((track: any, idx: number) => (
                                <div key={track.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 flex items-center justify-center text-slate-400 font-mono text-sm group-hover:text-emerald-600">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <Link
                                                href={`/reciters/${track.reciters.id}/${track.sections.slug}?play=${track.id}`}
                                                className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 block text-lg"
                                            >
                                                سورة {track.surah_number}
                                            </Link>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                                القارئ: <Link href={`/reciters/${track.reciters.id}`} className="hover:underline hover:text-emerald-600">{track.reciters.name_ar}</Link>
                                                <span className="mx-2">•</span>
                                                {track.sections.name_ar}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-sm text-slate-400 hidden sm:block">
                                            {Math.floor(track.duration_seconds / 60)}:{String(track.duration_seconds % 60).padStart(2, '0')}
                                        </div>
                                        <Link
                                            href={`/reciters/${track.reciters.id}/${track.sections.slug}?play=${track.id}`}
                                            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                            title="تشغيل"
                                        >
                                            ▶
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
