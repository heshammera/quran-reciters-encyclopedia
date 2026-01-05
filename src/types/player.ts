export interface Track {
    id: string;
    title: string;
    reciterName: string;
    src: string;
    surahNumber?: number;
    ayahStart?: number;
    ayahEnd?: number;
    reciterId?: string;
    sectionSlug?: string;
}

export interface PlayerState {
    currentTrack: Track | null;
    isPlaying: boolean;
    queue: Track[];
    volume: number;
    isExpanded: boolean;
}

export type Action =
    | { type: "PLAY_TRACK"; payload: Track }
    | { type: "TOGGLE_PLAY_PAUSE" }
    | { type: "SET_IS_PLAYING"; payload: boolean }
    | { type: "SET_VOLUME"; payload: number }
    | { type: "TOGGLE_EXPAND" }
    | { type: "ADD_TO_QUEUE"; payload: Track }
    | { type: "SET_QUEUE"; payload: Track[] }
    | { type: "NEXT_TRACK" }
    | { type: "PREV_TRACK" }
    | { type: "STOP_PLAYER" };
