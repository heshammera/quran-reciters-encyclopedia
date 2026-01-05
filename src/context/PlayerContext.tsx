"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";

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

interface PlayerState {
    currentTrack: Track | null;
    isPlaying: boolean;
    queue: Track[];
    volume: number;
    isExpanded: boolean; // For mobile full screen
}

type Action =
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

const initialState: PlayerState = {
    currentTrack: null,
    isPlaying: false,
    queue: [],
    volume: 1,
    isExpanded: false,
};

function playerReducer(state: PlayerState, action: Action): PlayerState {
    switch (action.type) {
        case "PLAY_TRACK":
            // If playing the same track, just toggle? No, usually 'play' means start over or resume.
            // But if it's a new track:
            return {
                ...state,
                currentTrack: action.payload,
                isPlaying: true,
            };
        case "TOGGLE_PLAY_PAUSE":
            return {
                ...state,
                isPlaying: !state.isPlaying,
            };
        case "SET_IS_PLAYING":
            return {
                ...state,
                isPlaying: action.payload,
            };
        case "SET_VOLUME":
            return {
                ...state,
                volume: action.payload,
            };
        case "TOGGLE_EXPAND":
            return {
                ...state,
                isExpanded: !state.isExpanded,
            };
        case "ADD_TO_QUEUE":
            return {
                ...state,
                queue: [...state.queue, action.payload],
            };
        case "SET_QUEUE":
            return {
                ...state,
                queue: action.payload,
            };
        case "NEXT_TRACK":
            // Logic to move to next track would normally require knowing the index.
            // For simplicity, we assume the queue logic is handled by the component or we shift here.
            // Let's keep it simple: The UI usually drives "play next", but if we want auto-next:
            // We'll need to find current index in queue.
            if (!state.currentTrack || state.queue.length === 0) return state;
            const currentIndex = state.queue.findIndex(t => t.id === state.currentTrack?.id);
            if (currentIndex === -1 || currentIndex === state.queue.length - 1) return state;
            return {
                ...state,
                currentTrack: state.queue[currentIndex + 1],
                isPlaying: true
            }
        case "PREV_TRACK":
            if (!state.currentTrack || state.queue.length === 0) return state;
            const prevIndex = state.queue.findIndex(t => t.id === state.currentTrack?.id);
            if (prevIndex <= 0) return state;
            return {
                ...state,
                currentTrack: state.queue[prevIndex - 1],
                isPlaying: true
            };
        case "STOP_PLAYER":
            return {
                ...state,
                currentTrack: null,
                isPlaying: false,
                queue: [] // Optional: clear queue on stop? Let's say yes for now to fully "close" it.
            };
        default:
            return state;
    }
}

const PlayerContext = createContext<{
    state: PlayerState;
    dispatch: React.Dispatch<Action>;
} | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(playerReducer, initialState);

    return (
        <PlayerContext.Provider value={{ state, dispatch }}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error("usePlayer must be used within a PlayerProvider");
    }
    return context;
}
