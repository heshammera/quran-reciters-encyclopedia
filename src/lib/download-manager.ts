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

const DOWNLOADS_KEY = 'offline-downloads';

export function getDownloadedTracks(): DownloadedTrack[] {
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

    // Remove if already exists
    const filtered = downloads.filter(t => t.id !== track.id);

    // Add new
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

// Service Worker communication
export async function downloadAudioForOffline(url: string): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
        console.error('Service Worker not supported');
        return false;
    }

    const registration = await navigator.serviceWorker.ready;

    return new Promise((resolve) => {
        const messageChannel = new MessageChannel();

        messageChannel.port1.onmessage = (event) => {
            resolve(event.data.success);
        };

        registration.active?.postMessage(
            { type: 'CACHE_AUDIO', url },
            [messageChannel.port2]
        );

        // Timeout after 30 seconds
        setTimeout(() => resolve(false), 30000);
    });
}

export async function deleteAudioFromCache(url: string): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
        return false;
    }

    const registration = await navigator.serviceWorker.ready;

    return new Promise((resolve) => {
        const messageChannel = new MessageChannel();

        messageChannel.port1.onmessage = (event) => {
            resolve(event.data.success);
        };

        registration.active?.postMessage(
            { type: 'DELETE_AUDIO', url },
            [messageChannel.port2]
        );

        setTimeout(() => resolve(false), 5000);
    });
}

// Get estimated cache size
export async function getCacheSize(): Promise<number> {
    if (!('caches' in window)) return 0;

    try {
        const cacheNames = await caches.keys();
        let totalSize = 0;

        for (const name of cacheNames) {
            const cache = await caches.open(name);
            const requests = await cache.keys();

            for (const request of requests) {
                const response = await cache.match(request);
                if (response) {
                    const blob = await response.blob();
                    totalSize += blob.size;
                }
            }
        }

        return totalSize;
    } catch {
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
