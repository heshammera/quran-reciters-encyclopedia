'use client';

import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/context/ToastContext";
import { PlayerProvider } from "@/context/PlayerContext";
import { DownloadProvider } from "@/context/DownloadContext";
import { LeanModeProvider } from "@/context/LeanModeContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ToastProvider>
                <LeanModeProvider>
                    <PlayerProvider>
                        <DownloadProvider>
                            {children}
                        </DownloadProvider>
                    </PlayerProvider>
                </LeanModeProvider>
            </ToastProvider>
        </ThemeProvider>
    );
}
