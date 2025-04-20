import { Question, GameState } from "../common/model";
import { GameEvent } from "~/common/game-event";
import { GameEventListener } from "./game-event-listener";
import { Player } from "./player";
import { TimeScheduler } from "./time-scheduler";


export class Game {
    
    id: string;
	topic: string;
    state: GameState;
	unusedQuestions: Question[];
	currentQuestion: Question | null = null;
	usedQuestions: Question[] = [];
	eventListenersByPlayerId: { [key: string]: Player; } = {};
	score: { [key: string]: number; } = {};
	timeSchduler: TimeScheduler;

	constructor(id: string, topic: string, questions: Question[], timeScheduler: TimeScheduler) {
		this.id = id;
		this.topic = topic;
		this.state = GameState.PREPARE;
		this.unusedQuestions = questions;
		this.timeSchduler = timeScheduler;
	}

	addPlayer(playerId: string, gameEventListener: GameEventListener): Game {
		this.eventListenersByPlayerId[playerId] = new Player(playerId, gameEventListener, false);
		this.computeScore();
		this.gameChanged();
		return this;
	}

	setSpectator(playerId: string, spectator: boolean) {
		this.eventListenersByPlayerId[playerId].spectator = spectator;
		this.computeScore();
		this.gameChanged();
	}

	nextQuestion() : Question | null {
		if (!this.unusedQuestions.length) {
			this.state = GameState.FINISH;
			return null;
		}
		this.currentQuestion = this.unusedQuestions.shift()!;
		this.usedQuestions.push(this.currentQuestion);

		this.currentQuestion.start();
		
		const questionId = this.currentQuestion.id;
		this.timeSchduler.schedule(
			() => { 
				if (this.currentQuestion != null && this.currentQuestion.id === questionId) {
					this.finishQuestion();
				}
			},
			this.currentQuestion.timeMillis
		);

		this.state = GameState.QUESTION;
		this.gameChanged();

		return this.currentQuestion;
	}

	answer(playerId: string, questionId: string, playerAnswer: string): boolean {
		if (this.currentQuestion == null) {
			return false;
		}
		let answered = false;
		if (this.currentQuestion.id === questionId) {
			if (this.currentQuestion.answer(playerId, playerAnswer, new Date())) {
				answered = true;
				this.gameChanged();
			}
		}
		if (this.allPlayerAnswered(this.currentQuestion, this.getPlayerIds())) {
			this.finishQuestion();
		}
		return answered;
	}

	gameChanged() {
		const gameEvent = new GameEvent(
			this.id, this.state, this.topic, this.currentQuestion, this.getLastQuestion(), this.score
		);
		for (const playerId in this.eventListenersByPlayerId) {
			this.eventListenersByPlayerId[playerId].getEventListener().onGameChanged(gameEvent);
		}
	}

	finishQuestion() {
		if (this.currentQuestion != null) {
			this.currentQuestion = null;
			
			if (!this.unusedQuestions.length) {
				this.state = GameState.FINISH;
			} else {
				this.state = GameState.BETWEEN_QUESTIONS;
			}

			this.computeScore();
			this.gameChanged();
		}
	}

	allPlayerAnswered(question: Question, playerIds: string[]): boolean {
		const answeredPlayerIds = question.getAnsweredPlayerIds();
		for (const playerId of playerIds) {
			if (!answeredPlayerIds.includes(playerId)) {
				return false;
			}
		}
		return true;
	}

	getPlayerIds(): string[] {
		const playerIds = []
		for (const player of Object.values(this.eventListenersByPlayerId)) {
			if (!player.isSpectator()) {
				playerIds.push(player.playerId);
			}
		}
		return playerIds;
	}

	getLastQuestion(): Question | null {
		return !this.usedQuestions.length ? null : this.usedQuestions[this.usedQuestions.length - 1];
	}

	computeScore(): { [key: string]: number; } {
		this.score = {};
		for (const playerId of this.getPlayerIds()) {
			this.score[playerId] = 0
		}
		for (const question of this.usedQuestions) {
			if (question !== this.currentQuestion) {
				const score = question.getScore();
				for (const playerId in this.score) {
					if (playerId in score) {
						this.score[playerId] += score[playerId];
					}
				}
			}
		}
		return this.score;
	}
}
