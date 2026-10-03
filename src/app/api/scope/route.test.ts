import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/scope", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("POST /api/scope", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("rejects invalid JSON", async () => {
    const res = await post("{not json");
    expect(res.status).toBe(400);
  });

  it("rejects briefs that are too short", async () => {
    const res = await post({ brief: "too short" });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/at least/);
  });

  it("uses the heuristic engine when no API key is configured", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("ANTHROPIC_AUTH_TOKEN", "");
    const res = await post({ brief: "We need a portfolio website for a photographer with a gallery and contact form." });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.engine).toBe("heuristic");
    expect(body.result.overview.projectType).toBe("Portfolio website");
  });
});
