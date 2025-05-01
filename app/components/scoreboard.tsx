import { GameEvent } from "~/common/game-event";


export default function Scoreboard({ gameEvent }: { gameEvent: GameEvent | null }) {
    const scores = gameEvent?.score || {};
    const sortedScores = Object.entries(scores).sort(([, scoreA], [, scoreB]) => scoreB - scoreA);
  
    return (
      <table id="tbl-score">
        <thead id="tbl-score-head">
          <tr>
            <th>Player</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody id="tbl-score-body">
          {sortedScores.map(([playerId, score]) => (
            <tr key={playerId}>
              <td>{playerId}</td>
              <td>{score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
}
