
"use client";

import { useState, useEffect } from "react";
import { createUser } from "@/app/actions/users";
import { PermissionSchema, DEFAULT_PERMISSIONS, ADMIN_PERMISSIONS } from "@/types/admin";
import PermissionMatrix from "./PermissionMatrix";

export default function AddUserButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ email: string, password: string } | null>(null);

    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [roleType, setRoleType] = useState<"admin" | "editor" | "custom">("custom");
    const [permissions, setPermissions] = useState<PermissionSchema>(DEFAULT_PERMISSIONS);

    // Handle Preset Selection
    useEffect(() => {
        if (roleType === "admin") {
            setPermissions(ADMIN_PERMISSIONS);
        } else if (roleType === "editor") {
            // Editor preset: Can manage content but not users/system
            setPermissions({
                ...DEFAULT_PERMISSIONS,
                reciters: { view: true, create: true, edit: true, delete: false },
                recordings: { view: true, create: true, edit: true, delete: false },
                sections: { view: true, create: true, edit: true, delete: false },
                collections: { view: true, create: true, edit: true, delete: false },
                pages: { view: true, create: true, edit: true, delete: false },
                incomplete: { view: true },
            });
        } else if (roleType === "custom") {
            // Keep current or reset to empty? Let's keep current to allow tweaking from a preset
        }
    }, [roleType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Determine final role string for DB (admin keeps 'admin', others 'user' with specific perms)
            // Actually, we could map 'editor' to 'editor' if we want, but 'custom' is definitely 'user'
            const dbRole = roleType === 'admin' ? 'admin' : (roleType === 'editor' ? 'editor' : 'user');

            const res = await createUser({
                email,
                password: password || undefined,
                role: dbRole,
                permissions: roleType === 'admin' ? undefined : permissions // Admins don't need explicit perms if code checks role 'admin'
            });

            if (res.success) {
                setResult({ email, password: res.password });
                setEmail("");
                setPassword("");
                setRoleType("custom");
                setPermissions(DEFAULT_PERMISSIONS);
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
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm transition-all hover:shadow-md"
            >
                <div className="w-5 h-5 flex items-center justify-center bg-white/20 rounded-full text-xs">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                </div>
                إضافة عضو جديد
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto py-10">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row overflow-hidden my-auto mx-4">

                {/* Result Success View */}
                {result ? (
                    <div className="p-12 w-full flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mb-2">
                            ✓
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">تم إضافة العضو بنجاح</h3>

                        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 w-full max-w-md">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-slate-500 text-sm">البريد الإلكتروني</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">{result.email}</span>
                            </div>
                            <div className="flex justify-between items-center bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-100 dark:border-yellow-900/50">
                                <span className="text-yellow-700 dark:text-yellow-500 text-sm">كلمة المرور</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white select-all">{result.password}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-4">يرجى نسخ كلمة المرور وإرسالها للعضو، لن تظهر مرة أخرى.</p>
                        </div>

                        <button
                            onClick={() => { setIsOpen(false); setResult(null); }}
                            className="px-8 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors"
                        >
                            إغلاق النافذة
                        </button>
                    </div>
                ) : (
                    // Creation Form
                    <>
                        {/* Sidebar / Header Section */}
                        <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-900 p-6 md:p-8 border-b md:border-b-0 md:border-l border-slate-200 dark:border-slate-800">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">بيانات العضو</h2>
                            <p className="text-slate-500 text-sm mb-8">قم بتعبئة البيانات الأساسية وتحديد مستوى الصلاحيات بدقة.</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">البريد الإلكتروني</label>
                                    <input
                                        type="email" required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                        placeholder="name@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">كلمة المرور</label>
                                    <input
                                        type="text"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm"
                                        placeholder="اتركها فارغة للتوليد التلقائي"
                                    />
                                </div>

                                <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">نوع الصلاحية</label>
                                    <div className="space-y-3">
                                        <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${roleType === 'admin' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-300'}`}>
                                            <input type="radio" name="role" checked={roleType === 'admin'} onChange={() => setRoleType('admin')} className="w-4 h-4 text-emerald-600" />
                                            <div>
                                                <div className="font-bold text-slate-900 text-sm">مدير نظام (Admin)</div>
                                                <div className="text-xs text-slate-500">صلاحيات كاملة للوصول والتحكم في كل شيء</div>
                                            </div>
                                        </label>

                                        <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${roleType === 'editor' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-300'}`}>
                                            <input type="radio" name="role" checked={roleType === 'editor'} onChange={() => setRoleType('editor')} className="w-4 h-4 text-emerald-600" />
                                            <div>
                                                <div className="font-bold text-slate-900 text-sm">محرر محتوى (Editor)</div>
                                                <div className="text-xs text-slate-500">يمكنه إدارة القراء والتسجيلات فقط</div>
                                            </div>
                                        </label>

                                        <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${roleType === 'custom' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-300'}`}>
                                            <input type="radio" name="role" checked={roleType === 'custom'} onChange={() => setRoleType('custom')} className="w-4 h-4 text-emerald-600" />
                                            <div>
                                                <div className="font-bold text-slate-900 text-sm">مخصص (Custom)</div>
                                                <div className="text-xs text-slate-500">تحديد صلاحيات دقيقة لكل قسم</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content / Permissions Matrix */}
                        <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                                    <span>جدول الصلاحيات</span>
                                    {roleType !== 'custom' && (
                                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">
                                            {roleType === 'admin' ? 'يتم تطبيق صلاحيات المدير' : 'صلاحيات المحرر الافتراضية'}
                                        </span>
                                    )}
                                </h3>

                                <div className={roleType === 'admin' ? 'opacity-50 pointer-events-none grayscale' : ''}>
                                    <PermissionMatrix
                                        permissions={permissions}
                                        onChange={(p) => {
                                            setPermissions(p);
                                            if (roleType !== 'custom') setRoleType('custom');
                                        }}
                                        disabled={roleType === 'admin'}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !email}
                                    className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:shadow-none transition-all flex-1"
                                >
                                    {loading ? "جاري الحفظ..." : "حفظ العضو الجديد"}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
