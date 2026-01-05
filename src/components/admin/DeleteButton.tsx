"use client";

import { useState, useTransition } from "react";
import { deleteReciter, deleteRecording } from "@/app/actions/admin";

interface DeleteButtonProps {
    id: string;
    resource: "reciter" | "recording";
    className?: string;
}

export default function DeleteButton({ id, resource, className }: DeleteButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!confirm("هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.")) {
            return;
        }

        startTransition(async () => {
            try {
                if (resource === "reciter") {
                    await deleteReciter(id);
                } else if (resource === "recording") {
                    await deleteRecording(id);
                }
            } catch (e: any) {
                setError(e.message);
                alert(`فشل الحذف: ${e.message}`);
            }
        });
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className={`text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            title="حذف"
        >
            {isPending ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            ) : (
                <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                </svg>
            )}
        </button>
    );
}
