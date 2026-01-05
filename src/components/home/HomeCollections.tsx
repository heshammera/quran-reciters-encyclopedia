"use client";

import Link from "next/link";
import { useLeanMode } from "@/context/LeanModeContext";

interface Collection {
    id: string;
    slug: string;
    title_ar: string;
    description_ar: string;
    cover_image_url?: string;
}

export default function HomeCollections({ collections }: { collections: any[] }) {
    const { isLean } = useLeanMode();

    return (
        <section>
            <div className={`flex items-center justify-between ${isLean ? 'mb-4' : 'mb-8'}`}>
                <h2 className={`font-bold text-slate-900 dark:text-white flex items-center gap-3 ${isLean ? 'text-xl' : 'text-2xl md:text-3xl'}`}>
                    {!isLean && <span className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">❖</span>}
                    مجموعات مختارة
                </h2>
                <Link href="/collections" className="text-emerald-600 font-bold hover:underline text-sm md:text-base">عرض الكل</Link>
            </div>
            <div className={`grid grid-cols-1 ${isLean ? 'gap-3' : 'md:grid-cols-3 gap-6'}`}>
                {collections.map((collection: any) => (
                    <Link
                        key={collection.id}
                        href={`/collections/${collection.slug}`}
                        className={`group relative rounded-2xl overflow-hidden shadow-xl flex items-end border border-slate-200 dark:border-slate-700 transition-all ${isLean
                                ? 'aspect-auto bg-white dark:bg-slate-800 p-4 shadow-sm'
                                : 'aspect-[16/10] bg-slate-900'
                            }`}
                    >
                        {!isLean && collection.cover_image_url && (
                            <div className="absolute inset-0 opacity-70 group-hover:scale-105 transition-transform duration-500">
                                <img src={collection.cover_image_url} alt="" className="w-full h-full object-cover" />
                            </div>
                        )}
                        {!isLean && <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>}

                        <div className={`relative z-10 w-full ${isLean ? '' : 'p-6'}`}>
                            <h3 className={`font-bold group-hover:text-emerald-300 transition-colors ${isLean ? 'text-slate-900 dark:text-white text-lg mb-1' : 'text-white text-xl mb-2'}`}>
                                {collection.title_ar}
                            </h3>
                            <p className={`${isLean ? 'text-slate-500 text-xs' : 'text-slate-300 text-sm'} line-clamp-2 opacity-80`}>
                                {collection.description_ar}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
