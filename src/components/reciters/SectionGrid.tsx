"use client";

import { useState } from "react";
import CollectionCard from "@/components/reciters/CollectionCard";

interface SectionGridProps {
    sections: {
        section: {
            id: string;
            name_ar: string;
            slug: string;
            description_ar?: string | null;
        };
        count: number;
    }[];
    reciterId: string;
}

export default function SectionGrid({ sections, reciterId }: SectionGridProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Logic: 
    // Desktop: Always show all
    // Mobile: Show 3 initially, toggle to show all

    // We can't strictly detect mobile on server, but we can render all validation logic in client
    // To avoid hydration mismatch, let's just check length.

    // Actually, simple CSS solution combined with state is safer for hydration.
    // Display all on Desktop (classes)
    // Hide > 3 on Mobile unless expanded

    const visibleSections = sections;
    const isMobileTruncated = !isExpanded && sections.length > 3;

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {visibleSections.map((item, index) => (
                    <div
                        key={item.section.id}
                        className={`${index >= 3 && !isExpanded ? 'hidden md:block' : 'block'}`}
                    >
                        <CollectionCard
                            section={item.section}
                            count={item.count}
                            reciterId={reciterId}
                        />
                    </div>
                ))}
            </div>

            {/* Mobile Show More Button */}
            {sections.length > 3 && (
                <div className="md:hidden text-center">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <span>{isExpanded ? 'عرض أقل' : `عرض ${sections.length - 3} أقسام أخرى`}</span>
                        <svg
                            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}
