import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { BiologyLesson } from "@/components/biology-lesson";
import { CourseHome } from "@/components/course-home";
import { LearnPathApp } from "@/components/learnpath-app";

describe("CourseHome", () => {
  it("links both current course modules to their lessons", () => {
    render(<CourseHome />);
    expect(screen.getByRole("heading", { name: "Good afternoon, Maya." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "FIT1008 Module 04: Recursion" })).toHaveAttribute("href", "/fit1008/recursion");
    expect(screen.getByRole("link", { name: "BIO2026 Module 02: Digestion" })).toHaveAttribute("href", "/biology/digestion");
  });
});

describe("shared navigation", () => {
  it.each([
    ["courses", <CourseHome />],
    ["recursion", <LearnPathApp />],
    ["biology", <BiologyLesson />],
  ])("shows the same menu on the %s page without a BIO2026 shortcut", (_page, component) => {
    const { unmount } = render(component);
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));

    const menu = screen.getByRole("navigation", { name: "Navigation menu" });
    expect(within(menu).getByText("All courses")).toBeInTheDocument();
    expect(within(menu).getByText("Student learning")).toBeInTheDocument();
    expect(within(menu).getByText("Lecturer insights")).toBeInTheDocument();
    expect(within(menu).getByText("Agent settings")).toBeInTheDocument();
    expect(within(menu).queryByText(/BIO2026|Digestion/)).not.toBeInTheDocument();
    unmount();
  });
});

describe("LearnPathApp", () => {
  beforeEach(() => window.localStorage.clear());

  it("opens with a transparent, simplified learning path", async () => {
    render(<LearnPathApp />);
    expect(screen.getByText("Thinking recursively")).toBeInTheDocument();
    expect(screen.getByText("Let’s build the mental model first")).toBeInTheDocument();
    expect(screen.getAllByText("Simplified")).toHaveLength(2);
    expect(screen.getByText("Calculate factorial(4)")).toBeInTheDocument();
    expect(screen.getByText("4 needs factorial(3)")).toBeInTheDocument();
    await waitFor(() => expect(window.localStorage.length).toBe(1));
  });

  it("links the settings drawer to the ChatGPT learning profile", () => {
    render(<LearnPathApp />);
    fireEvent.click(screen.getByLabelText("Open LearnPath settings"));
    expect(screen.getByRole("link", { name: /ChatGPT learning profile/ })).toHaveAttribute("href", "/learning-profile");
  });

  it("uses a saved learning profile to explain lesson personalization", async () => {
    window.localStorage.setItem("learnpath-chatgpt-profile-v1", JSON.stringify({
      schemaVersion: 1,
      sourceFile: "export.zip",
      importedAt: "2026-06-27T00:00:00.000Z",
      conversationCount: 12,
      userMessageCount: 30,
      wordCount: 500,
      dateRange: null,
      topTopics: ["Algorithms"],
      learningPromptRate: 70,
      preferences: {
        explanationStyle: { label: "Learning style", value: "Step-by-step", evidence: "Evidence" },
        detailLevel: { label: "Detail level", value: "Layered detail", evidence: "Evidence" },
        reinforcement: { label: "Learning style", value: "Practice questions", evidence: "Evidence" },
      },
    }));

    render(<LearnPathApp />);
    expect(await screen.findByText(/learning profile favors step-by-step explanations with practice questions/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View learning profile" })).toHaveAttribute("href", "/learning-profile");
  });

  it("walks factorial(4) through smaller recursive calls", () => {
    render(<LearnPathApp />);
    const diagram = screen.getByLabelText("Factorial 4 recursive call diagram");
    const factorialFour = within(diagram).getByText("factorial(4)", { exact: true }).closest("[aria-hidden]");
    const factorialThree = within(diagram).getByText("factorial(3)", { exact: true }).closest("[aria-hidden]");
    const secondConnector = within(diagram).getByText("3 needs factorial(2)").closest("[aria-hidden]");
    expect(factorialFour).toHaveAttribute("aria-hidden", "false");
    expect(factorialThree).toHaveAttribute("aria-hidden", "true");
    expect(secondConnector).toHaveAttribute("aria-hidden", "true");
    fireEvent.click(screen.getByLabelText("Next visualization step"));
    expect(factorialThree).toHaveAttribute("aria-hidden", "false");
    expect(secondConnector).toHaveAttribute("aria-hidden", "false");
    expect(screen.getByText("Reduce the input to 3")).toBeInTheDocument();
    expect(screen.getByText("factorial(3) = 3 × factorial(2)")).toBeInTheDocument();
  });

  it("reveals the digestive system one organ at a time", async () => {
    render(<BiologyLesson />);
    expect(screen.getByText("From food to fuel")).toBeInTheDocument();
    expect(screen.getAllByText("BIO2026").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "02 Digestion" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Digestion/ })).not.toBeInTheDocument();
    expect(screen.getByText("Digestion", { selector: "[aria-current='page'] span" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText("54%").length).toBeGreaterThan(0));
    expect(screen.getByText("What happens after you swallow?")).toBeInTheDocument();

    const visual = screen.getByRole("region", { name: "What happens after you swallow?" });
    expect(within(visual).getByRole("img", { name: "Pixel art digestive system from the oesophagus to the rectum" })).toBeInTheDocument();
    expect(within(visual).getByLabelText("Food is now in the oesophagus")).toBeInTheDocument();
    expect(within(visual).getByText("PERISTALSIS · 5–8 SECONDS")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Next digestion step"));
    expect(within(visual).getByLabelText("Food is now in the stomach")).toBeInTheDocument();
    expect(screen.getByText("Food is churned with digestive juices")).toBeInTheDocument();
  });

  it("shows the lecturer's original content when the agent is paused", () => {
    render(<LearnPathApp />);
    fireEvent.click(screen.getByLabelText("Open LearnPath settings"));
    fireEvent.click(screen.getByRole("switch", { name: "Enable LearnPath AI" }));
    fireEvent.click(screen.getByLabelText("Close settings"));
    expect(screen.getByText("LearnPath is paused")).toBeInTheDocument();
    expect(screen.getByText(/computational technique in which a function invokes itself/)).toBeInTheDocument();
  });

  it("switches to lecturer insights", () => {
    render(<LearnPathApp />);
    fireEvent.click(screen.getByRole("button", { name: /Lecturer view/ }));
    expect(screen.getByText(/See where learning gets stuck/)).toBeInTheDocument();
    expect(screen.getByText("ZERO EXTRA AUTHORING")).toBeInTheDocument();
  });
});
