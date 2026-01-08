import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";
import { getCurrentAdminUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export default async function RecitersList() {
    const supabase = await createClient();
    const user = await getCurrentAdminUser();

    // Permission Checks
    const canCreate = hasPermission(user, 'reciters', 'create');
    const canEdit = hasPermission(user, 'reciters', 'edit');
    const canDelete = hasPermission(user, 'reciters', 'delete');

    const { data: reciters, error } = await supabase
        .from("reciters")
        .select("*")
        .order("name_ar");

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                حدث خطأ أثناء جلب البيانات: {error.message}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white self-start sm:self-auto">
                    إدارة القرّاء
                </h1>
                {canCreate && (
                    <Link
                        href="/admin/reciters/new"
                        className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        إضافة قارئ
                    </Link>
                )}
            </div>

            {/* Mobile Cards (Visible on mobile only) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                {reciters?.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 col-span-full">
                        لا يوجد قرّاء حتى الآن
                    </div>
                ) : (
                    reciters?.map((reciter) => (
                        <div key={reciter.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-4 mb-4">
                                {reciter.image_url ? (
                                    <img
                                        src={reciter.image_url}
                                        alt={reciter.name_ar}
                                        className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-600"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">
                                        {reciter.name_ar}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {reciter.birth_date ? `مواليد ${new Date(reciter.birth_date).getFullYear()}` : "تاريخ الميلاد غير محدد"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                                <Link
                                    href={`/reciters/${reciter.id}`}
                                    target="_blank"
                                    className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    عرض
                                </Link>
                                {canEdit && (
                                    <Link
                                        href={`/admin/reciters/${reciter.id}`}
                                        className="px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                                    >
                                        تعديل
                                    </Link>
                                )}
                                {canDelete && <DeleteButton id={reciter.id} resource="reciter" />}
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
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">الاسم</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">الصورة</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">تاريخ الميلاد</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {reciters?.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                        لا يوجد قرّاء حتى الآن
                                    </td>
                                </tr>
                            ) : (
                                reciters?.map((reciter) => (
                                    <tr key={reciter.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                            {reciter.name_ar}
                                        </td>
                                        <td className="px-6 py-4">
                                            {reciter.image_url ? (
                                                <img
                                                    src={reciter.image_url}
                                                    alt={reciter.name_ar}
                                                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                            {reciter.birth_date ? new Date(reciter.birth_date).getFullYear() : "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {canEdit && (
                                                    <Link
                                                        href={`/admin/reciters/${reciter.id}`}
                                                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium text-sm"
                                                    >
                                                        تعديل
                                                    </Link>
                                                )}
                                                <Link
                                                    href={`/reciters/${reciter.id}`}
                                                    target="_blank"
                                                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm"
                                                >
                                                    عرض
                                                </Link>
                                                {canDelete && <DeleteButton id={reciter.id} resource="reciter" />}
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
