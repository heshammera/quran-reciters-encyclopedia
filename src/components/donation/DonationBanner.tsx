
"use client";

import { useEffect, useState } from "react";
import { getUserPreferences } from "@/app/actions/user-preferences";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function DonationBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const checkVisibility = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Check role
                const { data: roleData } = await supabase
                    .from("user_roles")
                    .select("role")
                    .eq("user_id", user.id)
                    .single();

                const role = roleData?.role;
                if (role === 'supporter' || role === 'admin' || role === 'editor') {
                    setVisible(false);
                    return;
                }

                // Check preferences
                const prefs = await getUserPreferences();
                if (prefs && prefs.hide_donation_prompts) {
                    setVisible(false);
                    return;
                }
            }

            setVisible(true);
        };
        checkVisibility();
    }, []);

    if (!visible) return null;

    return (
        <div className="bg-emerald-600 text-white py-3 px-4 text-center relative">
            <div className="container mx-auto flex items-center justify-center gap-4 flex-wrap text-sm">
                <span className="hidden sm:inline">🌟 ساهم في الحفاظ على هذا الإرث القرآني نقياً وبدون إعلانات.</span>
                <span className="sm:hidden">🌟 ادعم استمرار الموسوعة</span>
                <Link
                    href="/donate"
                    className="bg-white text-emerald-700 px-4 py-1 rounded-full font-bold hover:bg-emerald-50 transition-colors"
                >
                    ادعمنا الآن
                </Link>
            </div>
            <button
                onClick={() => setVisible(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
            >
                ✕
            </button>
        </div>
    );
}
