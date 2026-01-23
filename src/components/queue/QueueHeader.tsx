"use client";

import { usePlayer } from "@/hooks/usePlayer";
import { Trash2, Play, ChevronLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function QueueHeader() {
    const { state, clearQueue, playTrack } = usePlayer();
    const { queue } = state;

    // Play All Handler (starts from first)
    const handlePlayAll = () => {
        if (queue.length > 0) {
            playTrack(queue[0]);
        }
    };

    const handleClear = () => {
        if (confirm("هل أنت متأكد من مسح القائمة؟")) {
            clearQueue();
            toast.success("تم مسح القائمة");
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Link
                                href="/"
                                className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
                            </Link>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                قائمة التشغيل
                            </h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mr-7">
                            {queue.length} تسجيل • {queue.length > 0 ? 'جاهز للتشغيل' : 'القائمة فارغة'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleClear}
                            disabled={queue.length === 0}
                            className="px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 
                                     text-slate-600 dark:text-slate-300 font-medium hover:border-red-200 
                                     hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10 
                                     dark:hover:text-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                     flex items-center gap-2"
                        >
                            <Trash2 className="w-5 h-5" />
                            <span className="hidden sm:inline">مسح القائمة</span>
                        </button>

                        <button
                            onClick={handlePlayAll}
                            disabled={queue.length === 0}
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-medium 
                                     hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-lg 
                                     shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed
                                     flex items-center gap-2"
                        >
                            <Play className="w-5 h-5 fill-current" />
                            <span>تشغيل الكل</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
