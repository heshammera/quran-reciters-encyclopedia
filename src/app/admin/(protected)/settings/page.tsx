"use client";

import { useState } from "react";
import { seedQuranIndex } from "@/app/actions/seed-index";
import Link from "next/link";

export default function AdminSettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSeed = async () => {
        if (!confirm("Are you sure you want to re-seed the Quran Index? This might take a few moments.")) return;

        setIsLoading(true);
        setMessage("Starting seeding process...");
        setStatus('idle');

        try {
            const result = await seedQuranIndex();

            if (result.success) {
                setStatus('success');
                setMessage(result.message || "Done!");
            } else {
                setStatus('error');
                setMessage(result.message || "Failed.");
            }
        } catch (e: any) {
            setStatus('error');
            setMessage(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">إعدادات النظام</h1>

            <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">فهرس القرآن الكريم</h2>
                <p className="text-slate-600 mb-6">
                    يستخدم هذا الفهرس للبحث في الآيات. إذا كان البحث لا يعمل، قم بإعادة بناء الفهرس.
                </p>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSeed}
                        disabled={isLoading}
                        className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>جاري التحديث...</span>
                            </>
                        ) : (
                            <span>تحديث الفهرس (Seed Index)</span>
                        )}
                    </button>

                    {message && (
                        <div className={`px-4 py-2 rounded text-sm ${status === 'success' ? 'bg-emerald-50 text-emerald-700' :
                                status === 'error' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <Link href="/admin" className="text-slate-500 hover:text-slate-800">
                    ← العودة للوحة التحكم
                </Link>
            </div>
        </div>
    );
}
