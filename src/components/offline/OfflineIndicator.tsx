"use client";

import { useState, useEffect } from "react";

export default function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(true);
    const [showIndicator, setShowIndicator] = useState(false);

    useEffect(() => {
        // Set initial state
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            setShowIndicator(true);
            // Hide after 3 seconds
            setTimeout(() => setShowIndicator(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowIndicator(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!showIndicator) return null;

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] animate-in slide-in-from-top duration-300">
            <div className={`px-6 py-3 rounded-full shadow-lg backdrop-blur-md flex items-center gap-3 ${isOnline
                    ? "bg-emerald-500/90 text-white"
                    : "bg-amber-500/90 text-white"
                }`}>
                <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-white" : "bg-white animate-pulse"}`} />
                <span className="font-bold text-sm">
                    {isOnline ? "تم استعادة الاتصال بالإنترنت" : "لا يوجد اتصال بالإنترنت"}
                </span>
            </div>
        </div>
    );
}
