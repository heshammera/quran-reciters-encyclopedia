"use client";

import { useEffect } from "react";
import { useToast } from "@/context/ToastContext";

export default function OfflineGuard() {
    const { showToast } = useToast();

    useEffect(() => {
        // Simple event listeners without causing re-renders
        const handleOnline = () => {
            showToast("تم استعادة الاتصال بالإنترنت", "success");
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
