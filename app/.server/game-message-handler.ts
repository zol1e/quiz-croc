import { GameMessage, GameMessageType } from "../common/model.js";
import { GameEventListener } from "./game-event-listener.js";
import { Games } from "./games.js";


export class GameMessageHandler {

    public static handle(gameMessage: GameMessage, gameEventListener: GameEventListener) {
		switch (gameMessage.gameMessageType as GameMessageType) {
			case GameMessageType.JOIN: {
				Games.get().joinGame(gameMessage.playerId, gameMessage.gameId, gameEventListener);
				break;
			}
			case GameMessageType.NEXT_QUESTION: {
				Games.get().nextQuestion(gameMessage.gameId);
				break;
			}
			case GameMessageType.ANSWER: {
				Games.get().answer(
					gameMessage.playerId, 
					gameMessage.gameId, 
					gameMessage.questionId, 
					gameMessage.answer
				);
				break;
			}
			case GameMessageType.PLAY_OR_SPECTATE: {
				Games.get().setSpectator(gameMessage.playerId, gameMessage.gameId, gameMessage.spectator);
				break;
			}
			default:
				throw new Error("Unhandled GameMessageType: " + gameMessage.gameMessageType);
		}
    }

}
