import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useCallback, useEffect, useState } from "react";
import { ReadyState } from "react-use-websocket";

import { useGameWsClient } from "~/hooks/useGameWsClient";
import { commitSession, getSession } from "~/sessions";

import { Games } from "~/.server/games";

import AnswerInput from "~/components/answer-input";
import AnswerList from "~/components/answer-list";
import Countdown from "~/components/countdown";
import Scoreboard from "~/components/scoreboard";
import { GameMessage, GameMessageType } from "~/common/game-message";
import { GameState } from "~/common/game-event";
import { QuestionGenerator } from "~/.server/question-generator";


export type LoaderData = {
    playerId: string;
    gameId: string;
    create: boolean;
};

export async function loader({request, }: LoaderFunctionArgs): Promise<Response> {
    const session = await getSession(
        request.headers.get("Cookie")
    );
    
    const playerId = session.get("playerId") as string;
    if (!playerId) throw new Error("Nickname is required!");

    let game = null;

    const gameId = session.get("gameId");
    if (gameId) {
        // Use existing Game ID
        const gameId = session.get("gameId") as string;
        if (!gameId) throw new Error("Game ID is required!");

        if (!Games.get().hasGame(gameId)) throw new Error("Game not found!");
        game = Games.get().getGame(gameId);
    } else {
        // Create new game
        const topic = session.get("topic") as string;
        if (!topic) throw new Error("Topic is required!");
        
        const apiKey = process.env.AI_API_KEY ?? (() => { throw new Error("Missing AI_API_KEY"); })();
        const questionGenerator = new QuestionGenerator(apiKey);
        const generatedQuiz = await questionGenerator.generateQuestions(topic);
        game = Games.get().createGame(generatedQuiz.quizName, generatedQuiz.questions);
        session.set("gameId", game.id)
    }

    const responseBody = {
        playerId,
        gameId: game.id,
        create: session.get("create") === true,
    };

    // Return the response with a proper 'Set-Cookie' header.
    return new Response(JSON.stringify(responseBody), {
        headers: {
            "Content-Type": "application/json",
            "Set-Cookie": await commitSession(session),
        },
    });
}


export default function Game() {
    const loaderData = useLoaderData<LoaderData>();

    const isMasterPlayer = loaderData?.create
    const playerId = loaderData?.playerId;
    const gameId = loaderData?.gameId;

    const [secondsLeft, setSecondsLeft] = useState(0);
    const { gameEvent, previousGameEvent, readyState, sendMessage } = useGameWsClient()

    const showNextQuestionButton = isMasterPlayer && 
        gameEvent?.gameState !== GameState.QUESTION && 
        gameEvent?.gameState !== GameState.FINISH;

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
        showNextQuestionButton &&
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
