"use client";

import { usePlayer } from "@/hooks/usePlayer";
import { Track } from "@/types/player";
import { formatTime } from "@/lib/utils";
import { Reorder, useDragControls } from "framer-motion";
import { getHistory, clearHistory as clearHistoryStore, HistoryEntry } from "@/lib/history-utils";
import { useState, useEffect } from "react";

interface QueueItemProps {
    track: Track;
    isCurrent: boolean;
    playTrack: (track: Track) => void;
    removeFromQueue: (id: number) => void;
    index: number;
}

const QueueItem = ({ track, isCurrent, playTrack, removeFromQueue, index }: QueueItemProps) => {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={track}
            dragListener={false}
            dragControls={controls}
            className={`group flex items-center gap-3 p-3 rounded-xl transition-all border ${isCurrent
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 shadow-sm"
                : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent"
                }`}
        >
            {/* Drag Handle */}
            <div
                onPointerDown={(e) => controls.start(e)}
                className="text-slate-300 dark:text-slate-600 shrink-0 cursor-grab active:cursor-grabbing hover:text-emerald-500 transition-colors touch-none"
                title="سحب للترتيب"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button
                    onClick={(e) => { e.stopPropagation(); removeFromQueue(index); }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="حذف"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </Reorder.Item>
    );
};

export default function PlayerQueue() {
    const { state, dispatch, removeFromQueue, playTrack, clearQueue } = usePlayer();
    const { queue, currentTrack } = state;

    // UI State
    const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    useEffect(() => {
        if (activeTab === 'history') {
            setHistory(getHistory());
        }
    }, [activeTab, currentTrack]); // Refresh when track changes too

    const handleClearHistory = () => {
        if (confirm("هل تريد مسح سجل الاستماع؟")) {
            clearHistoryStore();
            setHistory([]);
        }
    };

    // Need a way to play history item. Since HistoryEntry matches Track mostly...
    // But Track needs 'src' which might not be in HistoryEntry if we omitted it?
    // Let's check HistoryEntry interface in history-utils. It has trackId, title, reciterName. No src.
    // Wait, addToHistory calls should store enough info?
    // Actually, `addToHistory` takes Omit<HistoryEntry, 'timestamp'>.
    // We need to make sure we store 'src' in history if we want to play it instantly without refetching?
    // Current HistoryEntry def: trackId, title, reciterName, surahNumber, timestamp... NO SRC.
    // This is a problem. We can't play directly from history unless we have the SRC.
    // Solution: Update HistoryEntry to include src. OR fetch it.
    // Let's assume for now we might need to update history-utils to store src.
    // Let's check where addToHistory is called. AudioPlayer.tsx. It passes currentTrack.
    // We should modify HistoryEntry to include src.

    // For now, let's just render the UI and I will update HistoryEntry in next step.

    return (
        <div className="absolute bottom-full left-0 w-full md:w-[450px] md:left-4 mb-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[70vh] flex flex-col z-[100]">
            {/* Header / Tabs */}
            <div className="flex items-center border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <button
                    onClick={() => setActiveTab('queue')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'queue'
                        ? "text-emerald-600 border-b-2 border-emerald-500 bg-white dark:bg-slate-900"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                    قائمة التشغيل ({queue.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'history'
                        ? "text-emerald-600 border-b-2 border-emerald-500 bg-white dark:bg-slate-900"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                    سجل الاستماع
                </button>
            </div>

            {activeTab === 'queue' ? (
                <>
                    <div className="p-2 flex justify-between items-center text-xs text-slate-400 px-4">
                        <span>التالي في القائمة</span>
                        <button onClick={clearQueue} className="text-red-500 hover:text-red-700">مسح الكل</button>
                    </div>
                    <div className="overflow-y-auto p-3 custom-scrollbar flex-1">
                        {queue.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">القائمة فارغة</div>
                        ) : (
                            <Reorder.Group axis="y" values={queue} onReorder={(newQueue) => dispatch({ type: "SET_QUEUE", payload: newQueue })} className="space-y-2">
                                {queue.map((track, index) => (
                                    <QueueItem
                                        key={track.id || index}
                                        track={track}
                                        index={index}
                                        isCurrent={currentTrack?.id === track.id}
                                        playTrack={playTrack}
                                        removeFromQueue={removeFromQueue}
                                    />
                                ))}
                            </Reorder.Group>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <div className="p-2 flex justify-between items-center text-xs text-slate-400 px-4">
                        <span>تم تشغيله مؤخراً</span>
                        <button onClick={handleClearHistory} className="text-red-500 hover:text-red-700">مسح السجل</button>
                    </div>
                    <div className="overflow-y-auto p-3 custom-scrollbar flex-1 space-y-2">
                        {history.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">سجل الاستماع فارغ</div>
                        ) : (
                            history.map((item, idx) => (
                                <div key={idx} className="group flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex-1 cursor-pointer" onClick={() => {
                                        if (item.src) {
                                            playTrack({
                                                id: item.trackId,
                                                title: item.title,
                                                reciterName: item.reciterName,
                                                src: item.src,
                                                surahNumber: item.surahNumber
                                            });
                                        }
                                    }}>
                                        <div className="font-bold text-sm text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 transition-colors">{item.title}</div>
                                        <div className="text-[10px] text-slate-500">{item.reciterName} • {new Date(item.timestamp).toLocaleDateString('ar-EG')}</div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (item.src) {
                                                playTrack({
                                                    id: item.trackId,
                                                    title: item.title,
                                                    reciterName: item.reciterName,
                                                    src: item.src,
                                                    surahNumber: item.surahNumber
                                                });
                                            }
                                        }}
                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-full transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {/* Old Footer removed as it's merged into tabs/header logic */}
        </div>
    );
}
