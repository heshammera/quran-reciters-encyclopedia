
import { getStaticPages } from "@/app/actions/pages";
import Link from "next/link";

export default async function PagesIndex() {
    const pages = await getStaticPages();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📝</span>
                    الصفحات الثابتة
                </h1>
                {/* Optional: Add New Page Button - for now we focus on editing existing seeded ones */}
                {/* <Link href="/admin/pages/new" className="...">+ إضافة</Link> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.map((page) => (
                    <Link
                        key={page.id}
                        href={`/admin/pages/${page.id}`}
                        className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-all hover:border-emerald-500/50"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-xl group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors">
                                📄
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full font-bold ${page.is_published
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                                }`}>
                                {page.is_published ? "منشور" : "مسودة"}
                            </span>
                        </div>

                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 transition-colors">
                            {page.title_ar}
                        </h3>

                        <div className="text-sm text-slate-500 font-mono mb-4">
                            /{page.slug}
                        </div>

                        <div className="text-xs text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-700">
                            آخر تحديث: {new Date(page.updated_at).toLocaleDateString("ar-EG")}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
