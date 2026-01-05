"use client";

import Link from "next/link";
import { useLeanMode } from "@/context/LeanModeContext";

export default function CollectionList({ collections }: { collections: any[] }) {
    const { isLean } = useLeanMode();

    if (!collections || collections.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-slate-500 dark:text-slate-400">
                    لا توجد مجموعات منشورة حالياً.
                </p>
            </div>
        );
    }

    return (
        <div className={`grid grid-cols-1 ${isLean ? 'gap-3' : 'md:grid-cols-2 lg:grid-cols-3 gap-8'}`}>
            {collections.map((collection) => (
                <Link
                    key={collection.id}
                    href={`/collections/${collection.slug}`}
                    className={`group block bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow transition-all border border-slate-100 dark:border-slate-700 h-full flex flex-col ${isLean ? 'p-4 shadow-sm' : 'hover:shadow-lg hover:-translate-y-1'
                        }`}
                >
                    {!isLean && (
                        <div className="relative aspect-[16/9] bg-slate-100 dark:bg-slate-700">
                            {collection.cover_image_url ? (
                                <img
                                    src={collection.cover_image_url}
                                    alt={collection.title_ar}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
                                    </svg>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="bg-white/90 text-slate-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                    استعراض المجموعة
                                </span>
                            </div>
                        </div>
                    )}

                    <div className={`${isLean ? '' : 'p-5'} flex-1 flex flex-col`}>
                        <h3 className={`font-bold transition-colors ${isLean ? 'text-lg mb-1 group-active:text-emerald-600' : 'text-xl text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600'}`}>
                            {collection.title_ar}
                        </h3>
                        <p className={`text-slate-600 dark:text-slate-400 leading-relaxed ${isLean ? 'text-xs line-clamp-1' : 'text-sm line-clamp-3'}`}>
                            {collection.description_ar || "لا يوجد وصف لهذه المجموعة"}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
}
