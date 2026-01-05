
"use client";

import { usePlayer } from "@/context/PlayerContext";

interface CollectionPlayButtonProps {
    playlist: {
        id: string;
        title: string;
        reciterId: string;
        reciterName: string;
        surahNumber: number;
        slug: string;
        duration: number;
    }[];
}

export default function CollectionPlayButton({ playlist }: CollectionPlayButtonProps) {
    const { playTrack, setQueue } = usePlayer();

    const handlePlayAll = () => {
        if (playlist.length === 0) return;

        // 1. Set the queue to the rest of the items
        const queueItems = playlist.slice(1).map(track => ({
            id: track.id,
            title: track.title, // In real app, might want nicer title logic
            reciterId: track.reciterId,
            reciterName: track.reciterName,
            surahNumber: track.surahNumber,
            sectionSlug: track.slug
        }));

        setQueue(queueItems);

        // 2. Play the first track
        const first = playlist[0];
        playTrack({
            id: first.id,
            title: first.title,
            reciterId: first.reciterId,
            reciterName: first.reciterName,
            surahNumber: first.surahNumber,
            sectionSlug: first.slug
        });
    };

    return (
        <button
            onClick={handlePlayAll}
            disabled={playlist.length === 0}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold shadow-lg shadow-emerald-900/20 hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
        >
            <span className="text-xl">▶</span>
            تشغيل الكل
        </button>
    );
}
