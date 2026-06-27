import { describe, expect, it } from "vitest";
import {
  applyQuizResult,
  getLearnerLevel,
  initialDemoState,
  parseStoredState,
  scoreQuiz,
} from "@/lib/demo-state";

describe("demo state", () => {
  it("starts Maya in the struggling learner state", () => {
    expect(initialDemoState.mastery).toBe(42);
    expect(getLearnerLevel(initialDemoState.mastery)).toBe("struggling");
  });

  it("promotes a learner when mastery reaches 80", () => {
    expect(getLearnerLevel(79)).toBe("struggling");
    expect(getLearnerLevel(80)).toBe("ready");
    expect(getLearnerLevel(95)).toBe("advanced");
  });

  it("scores a five-question mastery check", () => {
    const key = { q1: 1, q2: 0, q3: 1, q4: 2, q5: 1 };
    const answers = { q1: 1, q2: 0, q3: 1, q4: 2, q5: 0 };
    expect(scoreQuiz(answers, key)).toBe(80);
  });

  it("keeps the learner's best score across attempts", () => {
    const mastered = applyQuizResult(initialDemoState, 100);
    const lowerRetry = applyQuizResult(mastered, 60);
    expect(lowerRetry.mastery).toBe(100);
    expect(lowerRetry.quizAttempts).toBe(2);
  });

  it("restores valid persisted state", () => {
    const persisted = { ...initialDemoState, mastery: 80, quizAttempts: 1 };
    expect(parseStoredState(JSON.stringify(persisted))).toEqual(persisted);
  });

  it("falls back safely when persisted state is invalid", () => {
    expect(parseStoredState("not-json")).toEqual(initialDemoState);
    expect(parseStoredState(JSON.stringify({ schemaVersion: 2 }))).toEqual(initialDemoState);
  });
});
