"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { SAMPLE_BRIEF } from "@/lib/scope/heuristic";
import { addToHistory, historyStore, type HistoryEntry } from "@/lib/scope/history";
import { BRIEF_MAX_CHARS, BRIEF_MIN_CHARS, type ScopeResponse } from "@/lib/scope/schema";
import { AnalysisSteps, ANALYSIS_STEPS } from "../scope/analysis-steps";
import { ScopeResultView } from "../scope/scope-result-view";
import { Button } from "../ui/button";
import { RecentScopes } from "./recent-scopes";

type Status = "idle" | "loading" | "success" | "error";

const STEP_MS = 650;

const PASTE_HINTS = [
  "The client's email or message, unedited",
  "Notes from the discovery call",
  "Any links, budget or deadline they mentioned",
];

export function Workspace() {
  const [brief, setBrief] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<HistoryEntry | null>(null);
  const history = useSyncExternalStore(historyStore.subscribe, historyStore.getSnapshot, historyStore.getServerSnapshot);
  const resultsRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const trimmed = brief.trim();
  const tooShort = trimmed.length < BRIEF_MIN_CHARS;
  const tooLong = brief.length > BRIEF_MAX_CHARS;
  const canSubmit = !tooShort && !tooLong && status !== "loading";

  const generate = useCallback(async () => {
    if (!canSubmit) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setError(null);
    setActive(null);
    setStep(0);
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));

    // Steps advance on a clock but hold on the last one until the response lands.
    const ticker = window.setInterval(() => {
      setStep((s) => Math.min(s + 1, ANALYSIS_STEPS.length - 1));
    }, STEP_MS);
    const minDuration = new Promise((r) => window.setTimeout(r, STEP_MS * ANALYSIS_STEPS.length));

    try {
      const [res] = await Promise.all([
        fetch("/api/scope", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brief: trimmed }),
          signal: controller.signal,
        }),
        minDuration,
      ]);
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const message =
          data && typeof data === "object" && "error" in data && typeof data.error === "string"
            ? data.error
            : "The analysis could not be completed.";
        throw new Error(message);
      }
      const payload = data as ScopeResponse;
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        brief: trimmed,
        engine: payload.engine,
        result: payload.result,
      };
      setStep(ANALYSIS_STEPS.length);
      setActive(entry);
      setStatus("success");
      historyStore.set(addToHistory(historyStore.getSnapshot(), entry));
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error && err.message !== "Failed to fetch" ? err.message : "Network error. Check your connection and try again.");
      setStatus("error");
    } finally {
      window.clearInterval(ticker);
    }
  }, [canSubmit, trimmed]);

  function selectEntry(entry: HistoryEntry) {
    abortRef.current?.abort();
    setActive(entry);
    setBrief(entry.brief);
    setStatus("success");
    setError(null);
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function newAnalysis() {
    abortRef.current?.abort();
    setActive(null);
    setBrief("");
    setStatus("idle");
    setError(null);
    textareaRef.current?.focus();
  }

  function clearHistory() {
    historyStore.set([]);
  }

  return (
    <div className="container-page grid gap-12 pb-24 pt-28 md:pt-32 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
      <div className="min-w-0">
        {/* Input */}
        <section aria-labelledby="new-title" className="rounded-card bg-raised/50 p-5 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="label-instrument text-mist/80">New analysis</p>
            {active || status !== "idle" ? (
              <button type="button" onClick={newAnalysis} className="label-instrument min-h-11 px-1 text-[10px] text-muted hover:text-mist">
                Clear and start over
              </button>
            ) : null}
          </div>
          <h1 id="new-title" className="mt-5 text-[clamp(30px,3.6vw,44px)] font-medium leading-[1.05] tracking-[-0.03em] text-heading">
            Client brief
          </h1>
          <p className="mt-3 max-w-[560px] text-[15px] text-body">
            Paste the request as you received it. Messy is fine — that is the point.
          </p>

          <form
            className="mt-8"
            onSubmit={(e) => {
              e.preventDefault();
              void generate();
            }}
          >
            <label htmlFor="brief" className="sr-only">
              Client brief
            </label>
            <textarea
              ref={textareaRef}
              id="brief"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  void generate();
                }
              }}
              rows={10}
              aria-describedby="brief-help brief-count"
              aria-invalid={tooLong || undefined}
              placeholder="Hi, we need a new website for our clinic. Something modern with online booking and maybe a blog…"
              className="block min-h-[220px] w-full resize-y rounded-control border border-line bg-deep/70 p-4 text-[16px] leading-[1.55] text-mist placeholder:text-muted/80 focus:border-line-strong focus:outline-none focus-visible:outline-2 focus-visible:outline-mist md:p-5"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p id="brief-help" className="text-[13px] text-muted">
                {tooLong
                  ? `Shorten the brief to ${BRIEF_MAX_CHARS.toLocaleString()} characters or fewer.`
                  : tooShort && brief.length > 0
                    ? `Add a little more detail (at least ${BRIEF_MIN_CHARS} characters).`
                    : "Ctrl / ⌘ + Enter to generate"}
              </p>
              <p id="brief-count" className={`label-instrument text-[10px] ${tooLong ? "text-danger" : "text-muted"}`}>
                {brief.length.toLocaleString()} / {BRIEF_MAX_CHARS.toLocaleString()}
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="submit" size="lg" disabled={!canSubmit} className="w-full sm:w-auto">
                {status === "loading" ? "Analyzing…" : "Generate scope"}
              </Button>
              {brief.length === 0 ? (
                <Button type="button" variant="secondary" size="lg" onClick={() => setBrief(SAMPLE_BRIEF)} className="w-full sm:w-auto">
                  Use a sample brief
                </Button>
              ) : null}
            </div>
          </form>
        </section>

        {/* Generation + results */}
        <div ref={resultsRef} className="scroll-mt-28 pt-12 md:pt-16">
          {status === "idle" ? (
            <section aria-label="What to paste" className="grid gap-10 border-t border-line pt-10 md:grid-cols-2">
              <div>
                <p className="label-instrument text-mist/80">What to paste</p>
                <ul className="mt-5 border-t border-line">
                  {PASTE_HINTS.map((hint, i) => (
                    <li key={hint} className="flex gap-4 border-b border-line py-3.5 text-[15px] text-body">
                      <span className="label-instrument text-muted">0{i + 1}</span>
                      {hint}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="label-instrument text-mist/80">What you get back</p>
                <p className="mt-5 border-t border-line pt-4 text-[15px] text-body">
                  Open questions to resolve first, pages and features, an hours and weeks estimate, contract-style scope
                  boundaries, deliverables and a summary you can paste into your reply.
                </p>
              </div>
            </section>
          ) : null}

          {status === "loading" ? <AnalysisSteps current={step} /> : null}

          {status === "error" ? (
            <section role="alert" className="rounded-card bg-deep p-6 md:p-8">
              <p className="label-instrument text-danger">Analysis failed</p>
              <p className="mt-4 text-[16px] text-heading">{error}</p>
              <p className="mt-2 text-[14px] text-body">Your brief is still in the editor. Nothing was lost.</p>
              <div className="mt-6">
                <Button type="button" variant="secondary" onClick={() => void generate()} disabled={!canSubmit}>
                  Try again
                </Button>
              </div>
            </section>
          ) : null}

          {status === "success" && active ? (
            <div>
              <p className="label-instrument mb-8 flex items-center gap-2 text-[10px] text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-aqua" aria-hidden="true" />
                Scope output · {active.engine === "claude" ? "AI analysis" : "Rule-based analysis"}
              </p>
              <ScopeResultView result={active.result} />
            </div>
          ) : null}
        </div>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <RecentScopes entries={history} activeId={active?.id ?? null} onSelect={selectEntry} onClear={clearHistory} />
      </aside>
    </div>
  );
}
