import { GameEvent, GameState } from "~/common/game-event";
import { GameEventListener } from "./game-event-listener";
import { TimeScheduler } from "./time-scheduler";
import { describe, expect, test } from "vitest";
import { Question } from "~/common/question";
import { Games } from "./games";


class TestGameEventListener implements GameEventListener {

	onGameChanged(gameEvent: GameEvent): void {
		console.log(gameEvent);
	}
	
}


class TestTimeScheduler implements TimeScheduler {

  last_schedule_callback: (() => void) | null = null;
  delay: number | null = null;

  schedule(callback: () => void, delay: number): void {
    this.callLastCallback = callback;
    this.delay = delay;
  }

  callLastCallback() {
    if (this.last_schedule_callback) this.last_schedule_callback();
  }

}


describe('Game test', () => {

  test('Simple game test', () => {
    const masterEventListener = new TestGameEventListener();
    const q1 = new Question("1", "Hány éves Berta?", null, "4", []);
    const q2 = new Question("2", "Ki a nagyobb?", null, "Berta", ["Berta", "Zénó"]);
    const q3 = new Question("3", "Ki a kisebb?", null, "Zénó", ["Berta", "Zénó"]);

    const testTimeScheduler = new TestTimeScheduler();
    const games = Games.get()
    games.timeScheduler = testTimeScheduler;

    const game = Games.get().createGame("family", [q1, q2, q3]);
    Games.get().joinGame("zoli", game.id, masterEventListener);

    expect(Games.get().hasGame(game.id)).toBeTruthy();
    expect(game.unusedQuestions.length).toBe(3);

    expect(game.getPlayerIds()).toStrictEqual(["zoli"]);

    game.addPlayer("Game Master", masterEventListener);
    expect(game.getPlayerIds()).toStrictEqual(["zoli", "Game Master"]);
    game.setSpectator("Game Master", true);

    expect(game.getPlayerIds()).toStrictEqual(["zoli"]);
    
    game.addPlayer("csenge", masterEventListener);
    expect(game.getPlayerIds()).toStrictEqual(["zoli", "csenge"]);

    expect(game.score).toStrictEqual({"zoli": 0, "csenge": 0});

    games.nextQuestion(game.id);
    expect(game.currentQuestion?.id).toBe("1");
    expect(game.state).toBe(GameState.QUESTION);

    games.answer("zoli", game.id, game.currentQuestion?.id as string, "3");
    expect(game.state).toBe(GameState.QUESTION);
    games.answer("csenge", game.id, game.currentQuestion?.id as string, "4");
    expect(game.state).toBe(GameState.BETWEEN_QUESTIONS);

    expect(game.score).toStrictEqual({"zoli": 50, "csenge": 100});

    games.nextQuestion(game.id);
    expect(game.currentQuestion?.id).toBe("2");
    expect(game.state).toBe(GameState.QUESTION);

    games.answer("zoli", game.id, game.currentQuestion?.id as string, "Zénó");
    expect(game.state).toBe(GameState.QUESTION);
    games.answer("csenge", game.id, game.currentQuestion?.id as string, "Berta");
    expect(game.state).toBe(GameState.BETWEEN_QUESTIONS);

    expect(game.score["zoli"]).toStrictEqual(50);
    expect(game.score["csenge"]).toStrictEqual(200);

    games.nextQuestion(game.id);
    expect(game.currentQuestion?.id as string).toBe("3");
    expect(game.state).toBe(GameState.QUESTION);

    games.answer("zoli", game.id, game.currentQuestion?.id as string, "Zénó");
    expect(game.state).toBe(GameState.QUESTION);
    games.answer("csenge", game.id, game.currentQuestion?.id as string, "Zénó");
    expect(game.state).toBe(GameState.FINISH);

    expect(game.score).toStrictEqual({"zoli": 150, "csenge": 250});

    testTimeScheduler.callLastCallback();
    expect(game.state).toBe(GameState.FINISH);
  });

});
