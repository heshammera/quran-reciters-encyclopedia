"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Play, Trash2, Download } from "lucide-react";
import { usePlayer } from "@/hooks/usePlayer";
import { Track } from "@/types/player";
import DownloadButton from "../offline/DownloadButton";

interface QueueItemProps {
    track: Track;
    index: number;
    isActive: boolean;
}

export default function QueueItem({ track, index, isActive }: QueueItemProps) {
    const { playTrack, removeFromQueue } = usePlayer();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: track.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-colors group select-none
                      ${isActive
                    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/30'
                    : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:border-emerald-500/50'}
                      ${isDragging ? 'shadow-lg opacity-50' : 'shadow-sm'}`}
        >
            {/* Drag Handle */}
            <button
                {...attributes}
                {...listeners}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing p-1 touch-none"
            >
                <GripVertical className="w-5 h-5" />
            </button>

            {/* Play Button / Status */}
            <button
                onClick={() => playTrack(track)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0
                          ${isActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-emerald-600 hover:text-white dark:bg-slate-700 dark:text-slate-300'}`}
            >
                {isActive ? (
                    <div className="flex gap-0.5 items-end h-4 pb-1">
                        <span className="w-1 bg-white animate-[music-bar_1s_ease-in-out_infinite]" style={{ height: '60%' }}></span>
                        <span className="w-1 bg-white animate-[music-bar_1.2s_ease-in-out_infinite]" style={{ height: '100%' }}></span>
                        <span className="w-1 bg-white animate-[music-bar_0.8s_ease-in-out_infinite]" style={{ height: '40%' }}></span>
                    </div>
                ) : (
                    <Play className="w-5 h-5 ml-1" fill="currentColor" />
                )}
            </button>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className={`font-bold truncate ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                    {track.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {track.reciterName}
                    {track.surahNumber && ` • سورة ${track.surahNumber}`}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                {/* Save Offline */}
                <DownloadButton
                    trackId={track.id}
                    title={track.title}
                    reciterName={track.reciterName}
                    audioUrl={track.src}
                    surahNumber={track.surahNumber}
                    className="p-2 sm:px-2 sm:py-2 w-auto h-auto text-slate-400 hover:text-emerald-600"
                    minimal
                />

                {/* Remove */}
                <button
                    onClick={() => removeFromQueue(index)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="حذف من القائمة"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
