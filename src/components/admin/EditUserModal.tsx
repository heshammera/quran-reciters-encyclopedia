"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { updateUser } from "@/app/actions/users";
import { AdminUser, PermissionSchema, DEFAULT_PERMISSIONS, ADMIN_PERMISSIONS } from "@/types/admin";
import PermissionMatrix from "./PermissionMatrix";

interface EditUserModalProps {
    user: AdminUser;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditUserModal({ user, isOpen, onClose }: EditUserModalProps) {
    const [loading, setLoading] = useState(false);

    // Form State
    const [email, setEmail] = useState(user.email || "");
    const [password, setPassword] = useState("");
    const [roleType, setRoleType] = useState<"admin" | "editor" | "custom">("custom");
    const [permissions, setPermissions] = useState<PermissionSchema>(DEFAULT_PERMISSIONS);

    // Initialize state from props
    useEffect(() => {
        if (isOpen && user) {
            setEmail(user.email || "");
            setPassword(""); // Always blank for security

            // Determine initial role type
            if (user.role === 'admin') {
                setRoleType('admin');
                setPermissions(ADMIN_PERMISSIONS);
            } else if (user.role === 'editor' && !user.permissions) {
                // If it's an editor without custom permissions object, load defaults
                setRoleType('editor');
                setPermissions({
                    ...DEFAULT_PERMISSIONS,
                    reciters: { view: true, create: true, edit: true, delete: false },
                    recordings: { view: true, create: true, edit: true, delete: false },
                    sections: { view: true, create: true, edit: true, delete: false },
                    collections: { view: true, create: true, edit: true, delete: false },
                    pages: { view: true, create: true, edit: true, delete: false },
                    incomplete: { view: true },
                });
            } else {
                setRoleType('custom');
                // Load existing permissions or defaults if none
                setPermissions(user.permissions || DEFAULT_PERMISSIONS);
            }
        }
    }, [isOpen, user]);

    // Handle Preset Selection Changes
    const handleRoleChange = (newRole: "admin" | "editor" | "custom") => {
        setRoleType(newRole);
        if (newRole === "admin") {
            setPermissions(ADMIN_PERMISSIONS);
        } else if (newRole === "editor") {
            setPermissions({
                ...DEFAULT_PERMISSIONS,
                reciters: { view: true, create: true, edit: true, delete: false },
                recordings: { view: true, create: true, edit: true, delete: false },
                sections: { view: true, create: true, edit: true, delete: false },
                collections: { view: true, create: true, edit: true, delete: false },
                pages: { view: true, create: true, edit: true, delete: false },
                incomplete: { view: true },
            });
        }
        // for custom, we leave current permissions as is to allow tweaking
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dbRole = roleType === 'admin' ? 'admin' : (roleType === 'editor' ? 'editor' : 'user');

            await updateUser(user.id, {
                email: email !== user.email ? email : undefined,
                password: password || undefined,
                role: dbRole,
                permissions: roleType === 'admin' ? undefined : permissions
            });

            alert("تم تحديث بيانات العضو بنجاح");
            onClose();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    // Portal check
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto py-10" style={{ margin: 0 }}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row overflow-hidden my-auto mx-4 relative">

                {/* Result Success View or Form */}
                <>
                    {/* Sidebar / Header Section */}
                    <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-900 p-6 md:p-8 border-b md:border-b-0 md:border-l border-slate-200 dark:border-slate-800">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">تعديل العضو</h2>
                        <p className="text-slate-500 text-sm mb-8">يمكنك تغيير البريد، كلمة المرور، والصلاحيات.</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">البريد الإلكتروني</label>
                                <input
                                    type="email" required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">كلمة المرور الجديدة</label>
                                <input
                                    type="text"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm"
                                    placeholder="اتركها فارغة للإبقاء على الحالية"
                                />
                            </div>

                            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">نوع الصلاحية</label>
                                <div className="space-y-3">
                                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${roleType === 'admin' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-300'}`}>
                                        <input type="radio" name="edit_role" checked={roleType === 'admin'} onChange={() => handleRoleChange('admin')} className="w-4 h-4 text-emerald-600" />
                                        <div>
                                            <div className="font-bold text-slate-900 text-sm">مدير نظام (Admin)</div>
                                        </div>
                                    </label>

                                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${roleType === 'editor' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-300'}`}>
                                        <input type="radio" name="edit_role" checked={roleType === 'editor'} onChange={() => handleRoleChange('editor')} className="w-4 h-4 text-emerald-600" />
                                        <div>
                                            <div className="font-bold text-slate-900 text-sm">محرر محتوى (Editor)</div>
                                        </div>
                                    </label>

                                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${roleType === 'custom' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-300'}`}>
                                        <input type="radio" name="edit_role" checked={roleType === 'custom'} onChange={() => handleRoleChange('custom')} className="w-4 h-4 text-emerald-600" />
                                        <div>
                                            <div className="font-bold text-slate-900 text-sm">مخصص (Custom)</div>
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
                                        {roleType === 'admin' ? 'صلاحيات المدير' : 'صلاحيات المحرر'}
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
                                onClick={onClose}
                                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:shadow-none transition-all flex-1"
                            >
                                {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
                            </button>
                        </div>
                    </div>
                </>
            </div>
        </div>,
        document.body
    );
}
