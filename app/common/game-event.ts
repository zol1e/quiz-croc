import { GameState, Question } from "./model";


export class GameEvent {

  gameId: string;
  gameState: GameState;
  topic: string;
  currentQuestion: Question | null;
  lastQuestion: Question | null;
  score: { [key: string]: number; };

  constructor(
    gameId: string,
    gameState: GameState,
    topic: string, 
    currentQuestion: Question | null,
    lastQuestion: Question | null,
    score: { [key: string]: number; }
  ) {
    this.gameId = gameId;
    this.gameState = gameState;
    this.topic = topic;
    this.currentQuestion = currentQuestion;
    this.lastQuestion = lastQuestion;
    this.score = score;
  }

}
