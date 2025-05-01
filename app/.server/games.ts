import * as crypto from "node:crypto";
import { Game } from "./game";
import { GameEventListener } from "./game-event-listener";
import { SetTimeoutTimeScheduler, TimeScheduler } from "./time-scheduler";
import { Question } from "~/common/question";


// TRICK to reach server side singleton from client code:
// https://remix.run/docs/en/main/guides/manual-mode#keeping-in-memory-server-state-across-rebuilds
export const singleton = <Value>(
	name: string,
	valueFactory: () => Value
  ): Value => {
	const g = global as any;
	g.__singletons ??= {};
	g.__singletons[name] ??= valueFactory();
	return g.__singletons[name];
  };


export class Games {

	public constructor() {}
    public static get() {
        return games;
    }

	gamesById: { [key: string]: Game; } = {};
	timeScheduler: TimeScheduler = new SetTimeoutTimeScheduler();

	createGame(topic: string, questions: Question[]): Game {
		const gameId = this.generateUniqueId();
		const game = new Game(gameId, topic, questions, this.timeScheduler);
		this.addGame(game);
		return game;
	}

	setSpectator(playerId: string, gameId: string, spectator: boolean) {
		this.getGame(gameId).setSpectator(playerId, spectator);
	}

	joinGame(playerId: string, gameId: string, gameEventListener: GameEventListener): Game | null {
		if (this.hasGame(gameId)) {
			return this.getGame(gameId).addPlayer(playerId, gameEventListener);
		} else {
			return null;
		}
	}

	nextQuestion(gameId: string): void {
		if (this.hasGame(gameId)) {
			this.getGame(gameId).nextQuestion();
		}
	}
	
	answer(playerId: string, gameId: string, questionId: string, answer: string): boolean {
		if (this.hasGame(gameId)) {
			return this.getGame(gameId).answer(playerId, questionId, answer);
		} else {
			return false;
		}
	}

	getGame(gameId: string): Game {
		return this.gamesById[gameId];
	}

	hasGame(gameId: string): boolean {
		return gameId in this.gamesById;
	}

	private addGame(game: Game): void {
		this.gamesById[game.id] = game;
	}

	private generateUniqueId(): string {
		let newId = this.generateId();
		while (newId in this.gamesById) {
			newId = this.generateId();
		}
		return newId;
	}

	private generateId(): string {
		return crypto.randomBytes(3).toString('hex');
	}
}


// TRICK to reach server side singleton from client code:
// https://remix.run/docs/en/main/guides/manual-mode#keeping-in-memory-server-state-across-rebuilds
export const games = singleton(
	"games",
	() => new Games()
);
