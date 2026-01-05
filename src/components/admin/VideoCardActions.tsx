"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteRecording } from "@/app/actions/admin";

interface VideoCardActionsProps {
    videoId: string;
}

export default function VideoCardActions({ videoId }: VideoCardActionsProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("هل أنت متأكد من رغبتك في حذف هذا الفيديو نهائياً؟")) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteRecording(videoId);
        } catch (error) {
            console.error("Delete error:", error);
            alert("حدث خطأ أثناء الحذف. يرجى المحاولة مرة أخرى.");
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex gap-3">
            <Link
                href={`/admin/videos/edit/${videoId}`}
                className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors shadow-sm"
                title="تعديل"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="mr-1 text-sm font-bold hidden sm:inline">تعديل</span>
            </Link>

            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center justify-center p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors shadow-sm disabled:opacity-50"
                title="حذف"
            >
                {isDeleting ? (
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="mr-1 text-sm font-bold hidden sm:inline">حذف</span>
                    </>
                )}
            </button>
        </div>
    );
}
