"use client";

import { usePlayer } from "@/hooks/usePlayer";
import { Track } from "@/types/player";
import { formatTime } from "@/lib/utils";

export default function PlayerQueue() {
    const { state, dispatch, removeFromQueue, playTrack, clearQueue } = usePlayer();
    const { queue, currentTrack } = state;

    if (queue.length === 0) return null;

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
        <div className="absolute bottom-full left-0 w-full md:w-[450px] md:left-4 mb-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[70vh] flex flex-col z-[100]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-2">
                    <span className="text-emerald-500">🎼</span>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                        قائمة التشغيل ({queue.length})
                    </h3>
                </div>
                <button
                    onClick={clearQueue}
                    className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                    مسح القائمة
                </button>
            </div>

            <div className="overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {queue.map((track, index) => {
                    const isCurrent = currentTrack?.id === track.id;
                    return (
                        <div
                            key={`${track.id}-${index}`}
                            className={`group flex items-center gap-3 p-3 rounded-xl transition-all border ${isCurrent
                                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 shadow-sm"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent"
                                }`}
                        >
                            {/* Drag/Handle Visual */}
                            <div className="text-slate-300 dark:text-slate-600 shrink-0 cursor-default">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9-2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                </svg>
                            </div>

                            <button
                                onClick={() => playTrack(track)}
                                className="flex-1 text-right min-w-0"
                            >
                                <div className={`font-bold text-sm truncate ${isCurrent ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-200"}`}>
                                    {track.title}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                                    {track.reciterName}
                                </div>
                            </button>

                            {/* Actions Container */}
                            <div className="flex items-center gap-2">
                                {/* Reorder Controls */}
                                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); moveTrack(index, 'up'); }}
                                        disabled={index === 0}
                                        className="p-1.5 hover:text-emerald-600 disabled:opacity-30 transition-colors"
                                        title="تقديم"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                                        </svg>
                                    </button>
                                    <div className="w-px h-3 bg-slate-200 dark:bg-slate-700 mx-0.5" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); moveTrack(index, 'down'); }}
                                        disabled={index === queue.length - 1}
                                        className="p-1.5 hover:text-emerald-600 disabled:opacity-30 transition-colors"
                                        title="تأخير"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFromQueue(index); }}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all md:opacity-0 group-hover:opacity-100"
                                    title="حذف"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
