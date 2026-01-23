import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

import SectionDeleteButton from "@/components/admin/SectionDeleteButton";

export default async function SectionsList() {
    const supabase = await createClient();

    const { data: sections, error } = await supabase
        .from("sections")
        .select("*")
        .order("display_order");

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                حدث خطأ أثناء جلب البيانات: {error.message}
            </div>
        );
    }

    // Prepare simplified sections list for dropdowns
    const sectionsList = sections?.map(s => ({ id: s.id, name_ar: s.name_ar })) || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    إدارة الأقسام
                </h1>
                <Link
                    href="/admin/sections/new"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    إضافة قسم
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">الترتيب</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">الاسم العربي</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Slug</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">الوصف</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {sections?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                        لا توجد أقسام حتى الآن
                                    </td>
                                </tr>
                            ) : (
                                sections?.map((section) => (
                                    <tr key={section.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono">
                                            {section.display_order}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                            {section.name_ar}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-sm">
                                            {section.slug}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm max-w-xs truncate">
                                            {section.description_ar || "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={`/admin/sections/${section.id}`}
                                                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium text-sm"
                                                >
                                                    تعديل
                                                </Link>
                                                <SectionDeleteButton
                                                    id={section.id}
                                                    name={section.name_ar}
                                                    allSections={sectionsList}
                                                />
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
