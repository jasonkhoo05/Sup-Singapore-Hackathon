import type { DemoState, FeaturePreferences, LearnerLevel } from "@/lib/types";

export const STORAGE_KEY = "learnpath-demo-state-v1";
export const MASTERY_THRESHOLD = 80;

export const defaultPreferences: FeaturePreferences = {
  enabled: true,
  simplifyContent: true,
  visualizations: true,
  enrichment: true,
};

export const initialDemoState: DemoState = {
  schemaVersion: 1,
  mastery: 42,
  quizAttempts: 0,
  preferences: defaultPreferences,
};

export function getLearnerLevel(mastery: number): LearnerLevel {
  if (mastery >= 95) return "advanced";
  if (mastery >= MASTERY_THRESHOLD) return "ready";
  return "struggling";
}

export function scoreQuiz(answers: Record<string, number>, answerKey: Record<string, number>) {
  const questionIds = Object.keys(answerKey);
  if (questionIds.length === 0) return 0;
  const correct = questionIds.filter((id) => answers[id] === answerKey[id]).length;
  return Math.round((correct / questionIds.length) * 100);
}

export function applyQuizResult(state: DemoState, score: number): DemoState {
  return {
    ...state,
    mastery: Math.max(state.mastery, score),
    quizAttempts: state.quizAttempts + 1,
  };
}

export function parseStoredState(value: string | null): DemoState {
  if (!value) return initialDemoState;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!isDemoState(parsed)) return initialDemoState;
    return parsed;
  } catch {
    return initialDemoState;
  }
}

function isDemoState(value: unknown): value is DemoState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<DemoState>;
  const preferences = state.preferences as Partial<FeaturePreferences> | undefined;
  return (
    state.schemaVersion === 1 &&
    typeof state.mastery === "number" &&
    state.mastery >= 0 &&
    state.mastery <= 100 &&
    typeof state.quizAttempts === "number" &&
    Number.isInteger(state.quizAttempts) &&
    state.quizAttempts >= 0 &&
    !!preferences &&
    typeof preferences.enabled === "boolean" &&
    typeof preferences.simplifyContent === "boolean" &&
    typeof preferences.visualizations === "boolean" &&
    typeof preferences.enrichment === "boolean"
  );
}
