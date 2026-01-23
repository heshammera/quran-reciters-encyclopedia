"use client";

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { usePlayer } from "@/hooks/usePlayer";
import QueueItem from "./QueueItem";
import { useMemo } from 'react';

export default function DraggableQueue() {
    const { state, reorderQueue } = usePlayer();
    const { queue, currentTrack } = state;

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Filter valid items (ensure they have an id)
    const validQueue = useMemo(() => queue.filter(item => item && item.id), [queue]);

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = validQueue.findIndex(item => item.id === active.id);
            const newIndex = validQueue.findIndex(item => item.id === over?.id);

            reorderQueue(oldIndex, newIndex);
        }
    }

    if (validQueue.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    قائمة التشغيل فارغة
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                    قم بإضافة التسجيلات إلى القائمة لتشغيلها والاستماع إليها بشكل متتابع
                </p>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={validQueue.map(item => item.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-3">
                    {validQueue.map((track, index) => (
                        <QueueItem
                            key={`${track.id}-${index}`}
                            track={track}
                            index={index}
                            isActive={currentTrack?.id === track.id}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
