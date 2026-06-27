export type LearnerLevel = "struggling" | "ready" | "advanced";

export type FeaturePreferences = {
  enabled: boolean;
  simplifyContent: boolean;
  visualizations: boolean;
  enrichment: boolean;
};

export type DemoState = {
  schemaVersion: 1;
  mastery: number;
  quizAttempts: number;
  preferences: FeaturePreferences;
};

export type LectureSection = {
  id: string;
  eyebrow: string;
  title: string;
  original: string;
  simplified: string;
  keyIdea: string;
};

export type TopicDependency = {
  id: string;
  title: string;
  relation: "prerequisite" | "current" | "future";
  description: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type LecturerInsight = {
  label: string;
  value: string;
  detail: string;
  tone: "red" | "amber" | "green" | "blue";
};
