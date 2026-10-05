import { z } from "zod";

export const BRIEF_MIN_CHARS = 40;
export const BRIEF_MAX_CHARS = 8000;

export const BriefInputSchema = z.object({
  brief: z
    .string()
    .trim()
    .min(BRIEF_MIN_CHARS, `Brief must be at least ${BRIEF_MIN_CHARS} characters.`)
    .max(BRIEF_MAX_CHARS, `Brief must be at most ${BRIEF_MAX_CHARS} characters.`),
});

export const ComplexitySchema = z.enum(["low", "medium", "high"]);
export type Complexity = z.infer<typeof ComplexitySchema>;

const RangeSchema = z.object({
  min: z.number().int().nonnegative(),
  max: z.number().int().nonnegative(),
});

export const ScopeResultSchema = z.object({
  overview: z.object({
    projectName: z.string(),
    projectType: z.string(),
    summary: z.string(),
  }),
  questions: z.array(
    z.object({
      question: z.string(),
      why: z.string(),
      impact: z.enum(["price", "architecture", "timeline"]),
    }),
  ),
  pages: z.array(z.string()),
  features: z.array(
    z.object({
      name: z.string(),
      detail: z.string(),
    }),
  ),
  estimate: z.object({
    hours: RangeSchema,
    weeks: RangeSchema,
    complexity: ComplexitySchema,
    rationale: z.string(),
  }),
  boundaries: z.object({
    included: z.array(z.string()),
    excluded: z.array(z.string()),
    changeRequest: z.array(z.string()),
    thirdPartyCost: z.array(z.string()),
  }),
  deliverables: z.array(z.string()),
  clientSummary: z.string(),
});

export type ScopeResult = z.infer<typeof ScopeResultSchema>;
export type ScopeQuestion = ScopeResult["questions"][number];

export type ScopeEngine = "claude" | "heuristic";

export interface ScopeResponse {
  result: ScopeResult;
  engine: ScopeEngine;
}

export function formatRange(range: { min: number; max: number }): string {
  return range.min === range.max ? `${range.min}` : `${range.min}–${range.max}`;
}
