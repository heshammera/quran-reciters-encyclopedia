import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Database } from "@/types/database";
import DeleteButton from "@/components/admin/DeleteButton";
import { SURAHS } from "@/lib/quran/metadata";
import { getCurrentAdminUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

type RecordingWithDetails = Database["public"]["Tables"]["recordings"]["Row"] & {
    reciters: { name_ar: string } | null;
    sections: { name_ar: string } | null;
};

export default async function RecordingsList({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const supabase = await createClient();
    const user = await getCurrentAdminUser();
    const params = await searchParams;
    const unpublishedOnly = params["unpublished"] === "true";

    // Permission Checks
    const canCreate = hasPermission(user, 'recordings', 'create');
    const canEdit = hasPermission(user, 'recordings', 'edit');
    const canDelete = hasPermission(user, 'recordings', 'delete');

    let query = supabase
        .from("recordings")
        .select(`
      *,
      reciters (name_ar),
      sections (name_ar),
      recording_coverage(*)
    `)
        .eq('type', 'audio') // Main filter for Audio Library
        .order("created_at", { ascending: false });

    if (unpublishedOnly) {
        query = query.eq("is_published", false);
    }

    const { data: recordings, error } = await query;

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                حدث خطأ أثناء جلب البيانات: {error.message}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        إدارة التسجيلات
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {recordings?.length} تسجيل
                        {unpublishedOnly && " (محجوب فقط)"}
                    </p>
                </div>
                {canCreate && (
                    <Link
                        href="/admin/recordings/new"
                        className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        إضافة تسجيل
                    </Link>
                )}
            </div>

            {/* Filters */}
            <div className="flex gap-4 overflow-x-auto pb-2 sm:pb-0">
                <Link
                    href="/admin/recordings"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${!unpublishedOnly
                        ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                >
                    الكل
                </Link>
                <Link
                    href="/admin/recordings?unpublished=true"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${unpublishedOnly
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                >
                    مراجعة المحجوب
                </Link>
            </div>

            {/* Mobile Cards (Visible on mobile only) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {recordings?.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400">
                        لا توجد تسجيلات تطابق البحث
                    </div>
                ) : (
                    recordings?.map((rec: any) => (
                        <div key={rec.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">
                                        {rec.title || (rec.surah_number ? `سورة ${SURAHS.find(s => s.number === rec.surah_number)?.name}` : 'تسجيل عام')}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {rec.reciters?.name_ar}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {rec.is_published ? (
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
                                    <span>{rec.sections?.name_ar}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>المدينة:</span>
                                    <span>{rec.city || '-'}</span>
                                </div>
                                {/* Multi-segment Coverage Display */}
                                {rec.recording_coverage && rec.recording_coverage.length > 0 ? (
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 mt-2">
                                        <div className="text-xs text-slate-500 mb-1">المقاطع:</div>
                                        <div className="flex flex-wrap gap-1">
                                            {rec.recording_coverage.map((seg: any, idx: number) => (
                                                <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                                    {SURAHS.find(s => s.number === seg.surah_number)?.name} ({seg.ayah_start}-{seg.ayah_end})
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : rec.ayah_start && (
                                    <div className="flex justify-between">
                                        <span>الآيات:</span>
                                        <span>{rec.ayah_start} - {rec.ayah_end}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                                {canEdit && (
                                    <Link
                                        href={`/admin/recordings/${rec.id}`}
                                        className="px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                                    >
                                        تعديل
                                    </Link>
                                )}
                                {canDelete && <DeleteButton id={rec.id} resource="recording" />}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table (Hidden on mobile) */}
            <div className="hidden md:block bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">القارئ</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">القسم / السورة</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">المعلومات</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">الحالة</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {recordings?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                        لا توجد تسجيلات تطابق البحث
                                    </td>
                                </tr>
                            ) : (
                                recordings?.map((rec: any) => (
                                    <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                            {rec.reciters?.name_ar}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                            <div className="font-medium text-slate-900 dark:text-white">
                                                {rec.title || (rec.surah_number ? `سورة ${SURAHS.find(s => s.number === rec.surah_number)?.name}` : 'تسجيل عام')}
                                            </div>
                                            {rec.recording_coverage && rec.recording_coverage.length > 0 ? (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {rec.recording_coverage.map((seg: any, idx: number) => (
                                                        <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                                            {SURAHS.find(s => s.number === seg.surah_number)?.name} ({seg.ayah_start}-{seg.ayah_end})
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-500">
                                                    ({rec.ayah_start} - {rec.ayah_end})
                                                </span>
                                            )}
                                            <div className="text-xs mt-1 text-emerald-600 dark:text-emerald-400">{rec.sections?.name_ar}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            <div>{rec.city}</div>
                                            <div className="text-xs text-slate-500">
                                                {typeof rec.recording_date === 'object' && rec.recording_date?.year}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {rec.is_published ? (
                                                    <span className="inline-flex w-fit px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                                        منشور
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex w-fit px-2 py-1 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                                                        محجوب
                                                    </span>
                                                )}
                                                {rec.is_featured && (
                                                    <span className="inline-flex w-fit px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                                        مميز
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {canEdit && (
                                                    <Link
                                                        href={`/admin/recordings/${rec.id}`}
                                                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium text-sm"
                                                    >
                                                        تعديل
                                                    </Link>
                                                )}
                                                {canDelete && <DeleteButton id={rec.id} resource="recording" />}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
