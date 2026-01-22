"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/context/ToastContext";

export default function OfflineGuard() {
    const router = useRouter();
    const pathname = usePathname();
    const { showToast } = useToast();
    const [isOffline, setIsOffline] = useState(false);

    // Use refs to prevent infinite loops
    const hasRedirected = useRef(false);
    const lastOfflineState = useRef<boolean | null>(null);

    // Monitor online/offline status
    useEffect(() => {
        // Initial check
        const initialOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
        setIsOffline(!initialOnline);
        lastOfflineState.current = !initialOnline;

        const handleOnline = () => {
            setIsOffline(false);
            lastOfflineState.current = false;
            hasRedirected.current = false; // Reset redirect flag when back online
            showToast("تم استعادة الاتصال بالإنترنت", "success");
        };

        const handleOffline = () => {
            setIsOffline(true);
            lastOfflineState.current = true;
            showToast("انقطع الاتصال بالإنترنت", "warning");
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []); // Run only once on mount

    // Handle offline redirect - separate effect to avoid router in deps
    useEffect(() => {
        // Only act if offline
        if (!isOffline) {
            hasRedirected.current = false;
            return;
        }

        // If we're already on downloads page, don't redirect
        if (pathname?.startsWith("/downloads")) {
            hasRedirected.current = false;
            return;
        }

        // Prevent multiple redirects
        if (hasRedirected.current) {
            return;
        }

        // Mark that we're redirecting
        hasRedirected.current = true;

        // Small delay to ensure we don't conflict with page navigation
        // Small delay to ensure we don't conflict with page navigation
        const timeoutId = setTimeout(() => {
            // Double-check we're still offline
            if (lastOfflineState.current && !pathname?.startsWith("/downloads")) {
                // DON'T force redirect, it kills the player if navigation chunks fail!
                // router.replace("/downloads");
                showToast("لا يوجد اتصال بالإنترنت - يمكنك الذهاب للتلاوات المحفوظة", "error");
            }
        }, 150);

        return () => clearTimeout(timeoutId);
    }, [isOffline, pathname]); // Removed router from deps to prevent loops

    return null;
}
