"use client";

import { BarChart3, BookOpen, Menu, Route, Settings2, X } from "lucide-react";
import { useState } from "react";

type HeaderSection = "courses" | "learn" | "lecturer" | "profile";

type AppHeaderProps = {
  activeSection: HeaderSection;
  agentActive?: boolean;
  onOpenSettings?: () => void;
  onSelectSection?: (section: "learn" | "lecturer") => void;
};

export function AppHeader({
  activeSection,
  agentActive = true,
  onOpenSettings,
  onSelectSection,
}: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  function selectSection(section: "learn" | "lecturer") {
    setMenuOpen(false);
    onSelectSection?.(section);
  }

  function openSettings() {
    setMenuOpen(false);
    onOpenSettings?.();
  }

  return (
    <>
      <header className="topbar">
        <a className="brand-lockup" href="/" aria-label="LearnPath AI home">
          <div className="brand-mark"><Route size={21} strokeWidth={2.4} /></div>
          <div><span className="brand-name">LearnPath</span><span className="brand-ai">AI</span></div>
        </a>

        <nav className="view-switch" aria-label="Primary navigation">
          <a className={activeSection === "courses" ? "active" : ""} href="/"><Route size={17} /> Courses</a>
          {onSelectSection ? (
            <button className={activeSection === "learn" ? "active" : ""} onClick={() => selectSection("learn")}>
              <BookOpen size={17} /> Learn
            </button>
          ) : (
            <a className={activeSection === "learn" ? "active" : ""} href="/fit1008/recursion"><BookOpen size={17} /> Learn</a>
          )}
          {onSelectSection ? (
            <button className={activeSection === "lecturer" ? "active" : ""} onClick={() => selectSection("lecturer")}>
              <BarChart3 size={17} /> Lecturer view
            </button>
          ) : (
            <a className={activeSection === "lecturer" ? "active" : ""} href="/fit1008/recursion?view=lecturer"><BarChart3 size={17} /> Lecturer view</a>
          )}
        </nav>

        <div className="header-actions">
          <span className={`agent-status ${agentActive ? "online" : "offline"}`}>
            <span className="status-dot" /> {agentActive ? "Agent active" : "Agent paused"}
          </span>
          {onOpenSettings ? (
            <button className="icon-button" onClick={openSettings} aria-label="Open LearnPath settings"><Settings2 size={19} /></button>
          ) : (
            <a className="icon-button" href="/fit1008/recursion?settings=open" aria-label="Open LearnPath settings"><Settings2 size={19} /></a>
          )}
          <button className="avatar-button" aria-label="Maya Tan account">MT</button>
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav className="mobile-nav" aria-label="Navigation menu">
          <a href="/"><Route size={17} /> All courses</a>
          {onSelectSection ? (
            <button onClick={() => selectSection("learn")}><BookOpen size={17} /> Student learning</button>
          ) : (
            <a href="/fit1008/recursion"><BookOpen size={17} /> Student learning</a>
          )}
          {onSelectSection ? (
            <button onClick={() => selectSection("lecturer")}><BarChart3 size={17} /> Lecturer insights</button>
          ) : (
            <a href="/fit1008/recursion?view=lecturer"><BarChart3 size={17} /> Lecturer insights</a>
          )}
          {onOpenSettings ? (
            <button onClick={openSettings}><Settings2 size={17} /> Agent settings</button>
          ) : (
            <a href="/fit1008/recursion?settings=open"><Settings2 size={17} /> Agent settings</a>
          )}
        </nav>
      )}
    </>
  );
}
