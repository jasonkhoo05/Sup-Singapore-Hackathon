import { describe, expect, it } from "vitest";
import { analyzeChatGPTExport, parseLearningProfile } from "@/lib/chatgpt-import";

const exportFixture = [
  {
    title: "Learning recursion",
    create_time: 1_700_000_000,
    mapping: {
      root: { message: null },
      one: {
        message: {
          author: { role: "user" },
          create_time: 1_700_000_010,
          content: { parts: ["Explain recursion step-by-step with a real-world example. Why does a base case matter?"] },
        },
      },
      two: {
        message: {
          author: { role: "assistant" },
          content: { parts: ["An assistant response that must not shape the learner profile."] },
        },
      },
    },
  },
  {
    title: "More algorithms",
    create_time: 1_710_000_000,
    mapping: {
      three: {
        message: {
          author: { role: "user" },
          content: { parts: ["Walk me through a recursion example, step by step, and break it down. Then give me a practice quiz about recursion."] },
        },
      },
    },
  },
];

describe("ChatGPT export analysis", () => {
  it("extracts only user messages and creates useful learning signals", () => {
    const profile = analyzeChatGPTExport(exportFixture, "export.zip");

    expect(profile.conversationCount).toBe(2);
    expect(profile.userMessageCount).toBe(2);
    expect(profile.learningPromptRate).toBe(100);
    expect(profile.preferences.explanationStyle.value).toBe("Step-by-step");
    expect(profile.preferences.reinforcement.value).toBe("Practice questions");
    expect(profile.topTopics).toContain("Recursion");
    expect(profile.dateRange?.from).toBe("2023-11-14T22:13:20.000Z");
  });

  it("rejects files that are not a ChatGPT conversation list", () => {
    expect(() => analyzeChatGPTExport({ conversations: [] })).toThrow(/conversation list/);
    expect(() => analyzeChatGPTExport([])).toThrow(/No student messages/);
  });

  it("safely restores only valid saved profiles", () => {
    const profile = analyzeChatGPTExport(exportFixture);
    expect(parseLearningProfile(JSON.stringify(profile))).toEqual(profile);
    expect(parseLearningProfile("not-json")).toBeNull();
    expect(parseLearningProfile(JSON.stringify({ schemaVersion: 2 }))).toBeNull();
  });
});
