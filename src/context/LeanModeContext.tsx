"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getUserPreferences, updatePreferences } from "@/app/actions/user-preferences";

interface LeanModeContextType {
    isLean: boolean;
    toggleLean: () => void;
}

const LeanModeContext = createContext<LeanModeContextType | undefined>(undefined);

export function LeanModeProvider({ children }: { children: React.ReactNode }) {
    const [isLean, setIsLean] = useState(false);

    useEffect(() => {
        const initLean = async () => {
            // 1. Try DB first for logged-in users
            const prefs = await getUserPreferences();
            if (prefs) {
                setIsLean(prefs.lean_mode || false);
                if (prefs.lean_mode) document.body.setAttribute("data-mode", "lean");
                return;
            }

            // 2. Fallback to LocalStorage for guests
            const saved = localStorage.getItem("lean-mode");
            if (saved === "true") {
                setIsLean(true);
                document.body.setAttribute("data-mode", "lean");
            }
        };
        initLean();
    }, []);

    const toggleLean = async () => {
        const newValue = !isLean;
        setIsLean(newValue);

        // Save to LocalStorage
        localStorage.setItem("lean-mode", String(newValue));

        // Sync to DB (non-blocking)
        updatePreferences({ lean_mode: newValue });

        if (newValue) {
            document.body.setAttribute("data-mode", "lean");
        } else {
            document.body.removeAttribute("data-mode");
        }
    };

    return (
        <LeanModeContext.Provider value={{ isLean, toggleLean }}>
            {children}
        </LeanModeContext.Provider>
    );
}

export function useLeanMode() {
    const context = useContext(LeanModeContext);
    if (context === undefined) {
        throw new Error("useLeanMode must be used within a LeanModeProvider");
    }
    return context;
}
