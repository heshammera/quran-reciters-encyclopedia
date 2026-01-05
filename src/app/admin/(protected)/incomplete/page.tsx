
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function IncompleteRecordingsPage() {
    const supabase = await createClient();

    // Fetch incomplete recordings (metadata_complete = false)
    // Note: We can filter by the stored column metadata_complete if Supabase exposes it to PostgREST, 
    // but sometimes computed columns need explicit setup. 
    // For now, we'll fetch where published is false and some fields are null or empty as a proxy, 
    // OR try to filter by the generated column directly.

    const { data: recordings, error } = await supabase
        .from("recordings")
        .select(`
            *,
            reciters (name_ar),
            sections (name_ar)
        `)
        .eq("metadata_complete", false)
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>📋</span>
                مراجعة الملفات غير المكتملة
                <span className="text-sm font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                    {recordings?.length || 0}
                </span>
            </h1>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow overflow-hidden border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm text-right">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-medium">
                        <tr>
                            <th className="p-4">القارئ</th>
                            <th className="p-4">السورة</th>
                            <th className="p-4">البيانات الناقصة</th>
                            <th className="p-4">تاريخ الإضافة</th>
                            <th className="p-4">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {recordings?.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">
                                    جميع الملفات مكتملة البيانات. أحسنت!
                                </td>
                            </tr>
                        ) : (
                            recordings?.map((rec: any) => {
                                const missing = [];
                                if (!rec.archival_id) missing.push("Archival ID");
                                if (!rec.city) missing.push("المدينة");
                                if (!rec.duration_seconds) missing.push("المدة");
                                if (!rec.source_description) missing.push("المصدر");

                                return (
                                    <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="p-4 font-bold text-slate-900 dark:text-white">
                                            {rec.reciters?.name_ar}
                                        </td>
                                        <td className="p-4">
                                            سورة {rec.surah_number} <br />
                                            <span className="text-xs text-slate-500">{rec.sections?.name_ar}</span>
                                        </td>
                                        <td className="p-4">
                                            {missing.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {missing.map((m) => (
                                                        <span key={m} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                                                            {m}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-green-600 text-xs">مكتمل ظاهرياً</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-500">
                                            {new Date(rec.created_at).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="p-4">
                                            <Link
                                                href={`/admin/recordings/${rec.id}`}
                                                className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
                                            >
                                                استكمال البيانات
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
