"use client";

import { usePlayer } from "@/hooks/usePlayer";
import { Track } from "@/types/player";
import { useState, useEffect } from "react";

interface QueueButtonProps {
    track?: Track;
    tracks?: Track[];
    variant?: "icon" | "outline" | "ghost" | "solid";
    size?: "sm" | "md";
    label?: string;
    className?: string;
}

export default function QueueButton({
    track,
    tracks,
    variant = "outline",
    size = "md",
    label,
    className = ""
}: QueueButtonProps) {
    const { addToQueue, addTracksToQueue, state } = usePlayer();
    const [added, setAdded] = useState(false);
    const [isInQueue, setIsInQueue] = useState(false);

    // Check if track is already in queue
    useEffect(() => {
        if (track) {
            const exists = state.queue.some(t => t.id === track.id);
            setIsInQueue(exists);
        }
    }, [track, state.queue]);

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // If already in queue, don't add again
        if (isInQueue) {
            return;
        }

        if (track) {
            addToQueue(track);
        } else if (tracks && tracks.length > 0) {
            addTracksToQueue(tracks);
        }

        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const sizeClasses = size === "sm"
        ? `${label ? "px-3 py-1.5" : "p-1.5"} text-xs`
        : `${label ? "px-4 py-2" : "p-2"} text-sm`;

    const variantClasses = {
        icon: "text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 dark:text-slate-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20 rounded-full transition-all p-2",
        ghost: "text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 border border-emerald-100/50 dark:border-emerald-800/30 rounded-lg transition-colors shadow-sm",
        outline: "border border-slate-300 dark:border-slate-600 hover:border-emerald-500 text-slate-700 dark:text-slate-300 hover:text-emerald-600 rounded-lg transition-all",
        solid: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg rounded-lg font-bold transition-all transform hover:-translate-y-0.5"
    };

    // Change styling if already in queue
    const buttonClasses = isInQueue
        ? "bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-400 cursor-not-allowed rounded-lg"
        : variantClasses[variant];

    return (
        <button
            onClick={handleAdd}
            disabled={isInQueue}
            className={`flex items-center justify-center gap-2 ${buttonClasses} ${sizeClasses} relative group/queue ${className}`}
            title={isInQueue ? "مُضافة مسبقاً" : (added ? "تمت الإضافة!" : (label || "إضافة لقائمة التشغيل"))}
        >
            {isInQueue ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ) : added ? (
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            )}
            {label && <span className="font-bold">{isInQueue ? "مُضافة مسبقاً" : (added ? "تمت الإضافة" : label)}</span>}

            {/* Tooltip for icon variant */}
            {variant === "icon" && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover/queue:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {isInQueue ? "مُضافة مسبقاً" : (added ? "تمت الإضافة" : (label || "إضافة لقائمة التشغيل"))}
                </span>
            )}
        </button>
    );
}
