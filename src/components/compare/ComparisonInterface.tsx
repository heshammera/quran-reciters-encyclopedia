"use client";

import { useState, useEffect } from "react";
import { findRecordingsForAyah } from "@/app/actions/compare";
import { usePlayer, type Track } from "@/context/PlayerContext";
import { SURAHS } from "@/lib/quran/metadata";

export default function ComparisonInterface() {
    const { state, dispatch } = usePlayer();
    const [loading, setLoading] = useState(false);
    const [recordings, setRecordings] = useState<any[]>([]);

    const [surahNumber, setSurahNumber] = useState(1);
    const [ayahStart, setAyahStart] = useState(1);
    const [ayahEnd, setAyahEnd] = useState(7);

    // Get metadata for current surah
    const currentSurah = SURAHS.find(s => s.number === surahNumber);
    const maxAyahs = currentSurah?.ayahCount || 0;

    // Generate ayah options
    const ayahOptions = Array.from({ length: maxAyahs }, (_, i) => i + 1);

    // Ensure ayah range is valid when surah changes
    useEffect(() => {
        if (ayahStart > maxAyahs) setAyahStart(1);
        if (ayahEnd > maxAyahs) setAyahEnd(maxAyahs);
        if (ayahStart > ayahEnd) setAyahEnd(ayahStart);
    }, [surahNumber, maxAyahs]);

    const handleSearch = async () => {
        setLoading(true);
        setRecordings([]);
        try {
            const results = await findRecordingsForAyah({
                surahNumber,
                ayahStart,
                ayahEnd
            });

            if (results.length === 0) {
                alert("لم يتم العثور على تسجيلات تغطي هذا النطاق من الآيات.");
            } else {
                setRecordings(results);
            }
        } catch (e: any) {
            console.error("Comparison error:", e);
            alert("حدث خطأ: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const playRecording = (recording: any) => {
        const track: Track = {
            id: recording.id,
            title: `${recording.sections?.name_ar || `سورة ${recording.surah_number}`} (${recording.ayah_start}-${recording.ayah_end})`,
            reciterName: recording.reciters?.name_ar || "Unknown",
            src: recording.archive_url,
            reciterId: recording.reciter_id,
            sectionSlug: recording.sections?.slug
        };

        dispatch({ type: "PLAY_TRACK", payload: track });
    };

    const playAllSequentially = () => {
        if (recordings.length === 0) return;

        const tracks: Track[] = recordings.map(rec => ({
            id: rec.id,
            title: `${rec.sections?.name_ar || `سورة ${rec.surah_number}`} - ${rec.reciters?.name_ar}`,
            reciterName: rec.reciters?.name_ar || "Unknown",
            src: rec.archive_url,
            reciterId: rec.reciter_id,
            sectionSlug: rec.sections?.slug
        }));

        dispatch({ type: "PLAY_TRACK", payload: tracks[0] });
        dispatch({ type: "SET_QUEUE", payload: tracks });
    };

    return (
        <div className="space-y-8">
            {/* Search Form */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <span>🎯</span>
                    اختر الآيات للمقارنة
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">اسم السورة</label>
                        <select
                            value={surahNumber}
                            onChange={(e) => setSurahNumber(parseInt(e.target.value))}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                            {SURAHS.map((surah) => (
                                <option key={surah.number} value={surah.number}>
                                    {surah.number}. {surah.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">من آية</label>
                        <select
                            value={ayahStart}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setAyahStart(val);
                                if (val > ayahEnd) setAyahEnd(val);
                            }}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                            {ayahOptions.map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">إلى آية</label>
                        <select
                            value={ayahEnd}
                            onChange={(e) => setAyahEnd(parseInt(e.target.value))}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                            {ayahOptions.filter(n => n >= ayahStart).map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="mt-6 w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <span>🔍</span>
                            ابحث عن التسجيلات
                        </>
                    )}
                </button>
            </div>

            {/* Results */}
            {recordings.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            النتائج ({recordings.length} قارئ)
                        </h3>
                        <button
                            onClick={playAllSequentially}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm flex items-center gap-2"
                        >
                            <span>▶️</span>
                            تشغيل الكل
                        </button>
                    </div>

                    <div className="space-y-3">
                        {recordings.map((rec) => (
                            <div
                                key={rec.id}
                                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    {rec.reciters?.image_url && (
                                        <img
                                            src={rec.reciters.image_url}
                                            alt={rec.reciters.name_ar}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    )}
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">
                                            {rec.reciters?.name_ar}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {rec.sections?.name_ar} - آيات {rec.ayah_start} إلى {rec.ayah_end}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => playRecording(rec)}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${state.currentTrack?.id === rec.id
                                            ? "bg-emerald-600 text-white"
                                            : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white"
                                        }`}
                                >
                                    {state.currentTrack?.id === rec.id ? "▶️ يُشغَّل الآن" : "▶️ استمع"}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
