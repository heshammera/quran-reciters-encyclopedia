import { useContext } from "react";
import { PlayerContext } from "@/context/PlayerContext";
import { PlayerState, Action, Track } from "@/types/player";

interface PlayerHook {
    state: PlayerState;
    dispatch: React.Dispatch<Action>;
    playTrack: (track: Track) => void;
    setQueue: (tracks: Track[]) => void;
    addToQueue: (track: Track) => void;
    addTracksToQueue: (tracks: Track[]) => void;
    clearQueue: () => void;
    removeFromQueue: (index: number) => void;
    reorderQueue: (fromIndex: number, toIndex: number) => void;
}

export function usePlayer(): PlayerHook {
    const context = useContext(PlayerContext);

    if (!context) {
        throw new Error("usePlayer must be used within a PlayerProvider");
    }

    const { state, dispatch } = context;

    const playTrack = (track: Track) => {
        dispatch({ type: "PLAY_TRACK", payload: track });
    };

    const setQueue = (tracks: Track[]) => {
        dispatch({ type: "SET_QUEUE", payload: tracks });
    };

    const addToQueue = (track: Track) => {
        dispatch({ type: "ADD_TO_QUEUE", payload: track });
    };

    const addTracksToQueue = (tracks: Track[]) => {
        const currentQueue = state.queue;
        dispatch({ type: "SET_QUEUE", payload: [...currentQueue, ...tracks] });
    };

    const clearQueue = () => {
        dispatch({ type: "CLEAR_QUEUE" });
    };

    const removeFromQueue = (index: number) => {
        dispatch({ type: "REMOVE_FROM_QUEUE", payload: index });
    };

    const reorderQueue = (fromIndex: number, toIndex: number) => {
        dispatch({ type: "REORDER_QUEUE", payload: { fromIndex, toIndex } });
    };

    return { state, dispatch, playTrack, setQueue, addToQueue, addTracksToQueue, clearQueue, removeFromQueue, reorderQueue };
}
