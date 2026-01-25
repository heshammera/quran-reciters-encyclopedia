"use client";

import Link from "next/link";
import { MoveLeft } from "lucide-react";

interface Section {
    id: string;
    name_ar: string;
    slug: string;
    description_ar?: string | null;
}

interface CollectionCardProps {
    section: Section;
    count: number;
    reciterId: string;
    icon?: React.ReactNode;
}

export default function CollectionCard({ section, count, reciterId, icon }: CollectionCardProps) {
    return (
        <Link
            href={`/reciters/${reciterId}/${section.slug}`}
            className="group relative block"
        >
            {/* Padding restored to p-6 (24px) per design */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500 hover:shadow-lg dark:hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] flex flex-col h-full overflow-hidden relative">

                {/* Top Hover Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-[#1e293b] group-hover:bg-emerald-500 transition-colors duration-200" />

                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-500 text-2xl border border-slate-100 dark:border-transparent">
                        {icon || '📚'}
                    </div>
                    <span className="text-[10px] font-medium bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full border border-slate-200 dark:border-transparent">
                        {count} تلاوة
                    </span>
                </div>

                <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {section.name_ar}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed line-clamp-2">
                        {section.description_ar || 'تصفح التلاوات في هذا القسم...'}
                    </p>
                </div>

                <div className="mt-4 pt-3 flex items-center text-emerald-600 dark:text-emerald-500 text-xs font-bold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                    تصفح القسم <MoveLeft className="w-3.5 h-3.5 mr-2" />
                </div>
            </div>
        </Link>
    );
}
