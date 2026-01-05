
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserNav() {
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data } = await supabase
                    .from("user_roles")
                    .select("role")
                    .eq("user_id", user.id)
                    .single();
                setRole(data?.role || 'user');
            }
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (!session) setRole(null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    if (!user) {
        return (
            <Link
                href="/admin/login"
                className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-sm font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
                تسجيل الدخول
            </Link>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[100px]">
                    {user.email?.split('@')[0]}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                    {role === 'supporter' ? '💎 داعم' : role === 'admin' ? '⚙️ مسؤول' : 'مستكشف'}
                </span>
            </div>

            <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                title="تسجيل خروج"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </button>
        </div>
    );
}
