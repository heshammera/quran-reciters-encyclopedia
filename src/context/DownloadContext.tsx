"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from './ToastContext';
import { downloadAudioForOffline, addDownloadedTrack, type DownloadedTrack } from '@/lib/download-manager';

export interface DownloadItem {
    url: string;
    progress: number; // 0-100
    status: 'pending' | 'downloading' | 'completed' | 'error';
    error?: string;
    trackId?: string; // Optional: to link to UI
    fileName?: string;
}

interface DownloadContextType {
    downloads: Record<string, DownloadItem>; // Keyed by URL
    startDownload: (track: DownloadedTrack) => Promise<void>;
    removeDownload: (url: string) => void;
    isDownloading: (url: string) => boolean;
    getDownloadProgress: (url: string) => number;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export function DownloadProvider({ children }: { children: ReactNode }) {
    const [downloads, setDownloads] = useState<Record<string, DownloadItem>>({});
    const { showToast } = useToast();

    // Helper to update state safely
    const updateDownload = (url: string, updates: Partial<DownloadItem>) => {
        setDownloads(prev => ({
            ...prev,
            [url]: { ...prev[url], ...updates }
        }));
    };

    const startDownload = async (track: DownloadedTrack) => {
        const { audioUrl: url, id: trackId, title: fileName } = track;

        // Prevent duplicate downloads
        if (downloads[url]?.status === 'downloading') return;

        // Initialize state
        setDownloads(prev => ({
            ...prev,
            [url]: {
                url,
                progress: 0,
                status: 'pending',
                trackId,
                fileName
            }
        }));

        try {
            updateDownload(url, { status: 'downloading', progress: 0 });

            console.log(`[DownloadContext] Starting download for: ${url}`);

            const success = await downloadAudioForOffline(
                url,
                (loaded, total) => {
                    if (total > 0) {
                        const progress = Math.round((loaded / total) * 100);
                        updateDownload(url, { progress });
                    }
                }
            );

            if (success) {
                // Save metadata to localStorage
                addDownloadedTrack({
                    ...track,
                    downloadedAt: Date.now()
                });

                updateDownload(url, { status: 'completed', progress: 100 });
                showToast('تم تحميل التلاوة بنجاح', 'success');
            } else {
                throw new Error('Download failed');
            }

        } catch (error: any) {
            console.error("Download failed:", error);
            updateDownload(url, { status: 'error', error: error.message });
            showToast('فشل تحميل التلاوة', 'error');
        }
    };

    const removeDownload = (url: string) => {
        setDownloads(prev => {
            const next = { ...prev };
            delete next[url];
            return next;
        });
    };

    const isDownloading = (url: string) => downloads[url]?.status === 'downloading';
    const getDownloadProgress = (url: string) => downloads[url]?.progress || 0;

    return (
        <DownloadContext.Provider value={{ downloads, startDownload, removeDownload, isDownloading, getDownloadProgress }}>
            {children}
        </DownloadContext.Provider>
    );
}

export function useDownload() {
    const context = useContext(DownloadContext);
    if (context === undefined) {
        throw new Error('useDownload must be used within a DownloadProvider');
    }
    return context;
}
