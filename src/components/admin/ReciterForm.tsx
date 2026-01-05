"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ReciterFormProps {
    initialData?: any;
    onSuccess?: () => void;
}

import { uploadFile } from "@/app/actions/storage";

export default function ReciterForm({ initialData }: ReciterFormProps) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name_ar: initialData?.name_ar || "",
        biography_ar: initialData?.biography_ar || "",
        birth_date: initialData?.birth_date || "",
        death_date: initialData?.death_date || "",
        image_url: initialData?.image_url || "",
    });

    const router = useRouter();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", file);
            const publicUrl = await uploadFile(formData, "reciters-images", "avatars");
            setFormData(prev => ({ ...prev, image_url: publicUrl }));
        } catch (err: any) {
            setError("فشل رفع الصورة: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        // ... (existing submit logic)
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            let newlyCreatedId = null;

            // Clean up empty dates to null
            const cleanedData = {
                ...formData,
                birth_date: formData.birth_date || null,
                death_date: formData.death_date || null,
                biography_ar: formData.biography_ar || null,
            };

            if (initialData?.id) {
                // Update
                const { error } = await supabase
                    .from("reciters")
                    .update(cleanedData)
                    .eq("id", initialData.id);

                if (error) throw error;
            } else {
                // Create
                const { data, error } = await supabase
                    .from("reciters")
                    .insert([cleanedData])
                    .select()
                    .single();

                if (error) throw error;
                newlyCreatedId = data.id;
            }

            setSuccess(true);

            if (!initialData && newlyCreatedId) {
                router.push(`/admin/reciters/${newlyCreatedId}`);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-200 dark:border-slate-700">
            {/* ... error/success alerts ... */}
            {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
            {success && <div className="p-4 bg-green-50 text-green-600 rounded-lg text-sm">تم الحفظ بنجاح!</div>}

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الاسم (بالعربية) *</label>
                <input
                    type="text"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white"
                />
            </div>

            <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">الصورة</label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">رفع من الجهاز</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                        />
                        {uploading && <p className="text-xs text-blue-500 mt-2 animate-pulse">جاري الرفع...</p>}
                    </div>

                    <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">رابط خارجي (URL)</label>
                        <input
                            type="url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="https://..."
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                </div>

                {formData.image_url && (
                    <div className="flex items-center gap-4 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                        <img src={formData.image_url} alt="Preview" className="w-16 h-16 object-cover rounded shadow" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-500">تم اختيار الصورة:</p>
                            <p className="text-xs text-slate-400 truncate font-mono">{formData.image_url}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        تاريخ الميلاد
                    </label>
                    <input
                        type="date"
                        value={formData.birth_date}
                        onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        تاريخ الوفاة <span className="text-xs text-slate-400">(اختياري - اتركه فارغًا إذا كان على قيد الحياة)</span>
                    </label>
                    <input
                        type="date"
                        value={formData.death_date}
                        onChange={(e) => setFormData({ ...formData, death_date: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    السيرة الذاتية
                </label>
                <textarea
                    value={formData.biography_ar}
                    onChange={(e) => setFormData({ ...formData, biography_ar: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white"
                />
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                    {loading ? "جاري الحفظ..." : "حفظ القارئ"}
                </button>
            </div>
        </form>
    );
}
