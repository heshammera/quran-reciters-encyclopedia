
"use client";

import { useState } from "react";
import { createUser } from "@/app/actions/users";

export default function AddUserButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ email: string, password: string } | null>(null);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        role: "user"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await createUser({
                email: formData.email,
                password: formData.password || undefined,
                role: formData.role
            });

            if (res.success) {
                setResult({ email: formData.email, password: res.password });
                setFormData({ email: "", password: "", role: "user" });
            }
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm flex items-center gap-2"
            >
                <span>+</span> إضافة مستخدم
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">

                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">إضافة مستخدم جديد</h3>

                {result ? (
                    <div className="bg-emerald-50 text-emerald-900 p-4 rounded-lg mb-4">
                        <p className="font-bold text-center mb-2">✅ تم الحساب بنجاح!</p>
                        <div className="text-sm bg-white p-3 rounded border border-emerald-100 font-mono text-center">
                            <div className="mb-1">Email: <strong>{result.email}</strong></div>
                            <div>Password: <strong className="bg-yellow-200 px-1">{result.password}</strong></div>
                        </div>
                        <p className="text-xs mt-3 text-center text-emerald-700">يرجى نسخ كلمة المرور الآن، لن تظهر مرة أخرى.</p>
                        <button
                            onClick={() => { setIsOpen(false); setResult(null); }}
                            className="w-full mt-4 py-2 bg-emerald-600 text-white rounded font-bold"
                        >
                            إغلاق
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
                            <input
                                type="email" required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full p-2 border rounded dark:bg-slate-700 dir-ltr text-left"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">كلمة المرور (اختياري)</label>
                            <input
                                type="text"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                placeholder="اتركها فارغة للتوليد التلقائي"
                                className="w-full p-2 border rounded dark:bg-slate-700 dir-ltr text-left font-mono text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">الصلاحية</label>
                            <select
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="w-full p-2 border rounded dark:bg-slate-700"
                            >
                                <option value="user">مستخدم (User)</option>
                                <option value="editor">محرر (Editor)</option>
                                <option value="admin">مسؤول (Admin)</option>
                            </select>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold disabled:opacity-50"
                            >
                                {loading ? "جاري الإضافة..." : "حفظ"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
