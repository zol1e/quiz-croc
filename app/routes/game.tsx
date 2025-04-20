import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useCallback, useEffect, useState } from "react";
import { ReadyState } from "react-use-websocket";

import { useGameWsClient } from "~/hooks/game-ws-client";
import { getSession } from "~/sessions";

import { Games } from "~/.server/games";
import { QuestionGenerator } from "~/.server/question-generator";
import { GameMessage, GameMessageType, GameState } from "~/common/model";

import AnswerInput from "~/components/answer-input";
import AnswerList from "~/components/answer-list";
import Countdown from "~/components/countdown";
import Scoreboard from "~/components/scoreboard";


const questionGenerator = new QuestionGenerator("");


export type LoaderData = {
    playerId: string;
    gameId: string;
    create: boolean;
};

export async function loader({request, }: LoaderFunctionArgs): Promise<LoaderData> {
    const session = await getSession(
        request.headers.get("Cookie")
    );
    
    const playerId = session.get("playerId") as string;
    if (!playerId) throw new Error("Nickname is required!");

    let game = null;

    const create = session.get("create") as boolean;
    if (create) {
        // Create new game
        const topic = session.get("topic") as string;
        if (!topic) throw new Error("Topic is required!");

        const generatedQuiz = await questionGenerator.generateQuestions(topic);
        game = Games.get().createGame(generatedQuiz.quizName, generatedQuiz.questions);
    } else {
        // Use existing Game ID
        const gameId = session.get("gameId") as string;
        if (!gameId) throw new Error("Game ID is required!");

        if (!Games.get().hasGame(gameId)) throw new Error("Game not found!");
        game = Games.get().getGame(gameId);
    }

    return { 
        "playerId": playerId, "gameId": game.id, "create": create ? true : false 
    };
}


export default function Game() {
    const loaderData = useLoaderData<LoaderData>();

    const isMasterPlayer = loaderData?.create
    const playerId = loaderData?.playerId;
    const gameId = loaderData?.gameId;

    const [secondsLeft, setSecondsLeft] = useState(0);
    const { gameEvent, previousGameEvent, readyState, sendMessage } = useGameWsClient()

    useEffect(() => {
        if (readyState === ReadyState.OPEN) {
            const gameMessage = new GameMessage(GameMessageType.JOIN, playerId, gameId);
            sendMessage(JSON.stringify(gameMessage));
        }
    }, [readyState]);

    function answerQuestion(answerText: string) {
        const gameMessage = new GameMessage(
            GameMessageType.ANSWER, playerId, gameId, 
            gameEvent?.currentQuestion?.id, answerText
        );
        sendMessage(JSON.stringify(gameMessage));
    }

    const onNextQuestionClicked = useCallback(
        () => {
            const gameMessage = new GameMessage(GameMessageType.NEXT_QUESTION, playerId, gameId);
            sendMessage(JSON.stringify(gameMessage));
        }, []
    );

    useEffect(() => {
        if (gameEvent?.gameState == GameState.QUESTION) {
            if (previousGameEvent?.gameState != GameState.QUESTION) {
                setSecondsLeft(20);
            }
        } else {
            setSecondsLeft(0);
        }
    }, [gameEvent]);

    return (
        <>
        <div style={{ textAlign: 'center' }}>
        <h1>{gameEvent?.topic}</h1>

        <div style={{ display: 'flex', marginTop: '0.5rem' }}>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <h2>Player: {playerId}</h2>
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <h2>Game ID: {gameEvent?.gameId}</h2>
            </div>
        </div>
        </div>

        {
        (
            isMasterPlayer && 
            gameEvent?.gameState !== GameState.QUESTION && 
            gameEvent?.gameState !== GameState.FINISH
        ) &&
        <button className="button" onClick={onNextQuestionClicked} disabled={readyState !== ReadyState.OPEN}>
            Next question
        </button>
        }

        {
        (gameEvent?.gameState === GameState.FINISH) &&
        <>
        <h1 style={{ textAlign: 'center' }}>Final result</h1>
        <Scoreboard gameEvent={gameEvent}/>
        </>
        }

        <Countdown 
            gameEvent={gameEvent} 
            secondsLeft={secondsLeft} 
            setSecondsLeft={setSecondsLeft}
        />

        <h2 id="question-text">{gameEvent?.lastQuestion?.text}</h2>

        <AnswerInput answerQuestion={answerQuestion} gameEvent={gameEvent}/>
        <AnswerList gameEvent={gameEvent} playerId={playerId}/>
        
        {
        (gameEvent?.gameState !== GameState.FINISH) &&
        <>
        <h2>Score</h2>
        <Scoreboard gameEvent={gameEvent}/>
        </>
        }

        </>
    )
}
