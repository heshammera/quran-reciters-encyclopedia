
"use client";

import { useState } from "react";
import { deleteUser } from "@/app/actions/users";
import EditUserModal from "./EditUserModal";

export default function UserRow({ user }: { user: any }) {
    const [loading, setLoading] = useState(false);
    const [currentRole, setCurrentRole] = useState(user.role || "user");

    const [showEditModal, setShowEditModal] = useState(false);

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
        <>
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
                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                        }`}>
                        {user.role === 'admin' ? 'مسؤول' : user.role === 'editor' ? 'محرر' : 'مستخدم'}
                    </span>
                    {user.permissions && user.role !== 'admin' && (
                        <span className="mr-2 px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                            مخصص
                        </span>
                    )}
                </td>
                <td className="p-4 flex gap-2">
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-sm font-bold transition-colors"
                    >
                        تعديل
                    </button>
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

            {showEditModal && (
                <EditUserModal
                    user={user}
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </>
    );
}
