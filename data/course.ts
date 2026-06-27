import type {
  LectureSection,
  LecturerInsight,
  QuizQuestion,
  TopicDependency,
} from "@/lib/types";

export const lectureSections: LectureSection[] = [
  {
    id: "mental-model",
    eyebrow: "Core idea",
    title: "A function that solves a smaller version of itself",
    original:
      "Recursion is a computational technique in which a function invokes itself on a structurally reduced input until a terminating condition is satisfied, after which the suspended invocations resolve in reverse order.",
    simplified:
      "Recursion is when a function calls itself with a smaller problem. Each call waits until the smallest problem is solved, then the answers return back up the chain.",
    keyIdea: "Make the problem smaller each time, and always define where to stop.",
  },
  {
    id: "base-case",
    eyebrow: "Safety rule",
    title: "The base case stops the loop",
    original:
      "Every recursive definition requires at least one non-recursive branch whose predicate eventually becomes true; without it, invocation frames accumulate until the runtime exhausts its call stack.",
    simplified:
      "Every recursive function needs a base case: a simple answer that does not call the function again. Without it, the calls continue until the program crashes.",
    keyIdea: "Ask: what is the smallest input I can answer immediately?",
  },
];

export const dependencies: TopicDependency[] = [
  {
    id: "functions",
    title: "Functions",
    relation: "prerequisite",
    description: "Inputs, returns, and local variables",
  },
  {
    id: "stack",
    title: "Stack frames",
    relation: "prerequisite",
    description: "How calls wait for one another",
  },
  {
    id: "recursion",
    title: "Recursion",
    relation: "current",
    description: "Base cases and smaller subproblems",
  },
  {
    id: "trees",
    title: "Tree traversal",
    relation: "future",
    description: "Visit every branch and node",
  },
  {
    id: "divide",
    title: "Divide & conquer",
    relation: "future",
    description: "Split large problems into smaller ones",
  },
  {
    id: "dfs",
    title: "Depth-first search",
    relation: "future",
    description: "Explore one path before the next",
  },
  {
    id: "dynamic",
    title: "Dynamic programming",
    relation: "future",
    description: "Reuse answers to repeated subproblems",
  },
];

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "What is the main job of a base case?",
    options: [
      "Make the function run faster",
      "Stop the recursive calls",
      "Store every previous answer",
      "Create a new function",
    ],
    answer: 1,
    explanation: "The base case returns an answer without making another recursive call.",
  },
  {
    id: "q2",
    prompt: "What should happen to the input on each recursive call?",
    options: [
      "It should move closer to the base case",
      "It should always double",
      "It must stay unchanged",
      "It should become random",
    ],
    answer: 0,
    explanation: "Progress toward the base case is what guarantees the calls eventually stop.",
  },
  {
    id: "q3",
    prompt: "For factorial(n), which is a sensible base case?",
    options: ["n < 100", "n === 1", "n > 1", "n is even"],
    answer: 1,
    explanation: "factorial(1) can be answered immediately as 1.",
  },
  {
    id: "q4",
    prompt: "When factorial(3) calls factorial(2), what happens to factorial(3)?",
    options: [
      "It is deleted",
      "It restarts from the beginning",
      "It waits on the call stack",
      "It becomes the base case",
    ],
    answer: 2,
    explanation: "Its stack frame waits until factorial(2) returns a value.",
  },
  {
    id: "q5",
    prompt: "Which future topic most directly uses recursion to explore branches?",
    options: ["CSS layout", "Tree traversal", "SQL joins", "Encryption keys"],
    answer: 1,
    explanation: "Tree traversal naturally repeats the same visit operation on smaller subtrees.",
  },
];

export const lecturerInsights: LecturerInsight[] = [
  {
    label: "Class mastery",
    value: "68%",
    detail: "+9% after adaptive explanations",
    tone: "green",
  },
  {
    label: "Needs attention",
    value: "14",
    detail: "students below the mastery threshold",
    tone: "red",
  },
  {
    label: "Content adapted",
    value: "37",
    detail: "explanations tailored this week",
    tone: "blue",
  },
  {
    label: "Time returned",
    value: "4.2h",
    detail: "estimated lecturer preparation saved",
    tone: "amber",
  },
];

export const classDistribution = [
  { label: "Building foundations", value: 18, color: "var(--red)" },
  { label: "On track", value: 57, color: "var(--navy)" },
  { label: "Ready for enrichment", value: 25, color: "var(--green)" },
];
