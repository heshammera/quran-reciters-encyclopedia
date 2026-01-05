"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { Track } from "@/types/player";

function AutoPlayerInner({ queueTracks }: { queueTracks: Track[] }) {
    const searchParams = useSearchParams();
    const { dispatch, state } = usePlayer();
    const playId = searchParams.get("play");

    useEffect(() => {
        if (playId) {
            const track = queueTracks.find(t => t.id === playId);
            if (track && state.currentTrack?.id !== playId) {
                // Set the context queue first so next/prev works
                dispatch({ type: "SET_QUEUE", payload: queueTracks });
                // Then play the specific track
                dispatch({ type: "PLAY_TRACK", payload: track });
            }
        }
    }, [playId, queueTracks, dispatch, state.currentTrack?.id]);

    return null;
}

export default function AutoPlayer({ queueTracks }: { queueTracks: Track[] }) {
    return (
        <Suspense fallback={null}>
            <AutoPlayerInner queueTracks={queueTracks} />
        </Suspense>
    );
}
