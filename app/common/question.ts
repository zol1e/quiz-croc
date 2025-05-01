
export class PlayerAnswer {
    constructor(
      public playerId: string,
      public answer: string,
      public answeredAt: Date,
      public timeSpentMillis: number,
      public distanceFromCorrect: number
    ) {}
  
    isCorrect(): boolean {
      return this.distanceFromCorrect === 0;
    }
}


export class Question {

    public score: number = 100;
    public timeMillis: number = 20000;
    public playerAnswers: { [key: string]: PlayerAnswer } = {};
    public startedAt: Date | null = null;
    public finishTime: Date | null = null;

    constructor(
      public id: string,
      public text: string,
      public sourceUrl: string | null,
      public correctAnswer: string,
      public alternativeAnswers: string[],
    ) {}
  
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
  
    getScore(): Record<string, number> {
      const score: Record<string, number> = {};
      const answersSorted = Object.values(this.playerAnswers)
        .sort((a, b) => new Date(a.answeredAt).getTime() - new Date(b.answeredAt).getTime())
        .sort((a, b) => a.distanceFromCorrect - b.distanceFromCorrect);

      let place = 1;
      for (const answer of answersSorted) {
        if (this.hasAlternativeAnswers()) {
          score[answer.playerId] = answer.isCorrect() ? this.score / place : 0;
        } else {
          score[answer.playerId] = this.score / place;
        }
        place++;
      }
    
      return score;
    }
}
