"use client";

import Link from "next/link";
import { useLeanMode } from "@/context/LeanModeContext";
import { cn } from "@/lib/utils";

interface ReciterCardProps {
    reciter: {
        id: string;
        name_ar: string;
        image_url?: string | null;
        bio_short?: string; // fallback or derived if needed
    };
}

export default function ReciterCard({ reciter }: ReciterCardProps) {
    const { isLean } = useLeanMode();

    if (isLean) {
        return (
            <Link
                href={`/reciters/${reciter.id}`}
                className="block p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-emerald-500 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{reciter.name_ar}</h3>
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={`/reciters/${reciter.id}`}
            className="group relative overflow-hidden rounded-2xl aspect-[3/4] hover:shadow-xl transition-all duration-300 bg-slate-100 dark:bg-slate-800"
        >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-xl font-bold text-white mb-1 shadow-sm">{reciter.name_ar}</h3>
                <div className="h-0.5 w-12 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100" />
            </div>

            {/* Image */}
            {reciter.image_url ? (
                <img
                    src={reciter.image_url}
                    alt={reciter.name_ar}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700">
                    <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            )}
        </Link>
    );
}
