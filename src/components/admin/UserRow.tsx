
"use client";

import { useState } from "react";
import { updateUserRole, deleteUser } from "@/app/actions/users";

export default function UserRow({ user }: { user: any }) {
    const [loading, setLoading] = useState(false);
    const [currentRole, setCurrentRole] = useState(user.role || "user");

    const handleChange = async (newRole: string) => {
        if (!confirm(`هل أنت متأكد من تغيير صلاحية هذا المستخدم إلى ${newRole}؟`)) return;

        setLoading(true);
        try {
            await updateUserRole(user.id, newRole);
            setCurrentRole(newRole);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletion = async () => {
        if (!confirm(`⚠️ هل أنت متأكد تماماً من حذف المستخدم ${user.email}؟ لا يمكن التراجع عن هذا الإجراء.`)) return;

        setLoading(true);
        try {
            await deleteUser(user.id);
        } catch (e: any) {
            alert(e.message);
            setLoading(false);
        }
    };

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <td className="p-4 font-bold text-slate-900 dark:text-white font-mono">
                {user.email}
            </td>
            <td className="p-4 text-slate-500">
                {new Date(user.created_at).toLocaleDateString('ar-EG')}
            </td>
            <td className="p-4 text-slate-500">
                {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('ar-EG') : 'لم يدخل بعد'}
            </td>
            <td className="p-4">
                <span className={`px-2 py-1 rounded text-xs font-bold ${currentRole === 'admin' ? 'bg-purple-100 text-purple-700' :
                    currentRole === 'editor' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                    }`}>
                    {currentRole === 'admin' ? 'مسؤول' : currentRole === 'editor' ? 'محرر' : 'مستخدم'}
                </span>
            </td>
            <td className="p-4">
                <select
                    disabled={loading}
                    value={currentRole}
                    onChange={(e) => handleChange(e.target.value)}
                    className="p-1 border rounded text-xs bg-white dark:bg-slate-800 dark:border-slate-600 disabled:opacity-50"
                >
                    <option value="user">مستخدم (User)</option>
                    <option value="editor">محرر (Editor)</option>
                    <option value="admin">مسؤول (Admin)</option>
                </select>
                {loading && <span className="mr-2 text-xs text-slate-400">...</span>}
            </td>
            <td className="p-4">
                <button
                    disabled={loading}
                    onClick={handleDeletion}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="حذف المستخدم"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </td>
        </tr>
    );
}
