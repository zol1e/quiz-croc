export enum GameState {
  PREPARE = "PREPARE",
  QUESTION = "QUESTION",
  BETWEEN_QUESTIONS = "BETWEEN_QUESTIONS",
  FINISH = "FINISH"
}

export class Question {

  id: string
  text: string
  sourceUrl: string | null = null;
  score: number = 100;
  timeMillis: number = 20000;
  correctAnswer: string
  alternativeAnswers: string[]
  playerAnswers: { [key: string]: PlayerAnswer; } = {};
  startedAt: Date | null = null;
  finishTime: Date | null = null;

  constructor(
    id: string, text: string, sourceUrl: string | null, 
    correctAnswer: string, alternativeAnswers: string[],
  ) {
    this.id = id;
    this.text = text;
    this.sourceUrl = sourceUrl;
    this.correctAnswer = correctAnswer;
    this.alternativeAnswers = alternativeAnswers;
  }

  start() {
    const now = Date.now();
    this.startedAt = new Date(now);
    this.finishTime = new Date(now + this.timeMillis);
  }

  answer(playerId: string, playerAnswer: string, answeredAt: Date): boolean {
    if (!(playerId in this.playerAnswers) && this.startedAt != null) {
      this.playerAnswers[playerId] = new PlayerAnswer(
        playerId,
        playerAnswer,
        answeredAt,
        answeredAt.getTime() - this.startedAt.getTime(),
        this.getDisctanceFromCorrect(playerAnswer)
      )
      return true;
    }
    return false;
  }

  getDisctanceFromCorrect(answer: string): number {
    if (!this.hasAlternativeAnswers()) {
      return Math.abs(parseInt(this.correctAnswer) - parseInt(answer));
    } else {
      return this.correctAnswer === answer ? 0 : 1;
    }
  }

  getAnsweredPlayerIds(): string[] {
    const answeredPlayerIds: string[] = []
    for (const playerId in this.playerAnswers) {
      answeredPlayerIds.push(playerId);
    }
    return answeredPlayerIds;
  }

  hasAlternativeAnswers(): boolean {
    return this.alternativeAnswers.length > 0;
  }

	getScore(): { [key: string]: number; } {
		const score: { [key: string]: number; } = {};

    const answersSorted = Object.values(this.playerAnswers);
    answersSorted.sort(
      (answer1, answer2) => new Date(answer1.answeredAt).getTime() - new Date(answer2.answeredAt).getTime()
    );
    answersSorted.sort(
      (answer1, answer2) => answer1.distanceFromCorrect - answer2.distanceFromCorrect
    );

		if(this.hasAlternativeAnswers()) {
			let place = 1;
      for(const answer of answersSorted) {
				if(answer.isCorrect()) {
					score[answer.playerId] = this.score / place;
          place++;
				} else {
					score[answer.playerId] = 0;
				}
			}
		} else {
			let place = 1;
			for(const answer of answersSorted) {
				score[answer.playerId] = this.score / place;
				place++;
			}
		}

		return score;
	}

}


export class PlayerAnswer {

  playerId: string
  answer: string
  answeredAt: Date
  timeSpentMillis: number
  distanceFromCorrect: number

  constructor(
    playerId: string,
    answer: string,
    answeredAt: Date,
    timeSpentMillis: number,
    distanceFromCorrect: number
  ) {
    this.playerId = playerId
    this.answer = answer
    this.answeredAt = answeredAt
    this.timeSpentMillis = timeSpentMillis
    this.distanceFromCorrect = distanceFromCorrect
  }

	isCorrect(): boolean {
		return this.distanceFromCorrect == 0;
	}

}

export enum GameMessageType {
  CREATE = "CREATE",
  JOIN = "JOIN",
  NEXT_QUESTION = "NEXT_QUESTION",
  ANSWER = "ANSWER",
  PLAY_OR_SPECTATE = "PLAY_OR_SPECTATE"
}

export class GameMessage {

  gameMessageType: GameMessageType;
  playerId: string;
  gameId: string;
  questionId: string | null = null;
  answer: string | null = null;
  spectator: boolean = true;

  constructor(
    gameMessageType: GameMessageType,
    playerId: string,
    gameId: string,
    questionId: string | null = null,
    answer: string | null = null,
    spectator: boolean = true
  ) {
    this.gameMessageType = gameMessageType;
    this.playerId = playerId;
    this.gameId = gameId;
    this.questionId = questionId;
    this.answer = answer;
    this.spectator = spectator;
  }

}
