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

    // تمت إزالة useEffect لاسترجاع الحالة السابقة بناءً على طلب المستخدم
    // ليكون الوضع الهادئ ميزة مؤقتة تعمل فقط عند الضغط عليها

    const toggleLean = () => {
        const newValue = !isLean;
        setIsLean(newValue);

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
