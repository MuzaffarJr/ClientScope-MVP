import type { ScopeEngine, ScopeResult } from "./schema";

export interface HistoryEntry {
  id: string;
  createdAt: string;
  brief: string;
  engine: ScopeEngine;
  result: ScopeResult;
}

const KEY = "clientscope.history.v1";
export const HISTORY_LIMIT = 20;

/** Local-only project history. Browser storage can be unavailable, so every access is guarded. */
export function loadHistory(): HistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, HISTORY_LIMIT)));
  } catch {
    // Storage full or blocked: history is a convenience, so fail silently.
  }
}

export function addToHistory(entries: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  return [entry, ...entries.filter((e) => e.id !== entry.id)].slice(0, HISTORY_LIMIT);
}

export function entryStatus(entry: HistoryEntry): string {
  const open = entry.result.questions.length;
  return open === 0 ? "Ready to quote" : `${open} open ${open === 1 ? "question" : "questions"}`;
}

// Minimal external store so components read history via useSyncExternalStore
// (server snapshot is empty; the client hydrates from localStorage).
const EMPTY: HistoryEntry[] = [];
let cache: HistoryEntry[] | null = null;
const listeners = new Set<() => void>();

export const historyStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): HistoryEntry[] {
    if (cache === null) cache = loadHistory();
    return cache;
  },
  getServerSnapshot(): HistoryEntry[] {
    return EMPTY;
  },
  set(next: HistoryEntry[]) {
    cache = next.slice(0, HISTORY_LIMIT);
    saveHistory(cache);
    listeners.forEach((l) => l());
  },
};
