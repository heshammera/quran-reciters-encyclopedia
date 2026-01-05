
"use client";

import { useState } from "react";

interface CitationExportProps {
    recording: {
        id: string;
        surah_number: number;
        ayah_start?: number;
        ayah_end?: number;
        city?: string;
        recording_date?: {
            year?: number;
        };
        reciter: {
            name_ar: string;
        };
        section?: {
            name_ar: string;
        };
        archival_id?: string;
    };
}

export default function CitationExport({ recording }: CitationExportProps) {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
    };

    const citationText = `المصدر: موسوعة قراء القرآن. تلاوة سورة ${recording.surah_number} بصوت الشيخ ${recording.reciter.name_ar}، ${recording.section?.name_ar || ""}، ${recording.city || ""} ${recording.recording_date?.year ? `(${recording.recording_date.year})` : ""}. معرف الأرشيف: ${recording.archival_id || recording.id}`;

    const downloadMetadata = () => {
        const data = JSON.stringify(recording, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `recording-${recording.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700/50">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                <span>📚</span>
                الاقتباس والتصدير (للباحثين)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Archivial ID */}
                <div className="space-y-2">
                    <label className="text-xs text-slate-500 block">Archival ID</label>
                    <div className="flex items-center gap-2">
                        <code className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded text-xs flex-1 truncate font-mono">
                            {recording.archival_id || recording.id}
                        </code>
                        <button
                            onClick={() => handleCopy(recording.archival_id || recording.id, "id")}
                            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
                            title="نسخ المعرف"
                        >
                            {copied === "id" ? "✅" : "📋"}
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-end gap-2">
                    <button
                        onClick={() => handleCopy(citationText, "cite")}
                        className="flex-1 py-1.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold hover:border-emerald-500 transition-colors flex items-center justify-center gap-2"
                    >
                        <span>{copied === "cite" ? "✅ تم النسخ" : "📝 نسخ الاقتباس"}</span>
                    </button>
                    <button
                        onClick={downloadMetadata}
                        className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded hover:border-emerald-500 transition-colors"
                        title="تنزيل Metadata (JSON)"
                    >
                        📥
                    </button>
                </div>
            </div>

            {/* Preview */}
            <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded border border-dashed border-slate-300 dark:border-slate-700 text-[10px] text-slate-500 leading-relaxed">
                {citationText}
            </div>
        </div>
    );
}
