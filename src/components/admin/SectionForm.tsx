"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface SectionFormProps {
    initialData?: any;
}

export default function SectionForm({ initialData }: SectionFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name_ar: initialData?.name_ar || "",
        slug: initialData?.slug || "",
        description_ar: initialData?.description_ar || "",
        display_order: initialData?.display_order || 0,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            if (initialData?.id) {
                // Update
                const { error } = await supabase
                    .from("sections")
                    .update(formData)
                    .eq("id", initialData.id);

                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from("sections")
                    .insert([formData]);

                if (error) throw error;
            }

            setSuccess(true);
            if (!initialData) {
                setFormData({
                    name_ar: "",
                    slug: "",
                    description_ar: "",
                    display_order: 0,
                });
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-200 dark:border-slate-700">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-50 text-green-600 rounded-lg text-sm border border-green-200">
                    تم الحفظ بنجاح!
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    اسم القسم (بالعربية) *
                </label>
                <input
                    type="text"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Slug (English) *
                    </label>
                    <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        required
                        dir="ltr"
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white"
                        placeholder="e.g. murattal"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        الترتيب (Order)
                    </label>
                    <input
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    الوصف
                </label>
                <textarea
                    value={formData.description_ar}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white"
                />
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                    {loading ? "جاري الحفظ..." : "حفظ القسم"}
                </button>
            </div>
        </form>
    );
}
