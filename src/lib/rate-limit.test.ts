import { describe, expect, it } from "vitest";
import { clientKey, createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows up to the limit, then blocks until the window resets", () => {
    const check = createRateLimiter({ limit: 2, windowMs: 60_000 });
    expect(check("a", 0)).toEqual({ ok: true });
    expect(check("a", 1)).toEqual({ ok: true });
    expect(check("a", 2)).toEqual({ ok: false, retryAfterSeconds: 60 });
    expect(check("b", 2)).toEqual({ ok: true });
    expect(check("a", 60_000)).toEqual({ ok: true });
  });
});

describe("clientKey", () => {
  it("uses the first forwarded address", () => {
    const request = new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" } });
    expect(clientKey(request)).toBe("1.2.3.4");
  });
});
