"use client";

import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  Dna,
  Eye,
  GraduationCap,
  Leaf,
  Lightbulb,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WandSparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { DigestionVisualizer } from "@/components/learnpath-app";

const biologySections = [
  {
    eyebrow: "System overview",
    title: "Digestion turns large food molecules into absorbable nutrients",
    original: "The alimentary canal performs coordinated mechanical and chemical digestion, hydrolysing macromolecules into monomers capable of crossing the intestinal epithelium and entering circulatory transport.",
    simplified: "Your digestive system breaks food into molecules small enough to enter the blood. Muscles physically move and mix food, while enzymes chemically cut carbohydrates, proteins, and fats into smaller nutrients.",
    keyIdea: "Digestion breaks food down; absorption moves the useful nutrients into the body.",
  },
  {
    eyebrow: "Absorption",
    title: "The small intestine does most of the nutrient absorption",
    original: "The mucosal surface of the small intestine exhibits extensive folding, villi, and microvilli, substantially increasing the area available for trans-epithelial nutrient uptake.",
    simplified: "The inside of the small intestine is covered with millions of tiny finger-like villi. They create a huge surface area, helping nutrients pass quickly into the blood and lymph.",
    keyIdea: "More surface area means more places for nutrients to be absorbed.",
  },
];

const biologyQuiz = [
  { id: "b1", prompt: "Where does most nutrient absorption happen?", options: ["Stomach", "Small intestine", "Oesophagus", "Large intestine"], answer: 1 },
  { id: "b2", prompt: "What pushes food down the oesophagus?", options: ["Gravity only", "Diffusion", "Peristalsis", "Villi"], answer: 2 },
  { id: "b3", prompt: "What is the main advantage of intestinal villi?", options: ["They increase surface area", "They make stomach acid", "They store water", "They chew food"], answer: 0 },
  { id: "b4", prompt: "What is mainly recovered in the large intestine?", options: ["Oxygen", "Protein", "Water", "Glucose"], answer: 2 },
];

const BIOLOGY_STORAGE_KEY = "learnpath-biology-mastery-v2";
const BIOLOGY_MASTERY_THRESHOLD = 75;

export function BiologyLesson() {
  const [contentMode, setContentMode] = useState<"adapted" | "original">("adapted");
  const [mastery, setMastery] = useState(54);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [score, setScore] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const rawStored = window.localStorage.getItem(BIOLOGY_STORAGE_KEY);
    const stored = rawStored === null ? Number.NaN : Number(rawStored);
    if (Number.isFinite(stored) && stored >= 0 && stored <= 100) setMastery(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(BIOLOGY_STORAGE_KEY, String(mastery));
  }, [hydrated, mastery]);

  const answerKey = useMemo(() => Object.fromEntries(biologyQuiz.map((question) => [question.id, question.answer])), []);
  const mastered = mastery >= BIOLOGY_MASTERY_THRESHOLD;

  function submitQuiz() {
    if (Object.keys(answers).length !== biologyQuiz.length) return;
    const correct = biologyQuiz.filter((question) => answers[question.id] === answerKey[question.id]).length;
    const nextScore = Math.round((correct / biologyQuiz.length) * 100);
    setScore(nextScore);
    setMastery((current) => Math.max(current, nextScore));
  }

  function retryQuiz() {
    setAnswers({});
    setScore(null);
  }

  return (
    <div className="app-shell biology-shell">
      <AppHeader activeSection="learn" />

      <div className="student-layout biology-layout-page">
        <aside className="course-sidebar">
          <a className="back-link" href="/"><ArrowLeft size={15} /> All courses</a>
          <div className="course-code biology-code">BIO2026</div>
          <h2>Human Biology</h2>
          <div className="course-progress">
            <div className="progress-copy"><span>Course progress</span><strong>31%</strong></div>
            <div className="progress-track biology-progress"><span style={{ width: "31%" }} /></div>
          </div>
          <nav className="module-nav" aria-label="Biology course modules">
            <BiologyModule number="01" title="Cells & tissues" complete />
            <BiologyModule number="02" title="Digestion" active />
            <BiologyModule number="03" title="Respiration" locked={!mastered} />
            <BiologyModule number="04" title="Circulation" locked />
            <BiologyModule number="05" title="Homeostasis" locked />
          </nav>
          <div className="sidebar-note"><ShieldCheck size={17} /><p><strong>Your learning, your choice.</strong> The lecturer’s original biology notes remain available at all times.</p></div>
        </aside>

        <main className="learning-main">
          <div className="breadcrumbs"><span>BIO2026</span><ChevronRight size={13} /><span>Module 2</span><ChevronRight size={13} /><strong>Digestion</strong></div>
          <div className="lesson-heading">
            <div><span className="lesson-label biology-label">Module 02 · 30 min</span><h1>From food to fuel</h1><p>Follow food through the digestive system and understand how nutrients enter the body.</p></div>
            <a className="save-button lesson-back-link" href="/fit1008/recursion"><ArrowLeft size={16} /> Recursion lesson</a>
          </div>

          <section className="adaptation-banner biology-adaptation" aria-label="LearnPath biology adaptation">
            <div className="spark-icon biology-spark"><Dna size={21} /></div>
            <div className="adaptation-copy"><div className="eyebrow-line"><span>Adapted for you</span><span className="demo-pill">SIMULATED AI</span></div><h2>Let’s connect each organ to one clear job</h2><p>Your last activity mixed up digestion and absorption. I’ve simplified the distinction and generated an organ-by-organ walkthrough.</p></div>
            <div className="confidence-box"><span>Learning confidence</span><strong>{mastery}%</strong><TrendingUp size={16} /></div>
          </section>

          <section className="content-section">
            <div className="section-number">01</div>
            <div className="section-content">
              <div className="section-topline">
                <div><span className="section-kicker biology-label">The big idea</span><h2>Digestion and absorption are different jobs</h2></div>
                <div className="content-toggle" aria-label="Biology explanation version">
                  <button className={contentMode === "adapted" ? "active" : ""} onClick={() => setContentMode("adapted")}><WandSparkles size={14} /> For me</button>
                  <button className={contentMode === "original" ? "active" : ""} onClick={() => setContentMode("original")}><Eye size={14} /> Original</button>
                </div>
              </div>
              {biologySections.map((section) => (
                <article className={`explanation-card ${contentMode === "adapted" ? "adapted biology-explanation" : ""}`} key={section.title}>
                  <div className="explanation-meta"><span>{section.eyebrow}</span>{contentMode === "adapted" && <span className="adapted-tag biology-tag"><Sparkles size={12} /> Simplified</span>}</div>
                  <h3>{section.title}</h3><p>{contentMode === "adapted" ? section.simplified : section.original}</p>
                  {contentMode === "adapted" && <div className="key-idea"><Lightbulb size={17} /><span><strong>Hold onto this:</strong> {section.keyIdea}</span></div>}
                </article>
              ))}
            </div>
          </section>

          <DigestionVisualizer />
          <BiologyLearningMap mastered={mastered} />
          <BiologyQuiz answers={answers} setAnswers={setAnswers} score={score} submit={submitQuiz} retry={retryQuiz} />
        </main>

        <aside className="coach-sidebar">
          <div className="coach-card biology-coach">
            <div className="coach-title"><div className="coach-orb biology-orb"><Dna size={18} /></div><div><span>Your learning guide</span><strong>Why this path?</strong></div></div>
            <p>You understand the organ names. Now we’re strengthening the sequence and what is absorbed at each stage.</p>
            <div className="signal-list">
              <div><span className="signal-icon amber"><BrainCircuit size={15} /></span><span><strong>Mixed up</strong> digestion and absorption</span></div>
              <div><span className="signal-icon red"><Leaf size={15} /></span><span><strong>Review needed</strong> for villi and surface area</span></div>
              <div><span className="signal-icon green"><Check size={15} /></span><span><strong>Strong</strong> organ identification</span></div>
            </div>
          </div>
          <div className="mastery-card"><div className="mastery-top"><span>Topic mastery</span><strong>{mastery}%</strong></div><div className="mastery-track biology-mastery"><span style={{ width: `${mastery}%` }} /></div><p>{mastered ? "Respiration is now unlocked." : `${BIOLOGY_MASTERY_THRESHOLD - mastery} more points to unlock Respiration.`}</p></div>
          <div className="next-card"><span className="mini-label biology-label">Up next</span><div className="next-icon">🫁</div><strong>Respiration</strong><p>See how absorbed nutrients release usable energy.</p><span className={mastered ? "unlock-chip open" : "unlock-chip"}>{mastered ? <Check size={13} /> : <LockKeyhole size={12} />}{mastered ? "Unlocked" : `Unlocks at ${BIOLOGY_MASTERY_THRESHOLD}%`}</span></div>
        </aside>
      </div>
    </div>
  );
}

function BiologyModule({ number, title, active, complete, locked }: { number: string; title: string; active?: boolean; complete?: boolean; locked?: boolean }) {
  const content = <><span className="module-number">{complete ? <Check size={13} /> : locked ? <LockKeyhole size={12} /> : number}</span><span>{title}</span>{active && <ChevronRight size={15} />}</>;

  if (active) {
    return <div className="module-item active biology-active" aria-current="page">{content}</div>;
  }

  return <button className="module-item" disabled={locked}>{content}</button>;
}

function BiologyLearningMap({ mastered }: { mastered: boolean }) {
  return (
    <section className="pathway-section biology-pathway">
      <div className="visual-heading-row"><div><span className="section-kicker biology-label">Your learning map</span><h2>Why digestion comes before respiration</h2><p>Cells can only release energy after digestion supplies absorbable nutrients.</p></div><Dna size={28} /></div>
      <div className="bio-map-flow">
        <div className="topic-node done"><CheckCircle2 size={17} /><span><strong>Cells & tissues</strong><small>How living structures are organised</small></span></div>
        <ArrowRight size={18} />
        <div className="topic-node current biology-current"><Leaf size={18} /><span><strong>Digestion</strong><small>Break down and absorb nutrients</small></span></div>
        <ArrowRight size={18} />
        <div className={`topic-node ${mastered ? "bio-open" : "mini"}`}>{mastered ? <Check size={15} /> : <LockKeyhole size={14} />}<span><strong>Respiration</strong><small>Release energy from glucose</small></span></div>
        <ArrowRight size={18} />
        <div className="topic-node mini"><LockKeyhole size={14} /><span><strong>Homeostasis</strong><small>Keep internal conditions stable</small></span></div>
      </div>
    </section>
  );
}

function BiologyQuiz({ answers, setAnswers, score, submit, retry }: { answers: Record<string, number>; setAnswers: React.Dispatch<React.SetStateAction<Record<string, number>>>; score: number | null; submit: () => void; retry: () => void }) {
  return (
    <section className="quiz-section" id="biology-mastery-check">
      <div className="quiz-header"><div className="quiz-number biology-quiz-number"><GraduationCap size={21} /></div><div><span className="section-kicker biology-label">Mastery check · 4 questions</span><h2>Can you trace the digestive pathway?</h2><p>This check adapts your learning path; it does not affect your course grade.</p></div></div>
      {score === null ? <div className="question-list">
        {biologyQuiz.map((question, index) => <fieldset className="question-card" key={question.id}><legend><span>{index + 1}</span>{question.prompt}</legend><div className="answer-grid">{question.options.map((option, optionIndex) => <label className={answers[question.id] === optionIndex ? "selected" : ""} key={option}><input type="radio" name={question.id} checked={answers[question.id] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} /><span className="radio-mark" />{option}</label>)}</div></fieldset>)}
        <div className="quiz-submit-row"><span>{Object.keys(answers).length} of {biologyQuiz.length} answered</span><button className="primary-button biology-primary" onClick={submit} disabled={Object.keys(answers).length !== biologyQuiz.length}>Check my mastery <ArrowRight size={16} /></button></div>
      </div> : <div className={`quiz-result ${score >= BIOLOGY_MASTERY_THRESHOLD ? "success" : "review"}`} role="status"><div className="result-score"><strong>{score}%</strong><span>mastery</span></div><div><span className="result-label">{score >= BIOLOGY_MASTERY_THRESHOLD ? "PATHWAY UNLOCKED" : "REVIEW THE PATH"}</span><h3>{score >= BIOLOGY_MASTERY_THRESHOLD ? "You’re ready to connect digestion to respiration." : "Revisit where absorption happens."}</h3><p>Your best score is saved, so another attempt can only move your pathway forward.</p></div><button onClick={retry}>Try again</button></div>}
    </section>
  );
}
