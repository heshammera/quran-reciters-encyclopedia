"use client";

import { usePlayer } from "@/hooks/usePlayer";
import { Track } from "@/types/player";
import { useState } from "react";

interface QueueButtonProps {
    track?: Track;
    tracks?: Track[];
    variant?: "icon" | "outline" | "ghost" | "solid";
    size?: "sm" | "md";
    label?: string;
}

export default function QueueButton({ track, tracks, variant = "outline", size = "md", label }: QueueButtonProps) {
    const { addToQueue, addTracksToQueue } = usePlayer();
    const [added, setAdded] = useState(false);

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (track) {
            addToQueue(track);
        } else if (tracks && tracks.length > 0) {
            addTracksToQueue(tracks);
        }

        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const sizeClasses = size === "sm" ? "p-1.5 text-xs" : "p-2 text-sm";

    const variantClasses = {
        icon: "text-slate-400 hover:text-emerald-600 dark:text-slate-500 dark:hover:text-emerald-400 p-2",
        ghost: "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors",
        outline: "border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-600 dark:text-slate-400 rounded-lg transition-all",
        solid: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg font-bold"
    };

    return (
        <button
            onClick={handleAdd}
            className={`flex items-center gap-2 ${variantClasses[variant]} ${sizeClasses} relative group`}
            title={added ? "تمت الإضافة!" : (label || "إضافة لقائمة التشغيل")}
        >
            {added ? (
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            )}
            {label && <span className="font-bold">{added ? "تمت الإضافة" : label}</span>}

            {/* Tooltip for icon variant */}
            {variant === "icon" && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {added ? "تمت الإضافة" : (label || "إضافة للقائمة")}
                </span>
            )}
        </button>
    );
}
