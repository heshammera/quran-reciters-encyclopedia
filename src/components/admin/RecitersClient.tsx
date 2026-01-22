"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import DeleteButton from '@/components/admin/DeleteButton';
import { Search, X } from 'lucide-react';

interface Reciter {
    id: string;
    name_ar: string;
    name_en: string | null;
    is_published: boolean;
    recordings_count?: number;
}

interface RecitersClientProps {
    reciters: Reciter[];
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
}

export default function RecitersClient({
    reciters,
    canCreate,
    canEdit,
    canDelete
}: RecitersClientProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter reciters based on search
    const filteredReciters = useMemo(() => {
        if (!searchQuery.trim()) return reciters;

        const query = searchQuery.toLowerCase();
        return reciters.filter(reciter => {
            const nameAr = reciter.name_ar?.toLowerCase() || '';
            return nameAr.includes(query);
        });
    }, [reciters, searchQuery]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        إدارة القراء
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {filteredReciters.length} من {reciters.length} قارئ
                    </p>
                </div>
                {canCreate && (
                    <Link
                        href="/admin/reciters/new"
                        className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-lg 
                                 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        إضافة قارئ
                    </Link>
                )}
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن قارئ بالاسم..."
                    className="w-full pl-4 pr-14 py-4 rounded-xl border-2 border-gray-200 
                             focus:border-emerald-500 focus:ring-0 outline-none
                             dark:bg-gray-800 dark:border-gray-700 dark:text-white
                             transition-colors text-lg"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute left-4 top-1/2 -translate-y-1/2 
                                 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                                 transition-colors p-1 rounded-full hover:bg-gray-100 
                                 dark:hover:bg-gray-700"
                        aria-label="مسح البحث"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Results */}
            {filteredReciters.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-xl 
                              text-slate-500 dark:text-slate-400">
                    {searchQuery ?
                        `لا يوجد قراء تطابق البحث "${searchQuery}"` :
                        'لا يوجد قراء'
                    }
                </div>
            ) : (
                <>
                    {/* Mobile Cards */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {filteredReciters.map((reciter) => (
                            <ReciterMobileCard
                                key={reciter.id}
                                reciter={reciter}
                                canEdit={canEdit}
                                canDelete={canDelete}
                            />
                        ))}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto bg-white dark:bg-slate-800 rounded-xl shadow">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">الاسم</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">التسجيلات</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredReciters.map((reciter) => (
                                    <ReciterTableRow
                                        key={reciter.id}
                                        reciter={reciter}
                                        canEdit={canEdit}
                                        canDelete={canDelete}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

// Mobile Card Component
function ReciterMobileCard({
    reciter,
    canEdit,
    canDelete
}: {
    reciter: Reciter;
    canEdit: boolean;
    canDelete: boolean;
}) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow border border-slate-200 dark:border-slate-700">
            <div className="mb-3">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {reciter.name_ar}
                </h3>
            </div>

            {reciter.recordings_count !== undefined && (
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    📊 {reciter.recordings_count} تسجيل
                </div>
            )}

            <div className="flex gap-2">
                {canEdit && (
                    <Link
                        href={`/admin/reciters/${reciter.id}/edit`}
                        className="flex-1 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-center"
                    >
                        تعديل
                    </Link>
                )}
                {canDelete && (
                    <DeleteButton
                        id={reciter.id}
                        resource="reciter"
                    />
                )}
            </div>
        </div>
    );
}

// Table Row Component
function ReciterTableRow({
    reciter,
    canEdit,
    canDelete
}: {
    reciter: Reciter;
    canEdit: boolean;
    canDelete: boolean;
}) {
    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <td className="px-6 py-4">
                <div className="font-medium text-slate-900 dark:text-white text-lg">
                    {reciter.name_ar}
                </div>
            </td>
            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                {reciter.recordings_count !== undefined ?
                    `${reciter.recordings_count} تسجيل` :
                    '-'
                }
            </td>
            <td className="px-6 py-4">
                <div className="flex gap-2">
                    {canEdit && (
                        <Link
                            href={`/admin/reciters/${reciter.id}/edit`}
                            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        >
                            تعديل
                        </Link>
                    )}
                    {canDelete && (
                        <DeleteButton
                            id={reciter.id}
                            resource="reciter"
                        />
                    )}
                </div>
            </td>
        </tr>
    );
}
