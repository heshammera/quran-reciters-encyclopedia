
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getCollections } from "@/app/actions/collections";

export default async function CollectionsListPage() {
    // We can use the server action directly or query supabase directly for lists
    // Using server action for consistency
    let collections = [];
    let error = null;

    try {
        collections = await getCollections() || [];
    } catch (e: any) {
        error = e.message;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        المجموعات المختارة
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        إدارة قوائم التشغيل والألبومات الخاصة
                    </p>
                </div>
                <Link
                    href="/admin/collections/new"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    إضافة مجموعة
                </Link>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                    حدث خطأ: {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500">
                        لا توجد مجموعات حتى الآن. ابدأ بإنشاء واحدة!
                    </div>
                ) : (
                    collections.map((collection: any) => (
                        <div key={collection.id} className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
                            {collection.cover_image_url ? (
                                <img
                                    src={collection.cover_image_url}
                                    alt={collection.title_ar}
                                    className="w-full h-40 object-cover"
                                />
                            ) : (
                                <div className="w-full h-40 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 text-4xl">
                                    📁
                                </div>
                            )}

                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1">
                                        {collection.title_ar}
                                    </h3>
                                    {collection.is_published ? (
                                        <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full">منشور</span>
                                    ) : (
                                        <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">مسودة</span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                                    {collection.description_ar || "لا يوجد وصف"}
                                </p>

                                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <Link
                                        href={`/admin/collections/${collection.id}`}
                                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex-1 text-center py-2 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                    >
                                        تعديل
                                    </Link>
                                    <Link
                                        href={`/collections/${collection.slug}`}
                                        target="_blank"
                                        className="text-sm font-medium text-slate-600 hover:text-slate-700 flex-1 text-center py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                    >
                                        عرض
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
