"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { formatDualYear } from "@/lib/date-utils";
import { getSurahName } from "@/lib/quran-helpers";
import { Track } from "@/types/player";
import { useLeanMode } from "@/context/LeanModeContext";
import PlayButton from "@/components/player/PlayButton";
import QueueButton from "@/components/player/QueueButton";
import DownloadButton from "@/components/offline/DownloadButton";
import VideoModal from "@/components/player/VideoModal";

interface TimelineRecording {
    id: string;
    title?: string;
    surah_number: number;
    ayah_start: number;
    ayah_end: number;
    recording_date: {
        year: number;
        month?: number;
        day?: number;
        approximate: boolean;
    };
    created_at: string;
    section: {
        name_ar: string;
        slug: string;
    };
    city?: string;
    src?: string;
    reciterName?: string;
    reciterId?: string;
    duration?: string;
    type?: 'audio' | 'video';
    videoUrl?: string;
    videoThumbnail?: string;
    recording_coverage?: {
        surah_number: number;
        ayah_start: number;
        ayah_end: number;
    }[];
    play_count?: number;
}

interface ReciterTimelineProps {
    recordings: TimelineRecording[];
}

const COLLAPSE_THRESHOLD = 9;

export default function ReciterTimeline({ recordings }: ReciterTimelineProps) {
    const { isLean } = useLeanMode();
    const [selectedVideo, setSelectedVideo] = useState<any>(null);

    // Grouping Logic: Year -> Section (Cluster)
    const timelineData = useMemo(() => {
        const groups: Record<number, Record<string, TimelineRecording[]>> = {};

        recordings.forEach(rec => {
            const year = rec.recording_date?.year || 0;
            // Use section name as cluster key, default to 'Unknown'
            const sectionName = rec.section?.name_ar || "تلاوات متنوعة";

            if (!groups[year]) {
                groups[year] = {};
            }
            if (!groups[year][sectionName]) {
                groups[year][sectionName] = [];
            }
            groups[year][sectionName].push(rec);
        });

        // Convert to array and sort years descending
        return Object.entries(groups)
            .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
            .map(([year, clusters]) => ({
                year,
                clusters: Object.entries(clusters).map(([name, items]) => ({ name, items }))
            }));
    }, [recordings]);

    if (recordings.length === 0) {
        return (
            <div className="text-center py-10 opacity-60">
                لا توجد بيانات زمنية متاحة للتلاوات.
            </div>
        );
    }

    return (
        <div className="relative w-full pb-32">
            {/* River Line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-gradient-to-b from-emerald-500 via-slate-200 dark:via-slate-700 to-transparent z-0"></div>

            {timelineData.map((group) => (
                <YearGroup
                    key={group.year}
                    group={group}
                    isLean={isLean}
                    onVideoSelect={setSelectedVideo}
                />
            ))}

            {/* Video Modal */}
            {selectedVideo && (
                <VideoModal
                    video={{
                        video_url: selectedVideo.videoUrl || "",
                        title: selectedVideo.title || "",
                        reciter: { name_ar: selectedVideo.reciterName },
                        section: selectedVideo.section
                    }}
                    onClose={() => setSelectedVideo(null)}
                />
            )}
        </div>
    );
}

function YearGroup({ group, isLean, onVideoSelect }: { group: any, isLean: boolean, onVideoSelect: (v: any) => void }) {
    const [activeSection, setActiveSection] = useState<string | null>(null);

    return (
        <div className="relative mb-16 scroll-mt-24" id={`year-${group.year}`}>
            {/* Smart Sticky Year Header */}
            <div className="sticky top-16 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
                <div className="container mx-auto px-4 md:px-6 py-3 flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-3 transition-all duration-300">
                        <span className="font-black text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-sans tracking-tight">
                            {group.year === "0" ? "غير مؤرخ" : group.year}
                        </span>

                        {activeSection && (
                            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                <span className="h-6 w-0.5 bg-emerald-500/50 rounded-full"></span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl md:text-2xl">{getSectionIcon(activeSection)}</span>
                                    <span className="font-bold text-lg text-slate-700 dark:text-slate-200">{activeSection}</span>
                                </div>
                            </div>
                        )}

                        {!activeSection && (
                            <>
                                <div className="hidden sm:block h-5 w-px bg-slate-300 dark:bg-slate-700"></div>
                                <div className="flex items-center gap-1.5 text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium">
                                    <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                                        {group.clusters.length} {group.clusters.length === 1 ? 'قسم' : 'أقسام'}
                                    </span>
                                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
                                        {group.clusters.reduce((acc: any, c: any) => acc + c.items.length, 0)} تلاوة
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="relative z-10 px-4 md:px-6 flex flex-col gap-8 pt-8">
                {group.clusters.map((cluster: any) => (
                    <ClusterCard
                        key={cluster.name}
                        name={cluster.name}
                        items={cluster.items}
                        isLean={isLean}
                        onVideoSelect={onVideoSelect}
                        onVisible={() => setActiveSection(cluster.name)}
                        onHidden={() => setActiveSection((prev) => prev === cluster.name ? null : prev)}
                    />
                ))}
            </div>
        </div>
    );
}

// Cluster Card Component (Handles Toggle Logic)
function ClusterCard({ name, items, isLean, onVideoSelect, onVisible, onHidden }: {
    name: string,
    items: TimelineRecording[],
    isLean: boolean,
    onVideoSelect: (v: any) => void,
    onVisible: () => void,
    onHidden: () => void
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const totalItems = items.length;
    const shouldCollapse = totalItems > COLLAPSE_THRESHOLD;
    const visibleItems = shouldCollapse && !isExpanded ? items.slice(0, COLLAPSE_THRESHOLD) : items;
    const hiddenCount = totalItems - COLLAPSE_THRESHOLD;

    // Intersection Observer for Sticky Header Merge
    const [ref, setRef] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!ref) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                // Adjust threshold based on when you want the merge to happen
                // rootMargin: -140px ensures it triggers when the card slips under the header area
                if (entry.isIntersecting) {
                    onVisible();
                } else if (entry.boundingClientRect.top > 0) {
                    // Only hide if we scrolled BACK UP past it, not down past it
                    onHidden();
                }
            },
            { threshold: 0, rootMargin: "-120px 0px -50% 0px" }
        );

        observer.observe(ref);
        return () => observer.disconnect();
    }, [ref, onVisible, onHidden]);

    const gridColsClass = visibleItems.length === 1
        ? "grid-cols-1"
        : visibleItems.length === 2
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

    return (
        <div ref={setRef} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] dark:shadow-none relative ring-1 ring-slate-900/5 dark:ring-white/5 scroll-mt-32">
            {/* Header - Not Sticky anymore, static */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xl md:text-2xl shrink-0 border border-slate-100 dark:border-slate-700/50">
                    {getSectionIcon(name)}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-base md:text-lg text-slate-900 dark:text-white truncate">{name}</h3>
                </div>
                <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-lg shrink-0">
                    {totalItems}
                </span>
            </div>

            {/* Grid */}
            <div className={`grid ${gridColsClass} gap-3 transition-all duration-300`}>
                {visibleItems.map((rec) => (
                    <TrackCard key={rec.id} rec={rec} isLean={isLean} onVideoSelect={onVideoSelect} />
                ))}
            </div>

            {/* Toggle System */}
            {shouldCollapse && (
                <>
                    {/* Fade Mask */}
                    {!isExpanded && (
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-white/80 to-white dark:via-slate-900/80 dark:to-slate-900 pointer-events-none z-10 transition-opacity duration-300 rounded-b-3xl"></div>
                    )}

                    {/* Toggle Button */}
                    <div className="relative z-20 text-center mt-4">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 shadow-lg backdrop-blur-md
                                ${isExpanded
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    : 'bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 hover:scale-105 hover:bg-emerald-600 dark:hover:bg-emerald-400'
                                }`}
                        >
                            <span>{isExpanded ? 'إظهار أقل' : `عرض ${hiddenCount} المزيد`}</span>
                            <svg
                                className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

// Individual Track Card
function TrackCard({ rec, isLean, onVideoSelect }: { rec: TimelineRecording, isLean: boolean, onVideoSelect: (v: any) => void }) {
    const track: Track = {
        id: rec.id,
        title: rec.title || (rec.surah_number ? `سورة ${getSurahName(rec.surah_number)}` : 'تسجيل عام'),
        reciterName: rec.reciterName || 'Unknown',
        src: rec.src || '',
        surahNumber: rec.surah_number,
        reciterId: rec.reciterId || 'unknown'
    };

    return (
        <div className="group bg-slate-50 dark:bg-slate-950/50 border border-transparent hover:bg-white dark:hover:bg-slate-800 hover:border-emerald-500/50 hover:shadow-[0_8px_24px_-8px_rgba(16,185,129,0.15)] rounded-xl p-3 flex items-center gap-3 transition-all duration-200 cursor-default">
            {/* Play Button Area */}
            <div className="shrink-0 bg-white dark:bg-slate-800 w-10 h-10 rounded-full flex items-center justify-center shadow-sm text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                {rec.type === 'video' ? (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onVideoSelect(rec);
                        }}
                        className="w-full h-full flex items-center justify-center text-red-600"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </button>
                ) : (
                    <PlayButton track={track} size="sm" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-relaxed" title={track.title}>
                        {track.title}
                    </h4>
                </div>

                <div className="flex items-center gap-2 mt-1">
                    {rec.city && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {rec.city}
                        </span>
                    )}

                    {(rec.play_count !== undefined && rec.play_count !== null) && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                            {Number(rec.play_count).toLocaleString('ar-EG')}
                        </span>
                    )}
                </div>
            </div>

            {/* Hover Actions (Queue/Download) */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {!isLean && (
                    <>
                        <QueueButton
                            track={track}
                            variant="icon"
                            size="xs"
                            className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                        />
                        <DownloadButton
                            trackId={rec.id}
                            title={track.title}
                            reciterName={track.reciterName}
                            audioUrl={rec.src || ''}
                            surahNumber={rec.surah_number}
                            minimal={true}
                            className="bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 !p-1.5"
                        />
                    </>
                )}
            </div>
        </div>
    );
}

function getSectionIcon(name: string) {
    if (name.includes("مجود")) return "🎤";
    if (name.includes("مرتل")) return "📖";
    if (name.includes("حفلات")) return "🕌";
    if (name.includes("استوديو")) return "🎙️";
    if (name.includes("إذاعة")) return "📻";
    return "📜";
}
