import { useState } from "react";
import { GameState } from "~/common/model";
import { GameEvent } from "~/common/game-event";


type AnswerProps = {
    answerQuestion: (value: string) => void;
    gameEvent: GameEvent | null;
};

export default function AnswerInput({ answerQuestion, gameEvent }: AnswerProps) {
    const [answer, setAnswer] = useState("");
    
    function onAnswerClicked() { answerQuestion(answer); }

    return (
        <>
        {
        (gameEvent?.gameState === GameState.BETWEEN_QUESTIONS || gameEvent?.gameState === GameState.FINISH) &&
        <h2 id="question-answer">
            Correct answer: {gameEvent?.lastQuestion?.correctAnswer}
            {" "}
            {gameEvent?.lastQuestion?.sourceUrl && (
            <>
                | Source:{" "}
                <a
                href={gameEvent.lastQuestion.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '0.25rem' }}
                >
                🔗
                </a>
            </>
            )}
        </h2>
        }

        {
        (gameEvent?.currentQuestion?.alternativeAnswers?.length as number > 0) 
        && 
        <div id="answer-input-container">
        {gameEvent?.currentQuestion?.alternativeAnswers.map((buttonAnswer, index) => (
        <button key={index} className="button" id="answer-choice" type="button" onClick={() => answerQuestion(buttonAnswer)}>{buttonAnswer}</button>
        ))}
        </div>
        }

        {
        (gameEvent?.currentQuestion?.alternativeAnswers?.length as number < 1) 
        && 
        <div id="answer-input-container">
        <input id="input-answer" type="number" 
        pattern="\d*" inputMode="numeric" autoCorrect="off" autoCapitalize="off"
        onChange={(e) => setAnswer(e.target.value)}
        />
        <button className="button" id="answer-numeric" type="button" onClick={onAnswerClicked}>Answer</button>
        </div>
        }
        </>
    )
}
