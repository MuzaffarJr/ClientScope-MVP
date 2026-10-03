"use client";

export const ANALYSIS_STEPS = [
  "Parsing requirements",
  "Finding missing information",
  "Defining scope boundaries",
  "Estimating workload",
] as const;

/**
 * Generation state: a stepped readout with a thin scanning data line on the
 * active step. `current` is the index of the running step; steps before it are done.
 */
export function AnalysisSteps({ current, title = "Analyzing client brief" }: { current: number; title?: string }) {
  return (
    <div role="status" aria-live="polite" className="rounded-card bg-deep p-6 md:p-8">
      <div className="flex items-center gap-3">
        <span className="h-1.5 w-1.5 rounded-full bg-aqua motion-safe:animate-[pulse-dot_1.6s_ease-in-out_infinite]" aria-hidden="true" />
        <p className="label-instrument text-mist">{title}</p>
      </div>
      <ol className="mt-6 border-t border-line">
        {ANALYSIS_STEPS.map((step, i) => {
          const state = i < current ? "done" : i === current ? "active" : "pending";
          return (
            <li key={step} className="relative grid grid-cols-[72px_1fr_auto] items-center gap-4 overflow-hidden border-b border-line py-4 last:border-none">
              <span className="label-instrument text-[10px] text-muted">Step {String(i + 1).padStart(2, "0")}</span>
              <span
                className={`text-[15px] transition-colors duration-500 ease-abyss ${
                  state === "pending" ? "text-muted" : "text-heading"
                }`}
              >
                {step}
              </span>
              <span className="label-instrument text-[10px] text-muted">
                {state === "done" ? <span className="text-aqua">Done</span> : state === "active" ? "Running" : "Queued"}
              </span>
              {state === "active" ? (
                <span className="absolute inset-x-0 bottom-0 h-px overflow-hidden" aria-hidden="true">
                  <span className="block h-px w-1/2 bg-gradient-to-r from-transparent via-aqua to-transparent motion-safe:animate-[scan_1.8s_var(--ease-abyss)_infinite]" />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      <span className="sr-only">
        {current < ANALYSIS_STEPS.length ? `Step ${current + 1} of ${ANALYSIS_STEPS.length}: ${ANALYSIS_STEPS[current]}` : "Finishing"}
      </span>
    </div>
  );
}
