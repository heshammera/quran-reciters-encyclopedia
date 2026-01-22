// Offline Download Manager
export interface DownloadedTrack {
    id: string;
    title: string;
    reciterName: string;
    audioUrl: string;
    surahNumber?: number;
    downloadedAt: number;
    size?: number;
}

export type DownloadProgressCallback = (receivedLength: number, contentLength: number) => void;

const DOWNLOADS_KEY = 'offline-downloads';
export const AUDIO_CACHE_NAME = 'offline-audio-v1';

// --- LocalStorage Helpers ---

export function getDownloadedTracks(): DownloadedTrack[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(DOWNLOADS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function isTrackDownloaded(trackId: string): boolean {
    const downloads = getDownloadedTracks();
    return downloads.some(t => t.id === trackId);
}

export function addDownloadedTrack(track: DownloadedTrack): void {
    const downloads = getDownloadedTracks();
    // Remove if exists to update
    const filtered = downloads.filter(t => t.id !== track.id);
    filtered.push(track);
    localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(filtered));
}

export function removeDownloadedTrack(trackId: string): void {
    const downloads = getDownloadedTracks();
    const filtered = downloads.filter(t => t.id !== trackId);
    localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(filtered));
}

export function clearAllDownloads(): void {
    localStorage.removeItem(DOWNLOADS_KEY);
}

// --- Cache API & Download Logic ---

/**
 * Download audio file using fetch and stream reader to track progress.
 * Stores the result in Cache API.
 */
export async function downloadAudioForOffline(
    url: string,
    onProgress?: DownloadProgressCallback,
    signal?: AbortSignal
): Promise<boolean> {
    if (!('caches' in window)) {
        console.error('[DownloadManager] Cache API not supported');
        return false;
    }

    try {
        const cache = await caches.open(AUDIO_CACHE_NAME);

        // Check if already cached
        const existing = await cache.match(url);
        if (existing) {
            console.log('[DownloadManager] Already cached:', url);
            // If we have it, we can just say 100%
            if (onProgress) {
                const size = parseInt(existing.headers.get('Content-Length') || '0');
                onProgress(size, size);
            }
            return true;
        }

        console.log(`[DownloadManager] Starting fetch: ${url}`);
        const response = await fetch(url, { signal });

        if (!response.ok) {
            throw new Error(`Fetch failed with status: ${response.status}`);
        }

        const contentLength = response.headers.get('Content-Length');
        const totalLength = contentLength ? parseInt(contentLength, 10) : 0;

        // If we can't track progress (no content-length), just clone and put.
        // But usually audio files have content-length.

        if (!response.body) {
            throw new Error('Response body is empty');
        }

        // To track progress, we need to read the stream
        const reader = response.body.getReader();
        let receivedLength = 0;
        const chunks = [];

        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            chunks.push(value);
            receivedLength += value.length;

            if (onProgress && totalLength > 0) {
                onProgress(receivedLength, totalLength);
            }
        }

        // Reconstruct the blob
        const blob = new Blob(chunks, { type: 'audio/mpeg' }); // Assume mp3/audio
        const newResponse = new Response(blob, {
            status: 200,
            statusText: 'OK',
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': blob.size.toString(),
                // Add validation header
                'X-Offline-Created': Date.now().toString()
            }
        });

        await cache.put(url, newResponse);
        console.log('[DownloadManager] Download complete and cached');
        return true;

    } catch (error) {
        if (signal?.aborted) {
            console.log('[DownloadManager] Download aborted');
        } else {
            console.error('[DownloadManager] Download error:', error);
        }
        return false;
    }
}

export async function deleteAudioFromCache(url: string): Promise<boolean> {
    if (!('caches' in window)) return false;

    try {
        const cache = await caches.open(AUDIO_CACHE_NAME);
        return await cache.delete(url);
    } catch (error) {
        console.error('[DownloadManager] Delete error:', error);
        return false;
    }
}

/**
 * Get the cached audio file as a Blob URL for offline playback
 */
export async function getOfflineAudioUrl(url: string): Promise<string | null> {
    if (!('caches' in window)) return null;

    try {
        const cache = await caches.open(AUDIO_CACHE_NAME);
        const response = await cache.match(url);

        if (!response) {
            console.log('[getOfflineAudioUrl] Not cached:', url);
            return null;
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        console.log('[getOfflineAudioUrl] Created blob URL for cached audio');
        return blobUrl;
    } catch (error) {
        console.error('[getOfflineAudioUrl] Error:', error);
        return null;
    }
}

/**
 * Check if audio is cached
 */
export async function isAudioCached(url: string): Promise<boolean> {
    if (!('caches' in window)) return false;

    try {
        const cache = await caches.open(AUDIO_CACHE_NAME);
        const response = await cache.match(url);
        return !!response;
    } catch (error) {
        console.error('[isAudioCached] Error:', error);
        return false;
    }
}

export async function getCacheSize(): Promise<number> {
    if (!('caches' in window)) return 0;

    try {
        const cache = await caches.open(AUDIO_CACHE_NAME);
        const requestKeys = await cache.keys();
        let totalSize = 0;

        for (const request of requestKeys) {
            const response = await cache.match(request);
            if (response) {
                // Try Content-Length first
                const cl = response.headers.get('Content-Length');
                if (cl) {
                    totalSize += parseInt(cl, 10);
                } else {
                    // Fallback to blob size
                    const blob = await response.blob();
                    totalSize += blob.size;
                }
            }
        }
        return totalSize;
    } catch (e) {
        console.error('[getCacheSize] Error:', e);
        return 0;
    }
}

export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

