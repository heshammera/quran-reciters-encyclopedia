"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { getSectionUsageCount, deleteSection } from "@/app/actions/admin";

interface Section {
    id: string;
    name_ar: string;
}

interface SectionDeleteButtonProps {
    id: string;
    name: string;
    allSections: Section[];
}

export default function SectionDeleteButton({ id, name, allSections }: SectionDeleteButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [isChecking, setIsChecking] = useState(false);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [usageCount, setUsageCount] = useState(0);
    const [targetSectionId, setTargetSectionId] = useState<string>("");

    const handleInitialClick = async () => {
        setIsChecking(true);
        try {
            const count = await getSectionUsageCount(id);
            if (count > 0) {
                setUsageCount(count);
                setShowModal(true);
            } else {
                if (confirm(`هل أنت متأكد من حذف قسم "${name}"؟`)) {
                    performDelete();
                }
            }
        } catch (e: any) {
            alert(e.message);
        } finally {
            setIsChecking(false);
        }
    };

    const performDelete = (migrateTo?: string) => {
        startTransition(async () => {
            try {
                await deleteSection(id, migrateTo);
                setShowModal(false);
            } catch (e: any) {
                alert(`فشل الحذف: ${e.message}`);
            }
        });
    };

    const handleMigrateAndDelete = () => {
        if (!targetSectionId) {
            alert("يرجى اختيار قسم لنقل التسجيلات إليه");
            return;
        }
        performDelete(targetSectionId);
    };

    return (
        <>
            <button
                onClick={handleInitialClick}
                disabled={isPending || isChecking}
                className="text-red-500 hover:text-red-700 disabled:opacity-50"
                title="حذف القسم"
            >
                {isPending || isChecking ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                )}
            </button>

            {showModal && createPortal(
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                            تحذير: القسم يحتوي على تسجيلات
                        </h3>

                        <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 p-4 rounded-lg mb-6 text-sm">
                            هذا القسم يحتوي على <strong>{usageCount}</strong> تسجيلات. لا يمكنك حذفه دون نقل هذه التسجيلات أولاً.
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                نقل التسجيلات إلى:
                            </label>
                            <select
                                value={targetSectionId}
                                onChange={(e) => setTargetSectionId(e.target.value)}
                                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 text-sm"
                            >
                                <option value="">-- اختر قسماً --</option>
                                {allSections.filter(s => s.id !== id).map(s => (
                                    <option key={s.id} value={s.id}>{s.name_ar}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleMigrateAndDelete}
                                disabled={!targetSectionId || isPending}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold disabled:opacity-50 transition-colors"
                            >
                                {isPending ? "جاري الحذف..." : "نقل وحذف"}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
