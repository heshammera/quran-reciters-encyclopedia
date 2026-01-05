
"use client";

import { useState } from "react";
import { createCollection, updateCollection } from "@/app/actions/collections";
import { useRouter } from "next/navigation";

interface CollectionFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export default function CollectionForm({ initialData, isEdit = false }: CollectionFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);

        try {
            if (isEdit && initialData?.id) {
                await updateCollection(initialData.id, formData);
                // Optional: Show success toast
            } else {
                const res = await createCollection(formData);
                if (res?.id) {
                    // Redirect to edit page to add items
                    router.push(`/admin/collections/${res.id}`);
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-200 dark:border-slate-700 space-y-6">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}

            <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">عنوان المجموعة *</label>
                <input
                    required
                    name="title_ar"
                    type="text"
                    defaultValue={initialData?.title_ar}
                    className="w-full p-2 border rounded dark:bg-slate-900 dark:text-white dark:border-slate-600"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">الرابط المميز (Slug) *</label>
                <input
                    required
                    name="slug"
                    type="text"
                    defaultValue={initialData?.slug}
                    placeholder="example: ramadan-selections"
                    dir="ltr"
                    className="w-full p-2 border rounded dark:bg-slate-900 dark:text-white dark:border-slate-600"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">صورة الغلاف (URL)</label>
                <input
                    name="cover_image_url"
                    type="url"
                    defaultValue={initialData?.cover_image_url}
                    dir="ltr"
                    className="w-full p-2 border rounded dark:bg-slate-900 dark:text-white dark:border-slate-600"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">وصف المجموعة</label>
                <textarea
                    name="description_ar"
                    rows={4}
                    defaultValue={initialData?.description_ar}
                    className="w-full p-2 border rounded dark:bg-slate-900 dark:text-white dark:border-slate-600"
                />
            </div>

            <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        name="is_published"
                        value="true"
                        defaultChecked={initialData?.is_published}
                        className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="text-sm font-medium dark:text-white">نشر المجموعة</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        name="is_featured"
                        value="true"
                        defaultChecked={initialData?.is_featured}
                        className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="text-sm font-medium dark:text-white">تمييز في الرئيسية</span>
                </label>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 disabled:opacity-50"
            >
                {loading ? "جاري الحفظ..." : "حفظ البيانات"}
            </button>
        </form>
    );
}
