"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { SURAHS } from "@/lib/quran/metadata";
import { useAutocomplete } from "@/hooks/useAutocomplete";

interface VideoFormProps {
    reciters: any[];
    sections: any[];
    phases?: any[];
    initialData?: any;
    cities?: { name: string; count: number }[];
}

export default function VideoForm({ reciters, sections, phases: initialPhases = [], initialData, cities = [] }: VideoFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Data lists
    const [phases, setPhases] = useState<any[]>(initialPhases);

    const [formData, setFormData] = useState({
        video_url: initialData?.video_url || "",
        title: initialData?.title || "",
        reciter_id: initialData?.reciter_id || "",
        section_id: initialData?.section_id || "",
        reciter_phase_id: initialData?.reciter_phase_id || "",
        album: initialData?.album || "",
        surah_number: initialData?.surah_number || 1,
        ayah_start: initialData?.ayah_start || 1,
        ayah_end: initialData?.ayah_end || 1,
        city: initialData?.city || "",

        // Date fields
        time_period: initialData?.recording_date?.time_period || "",
        recording_year: initialData?.recording_date?.year || null,
        recording_month: initialData?.recording_date?.month || null,
        recording_day: initialData?.recording_date?.day || null,

        quality_level: initialData?.quality_level || "",
        rarity_classification: initialData?.rarity_classification || "common",
        source_description: initialData?.source_description || "",
        is_published: initialData?.is_published ?? true,
        is_featured: initialData?.is_featured ?? false,

        // New fields
        venue: initialData?.venue || "",
        publisher: initialData?.publisher || "",
        recording_details: initialData?.recording_details || "",
    });

    // Autocomplete hooks
    const venueSuggestions = useAutocomplete('venue');
    const citySuggestions = useAutocomplete('city');
    const publisherSuggestions = useAutocomplete('publisher');
    const albumSuggestions = useAutocomplete('album');

    const [segments, setSegments] = useState<{ surah: number, start: number, end: number }[]>(
        initialData?.recording_coverage?.length > 0
            ? initialData.recording_coverage.map((s: any) => ({ surah: s.surah_number, start: s.ayah_start, end: s.ayah_end }))
            : [{ surah: initialData?.surah_number || 1, start: initialData?.ayah_start || 1, end: initialData?.ayah_end || 7 }]
    );

    // Fetch phases when reciter changes
    const fetchPhases = async (reciterId: string) => {
        if (!reciterId) {
            setPhases([]);
            return;
        }
        const { data } = await supabase
            .from("reciter_phases")
            .select("*")
            .eq("reciter_id", reciterId)
            .order("display_order");

        if (data) setPhases(data);
        else setPhases([]);
    };

    const handleReciterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setFormData({ ...formData, reciter_id: id, reciter_phase_id: "" });
        fetchPhases(id);
    };

    // Initialize phases if editing
    useEffect(() => {
        if (initialData?.reciter_id) {
            fetchPhases(initialData.reciter_id);
        }
    }, [initialData]);

    const updateSegment = (index: number, field: 'surah' | 'start' | 'end', value: number) => {
        const newSegments = [...segments];
        const seg = newSegments[index];

        if (field === 'surah') {
            const surah = SURAHS.find(s => s.number === value);
            seg.surah = value;
            seg.start = 1;
            seg.end = surah ? surah.ayahCount : 1;
        } else if (field === 'start') {
            seg.start = value;
            if (seg.end < value) seg.end = value;
        } else if (field === 'end') {
            seg.end = value;
        }

        setSegments(newSegments);

        // Update main fields if it's the first segment
        if (index === 0) {
            setFormData(prev => ({
                ...prev,
                surah_number: field === 'surah' ? value : prev.surah_number,
                ayah_start: field === 'start' ? value : prev.ayah_start,
                ayah_end: field === 'end' ? value : prev.ayah_end,
            }));
        }
    };

    const addSegment = () => {
        setSegments([...segments, { surah: 1, start: 1, end: 7 }]);
    };

    const removeSegment = (index: number) => {
        if (segments.length === 1) return;
        setSegments(segments.filter((_, i) => i !== index));
    };

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
                reciter_phase_id: formData.reciter_phase_id || null,
                album: formData.album || null,
                surah_number: Number(formData.surah_number),
                ayah_start: Number(formData.ayah_start),
                ayah_end: Number(formData.ayah_end),
                city: formData.city,
                recording_date: {
                    year: formData.recording_year,
                    month: formData.recording_month,
                    day: formData.recording_day,
                    time_period: formData.time_period || null
                },
                quality_level: formData.quality_level,
                rarity_classification: formData.rarity_classification,
                source_description: formData.source_description,
                recording_details: formData.recording_details || null,
                venue: formData.venue || null,
                publisher: formData.publisher || null,
                is_published: formData.is_published,
                is_featured: formData.is_featured,
                reliability_level: 'verified', // Default for video
                duration_seconds: 60, // Mock duration, ideally fetched from API
                archival_id: initialData?.archival_id || `VID-${videoMeta.id}-${Date.now()}`,
                title: formData.title || (formData.surah_number ? `سورة ${SURAHS.find(s => s.number === Number(formData.surah_number))?.name}` : 'فيديو جديد')
            };

            let recordingId: string;
            if (isEdit) {
                const { error: submitError } = await supabase
                    .from('recordings')
                    .update(payload)
                    .eq('id', initialData.id);
                if (submitError) throw submitError;
                recordingId = initialData.id;
            } else {
                const { data: newRec, error: submitError } = await supabase
                    .from('recordings')
                    .insert(payload)
                    .select()
                    .single();
                if (submitError) throw submitError;
                recordingId = newRec.id;
            }

            // Sync Coverage (Recording Segments)
            if (recordingId) {
                // Remove old coverage if edit
                if (isEdit) {
                    await supabase
                        .from("recording_coverage")
                        .delete()
                        .eq("recording_id", recordingId);
                }

                // Insert segments
                const coveragePayload = segments.map((seg, idx) => ({
                    recording_id: recordingId,
                    surah_number: seg.surah,
                    ayah_start: seg.start,
                    ayah_end: seg.end,
                    display_order: idx
                }));

                const { error: coverageError } = await supabase
                    .from("recording_coverage")
                    .insert(coveragePayload);

                if (coverageError) throw coverageError;
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
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">{error}</div>
            )}

            {/* 1. Video Source & Preview */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
                    <span className="text-emerald-500">▶</span>
                    مصدر الفيديو
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">رابط الفيديو *</label>
                            <input
                                type="text"
                                required
                                dir="ltr"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={formData.video_url}
                                onChange={handleUrlChange}
                                className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                            />
                            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                                ℹ️ يدعم YouTube و Archive.org
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">عنوان الفيديو (اختياري)</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                placeholder="اتركه فارغاً ليتم تسميته تلقائياً باسم السورة"
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 border border-slate-100 dark:border-slate-700/50 flex items-center justify-center min-h-[160px]">
                        {videoMeta ? (
                            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black shadow-md">
                                <img
                                    src={videoMeta.thumb}
                                    alt="Thumbnail"
                                    className="w-full h-full object-cover opacity-90"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-14 h-14 bg-red-600/90 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl backdrop-blur-sm transition-all">
                                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-slate-400">
                                <svg className="w-12 h-12 mx-auto mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm">معاينة الفيديو ستظهر هنا</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Classification Info (Grid 3) */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
                    <span className="text-emerald-500">🏷️</span>
                    التصنيف
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">القسم *</label>
                        <select
                            required
                            value={formData.section_id}
                            onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                            className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        >
                            <option value="">اختر القسم...</option>
                            {sections.map((s) => (
                                <option key={s.id} value={s.id}>{s.name_ar}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">القارئ *</label>
                        <select
                            required
                            value={formData.reciter_id}
                            onChange={handleReciterChange}
                            className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        >
                            <option value="">اختر القارئ...</option>
                            {reciters.map((r) => (
                                <option key={r.id} value={r.id}>{r.name_ar}</option>
                            ))}
                        </select>
                        {phases.length > 0 && (
                            <div className="mt-2">
                                <select
                                    value={formData.reciter_phase_id}
                                    onChange={(e) => setFormData({ ...formData, reciter_phase_id: e.target.value })}
                                    className="w-full p-2 text-xs border rounded dark:bg-slate-900 dark:border-slate-600"
                                >
                                    <option value="">(مرحلة زمنية عامة)</option>
                                    {phases.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name_ar}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">الألبوم / المجموعة</label>
                        <input
                            type="text"
                            list="album-suggestions"
                            value={formData.album}
                            onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                            className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                            placeholder="مثال: تسجيلات الإذاعة"
                        />
                        <datalist id="album-suggestions">
                            {albumSuggestions.map((s, i) => <option key={i} value={s} />)}
                        </datalist>
                    </div>
                </div>
            </div>

            {/* 3. Location & Date (Grid 4) */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
                    <span className="text-emerald-500">📍</span>
                    المكان والزمان
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">المدينة</label>
                        <input
                            type="text"
                            list="city-suggestions"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500/20"
                            placeholder="القاهرة، دمشق..."
                        />
                        <datalist id="city-suggestions">
                            {citySuggestions.map((s, i) => <option key={i} value={s} />)}
                        </datalist>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">مكان التسجيل</label>
                        <input
                            type="text"
                            list="venue-suggestions"
                            value={formData.venue}
                            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                            className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500/20"
                            placeholder="المسجد الأقصى..."
                        />
                        <datalist id="venue-suggestions">
                            {venueSuggestions.map((s, i) => <option key={i} value={s} />)}
                        </datalist>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">السنة</label>
                        <input
                            type="number"
                            placeholder="YYYY"
                            value={formData.recording_year || ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFormData({
                                    ...formData,
                                    recording_year: val ? parseInt(val) : null,
                                    time_period: val // backward compat
                                });
                            }}
                            className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-600 text-center"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">الشهر</label>
                        <input
                            type="number"
                            min="1" max="12"
                            placeholder="MM"
                            value={formData.recording_month || ""}
                            onChange={(e) => setFormData({ ...formData, recording_month: e.target.value ? parseInt(e.target.value) : null })}
                            className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-600 text-center"
                        />
                    </div>
                </div>
            </div>

            {/* 4. Additional Info (Grid 3 & Grid 2) */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
                    <span className="text-emerald-500">📝</span>
                    تفاصيل إضافية
                </h3>

                {/* Row: Publisher, Quality, Rarity */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">الناشر / جهة التسجيل</label>
                        <input
                            type="text"
                            list="publisher-suggestions"
                            value={formData.publisher}
                            onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                            className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                        />
                        <datalist id="publisher-suggestions">
                            {publisherSuggestions.map((s, i) => <option key={i} value={s} />)}
                        </datalist>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">جودة التسجيل</label>
                        <select
                            value={formData.quality_level}
                            onChange={(e) => setFormData({ ...formData, quality_level: e.target.value })}
                            className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                        >
                            <option value="">غير محدد</option>
                            <option value="high">عالية (High)</option>
                            <option value="medium">متوسطة (Medium)</option>
                            <option value="low">منخفضة (Low)</option>
                            <option value="remastered">منقحة (Remastered)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">الندرة</label>
                        <select
                            value={formData.rarity_classification}
                            onChange={(e) => setFormData({ ...formData, rarity_classification: e.target.value })}
                            className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                        >
                            <option value="common">عادي</option>
                            <option value="rare">نادر</option>
                            <option value="very_rare">نادر جداً</option>
                        </select>
                    </div>
                </div>

                {/* Row: Descriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">وصف المصدر</label>
                        <textarea
                            rows={3}
                            value={formData.source_description}
                            onChange={(e) => setFormData({ ...formData, source_description: e.target.value })}
                            className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                            placeholder="معلومات عن مصدر الملف..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">تفاصيل التلاوة</label>
                        <textarea
                            rows={3}
                            value={formData.recording_details}
                            onChange={(e) => setFormData({ ...formData, recording_details: e.target.value })}
                            className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                            placeholder="مقام التلاوة، مناسبة الحدث..."
                        />
                    </div>
                </div>
            </div>

            {/* 5. Content Coverage */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="text-emerald-500">📖</span>
                        محتوى التلاوة
                    </h3>
                    <button
                        type="button"
                        onClick={addSegment}
                        className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-1"
                    >
                        <span>+</span>
                        إضافة مقطع
                    </button>
                </div>

                <div className="space-y-3">
                    {segments.map((seg, index) => (
                        <div key={index} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl relative group/seg border border-slate-200 dark:border-slate-700">
                            {segments.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeSegment(index)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 shadow-sm z-10 transition-transform hover:scale-110"
                                >
                                    ×
                                </button>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">السورة</label>
                                    <select
                                        value={seg.surah}
                                        onChange={(e) => updateSegment(index, 'surah', Number(e.target.value))}
                                        className="w-full p-2 border rounded-lg text-sm dark:bg-slate-700 dark:border-slate-600"
                                    >
                                        {SURAHS.map(s => <option key={s.number} value={s.number}>{s.number}. {s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">من آية</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={seg.start}
                                        onChange={(e) => updateSegment(index, 'start', Number(e.target.value))}
                                        className="w-full p-2 border rounded-lg text-sm dark:bg-slate-700 dark:border-slate-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">إلى آية</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={seg.end}
                                        onChange={(e) => updateSegment(index, 'end', Number(e.target.value))}
                                        className="w-full p-2 border rounded-lg text-sm dark:bg-slate-700 dark:border-slate-600"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.is_published}
                            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                            className="w-4 h-4 accent-emerald-600"
                        />
                        <span className="text-sm">نشر الفيديو</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.is_featured}
                            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                            className="w-4 h-4 accent-emerald-600"
                        />
                        <span className="text-sm">تمييز (Featured)</span>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading || !videoMeta}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? 'جاري الحفظ...' : 'حفظ الفيديو'}
                </button>
            </div>
        </form>
    );
}
