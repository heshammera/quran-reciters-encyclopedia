"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRecordingsFilters } from '@/hooks/useRecordingsFilters';
import RecordingsSearch from '@/components/admin/RecordingsSearch';
import RecordingsSidebar from '@/components/admin/RecordingsSidebar';
import DeleteButton from '@/components/admin/DeleteButton';
import { SURAHS } from '@/lib/quran/metadata';
import { Menu, X } from 'lucide-react';

interface RecordingWithDetails {
    id: string;
    title: string | null;
    surah_number: number | null;
    city: string | null;
    is_published: boolean;
    created_at: string;
    play_count: number | null;
    type: string;
    reciters: { name_ar: string } | null;
    sections: { name_ar: string } | null;
    recording_coverage: any[] | null;
}

interface RecordingsClientProps {
    recordings: RecordingWithDetails[];
    reciters: Array<{ id: string; name_ar: string }>;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
}

export default function RecordingsClient({
    recordings,
    reciters,
    canCreate,
    canEdit,
    canDelete
}: RecordingsClientProps) {
    const { filters, updateFilter, resetFilters, hasActiveFilters } = useRecordingsFilters();
    const [showSidebar, setShowSidebar] = useState(false);

    // Apply filters and sorting
    const filteredRecordings = useMemo(() => {
        let result = [...recordings];

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(rec => {
                const title = rec.title?.toLowerCase() || '';
                const reciterName = rec.reciters?.name_ar?.toLowerCase() || '';
                const surahName = rec.surah_number ?
                    SURAHS.find(s => s.number === rec.surah_number)?.name.toLowerCase() : '';
                return title.includes(searchLower) ||
                    reciterName.includes(searchLower) ||
                    surahName?.includes(searchLower);
            });
        }

        // Reciter filter
        if (filters.reciterId) {
            result = result.filter(rec => {
                if (!rec.reciters) return false;
                const reciterData = rec.reciters as any;
                return reciterData.id === filters.reciterId;
            });
        }

        // Surah filter
        if (filters.surahNumber) {
            result = result.filter(rec => rec.surah_number === filters.surahNumber);
        }

        // Type filter
        if (filters.type !== 'all') {
            const isVideo = filters.type === 'video';
            result = result.filter(rec =>
                (rec.type === 'video') === isVideo
            );
        }

        // Status filter
        if (filters.status !== 'all') {
            const published = filters.status === 'published';
            result = result.filter(rec => rec.is_published === published);
        }

        // Date range filter
        if (filters.dateRange !== 'all') {
            const now = new Date();
            const cutoff = new Date();

            if (filters.dateRange === 'week') {
                cutoff.setDate(now.getDate() - 7);
            } else if (filters.dateRange === 'month') {
                cutoff.setMonth(now.getMonth() - 1);
            } else if (filters.dateRange === 'year') {
                cutoff.setFullYear(now.getFullYear() - 1);
            }

            result = result.filter(rec =>
                new Date(rec.created_at) >= cutoff
            );
        }

        // Sorting
        switch (filters.sortBy) {
            case 'newest':
                result.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                break;
            case 'oldest':
                result.sort((a, b) =>
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
                break;
            case 'alphabetical':
                result.sort((a, b) => {
                    const aTitle = a.title || '';
                    const bTitle = b.title || '';
                    return aTitle.localeCompare(bTitle, 'ar');
                });
                break;
            case 'popular':
                result.sort((a, b) =>
                    (b.play_count || 0) - (a.play_count || 0)
                );
                break;
        }

        return result;
    }, [recordings, filters]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        إدارة التسجيلات
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {filteredRecordings.length} من {recordings.length} تسجيل
                    </p>
                </div>
                {canCreate && (
                    <Link
                        href="/admin/recordings/new"
                        className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-lg 
                                 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        إضافة تسجيل
                    </Link>
                )}
            </div>

            {/* Search Bar - Full Width */}
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                <div className="flex-1">
                    <RecordingsSearch
                        value={filters.search}
                        onChange={(value) => updateFilter('search', value)}
                    />
                </div>
                <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="lg:hidden px-4 py-3 rounded-xl border-2 border-gray-200 
                             dark:border-gray-700 bg-white dark:bg-gray-800 
                             text-gray-900 dark:text-white font-medium
                             hover:border-emerald-500 transition-all flex items-center justify-center gap-2"
                >
                    {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    فلاتر
                </button>
            </div>

            {/* Main Content */}
            <div className="flex gap-6">
                {/* Sidebar - Desktop always visible, Mobile conditional */}
                <div className={`${showSidebar ? 'block' : 'hidden'} lg:block`}>
                    <RecordingsSidebar
                        filters={filters}
                        onFilterChange={updateFilter}
                        onReset={resetFilters}
                        reciters={reciters}
                    />
                </div>

                {/* Recordings List */}
                <div className="flex-1 space-y-4">
                    {filteredRecordings.length === 0 ? (
                        <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl 
                                      text-slate-500 dark:text-slate-400">
                            {hasActiveFilters ?
                                'لا توجد تسجيلات تطابق الفلاتر المحددة' :
                                'لا توجد تسجيلات'
                            }
                        </div>
                    ) : (
                        <>
                            {/* Mobile Cards */}
                            <div className="grid grid-cols-1 gap-4 md:hidden">
                                {filteredRecordings.map((rec) => (
                                    <MobileCard
                                        key={rec.id}
                                        recording={rec}
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
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">العنوان</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">القارئ</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">القسم</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">الحالة</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {filteredRecordings.map((rec) => (
                                            <TableRow
                                                key={rec.id}
                                                recording={rec}
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
            </div>
        </div>
    );
}

// Mobile Card Component
function MobileCard({
    recording,
    canEdit,
    canDelete
}: {
    recording: RecordingWithDetails;
    canEdit: boolean;
    canDelete: boolean;
}) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                        {recording.title || (recording.surah_number ?
                            `سورة ${SURAHS.find(s => s.number === recording.surah_number)?.name}` :
                            'تسجيل عام'
                        )}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {recording.reciters?.name_ar}
                    </p>
                </div>
                <div className="flex gap-2">
                    {recording.is_published ? (
                        <span className="inline-flex w-fit px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                            منشور
                        </span>
                    ) : (
                        <span className="inline-flex w-fit px-2 py-1 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                            محجوب
                        </span>
                    )}
                </div>
            </div>

            <div className="text-sm space-y-1 text-slate-600 dark:text-slate-400 mb-4">
                <div className="flex justify-between">
                    <span>القسم:</span>
                    <span>{recording.sections?.name_ar}</span>
                </div>
                <div className="flex justify-between">
                    <span>المدينة:</span>
                    <span>{recording.city || '-'}</span>
                </div>
            </div>

            <div className="flex gap-2">
                {canEdit && (
                    <Link
                        href={`/admin/recordings/${recording.id}`}
                        className="flex-1 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-center"
                    >
                        تعديل
                    </Link>
                )}
                {canDelete && (
                    <DeleteButton
                        id={recording.id}
                        resource="recording"
                    />
                )}
            </div>
        </div>
    );
}

// Table Row Component
function TableRow({
    recording,
    canEdit,
    canDelete
}: {
    recording: RecordingWithDetails;
    canEdit: boolean;
    canDelete: boolean;
}) {
    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <td className="px-6 py-4">
                <div className="font-medium text-slate-900 dark:text-white">
                    {recording.title || (recording.surah_number ?
                        `سورة ${SURAHS.find(s => s.number === recording.surah_number)?.name}` :
                        'تسجيل عام'
                    )}
                </div>
                {recording.city && (
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        {recording.city}
                    </div>
                )}
            </td>
            <td className="px-6 py-4 text-slate-900 dark:text-white">
                {recording.reciters?.name_ar}
            </td>
            <td className="px-6 py-4 text-slate-900 dark:text-white">
                {recording.sections?.name_ar}
            </td>
            <td className="px-6 py-4">
                {recording.is_published ? (
                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        منشور
                    </span>
                ) : (
                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                        محجوب
                    </span>
                )}
            </td>
            <td className="px-6 py-4">
                <div className="flex gap-2">
                    {canEdit && (
                        <Link
                            href={`/admin/recordings/${recording.id}`}
                            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        >
                            تعديل
                        </Link>
                    )}
                    {canDelete && (
                        <DeleteButton
                            id={recording.id}
                            resource="recording"
                        />
                    )}
                </div>
            </td>
        </tr>
    );
}
