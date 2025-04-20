import { useEffect, useState } from "react";
import { GameState } from "~/common/model";
import { GameEvent } from "~/common/game-event";


type CountdownProps = {
    secondsLeft: number;
    setSecondsLeft: (value: number) => void;
    gameEvent: GameEvent | null;
};

export default function Countdown({ secondsLeft, setSecondsLeft, gameEvent }: CountdownProps) {
    const [showTime, setShowTime] = useState(false);

    useEffect(() => {
        if (secondsLeft > 0 && gameEvent?.gameState == GameState.QUESTION) {
            setShowTime(true);
            setTimeout(() => {
                if (secondsLeft > 0 && gameEvent?.gameState == GameState.QUESTION) setSecondsLeft(secondsLeft - 1);
            }, 1000);
        } else {
            setShowTime(false);
        }
    }, [secondsLeft, gameEvent?.gameState]);

    return (
        <>
        { showTime && <h2 id="timer">{secondsLeft} sec</h2> }
        </>
    );
}
