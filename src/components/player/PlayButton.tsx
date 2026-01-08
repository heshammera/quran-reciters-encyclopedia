"use client";

import { usePlayer } from "@/hooks/usePlayer";
import { Track } from "@/types/player";

interface PlayButtonProps {
    track: Track;
    contextTracks?: Track[];
    size?: "sm" | "md" | "lg";
    className?: string;
    label?: string;
}

export default function PlayButton({
    track,
    contextTracks,
    size = "md",
    className = "",
    label
}: PlayButtonProps) {
    const { state, dispatch } = usePlayer();
    const isCurrentTrack = state.currentTrack?.id === track.id;
    const isPlaying = isCurrentTrack && state.isPlaying;

    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12"
    };

    const iconClasses = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6"
    };

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating if inside a Link
        e.stopPropagation();

        if (isCurrentTrack) {
            dispatch({ type: "TOGGLE_PLAY_PAUSE" });
        } else {
            // Smart Queueing: If context is provided and we are playing a new track, update the queue
            if (contextTracks && contextTracks.length > 0) {
                dispatch({ type: "SET_QUEUE", payload: contextTracks });
            }
            dispatch({ type: "PLAY_TRACK", payload: track });
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`flex items-center justify-center transition-all duration-200 gap-2 ${className} ${label ? "rounded-lg px-4 py-2 font-bold text-sm" : `${sizeClasses[size]} rounded-full`
                } ${isPlaying
                    ? "bg-emerald-600 text-white shadow-lg scale-[1.02]"
                    : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                }`}
            title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
        >
            {isPlaying ? (
                <svg className={iconClasses[size]} fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
                <svg className={`${iconClasses[size]} translate-x-0.5`} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            )}
            {label && <span>{isPlaying ? "جاري التشغيل" : label}</span>}
        </button>
    );
}
