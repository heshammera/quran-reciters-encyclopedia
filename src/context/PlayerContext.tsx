"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Track, PlayerState, Action } from "@/types/player";

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
        case "CLEAR_QUEUE":
            return {
                ...state,
                queue: []
            };
        case "REMOVE_FROM_QUEUE":
            const filteredQueue = [...state.queue];
            filteredQueue.splice(action.payload, 1);
            return {
                ...state,
                queue: filteredQueue
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

export const PlayerContext = createContext<{
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


