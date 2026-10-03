import { describe, expect, it } from "vitest";
import { analyzeBrief, SAMPLE_BRIEF } from "./heuristic";
import { addToHistory, entryStatus, HISTORY_LIMIT, type HistoryEntry } from "./history";

const entry = (id: string): HistoryEntry => ({
  id,
  createdAt: "2026-10-03T00:00:00.000Z",
  brief: SAMPLE_BRIEF,
  engine: "heuristic",
  result: analyzeBrief(SAMPLE_BRIEF),
});

describe("history", () => {
  it("prepends new entries, de-duplicates and caps the list", () => {
    let list: HistoryEntry[] = [];
    for (let i = 0; i < HISTORY_LIMIT + 5; i++) list = addToHistory(list, entry(String(i)));
    expect(list).toHaveLength(HISTORY_LIMIT);
    expect(list[0].id).toBe(String(HISTORY_LIMIT + 4));
    list = addToHistory(list, entry("10"));
    expect(list.filter((e) => e.id === "10")).toHaveLength(1);
    expect(list[0].id).toBe("10");
  });

  it("describes status by open question count", () => {
    const e = entry("a");
    expect(entryStatus(e)).toMatch(/^\d+ open questions?$/);
    expect(entryStatus({ ...e, result: { ...e.result, questions: [] } })).toBe("Ready to quote");
  });
});
