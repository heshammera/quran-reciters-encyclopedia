"use client";

import { usePlayer, Track } from "@/context/PlayerContext";
import { formatTime } from "@/lib/utils";

export default function PlayerQueue() {
    const { state, dispatch } = usePlayer();
    const { queue, currentTrack } = state;

    if (queue.length === 0) return null;

    const removeFromQueue = (index: number) => {
        const newQueue = [...queue];
        newQueue.splice(index, 1);
        dispatch({ type: "SET_QUEUE", payload: newQueue });
    };

    const moveTrack = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === queue.length - 1)
        ) return;

        const newQueue = [...queue];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const temp = newQueue[index];
        newQueue[index] = newQueue[targetIndex];
        newQueue[targetIndex] = temp;

        dispatch({ type: "SET_QUEUE", payload: newQueue });
    };

    return (
        <div className="absolute bottom-full left-0 w-full md:w-96 md:left-4 mb-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[60vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🎼</span> قائمة التشغيل ({queue.length})
                </h3>
            </div>

            <div className="overflow-y-auto p-2 space-y-1">
                {queue.map((track, index) => {
                    const isCurrent = currentTrack?.id === track.id;
                    return (
                        <div
                            key={`${track.id}-${index}`}
                            className={`group flex items-center gap-3 p-2 rounded-lg transition-colors ${isCurrent
                                    ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent"
                                }`}
                        >
                            <button
                                onClick={() => dispatch({ type: "PLAY_TRACK", payload: track })}
                                className="flex-1 text-right min-w-0"
                            >
                                <div className={`font-bold text-sm truncate ${isCurrent ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-200"}`}>
                                    {track.title}
                                </div>
                                <div className="text-xs text-slate-500 truncate">
                                    {track.reciterName}
                                </div>
                            </button>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex flex-col">
                                    <button
                                        onClick={() => moveTrack(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 hover:text-emerald-600 disabled:opacity-30"
                                    >
                                        ▲
                                    </button>
                                    <button
                                        onClick={() => moveTrack(index, 'down')}
                                        disabled={index === queue.length - 1}
                                        className="p-1 hover:text-emerald-600 disabled:opacity-30"
                                    >
                                        ▼
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeFromQueue(index)}
                                    className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
