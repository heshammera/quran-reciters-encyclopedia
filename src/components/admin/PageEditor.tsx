
"use client";

import { updateStaticPage, StaticPage } from "@/app/actions/pages";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PageEditor({ page }: { page: StaticPage }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title_ar: page.title_ar,
        slug: page.slug,
        content_markdown: page.content_markdown || "",
        is_published: page.is_published
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateStaticPage(page.id, formData);
            router.refresh(); // Refresh server data
            alert("تم الحفظ بنجاح");
        } catch (error: any) {
            alert("حدث خطأ: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    تعديل صفحة: {page.title_ar}
                </h1>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400"
                    >
                        إلغاء
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        حفظ التغييرات
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <label className="block font-bold mb-2">محتوى الصفحة (Markdown)</label>
                        <textarea
                            value={formData.content_markdown}
                            onChange={(e) => setFormData({ ...formData, content_markdown: e.target.value })}
                            className="w-full h-[500px] p-4 font-mono text-sm bg-slate-50 dark:bg-slate-900 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
                            dir="ltr"
                            placeholder="# عنوان...\n\nنص..."
                        />
                        <p className="mt-2 text-xs text-slate-500">
                            يدعم تنسيق Markdown: استخدم # للعناوين، *للقوائم*، و [رابط](url) للروابط.
                        </p>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
                        <h3 className="font-bold border-b pb-2 dark:border-slate-700">إعدادات الصفحة</h3>

                        <div>
                            <label className="block text-sm font-medium mb-1">عنوان الصفحة</label>
                            <input
                                type="text"
                                value={formData.title_ar}
                                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                                className="w-full p-2 border rounded dark:bg-slate-700"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">الرابط (Slug)</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full p-2 border rounded dark:bg-slate-700 font-mono text-sm dir-ltr"
                            />
                        </div>

                        <div className="pt-4 border-t dark:border-slate-700">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_published}
                                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                    className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="font-medium">نشر الصفحة</span>
                            </label>
                            <p className="text-xs text-slate-500 mt-1 mr-7">
                                عند التفعيل، ستكون الصفحة متاحة للجمهور.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
