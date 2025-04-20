import { GameState } from "~/common/model";
import { GameEvent } from "~/common/game-event";


type AnswerListProps = {
    gameEvent: GameEvent | null;
    playerId: string;
};


export default function AnswerList({ gameEvent, playerId }: AnswerListProps) {
    return (
        <>
        {
        (gameEvent?.lastQuestion?.playerAnswers) &&
        <>
        <h2>Answers</h2>
        <table id="tbl-player-answered">
            <thead id="tbl-player-answered-head">
                <tr>
                    <th>Player</th>
                    <th>Time</th>
                    <th>Answer</th>
                </tr>
            </thead>
            <tbody id="tbl-player-answered-body">
            {
            (Object.entries(gameEvent?.lastQuestion?.playerAnswers).map(([answerPlayerId, { answer, timeSpentMillis }]) => (
            <tr key={answerPlayerId}>
                <td>{answerPlayerId}</td>
                <td>{timeSpentMillis / 1000}</td>
                <td>
                    {
                    (gameEvent?.gameState != GameState.QUESTION || answerPlayerId === playerId) ? answer : "?"
                    }
                </td>
            </tr>
            )))
            }
            </tbody>
        </table>
        </>
        }
        </>
    )
}
