"use client";

import { entryStatus, type HistoryEntry } from "@/lib/scope/history";
import { ArrowIcon } from "../ui/button";

const dateFmt = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });

export function RecentScopes({
  entries,
  activeId,
  onSelect,
  onClear,
}: {
  entries: HistoryEntry[];
  activeId: string | null;
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
}) {
  return (
    <section aria-labelledby="recent-title">
      <div className="flex items-center justify-between">
        <h2 id="recent-title" className="label-instrument text-mist/80">
          Recent scopes
        </h2>
        {entries.length > 0 ? (
          <button type="button" onClick={onClear} className="label-instrument min-h-11 px-1 text-[10px] text-muted hover:text-mist">
            Clear
          </button>
        ) : null}
      </div>

      {entries.length === 0 ? (
        <div className="mt-4 border-t border-line pt-5">
          <p className="text-[14px] text-body">No scopes yet. Each analysis you run is saved here, on this device only.</p>
        </div>
      ) : (
        <ul className="mt-3 border-t border-line">
          {entries.map((entry) => {
            const active = entry.id === activeId;
            return (
              <li key={entry.id} className="border-b border-line">
                <button
                  type="button"
                  onClick={() => onSelect(entry)}
                  aria-current={active ? "true" : undefined}
                  className={`group grid w-full grid-cols-[1fr_auto] items-center gap-3 py-3.5 text-left transition-colors duration-300 ease-abyss ${
                    active ? "text-heading" : "text-body hover:text-heading"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      {active ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-aqua" aria-hidden="true" /> : null}
                      <span className="truncate text-[15px]">{entry.result.overview.projectName}</span>
                    </span>
                    <span className="label-instrument mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted">
                      <span>{entry.result.overview.projectType}</span>
                      <span>{dateFmt.format(new Date(entry.createdAt))}</span>
                      <span className={entry.result.questions.length === 0 ? "text-aqua" : "text-lavender/80"}>
                        {entryStatus(entry)}
                      </span>
                    </span>
                  </span>
                  <span className="text-muted transition-colors group-hover:text-mist" aria-hidden="true">
                    <ArrowIcon />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
