import { NextResponse } from "next/server";
import { analyzeBriefWithClaude, isClaudeConfigured, ScopeRefusalError } from "@/lib/scope/claude";
import { analyzeBrief } from "@/lib/scope/heuristic";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { BriefInputSchema, type ScopeResponse } from "@/lib/scope/schema";

export const runtime = "nodejs";
export const maxDuration = 120;

// Caps how often one client can trigger a paid Claude call.
const limitRequests = createRateLimiter({ limit: 10, windowMs: 10 * 60 * 1000 });

export async function POST(request: Request) {
  const limited = limitRequests(clientKey(request));
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many analyses in a short time. Try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = BriefInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid brief." },
      { status: 400 },
    );
  }

  const { brief } = parsed.data;

  if (isClaudeConfigured()) {
    try {
      const result = await analyzeBriefWithClaude(brief);
      return NextResponse.json<ScopeResponse>({ result, engine: "claude" });
    } catch (error) {
      if (error instanceof ScopeRefusalError) {
        return NextResponse.json({ error: error.message }, { status: 422 });
      }
      // Degrade to the deterministic engine rather than failing the user.
      console.error("[scope] Claude engine failed, using heuristic engine", error);
    }
  }

  return NextResponse.json<ScopeResponse>({ result: analyzeBrief(brief), engine: "heuristic" });
}
