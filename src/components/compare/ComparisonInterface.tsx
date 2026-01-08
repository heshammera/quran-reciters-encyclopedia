"use client";

import { useState, useEffect, useMemo } from "react";
import { findRecordingsForAyah } from "@/app/actions/compare";
import { usePlayer } from "@/hooks/usePlayer";
import { Track } from "@/types/player";
import { SURAHS } from "@/lib/quran/metadata";
import { cn } from "@/lib/utils";
import { getSurahName } from "@/lib/quran-helpers";

export default function ComparisonInterface() {
    const { state, playTrack } = usePlayer();
    const [loading, setLoading] = useState(false);
    const [recordings, setRecordings] = useState<any[]>([]);

    const [surahNumber, setSurahNumber] = useState(1);
    const [ayahStart, setAyahStart] = useState(1);
    const [ayahEnd, setAyahEnd] = useState(7); // Will be updated by effect
    const [surahSearch, setSurahSearch] = useState("");
    const [showSurahList, setShowSurahList] = useState(false);

    // Filter surahs based on search
    const filteredSurahs = useMemo(() => {
        if (!surahSearch) return SURAHS;
        return SURAHS.filter(s =>
            s.name.includes(surahSearch) ||
            s.number.toString().includes(surahSearch)
        );
    }, [surahSearch]);

    const currentSurah = useMemo(() =>
        SURAHS.find(s => s.number === surahNumber),
        [surahNumber]);

    const maxAyahs = currentSurah?.ayahCount || 286;

    // Set initial default ayahEnd to maxAyahs on first mount or surah change
    useEffect(() => {
        if (currentSurah) {
            setAyahStart(1);
            setAyahEnd(currentSurah.ayahCount);
        }
    }, [surahNumber]);

    // Auto-adjust ayah range if out of bounds (safety)
    useEffect(() => {
        if (ayahStart > maxAyahs) setAyahStart(1);
        if (ayahEnd > maxAyahs) setAyahEnd(maxAyahs);
        if (ayahStart > ayahEnd && ayahEnd !== 0) setAyahEnd(ayahStart);
    }, [maxAyahs]);

    // Auto-search whenever selection changes
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch();
        }, 600);
        return () => clearTimeout(timer);
    }, [surahNumber, ayahStart, ayahEnd]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const results = await findRecordingsForAyah({
                surahNumber,
                ayahStart,
                ayahEnd
            });
            setRecordings(results);
        } catch (e: any) {
            console.error("Comparison error:", e);
        } finally {
            setLoading(false);
        }
    };

    const playRecording = (recording: any) => {
        playTrack({
            id: recording.id,
            title: recording.title || (recording.surah_number ? `سورة ${getSurahName(recording.surah_number)} (${recording.ayah_start}-${recording.ayah_end})` : 'تسجيل عام'),
            reciterName: recording.reciters?.name_ar || "Unknown",
            src: recording.archive_url,
            reciterId: recording.reciter_id,
        });
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Main Selection Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-visible relative">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white rounded-t-3xl">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <span className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">🎯</span>
                        تخصيص المقارنة
                    </h2>
                    <p className="mt-2 text-blue-100 opacity-90">اختر السورة والآيات التي تود سماعها بأصوات متعددة</p>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Surah Selector */}
                        <div className="relative">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 mr-1">اسم السورة</label>
                            <div className="relative z-[100]">
                                <input
                                    type="text"
                                    placeholder={currentSurah?.name || "بحث عن سورة..."}
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all pr-12 font-bold"
                                    value={surahSearch}
                                    onChange={(e) => {
                                        setSurahSearch(e.target.value);
                                        setShowSurahList(true);
                                    }}
                                    onFocus={() => setShowSurahList(true)}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    📖
                                </div>

                                {showSurahList && (
                                    <div className="fixed md:absolute top-auto md:top-full mt-2 left-4 right-4 md:left-0 md:right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[100] max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                                        {filteredSurahs.length > 0 ? (
                                            filteredSurahs.map(s => (
                                                <button
                                                    key={s.number}
                                                    className={cn(
                                                        "w-full text-right px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50 last:border-0",
                                                        surahNumber === s.number ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" : ""
                                                    )}
                                                    onClick={() => {
                                                        setSurahNumber(s.number);
                                                        setSurahSearch("");
                                                        setShowSurahList(false);
                                                    }}
                                                >
                                                    <span className="font-bold text-lg">{s.name}</span>
                                                    <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs opacity-70">سورة {s.number}</span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-slate-500">لا توجد نتائج</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {showSurahList && <div className="fixed inset-0 z-[90] bg-black/5" onClick={() => setShowSurahList(false)} />}
                        </div>

                        {/* Ayah Range */}
                        <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 mr-1">من آية</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={1}
                                        max={maxAyahs}
                                        value={ayahStart}
                                        onChange={(e) => setAyahStart(parseInt(e.target.value) || 1)}
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs opacity-50 underline decoration-blue-500">بداية</div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 mr-1">إلى آية</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={ayahStart}
                                        max={maxAyahs}
                                        value={ayahEnd}
                                        onChange={(e) => setAyahEnd(parseInt(e.target.value) || ayahStart)}
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs opacity-50 underline decoration-indigo-500">نهاية</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div>
                <div className="flex items-center justify-between mb-6 px-4">
                    <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">التسجيلات المتوفرة</h3>
                        {loading && <div className="w-5 h-5 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />}
                    </div>
                    {recordings.length > 0 && (
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-1.5 rounded-full text-sm font-bold">
                            تم العثور على {recordings.length} قارئ
                        </div>
                    )}
                </div>

                {recordings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {recordings.map((rec) => (
                            <div
                                key={rec.id}
                                className={cn(
                                    "group relative bg-gradient-to-br overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500",
                                    state.currentTrack?.id === rec.id
                                        ? "from-emerald-50 via-white to-emerald-50/50 dark:from-emerald-900/30 dark:via-slate-800 dark:to-emerald-900/20 ring-4 ring-emerald-500/30 shadow-emerald-500/20"
                                        : "from-slate-50 via-white to-blue-50/30 dark:from-slate-800/50 dark:via-slate-800 dark:to-slate-700/50 hover:from-blue-50 hover:via-white hover:to-indigo-50/30 dark:hover:from-slate-700 dark:hover:via-slate-800 dark:hover:to-slate-700"
                                )}
                            >
                                {/* Decorative gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-blue-500/5 dark:via-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                {/* Glow effect for active card */}
                                {state.currentTrack?.id === rec.id && (
                                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-emerald-400/20 to-emerald-500/20 blur-xl -z-10 animate-pulse" />
                                )}

                                <div className="relative p-5 flex flex-col items-center text-center gap-4">
                                    {/* Avatar Section */}
                                    <div className="relative">
                                        <div className={cn(
                                            "w-20 h-20 rounded-2xl overflow-hidden shadow-lg ring-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                                            state.currentTrack?.id === rec.id
                                                ? "ring-emerald-300/50 dark:ring-emerald-500/30 shadow-emerald-500/30"
                                                : "ring-white/80 dark:ring-slate-700/50 group-hover:ring-blue-200/50 dark:group-hover:ring-blue-500/20"
                                        )}>
                                            {rec.reciters?.image_url ? (
                                                <img
                                                    src={rec.reciters.image_url}
                                                    alt={rec.reciters.name_ar}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
                                                    🎙️
                                                </div>
                                            )}
                                        </div>

                                        {/* Active indicator */}
                                        {state.currentTrack?.id === rec.id && (
                                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                                <span className="text-white text-sm">▶️</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Section */}
                                    <div className="w-full space-y-2">
                                        {/* Reciter Name */}
                                        <h4 className={cn(
                                            "font-bold text-lg transition-colors truncate px-2",
                                            state.currentTrack?.id === rec.id
                                                ? "text-emerald-700 dark:text-emerald-300"
                                                : "text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400"
                                        )}>
                                            {rec.reciters?.name_ar}
                                        </h4>

                                        {/* Recording Info */}
                                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate px-2">
                                            {rec.title || (rec.surah_number ? `سورة ${getSurahName(rec.surah_number)}` : (rec.sections?.name_ar || 'تلاوة'))}
                                        </p>

                                        {/* City */}
                                        {rec.city && (
                                            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-500">
                                                <span className="opacity-60">📍</span>
                                                <span className="truncate max-w-[200px]">{rec.city}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 w-full">
                                        {/* Add to Queue Button */}
                                        <button
                                            onClick={() => {
                                                // Add to queue functionality
                                                const track: Track = {
                                                    id: rec.id,
                                                    title: rec.title || (rec.surah_number ? `سورة ${getSurahName(rec.surah_number)} (${rec.ayah_start}-${rec.ayah_end})` : 'تسجيل عام'),
                                                    reciterName: rec.reciters?.name_ar || "Unknown",
                                                    src: rec.archive_url,
                                                    reciterId: rec.reciter_id,
                                                };
                                                console.log('Add to queue:', track);
                                            }}
                                            className="relative p-3 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95 overflow-hidden bg-gradient-to-r from-indigo-100 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 hover:from-indigo-600 hover:to-purple-600 hover:text-white dark:hover:from-indigo-600 dark:hover:to-purple-600 shadow-indigo-200/50 dark:shadow-indigo-900/50 group/queue"
                                            title="إضافة إلى قائمة التشغيل"
                                        >
                                            {/* Button gradient overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/queue:translate-x-[100%] transition-transform duration-700" />
                                            <span className="relative z-10 text-lg">➕</span>
                                        </button>

                                        {/* Play Button */}
                                        <button
                                            onClick={() => playRecording(rec)}
                                            className={cn(
                                                "flex-1 relative px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg active:scale-95 overflow-hidden group/btn",
                                                state.currentTrack?.id === rec.id
                                                    ? "bg-emerald-600 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50"
                                                    : "bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-slate-600 shadow-slate-200/50 dark:shadow-slate-900/50"
                                            )}
                                        >
                                            {/* Button gradient overlay for hover */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 pointer-events-none" />

                                            <span className="relative z-10 text-lg">
                                                {state.currentTrack?.id === rec.id ? '⏸️' : '▶️'}
                                            </span>
                                            <span className="relative z-10 font-bold">
                                                {state.currentTrack?.id === rec.id ? 'يُشغَّل' : 'استمع'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !loading && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center">
                        <div className="text-5xl mb-4 opacity-50">🔍</div>
                        <h4 className="text-xl font-bold text-slate-600 dark:text-slate-400">لا توجد نتائج لهذا النطاق</h4>
                        <p className="text-slate-400 mt-2">جرب اختيار آيات أخرى أو سورة مختلفة</p>
                    </div>
                )}
            </div>
        </div >
    );
}
