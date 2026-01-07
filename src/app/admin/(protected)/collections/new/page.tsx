
import CollectionForm from "@/components/admin/CollectionForm";
import Link from "next/link";

import { Suspense } from "react";

export default function NewCollectionPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/collections"
                    className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors"
                >
                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        إضافة مجموعة جديدة
                    </h1>
                </div>
            </div>

            <Suspense fallback={<div>جاري التحميل...</div>}>
                <CollectionForm />
            </Suspense>
        </div>
    );
}
