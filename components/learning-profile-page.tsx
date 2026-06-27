"use client";

import {
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  FileArchive,
  FileJson,
  LockKeyhole,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/app-header";
import {
  analyzeChatGPTFile,
  LEARNING_PROFILE_KEY,
  parseLearningProfile,
} from "@/lib/chatgpt-import";
import type { LearningPreference, LearningProfile } from "@/lib/types";

export function LearningProfilePage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(parseLearningProfile(window.localStorage.getItem(LEARNING_PROFILE_KEY)));
  }, []);

  function chooseFile(file: File | undefined) {
    if (!file) return;
    setSelectedFile(file);
    setError(null);
    setSaved(false);
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    chooseFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    chooseFile(event.dataTransfer.files?.[0]);
  }

  async function analyze() {
    if (!selectedFile) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const nextProfile = await analyzeChatGPTFile(selectedFile);
      window.localStorage.setItem(LEARNING_PROFILE_KEY, JSON.stringify(nextProfile));
      setProfile(nextProfile);
      setSaved(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not analyze that file.");
    } finally {
      setBusy(false);
    }
  }

  function removeProfile() {
    window.localStorage.removeItem(LEARNING_PROFILE_KEY);
    setProfile(null);
    setSelectedFile(null);
    setSaved(false);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="profile-shell">
      <AppHeader activeSection="profile" />

      <main className="profile-main">
        <div className="profile-breadcrumbs"><a href="/">Courses</a><ArrowRight size={13} /><span>Learning profile</span></div>

        <section className="profile-hero">
          <div>
            <span className="section-kicker"><Sparkles size={12} /> Your learning fingerprint</span>
            <h1>Teach LearnPath<br />how you learn.</h1>
            <p>Bring in your ChatGPT conversation history and turn it into a private learning profile. LearnPath uses the patterns—not your raw chats—to shape clearer explanations, examples, and practice.</p>
          </div>
          <div className="profile-hero-orbit" aria-hidden="true">
            <div className="profile-orbit-ring ring-one" />
            <div className="profile-orbit-ring ring-two" />
            <div className="profile-orbit-core"><BrainCircuit size={38} /></div>
            <span className="orbit-chip chip-one">EXAMPLES</span>
            <span className="orbit-chip chip-two">DETAIL</span>
            <span className="orbit-chip chip-three">PRACTICE</span>
          </div>
        </section>

        <div className="profile-grid">
          <section className="profile-upload-panel" aria-labelledby="upload-title">
            <div className="profile-panel-heading">
              <span className="profile-step">01</span>
              <div><span className="section-kicker">Import</span><h2 id="upload-title">Add your ChatGPT export</h2></div>
            </div>

            <div
              className={`profile-dropzone ${dragging ? "dragging" : ""} ${selectedFile ? "has-file" : ""}`}
              onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <input ref={inputRef} type="file" accept=".zip,.json,application/zip,application/json" onChange={handleInput} aria-label="Choose ChatGPT export" />
              {selectedFile ? (
                <>
                  <span className="upload-icon ready">{selectedFile.name.toLowerCase().endsWith(".zip") ? <FileArchive size={28} /> : <FileJson size={28} />}</span>
                  <strong>{selectedFile.name}</strong>
                  <p>{formatBytes(selectedFile.size)} · Ready for local analysis</p>
                  <button type="button" className="profile-text-button" onClick={() => inputRef.current?.click()}>Choose a different file</button>
                </>
              ) : (
                <>
                  <span className="upload-icon"><UploadCloud size={28} /></span>
                  <strong>Drop your export here</strong>
                  <p>ChatGPT export ZIP or conversations.json · up to 100 MB</p>
                  <button type="button" className="profile-file-button" onClick={() => inputRef.current?.click()}>Choose file</button>
                </>
              )}
            </div>

            {error && <div className="profile-error" role="alert">{error}</div>}
            {saved && <div className="profile-success" role="status"><CheckCircle2 size={17} /> Learning profile updated. Your lessons can now use these signals.</div>}

            <button className="profile-analyze-button" type="button" onClick={analyze} disabled={!selectedFile || busy}>
              {busy ? <><RefreshCw className="spin" size={17} /> Analyzing your learning patterns…</> : <><Sparkles size={17} /> Analyze and save profile</>}
            </button>

            <div className="profile-local-note">
              <ShieldCheck size={20} />
              <div><strong>Your chats stay on this device</strong><p>The file is analyzed in your browser. LearnPath saves only the compact profile shown here—not conversation text, titles, or files.</p></div>
            </div>
          </section>

          <aside className="profile-guide-panel">
            <div className="profile-panel-heading compact">
              <span className="profile-step">?</span>
              <div><span className="section-kicker">Before you start</span><h2>Get your export</h2></div>
            </div>
            <ol className="export-steps">
              <li><span>1</span><div><strong>Open ChatGPT settings</strong><p>Go to Data Controls and choose Export Data.</p></div></li>
              <li><span>2</span><div><strong>Download the email link</strong><p>ChatGPT will send you a ZIP when your export is ready.</p></div></li>
              <li><span>3</span><div><strong>Add it here</strong><p>Upload the ZIP directly. There is no need to unzip it first.</p></div></li>
            </ol>
            <div className="supported-files"><FileArchive size={19} /><div><strong>Supported</strong><span>ZIP export · conversations.json</span></div></div>
          </aside>
        </div>

        <section className="profile-results" aria-labelledby="profile-results-title">
          <div className="profile-results-heading">
            <div><span className="section-kicker">02 · Learning signals</span><h2 id="profile-results-title">What LearnPath understands</h2></div>
            {profile && <button type="button" className="profile-delete-button" onClick={removeProfile}><Trash2 size={15} /> Delete learning profile</button>}
          </div>

          {profile ? <ProfileSummary profile={profile} /> : (
            <div className="profile-empty">
              <div className="empty-profile-icon"><MessageSquareText size={28} /></div>
              <div><strong>Your learning profile will appear here</strong><p>After analysis, you’ll see the exact signals LearnPath can use. You stay in control and can delete the profile at any time.</p></div>
              <LockKeyhole size={20} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function ProfileSummary({ profile }: { profile: LearningProfile }) {
  const preferences = [profile.preferences.explanationStyle, profile.preferences.detailLevel, profile.preferences.reinforcement];
  return (
    <>
      <div className="profile-stat-strip">
        <div><MessageSquareText size={18} /><strong>{profile.conversationCount.toLocaleString()}</strong><span>conversations scanned</span></div>
        <div><BrainCircuit size={18} /><strong>{profile.userMessageCount.toLocaleString()}</strong><span>your prompts analyzed</span></div>
        <div><Sparkles size={18} /><strong>{profile.learningPromptRate}%</strong><span>learning-oriented</span></div>
        <div><CalendarDays size={18} /><strong>{profile.dateRange ? formatDateRange(profile.dateRange) : "Not dated"}</strong><span>history represented</span></div>
      </div>
      <div className="preference-grid">
        {preferences.map((item, index) => <PreferenceCard key={`${item.value}-${index}`} preference={item} index={index} />)}
      </div>
      <div className="profile-topics">
        <span>FREQUENT TOPICS</span>
        <div>{profile.topTopics.length ? profile.topTopics.map((topic) => <span key={topic}>{topic}</span>) : <span>More history needed</span>}</div>
        <p>Imported {new Date(profile.importedAt).toLocaleString()} from <strong>{profile.sourceFile}</strong></p>
      </div>
      <div className="profile-ready-cta">
        <CheckCircle2 size={23} />
        <div><strong>Your agent is ready to use this profile</strong><p>Open a lesson to see these preferences combined with your in-course mastery and activity.</p></div>
        <a href="/fit1008/recursion">Go to my lesson <ArrowRight size={15} /></a>
      </div>
    </>
  );
}

function PreferenceCard({ preference, index }: { preference: LearningPreference; index: number }) {
  return (
    <article className={`preference-card preference-${index + 1}`}>
      <span>{index === 0 ? "EXPLANATION" : index === 1 ? "DEPTH" : "REINFORCEMENT"}</span>
      <strong>{preference.value}</strong>
      <p>{preference.evidence}</p>
    </article>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateRange(range: { from: string; to: string }) {
  const from = new Date(range.from);
  const to = new Date(range.to);
  const first = from.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
  const last = to.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
  return first === last ? first : `${first}–${last}`;
}
