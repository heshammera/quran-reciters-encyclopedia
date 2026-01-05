"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface Phase {
    id: string;
    phase_name_ar: string;
    description_ar: string;
    approximate_start_year: number | null;
    approximate_end_year: number | null;
    display_order: number;
}

interface PhasesManagerProps {
    reciterId: string;
}

export default function PhasesManager({ reciterId }: PhasesManagerProps) {
    const [phases, setPhases] = useState<Phase[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Form State
    const [isEditing, setIsEditing] = useState<string | null>(null); // ID of phase being edited or 'new'
    const [formData, setFormData] = useState<Partial<Phase>>({
        phase_name_ar: "",
        description_ar: "",
        display_order: 0
    });

    useEffect(() => {
        fetchPhases();
    }, [reciterId]);

    async function fetchPhases() {
        setLoading(true);
        const { data, error } = await supabase
            .from("reciter_phases")
            .select("*")
            .eq("reciter_id", reciterId)
            .order("display_order", { ascending: true });

        if (data) setPhases(data);
        if (error) console.error(error);
        setLoading(false);
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const payload = {
                reciter_id: reciterId,
                phase_name_ar: formData.phase_name_ar,
                description_ar: formData.description_ar,
                approximate_start_year: formData.approximate_start_year || null,
                approximate_end_year: formData.approximate_end_year || null,
                display_order: formData.display_order || 0
            };

            if (isEditing === 'new') {
                const { error } = await supabase.from("reciter_phases").insert([payload]);
                if (error) throw error;
            } else if (isEditing) {
                const { error } = await supabase
                    .from("reciter_phases")
                    .update(payload)
                    .eq("id", isEditing);
                if (error) throw error;
            }

            await fetchPhases();
            setIsEditing(null);
            setFormData({ phase_name_ar: "", description_ar: "", display_order: 0 });

        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذه الفترة؟")) return;

        try {
            const { error } = await supabase.from("reciter_phases").delete().eq("id", id);
            if (error) throw error;
            fetchPhases();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const startEdit = (phase: Phase) => {
        setFormData(phase);
        setIsEditing(phase.id);
    };

    const startNew = () => {
        setFormData({
            phase_name_ar: "",
            description_ar: "",
            display_order: phases.length + 1,
            approximate_start_year: null,
            approximate_end_year: null
        });
        setIsEditing('new');
    };

    if (loading && phases.length === 0) return <div className="text-center py-4 text-slate-500">جاري تحميل الفترات...</div>;

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-200 dark:border-slate-700 mt-8">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">الفترات الصوتية (المراحل)</h3>
                {!isEditing && (
                    <button
                        onClick={startNew}
                        className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm font-bold"
                    >
                        + إضافة فترة
                    </button>
                )}
            </div>

            {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

            {/* Form */}
            {isEditing && (
                <form onSubmit={handleSave} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg mb-6 border border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold mb-4 text-slate-800 dark:text-white">
                        {isEditing === 'new' ? 'إضافة فترة جديدة' : 'تعديل الفترة'}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">اسم الفترة *</label>
                            <input
                                required
                                type="text"
                                value={formData.phase_name_ar}
                                onChange={e => setFormData({ ...formData, phase_name_ar: e.target.value })}
                                placeholder="مثال: فترة الإذاعة، فترة الخمسينات..."
                                className="w-full p-2 border rounded dark:bg-slate-800"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">من سنة (تقريبي)</label>
                            <input
                                type="number"
                                value={formData.approximate_start_year || ""}
                                onChange={e => setFormData({ ...formData, approximate_start_year: parseInt(e.target.value) || null })}
                                className="w-full p-2 border rounded dark:bg-slate-800"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">إلى سنة (تقريبي)</label>
                            <input
                                type="number"
                                value={formData.approximate_end_year || ""}
                                onChange={e => setFormData({ ...formData, approximate_end_year: parseInt(e.target.value) || null })}
                                className="w-full p-2 border rounded dark:bg-slate-800"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">وصف مختصر</label>
                            <textarea
                                value={formData.description_ar || ""}
                                onChange={e => setFormData({ ...formData, description_ar: e.target.value })}
                                rows={2}
                                className="w-full p-2 border rounded dark:bg-slate-800"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">الترتيب</label>
                            <input
                                type="number"
                                value={formData.display_order}
                                onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                className="w-full p-2 border rounded dark:bg-slate-800"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">حفظ</button>
                        <button type="button" onClick={() => setIsEditing(null)} className="px-4 py-2 bg-slate-200 text-slate-800 rounded hover:bg-slate-300">إلغاء</button>
                    </div>
                </form>
            )}

            {/* List */}
            {phases.length === 0 && !isEditing ? (
                <div className="text-center py-8 text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed border-slate-300">
                    لا توجد فترات مسجلة لهذا القارئ
                </div>
            ) : (
                <div className="space-y-3">
                    {phases.map(phase => (
                        <div key={phase.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700">
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">{phase.phase_name_ar}</h4>
                                <p className="text-sm text-slate-500">
                                    {phase.approximate_start_year && `من ${phase.approximate_start_year}`}
                                    {phase.approximate_end_year && ` إلى ${phase.approximate_end_year}`}
                                    {!phase.approximate_start_year && !phase.approximate_end_year && "توقيت غير محدد"}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => startEdit(phase)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                    title="تعديل"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => handleDelete(phase.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                    title="حذف"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
