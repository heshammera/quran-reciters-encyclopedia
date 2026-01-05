import { useContext } from "react";
import { PlayerContext } from "@/context/PlayerContext";
import { PlayerState, Action, Track } from "@/types/player";

interface PlayerHook {
    state: PlayerState;
    dispatch: React.Dispatch<Action>;
    playTrack: (track: Track) => void;
    setQueue: (tracks: Track[]) => void;
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

    return { state, dispatch, playTrack, setQueue };
}
