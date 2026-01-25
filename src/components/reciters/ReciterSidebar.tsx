"use client";

import { formatDualYear } from "@/lib/date-utils";
import { useState } from "react";

interface ReciterSidebarProps {
    reciter: {
        id: string;
        name_ar: string;
        image_url?: string | null;
        biography_ar?: string | null;
        birth_date?: string | null;
        death_date?: string | null;
    };
    stats: {
        sectionsCount: number;
        recordingsCount: number;
        reciterCountry?: string; // Add if available, otherwise static or hidden
    };
}

export default function ReciterSidebar({ reciter, stats }: ReciterSidebarProps) {
    const [isBioExpanded, setIsBioExpanded] = useState(false);

    // Helper to get year from date string
    const getYear = (dateStr?: string | null) => {
        if (!dateStr) return null;
        return new Date(dateStr).getFullYear();
    };

    const birthYear = getYear(reciter.birth_date);
    const deathYear = getYear(reciter.death_date);

    return (
        // Mobile: w-full, centered content. Desktop: Fixed sidebar, 420px width.
        <aside className="w-full lg:w-[420px] bg-white dark:bg-[#0f172a] border-b lg:border-b-0 lg:border-l border-slate-200 dark:border-white/10 flex flex-col p-6 lg:p-10 lg:h-screen lg:overflow-y-auto relative z-20 shadow-sm dark:shadow-[10px_0_30px_rgba(0,0,0,0.3)] shrink-0 transition-colors duration-300">

            {/* Profile Image - Centered on Mobile */}
            <div className="w-[120px] h-[120px] md:w-[180px] md:h-[180px] mx-auto mb-6 relative">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-100 dark:border-[#1e293b] shadow-lg dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)]">
                    {reciter.image_url ? (
                        <img
                            src={reciter.image_url}
                            alt={reciter.name_ar}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600">
                            <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    )}
                </div>
                {/* Online Indicator */}
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-[#0f172a] rounded-full"></div>
            </div>

            {/* Name & Dates */}
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white text-center mb-2">
                {reciter.name_ar}
            </h1>

            <div className="text-center mb-6">
                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium bg-slate-100 dark:bg-white/5 px-4 py-1.5 rounded-full border border-slate-200 dark:border-transparent inline-block">
                    {birthYear ? formatDualYear(birthYear) : ''}
                    {deathYear ? ` - ${formatDualYear(deathYear)}` : ''}
                </span>
            </div>

            {/* Stats Row - Flex to match design */}
            <div className="flex justify-between items-center mb-8 py-4 px-0 border-t border-b border-slate-200 dark:border-white/10">
                <div className="text-center flex-1">
                    <span className="block text-xl font-extrabold text-slate-900 dark:text-white">{stats.sectionsCount}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">أقسام</span>
                </div>
                <div className="text-center flex-1 border-r border-l border-slate-200 dark:border-white/5">
                    <span className="block text-xl font-extrabold text-slate-900 dark:text-white">{stats.recordingsCount}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">تلاوة</span>
                </div>
                <div className="text-center flex-1">
                    <span className="block text-xl font-extrabold text-slate-900 dark:text-white">EG</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">مصر</span>
                </div>
            </div>

            {/* Bio Box */}
            {reciter.biography_ar && (
                <div className="bg-slate-50 dark:bg-[rgba(255,255,255,0.03)] border border-slate-200 dark:border-white/10 rounded-2xl p-5 mb-6 text-justify">
                    <div className={`text-slate-600 dark:text-slate-400 text-sm leading-relaxed ${!isBioExpanded ? 'line-clamp-4' : ''}`}>
                        <strong className="text-slate-900 dark:text-white font-bold">{reciter.name_ar}</strong> {reciter.biography_ar}
                    </div>
                    {reciter.biography_ar.length > 150 && (
                        <button
                            onClick={() => setIsBioExpanded(!isBioExpanded)}
                            className="mt-2 text-emerald-600 dark:text-emerald-500 text-xs font-bold hover:underline transition-colors block w-full text-left"
                        >
                            {isBioExpanded ? 'عرض أقل' : 'اقرأ المزيد...'}
                        </button>
                    )}
                </div>
            )}

            {/* Actions Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-auto">
                <button className="bg-transparent border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 py-3.5 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-[#1e293b] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-500 transition-all text-sm flex items-center justify-center gap-2">
                    <span className="text-red-500 text-lg">❤️</span> مفضلة
                </button>
                <button className="bg-transparent border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 py-3.5 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-[#1e293b] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-500 transition-all text-sm flex items-center justify-center gap-2">
                    <span className="text-lg">🔗</span> مشاركة
                </button>
            </div>
        </aside>
    );
}
