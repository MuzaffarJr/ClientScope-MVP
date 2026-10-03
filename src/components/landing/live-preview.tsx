"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { analyzeBrief, SAMPLE_BRIEF } from "@/lib/scope/heuristic";
import { BRIEF_MIN_CHARS, type ScopeResult } from "@/lib/scope/schema";
import { AnalysisSteps, ANALYSIS_STEPS } from "../scope/analysis-steps";
import { Boundaries, Estimate, Questions } from "../scope/scope-result-view";
import { Button, ButtonLink } from "../ui/button";
import { SectionLabel } from "../ui/section-label";

const STEP_MS = 420;

export function LivePreview() {
  const [brief, setBrief] = useState(SAMPLE_BRIEF);
  const [step, setStep] = useState(-1);
  const [result, setResult] = useState<ScopeResult | null>(null);
  const section = useRef<HTMLElement>(null);
  const timers = useRef<number[]>([]);
  const autoRan = useRef(false);

  const run = useCallback((text: string) => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = analyzeBrief(text);
    if (reduced) {
      setResult(next);
      setStep(-1);
      return;
    }
    setResult(null);
    setStep(0);
    ANALYSIS_STEPS.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setStep(i + 1), STEP_MS * (i + 1)));
    });
    timers.current.push(
      window.setTimeout(() => {
        setResult(next);
        setStep(-1);
      }, STEP_MS * (ANALYSIS_STEPS.length + 1)),
    );
  }, []);

  // Run the sample once when the section comes into view.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !autoRan.current) {
          autoRan.current = true;
          run(SAMPLE_BRIEF);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    const pending = timers.current;
    return () => {
      io.disconnect();
      pending.forEach(window.clearTimeout);
    };
  }, [run]);

  const tooShort = brief.trim().length < BRIEF_MIN_CHARS;

  return (
    <section ref={section} aria-labelledby="preview-title" className="bg-canvas py-28 md:py-40">
      <div className="container-page">
        <div className="reveal max-w-[760px]">
          <SectionLabel>Live product preview</SectionLabel>
          <h2 id="preview-title" className="mt-8 text-section font-medium text-heading text-balance">
            A real brief, processed in front of you.
          </h2>
          <p className="mt-6 max-w-[560px] text-[16px] text-body">
            This is the actual scope engine running in your browser. Edit the brief and run it again to see questions,
            estimate and boundaries change.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
          <form
            className="flex flex-col rounded-card bg-deep p-6 md:p-8 lg:sticky lg:top-28 lg:self-start"
            onSubmit={(e) => {
              e.preventDefault();
              if (!tooShort) run(brief);
            }}
          >
            <div className="flex items-center justify-between">
              <label htmlFor="preview-brief" className="label-instrument text-mist/80">
                Messy client brief
              </label>
              <span className="label-instrument text-[10px] text-muted">{brief.length} chars</span>
            </div>
            <textarea
              id="preview-brief"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={8}
              className="mt-4 w-full resize-y rounded-control border border-line bg-canvas/60 p-4 text-[15px] leading-[1.55] text-mist placeholder:text-muted focus:border-line-strong focus:outline-none focus-visible:outline-2 focus-visible:outline-mist"
            />
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button type="submit" variant="secondary" disabled={tooShort || step >= 0}>
                {step >= 0 ? "Analyzing" : "Run analysis"}
              </Button>
              <button
                type="button"
                className="label-instrument min-h-11 px-2 text-[10px] text-muted hover:text-mist"
                onClick={() => {
                  setBrief(SAMPLE_BRIEF);
                  run(SAMPLE_BRIEF);
                }}
              >
                Reset sample
              </button>
            </div>
            {tooShort ? (
              <p className="mt-3 text-[13px] text-body">Add at least {BRIEF_MIN_CHARS} characters to analyse.</p>
            ) : null}
          </form>

          <div className="min-h-[420px] space-y-6" aria-live="polite">
            {step >= 0 ? <AnalysisSteps current={step} /> : null}
            {result ? (
              <>
                <div className="rounded-card bg-raised/60 p-6 md:p-8">
                  <Estimate result={result} />
                </div>
                <Questions result={result} limit={3} />
                <Boundaries result={result} compact />
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <p className="text-[14px] text-body">Full analysis adds pages, features, deliverables and a client-ready summary.</p>
                  <ButtonLink href="/workspace">Open the workspace</ButtonLink>
                </div>
              </>
            ) : null}
            {step < 0 && !result ? (
              <div className="flex h-full min-h-[420px] items-center justify-center rounded-card border border-dashed border-line p-8 text-center">
                <p className="label-instrument text-muted">Output appears here</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
