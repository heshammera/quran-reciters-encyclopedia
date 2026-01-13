"use client";

import { useState, useMemo } from "react";
import ReciterCard from "./ReciterCard";
import { cn } from "@/lib/utils";

type SortOption = "alphabetical" | "most_recordings" | "recently_added" | "most_popular";

interface ReciterWithStats {
    id: string;
    name_ar: string;
    image_url?: string | null;
    bio_short?: string;
    created_at?: string;
    recordings_count?: number;
}

interface RecitersGridProps {
    reciters: ReciterWithStats[];
}

export default function RecitersGrid({ reciters }: RecitersGridProps) {
    const [sortBy, setSortBy] = useState<SortOption>("alphabetical");
    const [showAll, setShowAll] = useState(false);

    // Sort reciters based on selected filter
    const sortedReciters = useMemo(() => {
        const sorted = [...reciters];

        switch (sortBy) {
            case "alphabetical":
                return sorted.sort((a, b) => a.name_ar.localeCompare(b.name_ar, "ar"));

            case "most_recordings":
                return sorted.sort((a, b) =>
                    (b.recordings_count || 0) - (a.recordings_count || 0)
                );

            case "recently_added":
                return sorted.sort((a, b) => {
                    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                    return dateB - dateA;
                });

            case "most_popular":
                // Combine recordings count as popularity metric
                return sorted.sort((a, b) =>
                    (b.recordings_count || 0) - (a.recordings_count || 0)
                );

            default:
                return sorted;
        }
    }, [reciters, sortBy]);

    // Show only first 7 (one row) initially
    const displayedReciters = showAll ? sortedReciters : sortedReciters.slice(0, 7);
    const hasMore = sortedReciters.length > 7;

    const filters: { value: SortOption; label: string; icon: string }[] = [
        { value: "alphabetical", label: "أبجدياً", icon: "🔤" },
        { value: "most_recordings", label: "الأكثر تلاوات", icon: "📚" },
        { value: "recently_added", label: "المضاف حديثاً", icon: "✨" },
        { value: "most_popular", label: "الأكثر شعبية", icon: "🔥" },
    ];

    return (
        <div className="space-y-8">
            {/* Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
                {filters.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => setSortBy(filter.value)}
                        className={cn(
                            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-sm",
                            sortBy === filter.value
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-105"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700"
                        )}
                    >
                        <span className="mr-2">{filter.icon}</span>
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Reciters Grid - 7 columns on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 md:gap-6">
                {displayedReciters.map((reciter) => (
                    <ReciterCard key={reciter.id} reciter={reciter} />
                ))}
            </div>

            {/* Show More Button */}
            {hasMore && (
                <div className="text-center pt-4">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="group px-8 py-3 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl border-2 border-emerald-500 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        <span className="flex items-center gap-2">
                            {showAll ? (
                                <>
                                    <span>عرض أقل</span>
                                    <svg className="w-5 h-5 transition-transform group-hover:-translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                </>
                            ) : (
                                <>
                                    <span>رؤية المزيد ({sortedReciters.length - 7} قارئ)</span>
                                    <svg className="w-5 h-5 transition-transform group-hover:translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </>
                            )}
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}
