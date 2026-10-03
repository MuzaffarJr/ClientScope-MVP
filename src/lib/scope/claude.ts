import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { ScopeResultSchema, type ScopeResult } from "./schema";

const MODEL = process.env.CLIENTSCOPE_MODEL ?? "claude-opus-5-5";

const SYSTEM_PROMPT = `You are ClientScope, a senior project scoper for freelancers and small digital agencies.
You receive a raw client brief and return a scope the freelancer can defend before quoting.

Guidelines:
- Missing questions come first in importance. Ask only questions whose answers change price, architecture or timeline. Explain why each matters in one sentence.
- Pages are short route names. Features are functional areas, not visual adjectives.
- Estimate hours and weeks as honest ranges for one experienced builder working ~25 billable hours per week. Widen ranges when the brief is vague.
- Boundaries read like a contract: included, excluded, what requires a change request, and third-party costs the client pays.
- The client summary is a polished plain-text scope note the freelancer can paste into an email. No markdown headings, no emoji.
- Write in the same language as the brief.`;

export function isClaudeConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

export class ScopeRefusalError extends Error {}

export async function analyzeBriefWithClaude(brief: string): Promise<ScopeResult> {
  const client = new Anthropic();
  const response = await client.beta.messages.parse({
    model: MODEL,
    // On a policy decline, the API re-runs the request on a fallback model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    max_tokens: 16000,
    output_config: {
      effort: "medium",
      format: betaZodOutputFormat(ScopeResultSchema),
    },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Client brief:\n<brief>\n${brief}\n</brief>`,
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new ScopeRefusalError("The model declined to analyse this brief.");
  }
  if (!response.parsed_output) {
    throw new Error(`Model returned no structured output (stop_reason: ${response.stop_reason}).`);
  }
  return response.parsed_output;
}
