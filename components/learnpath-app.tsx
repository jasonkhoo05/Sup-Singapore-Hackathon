"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Eye,
  GraduationCap,
  Lightbulb,
  LockKeyhole,
  Pause,
  Play,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import {
  classDistribution,
  dependencies,
  lectureSections,
  lecturerInsights,
  quizQuestions,
} from "@/data/course";
import {
  applyQuizResult,
  defaultPreferences,
  getLearnerLevel,
  initialDemoState,
  MASTERY_THRESHOLD,
  parseStoredState,
  scoreQuiz,
  STORAGE_KEY,
} from "@/lib/demo-state";
import type { DemoState, FeaturePreferences, LecturerInsight } from "@/lib/types";

type View = "learn" | "lecturer";
type ContentMode = "adapted" | "original";

export function LearnPathApp() {
  const [view, setView] = useState<View>("learn");
  const [state, setState] = useState<DemoState>(initialDemoState);
  const [hydrated, setHydrated] = useState(false);
  const [contentMode, setContentMode] = useState<ContentMode>("adapted");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setState(parseStoredState(window.localStorage.getItem(STORAGE_KEY)));
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("view") === "lecturer") setView("lecturer");
    if (searchParams.get("settings") === "open") setSettingsOpen(true);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const answerKey = useMemo(
    () => Object.fromEntries(quizQuestions.map((question) => [question.id, question.answer])),
    [],
  );
  const level = getLearnerLevel(state.mastery);
  const adaptiveMode = state.preferences.enabled && state.preferences.simplifyContent;
  const showAdapted = adaptiveMode && contentMode === "adapted";
  const hasMastered = state.mastery >= MASTERY_THRESHOLD;

  function updatePreference(key: keyof FeaturePreferences, value: boolean) {
    setState((current) => ({
      ...current,
      preferences: { ...current.preferences, [key]: value },
    }));
  }

  function submitQuiz() {
    if (Object.keys(answers).length !== quizQuestions.length) {
      setToast("Answer all five questions before checking your mastery.");
      return;
    }
    const score = scoreQuiz(answers, answerKey);
    setQuizScore(score);
    setState((current) => applyQuizResult(current, score));
    setToast(
      score >= MASTERY_THRESHOLD
        ? "Mastery reached — new pathways are now open."
        : "LearnPath has adjusted your next review step.",
    );
    window.setTimeout(() => {
      document.getElementById("quiz-result")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }

  function retryQuiz() {
    setAnswers({});
    setQuizScore(null);
    document.getElementById("mastery-check")?.scrollIntoView({ behavior: "smooth" });
  }

  function resetDemo() {
    setState({ ...initialDemoState, preferences: { ...defaultPreferences } });
    setAnswers({});
    setQuizScore(null);
    setContentMode("adapted");
    setView("learn");
    window.localStorage.removeItem(STORAGE_KEY);
    setToast("Demo reset to Maya’s starting point.");
  }

  function switchView(next: View) {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app-shell">
      <AppHeader
        activeSection={view}
        agentActive={state.preferences.enabled}
        onOpenSettings={() => setSettingsOpen(true)}
        onSelectSection={switchView}
      />

      {view === "learn" ? (
        <StudentView
          state={state}
          level={level}
          showAdapted={showAdapted}
          adaptiveMode={adaptiveMode}
          contentMode={contentMode}
          setContentMode={setContentMode}
          answers={answers}
          setAnswers={setAnswers}
          quizScore={quizScore}
          submitQuiz={submitQuiz}
          retryQuiz={retryQuiz}
          hasMastered={hasMastered}
          openSettings={() => setSettingsOpen(true)}
        />
      ) : (
        <LecturerView resetDemo={resetDemo} />
      )}

      {settingsOpen && (
        <SettingsDrawer
          preferences={state.preferences}
          updatePreference={updatePreference}
          close={() => setSettingsOpen(false)}
          resetDemo={resetDemo}
        />
      )}

      {toast && <div className="toast" role="status"><CheckCircle2 size={18} /> {toast}</div>}
    </div>
  );
}

type StudentViewProps = {
  state: DemoState;
  level: ReturnType<typeof getLearnerLevel>;
  showAdapted: boolean;
  adaptiveMode: boolean;
  contentMode: ContentMode;
  setContentMode: (mode: ContentMode) => void;
  answers: Record<string, number>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  quizScore: number | null;
  submitQuiz: () => void;
  retryQuiz: () => void;
  hasMastered: boolean;
  openSettings: () => void;
};

function StudentView({
  state,
  level,
  showAdapted,
  adaptiveMode,
  contentMode,
  setContentMode,
  answers,
  setAnswers,
  quizScore,
  submitQuiz,
  retryQuiz,
  hasMastered,
  openSettings,
}: StudentViewProps) {
  return (
    <div className="student-layout">
      <aside className="course-sidebar">
        <a className="back-link" href="#"><ArrowLeft size={15} /> My courses</a>
        <div className="course-code">FIT1008</div>
        <h2>Introduction to Algorithms</h2>
        <div className="course-progress">
          <div className="progress-copy"><span>Course progress</span><strong>38%</strong></div>
          <div className="progress-track"><span style={{ width: "38%" }} /></div>
        </div>
        <nav className="module-nav" aria-label="Course modules">
          <ModuleItem number="01" title="Algorithm foundations" complete />
          <ModuleItem number="02" title="Complexity & Big O" complete />
          <ModuleItem number="03" title="Stacks & queues" complete />
          <ModuleItem number="04" title="Recursion" active />
          <ModuleItem number="05" title="Trees" locked={!hasMastered} />
          <ModuleItem number="06" title="Sorting" locked />
        </nav>
        <div className="sidebar-note">
          <ShieldCheck size={17} />
          <p><strong>Your learning, your choice.</strong> LearnPath never changes your original course material.</p>
        </div>
      </aside>

      <main className="learning-main">
        <div className="breadcrumbs"><span>FIT1008</span><ChevronRight size={13} /><span>Module 4</span><ChevronRight size={13} /><strong>Recursion</strong></div>
        <div className="lesson-heading">
          <div>
            <span className="lesson-label">Module 04 · 25 min</span>
            <h1>Thinking recursively</h1>
            <p>Understand how a problem can be solved by reducing it into smaller versions of itself.</p>
          </div>
          <button className="save-button"><BookOpen size={16} /> Save lesson</button>
        </div>

        {state.preferences.enabled ? (
          <section className="adaptation-banner" aria-label="LearnPath adaptation">
            <div className="spark-icon"><Sparkles size={21} /></div>
            <div className="adaptation-copy">
              <div className="eyebrow-line"><span>Adapted for you</span><span className="demo-pill">SIMULATED AI</span></div>
              <h2>{level === "struggling" ? "Let’s build the mental model first" : "You’ve built the foundation — let’s go deeper"}</h2>
              <p>{level === "struggling"
                ? "Your last quiz showed that call stacks were unclear. I’ve simplified two explanations and added a visual walkthrough."
                : "Your latest mastery check unlocked the next learning pathways and the challenge section below."}</p>
            </div>
            <div className="confidence-box"><span>Learning confidence</span><strong>{state.mastery}%</strong><TrendingUp size={16} /></div>
          </section>
        ) : (
          <section className="agent-paused-banner">
            <Pause size={18} />
            <div><strong>LearnPath is paused</strong><p>You’re viewing the lecturer’s original course content without adaptations.</p></div>
            <button onClick={openSettings}>Manage settings</button>
          </section>
        )}

        <section className="content-section">
          <div className="section-number">01</div>
          <div className="section-content">
            <div className="section-topline">
              <div><span className="section-kicker">The big idea</span><h2>What recursion actually means</h2></div>
              {adaptiveMode && (
                <div className="content-toggle" aria-label="Explanation version">
                  <button className={contentMode === "adapted" ? "active" : ""} onClick={() => setContentMode("adapted")}><WandSparkles size={14} /> For me</button>
                  <button className={contentMode === "original" ? "active" : ""} onClick={() => setContentMode("original")}><Eye size={14} /> Original</button>
                </div>
              )}
            </div>

            {lectureSections.map((section) => (
              <article className={`explanation-card ${showAdapted ? "adapted" : ""}`} key={section.id}>
                <div className="explanation-meta">
                  <span>{section.eyebrow}</span>
                  {showAdapted && <span className="adapted-tag"><Sparkles size={12} /> Simplified</span>}
                </div>
                <h3>{section.title}</h3>
                <p>{showAdapted ? section.simplified : section.original}</p>
                {showAdapted && <div className="key-idea"><Lightbulb size={17} /><span><strong>Hold onto this:</strong> {section.keyIdea}</span></div>}
              </article>
            ))}
          </div>
        </section>

        {state.preferences.enabled && state.preferences.visualizations ? <PixelVisualizer /> : (
          <section className="feature-placeholder">
            <div><Eye size={19} /><strong>Visual walkthrough hidden</strong><p>Turn visual explanations on in LearnPath settings when you need them.</p></div>
            <button onClick={openSettings}>Open settings</button>
          </section>
        )}

        <DependencyMap hasMastered={hasMastered} />

        <EnrichmentCard enabled={state.preferences.enabled && state.preferences.enrichment} unlocked={hasMastered} openSettings={openSettings} />

        <QuizSection
          answers={answers}
          setAnswers={setAnswers}
          score={quizScore}
          submit={submitQuiz}
          retry={retryQuiz}
          attempts={state.quizAttempts}
        />
      </main>

      <aside className="coach-sidebar">
        <div className="coach-card">
          <div className="coach-title"><div className="coach-orb"><BrainCircuit size={18} /></div><div><span>Your learning guide</span><strong>Why this path?</strong></div></div>
          <p>Based on your recent activity, I’m helping you connect recursion to the call stack before moving on.</p>
          <div className="signal-list">
            <div><span className="signal-icon amber"><Clock3 size={15} /></span><span><strong>2.3× longer</strong> on stack-frame questions</span></div>
            <div><span className="signal-icon red"><CircleHelp size={15} /></span><span><strong>2 attempts</strong> on the base-case activity</span></div>
            <div><span className="signal-icon green"><Check size={15} /></span><span><strong>Strong</strong> understanding of functions</span></div>
          </div>
          <button className="text-button" onClick={openSettings}>Tune my learning path <ArrowRight size={14} /></button>
        </div>

        <div className="mastery-card">
          <div className="mastery-top"><span>Topic mastery</span><strong>{state.mastery}%</strong></div>
          <div className="mastery-track"><span style={{ width: `${state.mastery}%` }} /></div>
          <p>{hasMastered ? "Ready. Your next learning pathways are unlocked." : `${MASTERY_THRESHOLD - state.mastery} more points to unlock Trees.`}</p>
        </div>

        <div className="next-card">
          <span className="mini-label">Up next</span>
          <div className="next-icon">🌳</div>
          <strong>Tree traversal</strong>
          <p>See how recursion explores every branch.</p>
          <span className={hasMastered ? "unlock-chip open" : "unlock-chip"}>{hasMastered ? <Check size={13} /> : <LockKeyhole size={12} />}{hasMastered ? "Unlocked" : `Unlocks at ${MASTERY_THRESHOLD}%`}</span>
        </div>
      </aside>
    </div>
  );
}

function ModuleItem({ number, title, active, complete, locked }: { number: string; title: string; active?: boolean; complete?: boolean; locked?: boolean }) {
  return (
    <button className={`module-item ${active ? "active" : ""}`} disabled={locked}>
      <span className="module-number">{complete ? <Check size={13} /> : locked ? <LockKeyhole size={12} /> : number}</span>
      <span>{title}</span>
      {active && <ChevronRight size={15} />}
    </button>
  );
}

const visualSteps = [
  { active: 0, returning: false, title: "Begin with factorial(4)", detail: "We cannot answer it yet, so we keep the 4 and ask for factorial(3).", equation: "factorial(4) = 4 × factorial(3)" },
  { active: 1, returning: false, title: "Reduce the input to 3", detail: "factorial(4) waits while factorial(3) asks for the smaller factorial(2).", equation: "factorial(3) = 3 × factorial(2)" },
  { active: 2, returning: false, title: "Reduce the input to 2", detail: "factorial(3) waits too. We are now one call away from the stopping point.", equation: "factorial(2) = 2 × factorial(1)" },
  { active: 3, returning: false, title: "Stop at the base case", detail: "factorial(1) is already known: it equals 1. No smaller call is needed.", equation: "factorial(1) = 1" },
  { active: 3, returning: true, title: "Return 1 from the base case", detail: "Now the direction reverses. The answer 1 travels back to factorial(2).", equation: "factorial(1) returns 1" },
  { active: 2, returning: true, title: "Resolve factorial(2)", detail: "Use the returned 1: multiply 2 × 1, then send 2 back to factorial(3).", equation: "factorial(2) = 2 × 1 = 2" },
  { active: 1, returning: true, title: "Resolve factorial(3)", detail: "Use the returned 2: multiply 3 × 2, then send 6 back to factorial(4).", equation: "factorial(3) = 3 × 2 = 6" },
  { active: 0, returning: true, title: "factorial(4) is solved", detail: "Use the returned 6: 4 × 6 gives the final answer, 24.", equation: "factorial(4) = 4 × 6 = 24" },
];

const factorialNodes = [
  { input: 4, result: 24 },
  { input: 3, result: 6 },
  { input: 2, result: 2 },
  { input: 1, result: 1 },
];

function PixelVisualizer() {
  return <FactorialVisualizer />;
}

function FactorialVisualizer() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setStep((current) => {
        if (current === visualSteps.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 1450);
    return () => window.clearInterval(timer);
  }, [playing]);

  const active = visualSteps[step];

  return (
    <section className="visual-section" aria-labelledby="visual-heading-factorial">
      <div className="visual-heading-row">
        <div>
          <span className="section-kicker"><span className="pixel-dot" /> Pixel visual</span>
          <h2 id="visual-heading-factorial">How does factorial(4) become 24?</h2>
          <p>Follow each smaller call to the base case, then watch the answers multiply on the way back.</p>
        </div>
        <span className="generated-label"><Sparkles size={13} /> AI VISUAL · SIMULATED</span>
      </div>
      <div className="pixel-stage">
        <div className="pixel-grid" aria-hidden="true" />
        <div className="factorial-goal">
          <span>WHAT WE’RE DEMONSTRATING</span>
          <strong>Calculate factorial(4)</strong>
          <p>Break <b>4 × 3 × 2 × 1</b> into smaller function calls, then rebuild the answer: <b>24</b>.</p>
        </div>

        <div className={`factorial-flow ${active.returning ? "returning" : "calling"}`} aria-label="Factorial 4 recursive call diagram">
          {factorialNodes.map((node, index) => {
            const reached = !active.returning ? index <= active.active : true;
            const resolved = active.returning && index >= active.active;
            const isActive = index === active.active;
            const connectorRevealed = active.returning || index <= active.active;
            return (
              <div className="flow-piece" key={node.input}>
                <div
                  aria-hidden={!reached}
                  className={`factorial-node ${reached ? "reached" : "concealed"} ${resolved ? "resolved" : ""} ${isActive ? "active" : ""} ${node.input === 1 ? "base" : ""}`}
                >
                  <span>{node.input === 1 ? "BASE CASE" : `n = ${node.input}`}</span>
                  <strong>factorial({node.input})</strong>
                  <small>{resolved ? `returns ${node.result}` : isActive ? "working here" : reached ? "waiting" : "not called yet"}</small>
                </div>
                {index < factorialNodes.length - 1 && (
                  <div
                    aria-hidden={!connectorRevealed}
                    className={`flow-connector ${connectorRevealed ? "" : "concealed"} ${(!active.returning && active.active > index) || (active.returning && active.active <= index) ? "travelled" : ""}`}
                  >
                    <span className="connector-arrow">{active.returning ? <ArrowLeft size={22} /> : <ArrowRight size={22} />}</span>
                    <span className="connector-copy">
                      <strong>{active.returning ? `multiply by ${node.input}` : "subtract 1"}</strong>
                      <small>{active.returning ? `${factorialNodes[index + 1].result} returns to the caller` : `${node.input} needs factorial(${node.input - 1})`}</small>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="visual-step-panel" aria-live="polite">
          <div className="step-badge"><span>{active.returning ? "RETURNING ANSWERS" : "MAKING CALLS"}</span><strong>{step + 1} / {visualSteps.length}</strong></div>
          <div className="visual-copy">
            <h3>{active.title}</h3>
            <p>{active.detail}</p>
            <div className="equation-line">{active.equation}</div>
          </div>
          <div className="visual-controls">
            <button onClick={() => { setPlaying(false); setStep(Math.max(0, step - 1)); }} disabled={step === 0} aria-label="Previous visualization step"><ArrowLeft size={16} /></button>
            <button className="play-button" onClick={() => { if (step === visualSteps.length - 1) setStep(0); setPlaying((value) => !value); }}>
              {playing ? <Pause size={15} /> : <Play size={15} fill="currentColor" />} {playing ? "Pause" : step === visualSteps.length - 1 ? "Replay" : "Play"}
            </button>
            <button onClick={() => { setPlaying(false); setStep(Math.min(visualSteps.length - 1, step + 1)); }} disabled={step === visualSteps.length - 1} aria-label="Next visualization step"><ArrowRight size={16} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

const digestionSteps = [
  { organ: "Oesophagus", x: 49, y: 28, zoom: 2.2, title: "The bolus travels down", detail: "Wave-like muscle contractions squeeze behind the swallowed food and push it toward the stomach.", process: "PERISTALSIS · 5–8 SECONDS", result: "The bolus reaches the stomach" },
  { organ: "Stomach", x: 56, y: 45, zoom: 2.05, title: "Food is churned with digestive juices", detail: "Strong stomach muscles mix food with acid and pepsin, beginning protein digestion.", process: "ACID + PEPSIN + CHURNING", result: "The mixture becomes liquid chyme" },
  { organ: "Small intestine", x: 50, y: 69, zoom: 1.75, title: "Digestion finishes and nutrients leave", detail: "Enzymes complete digestion while villi absorb glucose, amino acids, and fats into blood and lymph.", process: "ENZYMES + VILLI", result: "Useful nutrients enter circulation" },
  { organ: "Large intestine", x: 60, y: 70, zoom: 1.8, title: "Water is recovered", detail: "The large intestine absorbs most remaining water while bacteria act on undigested material.", process: "WATER + ELECTROLYTE ABSORPTION", result: "The remaining material becomes stool" },
  { organ: "Rectum", x: 50, y: 89, zoom: 2.15, title: "Waste is stored before leaving", detail: "The rectum temporarily stores stool. Stretch receptors signal when it is ready to be eliminated.", process: "STORAGE + ELIMINATION SIGNAL", result: "Digestion’s waste pathway is complete" },
];

export function DigestionVisualizer() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [travelling, setTravelling] = useState(false);

  useEffect(() => {
    if (!travelling) return;
    const timer = window.setTimeout(() => setTravelling(false), 1450);
    return () => window.clearTimeout(timer);
  }, [travelling, step]);

  useEffect(() => {
    if (!playing || travelling) return;
    if (step === digestionSteps.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setTravelling(true);
      setStep((current) => Math.min(digestionSteps.length - 1, current + 1));
    }, 1900);
    return () => window.clearTimeout(timer);
  }, [playing, step, travelling]);

  const active = digestionSteps[step];
  const cameraZoom = active.zoom;
  const cameraX = (50 - active.x) * cameraZoom;
  const cameraY = (50 - active.y) * cameraZoom;

  const goToStep = (nextStep: number) => {
    const boundedStep = Math.max(0, Math.min(digestionSteps.length - 1, nextStep));
    setPlaying(false);
    if (boundedStep === step) return;
    setTravelling(true);
    setStep(boundedStep);
  };

  const togglePlayback = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (step === digestionSteps.length - 1) {
      setTravelling(true);
      setStep(0);
    }
    setPlaying(true);
  };

  return (
    <section className="visual-section digestion-visual" aria-labelledby="visual-heading-digestion">
      <div className="visual-heading-row">
        <div>
          <span className="section-kicker"><span className="pixel-dot" /> Pixel visual</span>
          <h2 id="visual-heading-digestion">What happens after you swallow?</h2>
          <p>Watch food travel through five internal views of the digestive tract.</p>
        </div>
        <span className="generated-label"><Sparkles size={13} /> AI VISUAL · SIMULATED</span>
      </div>

      <div className="pixel-stage digestion-stage">
        <div className="pixel-grid" aria-hidden="true" />
        <div className="factorial-goal digestion-goal">
          <span>WHAT WE’RE DEMONSTRATING</span>
          <strong>Follow food inside the body</strong>
          <p>A pixelated animation from the <b>oesophagus</b> to the <b>rectum</b>.</p>
        </div>

        <div className="digestion-cinema">
          <div className={`pixel-film pixel-anatomy-stage ${travelling ? "is-travelling" : "is-focused"}`}>
            <div
              className="pixel-body-camera"
              style={{ transform: `translate(${cameraX}%, ${cameraY}%) scale(${cameraZoom})` }}
            >
              <img className="pixel-body-art" src="/digestion-frames/pixel-digestive-system.png" alt="Pixel art digestive system from the oesophagus to the rectum" />
              <div className="food-sprite" style={{ left: `${active.x}%`, top: `${active.y}%` }} aria-label={`Food is now in the ${active.organ.toLowerCase()}`}><span /><i /></div>
            </div>
            <div className="pixel-scanlines" aria-hidden="true" />
            <div className="film-hud"><span>{travelling ? "CAMERA MOVING TO" : `STAGE ${String(step + 1).padStart(2, "0")} / ${String(digestionSteps.length).padStart(2, "0")}`}</span><strong>{active.organ}</strong><small>{travelling ? "FOLLOWING THE FOOD" : "ORGAN FOCUS"}</small></div>
            <div className="route-status" aria-hidden="true"><span style={{ width: `${((step + 1) / digestionSteps.length) * 100}%` }} /></div>
          </div>

          <div className="digestion-filmstrip" aria-label="Digestion animation stages">
            {digestionSteps.map((scene, index) => (
              <button className={`${index === step ? "active" : ""} ${index < step ? "complete" : ""}`} onClick={() => goToStep(index)} key={scene.organ} aria-label={`Show ${scene.organ} stage`}>
                <span>{index < step ? <Check size={11} /> : String(index + 1).padStart(2, "0")}</span><strong>{scene.organ}</strong>
              </button>
            ))}
          </div>

          <div className="visual-step-panel digestion-cinematic-panel" aria-live="polite">
            <div className="step-badge"><span>DIGESTION PATH</span><strong>{step + 1} / {digestionSteps.length}</strong></div>
            <div className="visual-copy">
              <h3>{active.title}</h3>
              <p>{active.detail}</p>
              <div className="biology-process"><span>PROCESS</span><strong>{active.process}</strong></div>
              <div className="equation-line">→ {active.result}</div>
            </div>
            <div className="visual-controls">
              <button onClick={() => goToStep(step - 1)} disabled={step === 0} aria-label="Previous digestion step"><ArrowLeft size={16} /></button>
              <button className="play-button" onClick={togglePlayback}>
                {playing ? <Pause size={15} /> : <Play size={15} fill="currentColor" />} {playing ? "Pause" : step === digestionSteps.length - 1 ? "Replay" : "Play"}
              </button>
              <button onClick={() => goToStep(step + 1)} disabled={step === digestionSteps.length - 1} aria-label="Next digestion step"><ArrowRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DependencyMap({ hasMastered }: { hasMastered: boolean }) {
  const prerequisites = dependencies.filter((item) => item.relation === "prerequisite");
  const future = dependencies.filter((item) => item.relation === "future");
  return (
    <section className="pathway-section">
      <div className="visual-heading-row">
        <div><span className="section-kicker">Your learning map</span><h2>Why recursion comes before what’s next</h2><p>Learn these ideas in order so future topics have somewhere solid to land.</p></div>
        <Route size={28} />
      </div>
      <div className="dependency-map">
        <div className="dependency-group">
          <span className="dependency-label complete">FOUNDATIONS READY</span>
          {prerequisites.map((topic) => <div className="topic-node done" key={topic.id}><CheckCircle2 size={17} /><span><strong>{topic.title}</strong><small>{topic.description}</small></span></div>)}
        </div>
        <div className="path-arrow"><ArrowRight size={20} /></div>
        <div className="dependency-group current-group">
          <span className="dependency-label current">YOU ARE HERE</span>
          <div className="topic-node current"><BrainCircuit size={19} /><span><strong>Recursion</strong><small>Base cases & smaller problems</small></span></div>
        </div>
        <div className="path-arrow"><ArrowRight size={20} /></div>
        <div className="future-grid">
          <span className={`dependency-label ${hasMastered ? "complete" : ""}`}>{hasMastered ? "PATHWAYS OPEN" : "BUILDS ON THIS"}</span>
          <div className="future-nodes">
            {future.map((topic) => <div className={`topic-node mini ${hasMastered ? "open" : ""}`} key={topic.id}>{hasMastered ? <Check size={14} /> : <LockKeyhole size={13} />}<span><strong>{topic.title}</strong><small>{topic.description}</small></span></div>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function EnrichmentCard({ enabled, unlocked, openSettings }: { enabled: boolean; unlocked: boolean; openSettings: () => void }) {
  if (!enabled) {
    return <section className="feature-placeholder"><div><Zap size={19} /><strong>Challenge content is hidden</strong><p>You can enable enrichment in your LearnPath settings.</p></div><button onClick={openSettings}>Open settings</button></section>;
  }
  return (
    <section className={`enrichment-card ${unlocked ? "unlocked" : ""}`}>
      <div className="enrichment-art"><span>⌘</span><span>↺</span><span>{unlocked ? "⚡" : "?"}</span></div>
      <div>
        <div className="eyebrow-line"><span>{unlocked ? "Challenge unlocked" : "Beyond the lecture"}</span><span className={unlocked ? "open-badge" : "locked-badge"}>{unlocked ? <Check size={12} /> : <LockKeyhole size={11} />}{unlocked ? "READY" : `AT ${MASTERY_THRESHOLD}%`}</span></div>
        <h2>{unlocked ? "Tail recursion: can the stack disappear?" : "A deeper recursion challenge is waiting"}</h2>
        <p>{unlocked ? "Explore how some recursive calls can be optimized when there is no work left after the call returns." : "Master the core mental model first. LearnPath will reveal an extension that goes beyond the standard lecture."}</p>
        {unlocked && <button className="dark-button">Explore the challenge <ArrowRight size={15} /></button>}
      </div>
    </section>
  );
}

type QuizProps = {
  answers: Record<string, number>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  score: number | null;
  submit: () => void;
  retry: () => void;
  attempts: number;
};

function QuizSection({ answers, setAnswers, score, submit, retry, attempts }: QuizProps) {
  return (
    <section className="quiz-section" id="mastery-check">
      <div className="quiz-header">
        <div className="quiz-number"><GraduationCap size={21} /></div>
        <div><span className="section-kicker">Mastery check · 5 questions</span><h2>Ready to test the mental model?</h2><p>This check adapts your path; it does not affect your course grade.</p></div>
        {attempts > 0 && <span className="attempt-pill">Attempt {attempts + (score === null ? 1 : 0)}</span>}
      </div>

      {score === null ? (
        <div className="question-list">
          {quizQuestions.map((question, questionIndex) => (
            <fieldset className="question-card" key={question.id}>
              <legend><span>{questionIndex + 1}</span>{question.prompt}</legend>
              <div className="answer-grid">
                {question.options.map((option, optionIndex) => (
                  <label className={answers[question.id] === optionIndex ? "selected" : ""} key={option}>
                    <input type="radio" name={question.id} checked={answers[question.id] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} />
                    <span className="radio-mark" />{option}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <div className="quiz-submit-row"><span>{Object.keys(answers).length} of {quizQuestions.length} answered</span><button className="primary-button" onClick={submit}>Check my mastery <ArrowRight size={16} /></button></div>
        </div>
      ) : (
        <div className={`quiz-result ${score >= MASTERY_THRESHOLD ? "success" : "review"}`} id="quiz-result" role="status">
          <div className="result-score"><strong>{score}%</strong><span>mastery</span></div>
          <div>
            <span className="result-label">{score >= MASTERY_THRESHOLD ? "PATHWAY UNLOCKED" : "ONE MORE PASS"}</span>
            <h3>{score >= MASTERY_THRESHOLD ? "You’re ready to use recursion." : "The base is there. Let’s strengthen it."}</h3>
            <p>{score >= MASTERY_THRESHOLD ? "Tree traversal and the advanced challenge are now open. Your best score is saved." : "Review the visual once more, then retry. Your best score—not your latest—is kept."}</p>
          </div>
          <button onClick={retry}><RefreshCw size={15} /> {score >= MASTERY_THRESHOLD ? "Try again" : "Review & retry"}</button>
        </div>
      )}
    </section>
  );
}

function LecturerView({ resetDemo }: { resetDemo: () => void }) {
  return (
    <main className="lecturer-page">
      <div className="lecturer-hero">
        <div>
          <span className="lesson-label">FIT1008 · Lecturer intelligence</span>
          <h1>See where learning gets stuck—<br />without rewriting your course.</h1>
          <p>LearnPath analyzes the content already in Moodle, adapts it for each student, and returns class-level signals you can act on.</p>
        </div>
        <div className="zero-prep-card"><div className="zero-icon"><Sparkles size={23} /></div><div><span>ZERO EXTRA AUTHORING</span><strong>Your course stays yours.</strong><p>2 lectures, 6 activities, and 1 quiz analyzed automatically.</p></div></div>
      </div>

      <section className="insight-grid">
        {lecturerInsights.map((insight) => <InsightCard insight={insight} key={insight.label} />)}
      </section>

      <div className="dashboard-grid">
        <section className="dashboard-card distribution-card">
          <div className="dashboard-card-header"><div><span className="section-kicker">Live cohort view</span><h2>Recursion mastery</h2></div><select aria-label="Time range" defaultValue="week"><option value="week">This week</option><option value="month">This month</option></select></div>
          <div className="distribution-content">
            <div className="donut" aria-label="68 percent average class mastery"><div><strong>68%</strong><span>class average</span></div></div>
            <div className="distribution-legend">
              {classDistribution.map((item) => <div key={item.label}><span className="legend-dot" style={{ background: item.color }} /><span>{item.label}</span><strong>{item.value}%</strong></div>)}
            </div>
          </div>
          <div className="class-note"><TrendingUp size={17} /><p><strong>Mastery rose 9% after adaptation.</strong> The largest gain came from students who replayed the call-stack visual.</p></div>
        </section>

        <section className="dashboard-card friction-card">
          <div className="dashboard-card-header"><div><span className="section-kicker">Concept friction</span><h2>Where students need help</h2></div><CircleHelp size={20} /></div>
          <div className="friction-list">
            <FrictionRow rank="01" topic="Call stack unwinding" students={14} percent={78} tone="red" />
            <FrictionRow rank="02" topic="Choosing a base case" students={9} percent={51} tone="amber" />
            <FrictionRow rank="03" topic="Reducing the input" students={6} percent={34} tone="navy" />
          </div>
          <button className="text-button">View all concept signals <ArrowRight size={14} /></button>
        </section>

        <section className="dashboard-card adaptation-log">
          <div className="dashboard-card-header"><div><span className="section-kicker">Adaptation activity</span><h2>What LearnPath changed</h2></div><span className="live-pill"><span /> LIVE</span></div>
          <div className="activity-table" role="table" aria-label="Recent adaptation activity">
            <div className="activity-row heading" role="row"><span>Student need</span><span>Adaptation</span><span>Students</span><span>Impact</span></div>
            <ActivityRow need="Abstract wording" action="Simplified explanation" students="21" impact="+12%" />
            <ActivityRow need="Weak visualization" action="Pixel call-stack walkthrough" students="16" impact="+18%" />
            <ActivityRow need="High mastery" action="Unlocked tail recursion" students="11" impact="+7%" />
            <ActivityRow need="Missing prerequisite" action="Stack-frame refresher" students="8" impact="+15%" />
          </div>
        </section>

        <section className="dashboard-card content-map-card">
          <div className="dashboard-card-header"><div><span className="section-kicker">Detected automatically</span><h2>Course dependency map</h2></div><Route size={20} /></div>
          <div className="mini-map">
            <div className="mini-node done">Functions <Check size={12} /></div><ChevronRight size={14} /><div className="mini-node done">Stacks <Check size={12} /></div><ChevronRight size={14} /><div className="mini-node active">Recursion</div><ChevronRight size={14} /><div className="mini-branches"><span>Trees</span><span>DFS</span><span>Dynamic programming</span></div>
          </div>
          <p>LearnPath identified <strong>7 concept relationships</strong> from your existing lecture notes and quiz—no tagging required.</p>
        </section>
      </div>

      <section className="lecturer-footer-cta">
        <div><span className="section-kicker">Presentation controls</span><h2>Ready for the next demo?</h2><p>Reset Maya to her initial 42% mastery state and replay the full adaptive journey.</p></div>
        <button className="primary-button" onClick={resetDemo}><RefreshCw size={16} /> Reset student demo</button>
      </section>
    </main>
  );
}

function InsightCard({ insight }: { insight: LecturerInsight }) {
  const icons = { red: CircleHelp, amber: Clock3, green: TrendingUp, blue: WandSparkles };
  const Icon = icons[insight.tone];
  return <article className={`insight-card ${insight.tone}`}><div className="insight-icon"><Icon size={18} /></div><span>{insight.label}</span><strong>{insight.value}</strong><p>{insight.detail}</p></article>;
}

function FrictionRow({ rank, topic, students, percent, tone }: { rank: string; topic: string; students: number; percent: number; tone: string }) {
  return <div className="friction-row"><span className="rank">{rank}</span><div><div className="friction-copy"><strong>{topic}</strong><span>{students} students</span></div><div className="friction-track"><span className={tone} style={{ width: `${percent}%` }} /></div></div></div>;
}

function ActivityRow({ need, action, students, impact }: { need: string; action: string; students: string; impact: string }) {
  return <div className="activity-row" role="row"><span>{need}</span><span><Sparkles size={13} />{action}</span><strong>{students}</strong><b>{impact}</b></div>;
}

type SettingsProps = {
  preferences: FeaturePreferences;
  updatePreference: (key: keyof FeaturePreferences, value: boolean) => void;
  close: () => void;
  resetDemo: () => void;
};

function SettingsDrawer({ preferences, updatePreference, close, resetDemo }: SettingsProps) {
  return (
    <div className="drawer-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <aside className="settings-drawer" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="drawer-header"><div><span className="section-kicker">You’re in control</span><h2 id="settings-title">LearnPath settings</h2></div><button className="icon-button" onClick={close} aria-label="Close settings"><X size={19} /></button></div>
        <p className="drawer-intro">Choose how LearnPath supports you. Your lecturer’s original content is always one click away.</p>

        <div className="master-switch">
          <div className="setting-icon"><BrainCircuit size={20} /></div>
          <div><strong>LearnPath AI</strong><span>{preferences.enabled ? "Adapting your learning path" : "All adaptations are paused"}</span></div>
          <Toggle checked={preferences.enabled} onChange={(value) => updatePreference("enabled", value)} label="Enable LearnPath AI" />
        </div>

        <div className={`setting-group ${!preferences.enabled ? "disabled" : ""}`}>
          <span className="setting-group-label">PERSONALISE MY EXPERIENCE</span>
          <SettingRow icon={<WandSparkles size={18} />} title="Simplify explanations" description="Rephrase dense content when signals show confusion." checked={preferences.simplifyContent} setChecked={(value) => updatePreference("simplifyContent", value)} disabled={!preferences.enabled} />
          <SettingRow icon={<Eye size={18} />} title="Pixel visual explanations" description="Show lightweight animated concept walkthroughs." checked={preferences.visualizations} setChecked={(value) => updatePreference("visualizations", value)} disabled={!preferences.enabled} />
          <SettingRow icon={<Zap size={18} />} title="Advanced enrichment" description="Unlock deeper content when you are ready." checked={preferences.enrichment} setChecked={(value) => updatePreference("enrichment", value)} disabled={!preferences.enabled} />
        </div>

        <div className="privacy-note"><ShieldCheck size={18} /><div><strong>Private by design</strong><p>Your lecturer sees class-level learning signals, not your rewritten notes or individual reading behavior.</p></div></div>
        <div className="drawer-actions"><button className="reset-button" onClick={() => { resetDemo(); close(); }}><RefreshCw size={15} /> Reset demo</button><button className="primary-button" onClick={close}>Save preferences</button></div>
      </aside>
    </div>
  );
}

function SettingRow({ icon, title, description, checked, setChecked, disabled }: { icon: React.ReactNode; title: string; description: string; checked: boolean; setChecked: (checked: boolean) => void; disabled: boolean }) {
  return <div className="setting-row"><div className="setting-icon">{icon}</div><div><strong>{title}</strong><span>{description}</span></div><Toggle checked={checked} onChange={setChecked} label={title} disabled={disabled} /></div>;
}

function Toggle({ checked, onChange, label, disabled = false }: { checked: boolean; onChange: (value: boolean) => void; label: string; disabled?: boolean }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`toggle ${checked ? "on" : ""}`} onClick={() => onChange(!checked)} disabled={disabled}><span /></button>;
}
