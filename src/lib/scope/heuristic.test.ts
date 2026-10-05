import { describe, expect, it } from "vitest";
import { analyzeBrief, SAMPLE_BRIEF } from "./heuristic";
import { ScopeResultSchema } from "./schema";

describe("analyzeBrief", () => {
  it("returns a result that satisfies the shared schema", () => {
    const result = analyzeBrief(SAMPLE_BRIEF);
    expect(() => ScopeResultSchema.parse(result)).not.toThrow();
  });

  it("detects pages, features and vague wording in the sample brief", () => {
    const result = analyzeBrief(SAMPLE_BRIEF);
    expect(result.pages).toEqual(expect.arrayContaining(["Home", "Work", "Booking", "Blog", "Contact"]));
    expect(result.pages.at(-1)).toBe("Contact");
    const features = result.features.map((f) => f.name);
    expect(features).toEqual(expect.arrayContaining(["Booking", "Content management", "Multilingual content"]));
    expect(result.questions[0].question).toMatch(/modern|clean|premium/);
  });

  it("names the project from the brief subject", () => {
    expect(analyzeBrief(SAMPLE_BRIEF).overview.projectName).toBe("Interior design studio marketing website");
  });

  it("classifies e-commerce briefs and adds payment questions and costs", () => {
    const result = analyzeBrief(
      "We sell handmade candles and want a Shopify store with checkout, product filters and a newsletter signup.",
    );
    expect(result.overview.projectType).toBe("E-commerce store");
    expect(result.questions.map((q) => q.question).join(" ")).toMatch(/payment provider/i);
    expect(result.boundaries.thirdPartyCost.join(" ")).toMatch(/Shopify plan/);
  });

  it("asks fewer questions when the brief already answers them", () => {
    const vague = analyzeBrief("We need a website for our bakery with a menu page and a contact form please.");
    const detailed = analyzeBrief(
      "We need a website for our bakery with a menu page and a contact form. Budget is $3000, deadline in 6 weeks. " +
        "We provide all copy and photos, designs are ready in Figma, hosting on Vercel is ours. " +
        "No maintenance needed after launch. Similar to https://example.com.",
    );
    expect(detailed.questions.length).toBeLessThan(vague.questions.length);
    expect(detailed.questions).toHaveLength(0);
  });

  it("produces ordered, non-negative estimate ranges that grow with scope", () => {
    const small = analyzeBrief("A simple landing page for our new app launch with a waitlist form.");
    const large = analyzeBrief(
      "A SaaS dashboard where users sign up, pay with Stripe subscriptions, get real-time notifications, " +
        "an admin panel to manage users, search and filters, analytics, and an AI chatbot.",
    );
    for (const r of [small, large]) {
      expect(r.estimate.hours.min).toBeGreaterThan(0);
      expect(r.estimate.hours.max).toBeGreaterThanOrEqual(r.estimate.hours.min);
      expect(r.estimate.weeks.max).toBeGreaterThan(r.estimate.weeks.min);
    }
    expect(small.estimate.complexity).toBe("low");
    expect(large.estimate.complexity).toBe("high");
    expect(large.estimate.hours.min).toBeGreaterThan(small.estimate.hours.max);
  });

  it("is deterministic", () => {
    expect(analyzeBrief(SAMPLE_BRIEF)).toEqual(analyzeBrief(SAMPLE_BRIEF));
  });

  it("puts every open question in the client summary", () => {
    const result = analyzeBrief(SAMPLE_BRIEF);
    for (const q of result.questions) expect(result.clientSummary).toContain(q.question);
  });
});
