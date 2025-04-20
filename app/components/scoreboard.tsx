import { GameEvent } from "~/common/game-event";


export default function Scoreboard({ gameEvent }: { gameEvent: GameEvent | null}) {
    return (
        <>
        <table id="tbl-score">
            <thead id="tbl-score-head">
                <tr>
                    <th>Player</th>
                    <th>Score</th>
                </tr>
            </thead>
            <tbody id="tbl-score-body">
            { gameEvent?.score &&
            (Object.entries(gameEvent?.score).toReversed().map(([playerId, score], index) => (
            <tr key={index}><td>{playerId}</td><td>{score}</td></tr>
            )))
            }
            </tbody>
        </table>
        </>
    )
}
