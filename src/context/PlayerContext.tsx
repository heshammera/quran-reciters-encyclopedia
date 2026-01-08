"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Track, PlayerState, Action } from "@/types/player";

const initialState: PlayerState = {
    currentTrack: null,
    isPlaying: false,
    queue: [],
    volume: 1,
    isExpanded: false,
    sleepTimer: null,
    playbackRate: 1,
    repeatMode: 'off',
    shuffle: false,
    isMinimized: false,
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
        case "TOGGLE_MINIMIZED":
            return {
                ...state,
                isMinimized: !state.isMinimized,
                isExpanded: false, // Close expanded view if minimizing
            };
        case "ADD_TO_QUEUE":
            // Check if track already exists in queue
            const trackExists = state.queue.some(track => track.id === action.payload.id);
            if (trackExists) {
                return state; // Don't add duplicate
            }
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

            // Repeat One - replay same track
            if (state.repeatMode === 'one') {
                return {
                    ...state,
                    isPlaying: true
                };
            }

            // Normal or Repeat All
            if (currentIndex === -1 || currentIndex === state.queue.length - 1) {
                // End of queue
                if (state.repeatMode === 'all') {
                    // Go back to first track
                    return {
                        ...state,
                        currentTrack: state.queue[0],
                        isPlaying: true
                    };
                }
                // No repeat - stop
                return state;
            }

            // Play next track
            return {
                ...state,
                currentTrack: state.queue[currentIndex + 1],
                isPlaying: true
            };
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
        case "SET_SLEEP_TIMER":
            return {
                ...state,
                sleepTimer: action.payload
            };
        case "CLEAR_SLEEP_TIMER":
            return {
                ...state,
                sleepTimer: null
            };
        case "SET_PLAYBACK_RATE":
            return {
                ...state,
                playbackRate: action.payload
            };
        case "SET_REPEAT_MODE":
            return {
                ...state,
                repeatMode: action.payload
            };
        case "TOGGLE_SHUFFLE":
            return {
                ...state,
                shuffle: !state.shuffle,
                // Optionally shuffle the queue when enabled
                queue: !state.shuffle && state.queue.length > 0
                    ? [...state.queue].sort(() => Math.random() - 0.5)
                    : state.queue
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


