"use client";

import { useLeanMode } from "@/context/LeanModeContext";
import { cn } from "@/lib/utils";

export default function LeanToggle() {
    const { isLean, toggleLean } = useLeanMode();

    return (
        <button
            onClick={toggleLean}
            className={cn(
                "fixed bottom-4 left-4 z-40 p-3 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 font-medium text-sm",
                isLean
                    ? "bg-slate-800 text-white border-2 border-emerald-500"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-500"
            )}
            title={isLean ? "إيقاف الوضع الهادئ" : "تفعيل الوضع الهادئ"}
        >
            {isLean ? (
                <>
                    <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                        <path d="M7 12l5 5 5-5" transform="rotate(-90 12 12)" />
                        {/* Custom leaf-like representation or simplified icon */}
                    </svg>
                    <span>الوضع الهادئ: مفعل</span>
                </>
            ) : (
                <>
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="hidden group-hover:inline">الوضع الهادئ</span>
                </>
            )}
        </button>
    );
}
