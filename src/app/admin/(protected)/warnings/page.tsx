
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function WarningsPage() {
    const supabase = await createClient();

    const { data: warnings, error } = await supabase
        .from("validation_warnings")
        .select(`
            *,
            recordings (
                id,
                surah_number,
                reciters (name_ar)
            )
        `)
        .is("acknowledged_at", null)
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>⚠️</span>
                مراجعة التحذيرات
                <span className="text-sm font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                    {warnings?.length || 0}
                </span>
            </h1>

            <div className="grid gap-4">
                {warnings?.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500">
                        لا توجد تحذيرات جديدة.
                    </div>
                ) : (
                    warnings?.map((warning: any) => (
                        <div key={warning.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border-l-4 border-l-amber-500 flex items-start justify-between">
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white mb-1">
                                    {warning.recordings?.reciters?.name_ar} - سورة {warning.recordings?.surah_number}
                                </div>
                                <p className="text-amber-700 dark:text-amber-400 font-medium">
                                    {warning.warning_message_ar}
                                </p>
                                <p className="text-xs text-slate-400 mt-2">
                                    {new Date(warning.created_at).toLocaleString('ar-EG')}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/admin/recordings/${warning.recording_id}`}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
                                >
                                    مراجعة التسجيل
                                </Link>
                                {/* We could add a "Dismiss" action here directly */}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
