"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

export default function OfflineGuard() {
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        // Simple event listeners without causing re-renders
        const handleOnline = () => {
            showToast("تم استعادة الاتصال بالإنترنت - جاري الانتقال للتحميلات...", "success");
            // Client-side navigation preserves state (and audio player)
            router.push('/downloads');
        };

        const handleOffline = () => {
            showToast("انقطع الاتصال بالإنترنت", "warning");
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []); // Run only once on mount

    return null;
}
