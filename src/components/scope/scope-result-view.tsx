"use client";

import { useState } from "react";
import { formatRange, type ScopeResult } from "@/lib/scope/schema";
import { ArrowIcon } from "../ui/button";

const IMPACT_LABEL: Record<ScopeResult["questions"][number]["impact"], string> = {
  price: "Affects price",
  architecture: "Affects architecture",
  timeline: "Affects timeline",
};

function BlockLabel({ children, count }: { children: string; count?: number }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h3 className="label-instrument text-mist/80">{children}</h3>
      {count !== undefined ? (
        <span className="label-instrument text-muted">
          {String(count).padStart(2, "0")} {count === 1 ? "item" : "items"}
        </span>
      ) : null}
    </div>
  );
}

export function Overview({ result }: { result: ScopeResult }) {
  return (
    <section aria-labelledby="ov-title" className="pb-2">
      <p className="label-instrument text-muted">Project overview · {result.overview.projectType}</p>
      <h2 id="ov-title" className="mt-4 text-[clamp(28px,3.4vw,40px)] font-medium leading-[1.1] tracking-[-0.03em] text-heading">
        {result.overview.projectName}
      </h2>
      <p className="mt-4 max-w-[640px] text-[16px] text-body">{result.overview.summary}</p>
    </section>
  );
}

export function Questions({ result, limit }: { result: ScopeResult; limit?: number }) {
  const items = limit ? result.questions.slice(0, limit) : result.questions;
  return (
    <section aria-label="Open questions" className="rounded-card bg-raised p-6 md:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="label-instrument text-mist/80">Open questions</h3>
          <p className="mt-2 max-w-[460px] text-[14px] text-body">Resolve these with the client before committing to a fixed price.</p>
        </div>
        <p className="text-right">
          <span className="block text-[44px] font-medium leading-none tracking-[-0.04em] text-stat">
            {String(result.questions.length).padStart(2, "0")}
          </span>
          <span className="label-instrument text-[10px] text-muted">To resolve</span>
        </p>
      </div>
      {items.length === 0 ? (
        <p className="mt-6 border-t border-line pt-6 text-[15px] text-body">
          No blocking questions. The brief covers budget, timing, content and ownership.
        </p>
      ) : (
        <ol className="mt-6 border-t border-line">
          {items.map((q, i) => (
            <li key={q.question} className="grid gap-2 border-b border-line py-5 last:border-none sm:grid-cols-[40px_1fr]">
              <span className="label-instrument pt-1 text-lavender/80">Q{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-[16px] text-heading">{q.question}</p>
                <p className="mt-1.5 text-[14px] text-body">{q.why}</p>
                <p className="label-instrument mt-3 text-[10px] text-muted">{IMPACT_LABEL[q.impact]}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
      {limit && result.questions.length > limit ? (
        <p className="label-instrument mt-4 text-[10px] text-muted">+ {result.questions.length - limit} more in the full analysis</p>
      ) : null}
    </section>
  );
}

export function Estimate({ result }: { result: ScopeResult }) {
  const metrics = [
    { value: formatRange(result.estimate.hours), label: "Hours" },
    { value: formatRange(result.estimate.weeks), label: "Weeks" },
    { value: result.estimate.complexity.toUpperCase(), label: "Complexity" },
  ];
  return (
    <section aria-label="Estimate" className="py-2">
      <BlockLabel>Estimate</BlockLabel>
      <dl className="mt-8 flex flex-wrap gap-x-14 gap-y-10">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col">
            <dt className="label-instrument order-2 mt-3 text-mist">{m.label}</dt>
            <dd className="order-1 whitespace-nowrap text-metric font-medium text-stat">{m.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-8 max-w-[640px] border-t border-line pt-5 text-[14px] text-body">{result.estimate.rationale}</p>
    </section>
  );
}

export function ScopeLists({ result }: { result: ScopeResult }) {
  return (
    <section aria-label="Scope" className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-12">
      <div>
        <BlockLabel count={result.pages.length}>Pages</BlockLabel>
        <ol className="mt-5 border-t border-line">
          {result.pages.map((p, i) => (
            <li key={p} className="flex items-baseline gap-5 border-b border-line py-3.5">
              <span className="label-instrument w-6 text-muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[16px] text-heading">{p}</span>
            </li>
          ))}
        </ol>
      </div>
      <div>
        <BlockLabel count={result.features.length}>Features</BlockLabel>
        {result.features.length === 0 ? (
          <p className="mt-5 border-t border-line pt-4 text-[15px] text-body">No custom functionality detected. Content pages only.</p>
        ) : (
          <ol className="mt-5 border-t border-line">
            {result.features.map((f, i) => (
              <li key={f.name} className="flex gap-5 border-b border-line py-3.5">
                <span className="label-instrument w-6 pt-1 text-muted">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="text-[16px] text-heading">{f.name}</p>
                  <p className="mt-1 text-[14px] text-body">{f.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

export function Boundaries({ result, compact = false }: { result: ScopeResult; compact?: boolean }) {
  const rows = [
    { label: "Included", items: result.boundaries.included, mark: "+" },
    { label: "Excluded", items: result.boundaries.excluded, mark: "−" },
    { label: "Requires change request", items: result.boundaries.changeRequest, mark: "Δ" },
    { label: "Third-party cost", items: result.boundaries.thirdPartyCost, mark: "$" },
  ];
  return (
    <section aria-label="Scope boundaries" className="rounded-card bg-deep p-6 md:p-8">
      <BlockLabel>Scope boundaries</BlockLabel>
      <dl className="mt-6">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-3 border-t border-line py-5 md:grid-cols-[220px_1fr] md:gap-8">
            <dt className="label-instrument pt-0.5 text-heading">{row.label}</dt>
            <dd>
              <ul className="space-y-2">
                {(compact ? row.items.slice(0, 2) : row.items).map((item) => (
                  <li key={item} className="flex gap-3 text-[15px] text-body">
                    <span className="w-3 shrink-0 font-mono text-[13px] text-mist/60" aria-hidden="true">
                      {row.mark}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Deliverables({ result }: { result: ScopeResult }) {
  return (
    <section aria-label="Deliverables">
      <BlockLabel count={result.deliverables.length}>Deliverables</BlockLabel>
      <ul className="mt-5 grid border-t border-line sm:grid-cols-2 sm:gap-x-10">
        {result.deliverables.map((d) => (
          <li key={d} className="flex gap-4 border-b border-line py-3.5 text-[15px] text-heading">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-aqua" aria-hidden="true" />
            {d}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ClientSummary({ result }: { result: ScopeResult }) {
  const [copied, setCopied] = useState<"idle" | "done" | "error">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(result.clientSummary);
      setCopied("done");
    } catch {
      setCopied("error");
    }
    window.setTimeout(() => setCopied("idle"), 2200);
  }

  return (
    <section aria-label="Client-ready summary" className="rounded-card bg-deep">
      <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4 md:px-8">
        <h3 className="label-instrument text-mist/80">Client-ready summary</h3>
        <button
          type="button"
          onClick={copy}
          className="label-instrument inline-flex min-h-11 items-center gap-2 rounded-control px-2 text-mist hover:text-heading"
        >
          <span aria-live="polite">{copied === "done" ? "Copied" : copied === "error" ? "Copy failed" : "Copy"}</span>
          <ArrowIcon />
        </button>
      </div>
      <pre className="whitespace-pre-wrap break-words px-6 py-6 font-sans text-[15px] leading-[1.6] text-mist md:px-8 md:py-8">
        {result.clientSummary}
      </pre>
    </section>
  );
}

/** Full result in decision order. Hierarchy is carried by surface and scale, not equal cards. */
export function ScopeResultView({ result }: { result: ScopeResult }) {
  return (
    <div className="space-y-12 md:space-y-16">
      <Overview result={result} />
      <Questions result={result} />
      <ScopeLists result={result} />
      <Estimate result={result} />
      <Boundaries result={result} />
      <Deliverables result={result} />
      <ClientSummary result={result} />
    </div>
  );
}
