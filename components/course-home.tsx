import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock3,
  Code2,
  Leaf,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";

const courses = [
  {
    code: "FIT1008",
    title: "Introduction to Computer Science",
    description: "Build algorithmic thinking through data structures, recursion, trees, and graph traversal.",
    progress: 58,
    accent: "red",
    icon: Code2,
    currentLabel: "Continue Module 4",
    currentHref: "/fit1008/recursion",
    modules: [
      { number: "01", title: "Algorithm analysis", status: "complete" },
      { number: "02", title: "Data structures", status: "complete" },
      { number: "03", title: "Trees & stacks", status: "complete" },
      { number: "04", title: "Recursion", status: "current", href: "/fit1008/recursion", duration: "35 min" },
      { number: "05", title: "Graph traversal", status: "locked" },
      { number: "06", title: "Dynamic programming", status: "locked" },
    ],
  },
  {
    code: "BIO2026",
    title: "Human Biology",
    description: "Explore how human body systems process nutrients, release energy, and maintain balance.",
    progress: 31,
    accent: "green",
    icon: Leaf,
    currentLabel: "Continue Module 2",
    currentHref: "/biology/digestion",
    modules: [
      { number: "01", title: "Cells & tissues", status: "complete" },
      { number: "02", title: "Digestion", status: "current", href: "/biology/digestion", duration: "30 min" },
      { number: "03", title: "Respiration", status: "locked" },
      { number: "04", title: "Circulation", status: "locked" },
      { number: "05", title: "Homeostasis", status: "locked" },
    ],
  },
] as const;

export function CourseHome() {
  return (
    <div className="course-home-shell">
      <AppHeader activeSection="courses" />

      <main className="course-home-main">
        <section className="home-hero">
          <div>
            <span className="section-kicker"><Sparkles size={13} /> Your adaptive learning space</span>
            <h1>Good afternoon, Maya.</h1>
            <p>Pick up where you left off or explore your course modules. LearnPath adapts each lesson while preserving your lecturer’s original content.</p>
          </div>
          <div className="home-summary" aria-label="Learning summary">
            <div><strong>2</strong><span>Active courses</span></div>
            <div><strong>5</strong><span>Modules completed</span></div>
            <div><strong>1</strong><span>Topic to review</span></div>
          </div>
        </section>

        <div className="home-section-heading">
          <div><span className="mini-label">My courses</span><h2>Continue learning</h2></div>
          <p>Modules unlock as prerequisite concepts become ready.</p>
        </div>

        <section className="course-grid" aria-label="Enrolled courses">
          {courses.map((course) => {
            const Icon = course.icon;
            return (
              <article className={`course-card course-card-${course.accent}`} key={course.code}>
                <div className="course-card-header">
                  <div className="course-card-icon"><Icon size={25} /></div>
                  <div>
                    <span>{course.code}</span>
                    <h2>{course.title}</h2>
                  </div>
                  <div className="course-progress-ring" style={{ "--progress": `${course.progress * 3.6}deg` } as React.CSSProperties}>
                    <strong>{course.progress}%</strong>
                  </div>
                </div>
                <p className="course-description">{course.description}</p>

                <div className="home-module-list" aria-label={`${course.code} modules`}>
                  {course.modules.map((module) => {
                    const content = (
                      <>
                        <span className="home-module-number">{module.status === "complete" ? <Check size={14} /> : module.status === "locked" ? <LockKeyhole size={12} /> : module.number}</span>
                        <span className="home-module-copy"><small>Module {module.number}</small><strong>{module.title}</strong></span>
                        {"duration" in module && <span className="home-module-duration"><Clock3 size={12} /> {module.duration}</span>}
                        {module.status === "current" && <ArrowRight size={17} />}
                      </>
                    );
                    return "href" in module ? (
                      <Link className="home-module-row current" href={module.href} key={module.number} aria-label={`${course.code} Module ${module.number}: ${module.title}`}>
                        {content}
                      </Link>
                    ) : (
                      <div className={`home-module-row ${module.status}`} key={module.number} aria-disabled={module.status === "locked"}>
                        {content}
                      </div>
                    );
                  })}
                </div>

                <Link className="course-continue" href={course.currentHref}>
                  {course.currentLabel} <ArrowRight size={16} />
                </Link>
              </article>
            );
          })}
        </section>

        <aside className="home-agent-note">
          <div className="brand-mark"><Sparkles size={18} /></div>
          <div><strong>No special course preparation required</strong><p>LearnPath analyses the normal Moodle content and builds each adaptive pathway automatically.</p></div>
          <span>SIMULATED AI DEMO</span>
        </aside>
      </main>
    </div>
  );
}
