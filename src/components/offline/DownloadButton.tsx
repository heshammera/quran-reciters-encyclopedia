"use client";

import { useDownload } from "@/context/DownloadContext";
import { isTrackDownloaded, type DownloadedTrack } from "@/lib/download-manager";
import { useState, useEffect } from "react";

interface DownloadButtonProps {
    trackId: string;
    title: string;
    reciterName: string;
    audioUrl: string;
    surahNumber?: number;
    className?: string;
    fullWidth?: boolean;
    minimal?: boolean;
}

export default function DownloadButton({
    trackId,
    title,
    reciterName,
    audioUrl,
    surahNumber,
    className = "",
    fullWidth = false,
    minimal = false
}: DownloadButtonProps) {
    const { startDownload, isDownloading, getDownloadProgress } = useDownload();
    const [isSaved, setIsSaved] = useState(false);

    // Check specific download state from context
    const downloading = isDownloading(audioUrl);
    const progress = getDownloadProgress(audioUrl);

    useEffect(() => {
        // Initial check
        setIsSaved(isTrackDownloaded(trackId));

        // Create an interval to check for updates (e.g. if downloaded in another tab)
        const interval = setInterval(() => {
            setIsSaved(isTrackDownloaded(trackId));
        }, 2000);

        return () => clearInterval(interval);
    }, [trackId, downloading]); // Re-check when downloading status changes

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isSaved || downloading) return;

        const track: DownloadedTrack = {
            id: trackId,
            title,
            reciterName,
            audioUrl,
            surahNumber,
            downloadedAt: Date.now() // placeholder, will be updated by context on finish
        };

        await startDownload(track);
    };

    if (isSaved) {
        return (
            <button
                disabled
                className={`flex items-center justify-center gap-2 ${minimal ? "p-2" : "px-4 py-2"} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg cursor-not-allowed ${fullWidth ? "w-full" : ""} ${className}`}
                title="تم التحميل"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {!minimal && <span className="text-sm font-bold">تم</span>}
            </button>
        );
    }

    if (downloading) {
        return (
            <button
                disabled
                className={`flex items-center justify-center gap-2 ${minimal ? "p-2" : "px-4 py-2"} rounded-lg transition-colors font-bold text-sm ${fullWidth ? "w-full" : ""} ${className} bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-wait`}
                title={`${progress.toFixed(0)}% جاري التحميل...`}
            >
                <div className="relative w-5 h-5">
                    {/* Background Circle */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                            className="text-slate-300 dark:text-slate-600"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        {/* Progress Circle */}
                        <path
                            className="text-emerald-500 transition-all duration-300 ease-out"
                            strokeDasharray={`${progress}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                    </svg>
                </div>
                {!minimal && <span>{progress.toFixed(0)}%</span>}
            </button>
        );
    }

    return (
        <button
            onClick={handleDownload}
            className={`flex items-center justify-center gap-2 ${minimal ? "p-2" : "px-4 py-2"} rounded-lg transition-colors font-bold text-sm ${fullWidth ? "w-full" : ""} ${className} bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700`}
            title="حفظ للاستماع أوفلاين"
        >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {!minimal && <span>تحميل</span>}
        </button>
    );
}
