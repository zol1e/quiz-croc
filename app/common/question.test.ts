import { describe, it, expect } from 'vitest';
import { Question } from './question';


describe('question', () => {
    it('tip question test', () => {
      const tipQuestion = new Question(
        "1", "Test tip question text?", "https://test-source-url.org", "5", []
      );
      let score = tipQuestion.getScore();
      expect(score).toStrictEqual({});

      let success = tipQuestion.answer("zoli", "5", new Date());
      expect(success).toBeFalsy()

      tipQuestion.start();
      success = tipQuestion.answer("zoli", "5", new Date());
      expect(success).toBeTruthy();
      score = tipQuestion.getScore();
      expect(score).toEqual({"zoli": 100});

      success = tipQuestion.answer("csenge", "6", new Date());
      score = tipQuestion.getScore();
      expect(score).toEqual({"zoli": 100, "csenge": 50});
    });

    it('alternative answers question test', () => {
      const tipQuestion = new Question(
        "1", "Test tip question text?", "https://test source url.org",
        "test answer", ["wrong1", "wrong2", "wrong3", "test answer"]
      );
      let score = tipQuestion.getScore();
      expect(score).toStrictEqual({});

      let success = tipQuestion.answer("zoli", "test answer", new Date());
      expect(success).toBeFalsy()

      tipQuestion.start();
      success = tipQuestion.answer("zoli", "test answer", new Date());
      expect(success).toBeTruthy();
      score = tipQuestion.getScore();
      expect(score).toEqual({"zoli": 100});

      success = tipQuestion.answer("csenge", "wrong2", new Date());
      score = tipQuestion.getScore();
      expect(score).toEqual({"zoli": 100, "csenge": 0});
    });
});
