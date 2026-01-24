'use client';

import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import AudioPlayer from "@/components/player/AudioPlayer";
import LeanToggle from "@/components/layout/LeanToggle";
import FloatingRadioWidget from "@/components/radio/FloatingRadioWidget";
import AssistantChat from "@/components/assistant/AssistantChat";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import WelcomePopup from "@/components/layout/WelcomePopup";
import DonationBanner from "@/components/donation/DonationBanner";
import OfflineIndicator from "@/components/offline/OfflineIndicator";
import OfflineGuard from "@/components/offline/OfflineGuard";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import PresenceTracker from "@/components/layout/PresenceTracker";

import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* PWA Configuration */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="موسوعة القراء" />
        <link rel="apple-touch-icon" href="/logo.png" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Tajawal:wght@200;300;400;500;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-sans transition-colors duration-300 bg-background text-foreground">
        {!isAdmin && <DonationBanner />}
        <Providers>
          <div className="flex flex-col min-h-screen">
            {!isAdmin && <Navbar />}
            <main className="flex-grow">
              {children}
            </main>
            {!isAdmin && <AudioPlayer />}
            {!isAdmin && <LeanToggle />}
            <OfflineIndicator />
            <OfflineGuard />
            <ServiceWorkerRegister />
            <PresenceTracker />
            {!isAdmin && <WelcomePopup />}
            {/* {!isAdmin && <AssistantChat />} */}
            {!isAdmin && <FloatingRadioWidget />}
            {!isAdmin && <Footer />}
          </div>
        </Providers>
      </body>
    </html >
  );
}
