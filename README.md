# ClientScope

ClientScope turns a vague client brief into a scope a freelancer can defend before quoting: open questions, pages, features, workload and timeline ranges, contract-style boundaries, deliverables and a client-ready summary.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS 4 with design tokens in `src/app/globals.css`
- React Three Fiber + Three.js for the hero Scope Orb (custom particle shader)
- Anthropic SDK with Zod structured outputs for AI analysis
- Vitest

## Getting started

```bash
npm install
cp .env.example .env.local   # optional: add ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000 for the landing page and `/workspace` for the app.

## Scope engines

`POST /api/scope` with `{ "brief": "..." }` returns `{ result, engine }`.

- **claude**: used when `ANTHROPIC_API_KEY` is set. Calls `claude-opus-5-5` with a Zod schema (`src/lib/scope/schema.ts`) so the response is validated structured output. Server-side refusal fallback is enabled.
- **heuristic**: deterministic, keyword-based engine in `src/lib/scope/heuristic.ts`. Used without a key, as a fallback if the Claude call fails, and in-browser for the landing page live preview.

Both engines return the same `ScopeResult` shape.

## Deployment

Deployed on Vercel from `main`. Set `ANTHROPIC_API_KEY` in the Vercel project's environment variables to enable the Claude engine; set `NEXT_PUBLIC_SITE_URL` once a custom domain is attached. `/api/scope` allows 10 requests per client per 10 minutes (in-memory, per instance) to cap paid model calls.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit and route tests |

## Design system

"Abyssal Intelligence Terminal": depth comes from three surface colors (`deep` #011d1c → `canvas` #012624 → `raised` #003734), never from shadows. Radii are 16px (cards) and 6px (controls). The aurora gradient is reserved for primary CTAs. Instrument labels (`label-instrument`) are uppercase mono with 0.14em tracking.

The orb degrades progressively: a server-rendered static SVG orb shows first, then WebGL fades in. Reduced-motion users, devices without WebGL and low-end mobile keep the static orb; mobile and low-core devices get a lighter particle count.

## Project history

Recent scopes are stored in `localStorage` on the user's device only. There are no accounts yet.
