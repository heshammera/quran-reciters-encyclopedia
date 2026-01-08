// Listening History Utilities
export interface HistoryEntry {
    trackId: string;
    title: string;
    reciterName: string;
    surahNumber?: number;
    timestamp: number; // When it was played
    duration?: number; // How long was listened
    lastPosition?: number; // Last playback position
    src?: string;
}

const HISTORY_KEY = 'listening-history';
const MAX_HISTORY = 50;

export function addToHistory(entry: Omit<HistoryEntry, 'timestamp'>): void {
    const history = getHistory();

    // Add new entry with current timestamp
    const newEntry: HistoryEntry = {
        ...entry,
        timestamp: Date.now()
    };

    // Remove duplicates (same trackId within last hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const filtered = history.filter(h =>
        !(h.trackId === entry.trackId && h.timestamp > oneHourAgo)
    );

    // Add to beginning and limit to MAX_HISTORY
    const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function getHistory(): HistoryEntry[] {
    try {
        const stored = localStorage.getItem(HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function clearHistory(): void {
    localStorage.removeItem(HISTORY_KEY);
}

export function updateLastPosition(trackId: string, position: number): void {
    const history = getHistory();
    // Only update the first matching entry (most recent) to avoid ghost updates on old history
    const index = history.findIndex(h => h.trackId === trackId);
    if (index !== -1) {
        history[index].lastPosition = position;
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
}

export function getLastPosition(trackId: string): number {
    const history = getHistory();
    const entry = history.find(h => h.trackId === trackId);
    return entry?.lastPosition || 0;
}
