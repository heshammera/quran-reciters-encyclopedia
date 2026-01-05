"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { SURAHS } from "@/lib/quran/metadata";

interface VideoFormProps {
    reciters: any[];
    sections: any[];
    phases?: any[];
    initialData?: any;
    cities?: { name: string; count: number }[];
}

export default function VideoForm({ reciters, sections, phases = [], initialData, cities = [] }: VideoFormProps) {
    const router = useRouter();
    // const supabase = createClient(); // Removed
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        video_url: initialData?.video_url || "",
        title: "", // Not used in DB but helpful for UI
        reciter_id: initialData?.reciter_id || "",
        section_id: initialData?.section_id || "",
        surah_number: initialData?.surah_number || 1,
        city: initialData?.city || "",
        quality_level: initialData?.quality_level || "",
    });

    const [videoMeta, setVideoMeta] = useState<{ id: string; thumb: string; source: 'youtube' | 'archive' } | null>(
        initialData?.video_url ? extractMeta(initialData.video_url) : null
    );

    function extractYoutubeMeta(url: string) {
        const trimmedUrl = url.trim();
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = trimmedUrl.match(regExp);
        if (match && match[2].length === 11) {
            return {
                id: match[2],
                thumb: `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`,
                source: 'youtube' as const
            };
        }
        return null;
    }

    function extractArchiveMeta(url: string) {
        const trimmedUrl = url.trim();
        // Support both /details/IDENTIFIER and /download/IDENTIFIER/...
        const regExp = /archive\.org\/(details|download)\/([^\/\?\#&]+)/;
        const match = trimmedUrl.match(regExp);
        if (match && match[2]) {
            return {
                id: match[2],
                thumb: `https://archive.org/services/img/${match[2]}`,
                source: 'archive' as const
            };
        }
        return null;
    }

    function extractMeta(url: string) {
        return extractYoutubeMeta(url) || extractArchiveMeta(url);
    }

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setFormData({ ...formData, video_url: url });
        const meta = extractMeta(url);
        setVideoMeta(meta);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!videoMeta) throw new Error("رابط الفيديو غير صالح (يدعم يوتيوب وأرشيف فقط)");

            const isEdit = !!initialData?.id;

            const payload: any = {
                type: 'video',
                video_url: formData.video_url,
                video_thumbnail: videoMeta.thumb,
                reciter_id: formData.reciter_id,
                section_id: formData.section_id,
                surah_number: Number(formData.surah_number),
                city: formData.city,
            };

            // Only add defaults for new recordings
            if (!isEdit) {
                payload.archival_id = `VID-${videoMeta.id}-${Date.now()}`;
                payload.recording_date = { year: new Date().getFullYear(), approximate: false };
                payload.duration_seconds = 60;
                payload.source_description = videoMeta.source === 'youtube' ? 'YouTube Video' : 'Archive.org Video';
                payload.reliability_level = 'verified';
                payload.rarity_classification = 'common';
                payload.is_published = true;
                payload.ayah_start = 1;
                payload.ayah_end = 999;
            }

            let query = supabase.from('recordings');

            if (isEdit) {
                const { error: submitError } = await query
                    .update(payload)
                    .eq('id', initialData.id);
                if (submitError) throw submitError;
            } else {
                const { error: submitError } = await query
                    .insert(payload);
                if (submitError) throw submitError;
            }

            router.push('/admin/videos');
            router.refresh();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* URL */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">رابط الفيديو (YouTube أو Archive.org)</label>
                    <input
                        type="text"
                        required
                        dir="ltr"
                        placeholder="https://www.youtube.com/watch?v=... أو https://archive.org/details/..."
                        value={formData.video_url}
                        onChange={handleUrlChange}
                        className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    />
                </div>

                {/* Preview */}
                {videoMeta && (
                    <div className="md:col-span-2 relative aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                        <img
                            src={videoMeta.thumb}
                            alt="Video Thumbnail"
                            className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reciter */}
                <div>
                    <label className="block text-sm font-medium mb-2">القارئ</label>
                    <select
                        required
                        value={formData.reciter_id}
                        onChange={(e) => setFormData({ ...formData, reciter_id: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    >
                        <option value="">اختر القارئ...</option>
                        {reciters.map((r) => (
                            <option key={r.id} value={r.id}>{r.name_ar}</option>
                        ))}
                    </select>
                </div>

                {/* Section */}
                <div>
                    <label className="block text-sm font-medium mb-2">القسم</label>
                    <select
                        required
                        value={formData.section_id}
                        onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    >
                        <option value="">اختر القسم...</option>
                        {sections.map((s) => (
                            <option key={s.id} value={s.id}>{s.name_ar}</option>
                        ))}
                    </select>
                </div>

                {/* Surah */}
                <div>
                    <label className="block text-sm font-medium mb-2">السورة</label>
                    <select
                        value={formData.surah_number}
                        onChange={(e) => setFormData({ ...formData, surah_number: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    >
                        {SURAHS.map((s) => (
                            <option key={s.number} value={s.number}>
                                {s.number}. {s.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* City */}
                <div>
                    <label className="block text-sm font-medium mb-2">المدينة (اختياري)</label>
                    <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                        list="cities-list"
                    />
                    <datalist id="cities-list">
                        {cities.map((c) => (
                            <option key={c.name} value={c.name} />
                        ))}
                    </datalist>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                <button
                    type="submit"
                    disabled={loading || !videoMeta}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            جاري الحفظ...
                        </>
                    ) : (
                        'حفظ الفيديو'
                    )}
                </button>
            </div>
        </form>
    );
}
