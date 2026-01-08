"use client";

import { useState, useEffect } from "react";
import { usePlayer } from "@/hooks/usePlayer";
import {
    isTrackDownloaded,
    addDownloadedTrack,
    downloadAudioForOffline,
    type DownloadedTrack
} from "@/lib/download-manager";

interface DownloadButtonProps {
    trackId: string;
    title: string;
    reciterName: string;
    audioUrl: string;
    surahNumber?: number;
}

export default function DownloadButton({ trackId, title, reciterName, audioUrl, surahNumber }: DownloadButtonProps) {
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        setIsDownloaded(isTrackDownloaded(trackId));
    }, [trackId]);

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isDownloaded || isDownloading) return;

        setIsDownloading(true);

        try {
            // Download via Service Worker
            const success = await downloadAudioForOffline(audioUrl);

            if (success) {
                // Add to downloads list
                const track: DownloadedTrack = {
                    id: trackId,
                    title,
                    reciterName,
                    audioUrl,
                    surahNumber,
                    downloadedAt: Date.now()
                };

                addDownloadedTrack(track);
                setIsDownloaded(true);
            } else {
                alert('فشل التحميل. تأكد من اتصالك بالإنترنت.');
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('حدث خطأ أثناء التحميل');
        } finally {
            setIsDownloading(false);
        }
    };

    if (isDownloaded) {
        return (
            <button
                disabled
                className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg cursor-not-allowed"
                title="محفوظة أوفلاين"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-bold">محفوظة</span>
            </button>
        );
    }

    return (
        <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-bold text-sm ${isDownloading
                    ? "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 cursor-wait"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
            title={isDownloading ? "جاري التحميل..." : "حفظ للاستماع أوفلاين"}
        >
            {isDownloading ? (
                <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>جاري الحفظ...</span>
                </>
            ) : (
                <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    <span>حفظ أوفلاين</span>
                </>
            )}
        </button>
    );
}
