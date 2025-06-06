import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { GameEvent } from "~/common/game-event";


export function useGameWsClient() {
    const [gameEvent, setGameEvent] = useState<GameEvent | null>(null);
    const [previousGameEvent, setPreviousGameEvent] = useState<GameEvent | null>(null);
    const [socketUrl, setSocketUrl] = useState<string | null>(null);

    // Set socket URL only on the client
    useEffect(() => {
      if (typeof window !== "undefined") {
        const wsUrl = window.location.origin.replace('http://', 'ws://').replace('https://', 'wss://') + "/game-ws";
        setSocketUrl(wsUrl);
      }
    }, []);

    const { sendMessage, readyState, lastMessage } = useWebSocket(socketUrl);

    useEffect(() => {
      if (lastMessage !== null) {
        const lastGameEvent = JSON.parse(lastMessage.data)
        setPreviousGameEvent(gameEvent);
        setGameEvent(lastGameEvent);
        console.log("Last game event: " + JSON.stringify(lastGameEvent));
      }
    }, [lastMessage]);

    return { gameEvent, previousGameEvent, readyState, sendMessage };
}
