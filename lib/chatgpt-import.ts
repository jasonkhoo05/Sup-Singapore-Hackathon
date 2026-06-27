import { strFromU8, unzipSync } from "fflate";
import type { LearningPreference, LearningProfile } from "@/lib/types";

export const LEARNING_PROFILE_KEY = "learnpath-chatgpt-profile-v1";
export const MAX_EXPORT_BYTES = 100 * 1024 * 1024;

type ExportMessage = {
  text: string;
  createdAt: number | null;
};

type ConversationLike = {
  create_time?: unknown;
  mapping?: unknown;
};

const STOP_WORDS = new Set([
  "about", "after", "again", "also", "because", "before", "being", "between", "can", "could",
  "does", "doing", "each", "from", "have", "help", "into", "just", "like", "make", "more", "much",
  "need", "please", "should", "some", "than", "that", "their", "them", "then", "there", "these", "they",
  "this", "through", "using", "very", "want", "what", "when", "where", "which", "while", "with", "would",
  "write", "your", "you", "explain", "tell", "show", "give", "answer", "question", "chatgpt",
]);

const LEARNING_MARKERS = /\b(explain|learn|understand|why|how|example|analogy|step[- ]by[- ]step|quiz|practice|teach|compare|summari[sz]e|break down|walk me through)\b/i;

export async function analyzeChatGPTFile(file: File): Promise<LearningProfile> {
  if (file.size > MAX_EXPORT_BYTES) {
    throw new Error("That export is over 100 MB. Try uploading conversations.json from inside the export instead.");
  }

  const lowerName = file.name.toLowerCase();
  let jsonText: string;

  if (lowerName.endsWith(".zip")) {
    let files: Record<string, Uint8Array>;
    let conversationsTooLarge = false;
    try {
      files = unzipSync(new Uint8Array(await file.arrayBuffer()), {
        filter: (entry) => {
          if (!entry.name.toLowerCase().endsWith("conversations.json")) return false;
          if (entry.originalSize > MAX_EXPORT_BYTES) {
            conversationsTooLarge = true;
            return false;
          }
          return true;
        },
      });
    } catch {
      throw new Error("We could not open that ZIP file. Download a fresh ChatGPT export and try again.");
    }
    if (conversationsTooLarge) {
      throw new Error("conversations.json is over 100 MB. Use a smaller export before importing it.");
    }
    const entry = Object.entries(files).find(([name]) => name.toLowerCase().endsWith("conversations.json"));
    if (!entry) throw new Error("This ZIP does not contain conversations.json, so it does not look like a ChatGPT export.");
    jsonText = strFromU8(entry[1]);
  } else if (lowerName.endsWith(".json")) {
    jsonText = await file.text();
  } else {
    throw new Error("Choose a ChatGPT export ZIP or its conversations.json file.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("The conversations file is not valid JSON.");
  }

  return analyzeChatGPTExport(parsed, file.name);
}

export function analyzeChatGPTExport(value: unknown, sourceFile = "conversations.json"): LearningProfile {
  if (!Array.isArray(value)) {
    throw new Error("The file does not contain the conversation list expected in a ChatGPT export.");
  }

  const messages: ExportMessage[] = [];
  const dates: number[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const conversation = item as ConversationLike;
    const conversationDate = asTimestamp(conversation.create_time);
    if (conversationDate !== null) dates.push(conversationDate);
    if (!conversation.mapping || typeof conversation.mapping !== "object") continue;

    for (const node of Object.values(conversation.mapping as Record<string, unknown>)) {
      if (!node || typeof node !== "object") continue;
      const message = (node as { message?: unknown }).message;
      if (!message || typeof message !== "object") continue;
      const record = message as {
        author?: { role?: unknown };
        content?: { parts?: unknown };
        create_time?: unknown;
      };
      if (record.author?.role !== "user" || !Array.isArray(record.content?.parts)) continue;
      const text = record.content.parts.filter((part): part is string => typeof part === "string").join(" ").trim();
      if (!text) continue;
      const createdAt = asTimestamp(record.create_time) ?? conversationDate;
      if (createdAt !== null) dates.push(createdAt);
      messages.push({ text, createdAt });
    }
  }

  if (messages.length === 0) {
    throw new Error("No student messages were found in this export.");
  }

  const text = messages.map((message) => message.text).join("\n");
  const wordCount = text.match(/[\p{L}\p{N}][\p{L}\p{N}'-]*/gu)?.length ?? 0;
  const counts = {
    steps: countMatches(text, /step[- ]by[- ]step|walk me through|break (?:it|this) down|how (?:do|does|can|to)\b/gi),
    examples: countMatches(text, /\bexample|analogy|real[- ]world|use case|show me\b/gi),
    conceptual: countMatches(text, /\bwhy|intuition|concept|understand|mental model|fundamental\b/gi),
    concise: countMatches(text, /\bconcise|brief|short answer|tldr|tl;dr|in one sentence|summari[sz]e\b/gi),
    deep: countMatches(text, /\bdetailed|in depth|deep dive|thorough|elaborate|why exactly\b/gi),
    practice: countMatches(text, /\bquiz|practice|exercise|test me|questions? to solve|flashcards?\b/gi),
    visual: countMatches(text, /\bdiagram|visual|chart|flowchart|draw|illustrat\w*\b/gi),
    applied: countMatches(text, /\bapply|project|scenario|case study|real[- ]world|use case\b/gi),
  };

  const learningMessages = messages.filter((message) => LEARNING_MARKERS.test(message.text)).length;
  const timestamps = dates.filter((date) => Number.isFinite(date)).sort((a, b) => a - b);

  return {
    schemaVersion: 1,
    sourceFile,
    importedAt: new Date().toISOString(),
    conversationCount: value.filter((item) => item && typeof item === "object").length,
    userMessageCount: messages.length,
    wordCount,
    dateRange: timestamps.length
      ? { from: new Date(timestamps[0]).toISOString(), to: new Date(timestamps[timestamps.length - 1]).toISOString() }
      : null,
    topTopics: extractTopics(text),
    learningPromptRate: Math.round((learningMessages / messages.length) * 100),
    preferences: {
      explanationStyle: choosePreference(
        [
          [counts.steps, "Step-by-step", "You often ask for processes to be broken into smaller steps."],
          [counts.examples, "Example-led", "You frequently ask for examples, analogies, or real-world cases."],
          [counts.conceptual, "Concept-first", "You often probe the why and the underlying mental model."],
        ],
        ["Balanced explanations", "Your prompts mix procedural, example-led, and conceptual learning."],
      ),
      detailLevel: counts.concise > counts.deep
        ? preference("Detail level", "Concise first", "You more often request short summaries than deep dives.")
        : counts.deep > counts.concise
          ? preference("Detail level", "Deep dives", "You more often ask for thorough detail and elaboration.")
          : preference("Detail level", "Layered detail", "Start with the core idea, then reveal deeper detail when useful."),
      reinforcement: choosePreference(
        [
          [counts.practice, "Practice questions", "Your history includes requests for quizzes, exercises, or self-testing."],
          [counts.visual, "Visual support", "You often request diagrams, charts, or other visual explanations."],
          [counts.applied, "Applied scenarios", "You tend to reinforce ideas through projects and real-world situations."],
        ],
        ["Mixed reinforcement", "Use a blend of checks, visuals, and applications to reinforce new ideas."],
      ),
    },
  };
}

export function parseLearningProfile(value: string | null): LearningProfile | null {
  if (!value) return null;
  try {
    const profile = JSON.parse(value) as Partial<LearningProfile>;
    if (
      profile.schemaVersion !== 1 ||
      typeof profile.sourceFile !== "string" ||
      typeof profile.importedAt !== "string" ||
      typeof profile.conversationCount !== "number" ||
      typeof profile.userMessageCount !== "number" ||
      typeof profile.wordCount !== "number" ||
      !Array.isArray(profile.topTopics) ||
      typeof profile.learningPromptRate !== "number" ||
      !profile.preferences
    ) return null;
    return profile as LearningProfile;
  } catch {
    return null;
  }
}

function asTimestamp(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const milliseconds = value < 10_000_000_000 ? value * 1000 : value;
  return Number.isFinite(new Date(milliseconds).getTime()) ? milliseconds : null;
}

function countMatches(text: string, pattern: RegExp) {
  return text.match(pattern)?.length ?? 0;
}

function preference(label: string, value: string, evidence: string): LearningPreference {
  return { label, value, evidence };
}

function choosePreference(
  options: Array<[number, string, string]>,
  fallback: [string, string],
): LearningPreference {
  const ranked = [...options].sort((a, b) => b[0] - a[0]);
  if (ranked[0][0] === 0 || ranked[0][0] === ranked[1][0]) {
    return preference("Learning style", fallback[0], fallback[1]);
  }
  return preference("Learning style", ranked[0][1], ranked[0][2]);
}

function extractTopics(text: string) {
  const frequencies = new Map<string, number>();
  const words = text.toLowerCase().match(/[\p{L}][\p{L}\p{N}+#.-]{3,}/gu) ?? [];
  for (const raw of words) {
    const word = raw.replace(/^[.-]+|[.-]+$/g, "");
    if (word.length < 4 || STOP_WORDS.has(word) || /^https?/.test(word) || /^\d+$/.test(word)) continue;
    frequencies.set(word, (frequencies.get(word) ?? 0) + 1);
  }
  return [...frequencies.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 6)
    .map(([word]) => word.replace(/\b\w/g, (letter) => letter.toUpperCase()));
}
