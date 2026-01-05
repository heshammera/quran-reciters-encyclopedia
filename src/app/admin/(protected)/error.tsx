"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h2 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">
                حدث خطأ ما!
            </h2>
            <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                {error.message}
            </p>
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
                محاولة مرة أخرى
            </button>
        </div>
    );
}
