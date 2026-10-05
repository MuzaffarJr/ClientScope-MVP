"use client";

import { useEffect, useRef, useState } from "react";
import { ScopeOrb } from "../orb/scope-orb";
import { ButtonLink } from "../ui/button";

const STAGES = ["Chaos", "Analysis", "Structure"];
const CAPTIONS = [
  "A client request arrives as scattered fragments: wishes, adjectives and half-decisions.",
  "Fragments are pulled into one model: who it is for, what it must do, and what is still unknown.",
  "The output is ordered: questions, scope, workload, timeline and boundaries you can defend.",
];

/**
 * Hero + kinetic transition share one scroll-driven scene. The orb stays
 * pinned while the page scrolls through 3 stages: chaos → analysis → structure.
 */
export function HeroScene() {
  const scene = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [stage, setStage] = useState(0);
  const [heroFade, setHeroFade] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = scene.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -rect.top / travel));
      progressRef.current = p;
      setStage(p < 0.3 ? 0 : p < 0.62 ? 1 : 2);
      setHeroFade(Math.min(1, p / 0.28));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={scene} className="relative h-[260svh] md:h-[300vh]">
      {/* Pinned 3D layer: the page itself is the scene. */}
      <div className="sticky top-0 h-svh overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 55%, rgba(0,55,52,0.9) 0%, rgba(1,38,36,0) 70%), radial-gradient(40% 30% at 50% 100%, rgba(1,29,28,0.9) 0%, rgba(1,29,28,0) 100%)",
          }}
          aria-hidden="true"
        />
        <ScopeOrb progressRef={progressRef} className="absolute inset-x-0 bottom-0 top-[50%] md:top-0" />

        {/* Kinetic word — an environmental object, not a headline. */}
        <p
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-center text-kinetic font-medium text-heading transition-[opacity,transform] duration-700 ease-abyss"
          style={{
            opacity: stage === 0 ? 0 : stage === 1 ? 0.1 : 0.05,
            transform: `translateY(-50%) translateX(${stage === 0 ? 8 : stage === 1 ? 0 : -8}%)`,
          }}
        >
          Before you quote
        </p>

        <div className="absolute inset-x-0 bottom-6 md:bottom-10">
          <div className="container-page">
            <p
              key={stage}
              aria-live="polite"
              className="mb-5 max-w-[420px] text-[14px] text-body motion-safe:animate-[fade-up_700ms_var(--ease-abyss)] md:text-[15px]"
              style={{ opacity: heroFade }}
            >
              {CAPTIONS[stage]}
            </p>
          </div>
          <div className="container-page flex items-end justify-between gap-6">
            <ol className="flex gap-5 md:gap-8" aria-label="Scope engine stages">
              {STAGES.map((s, i) => (
                <li
                  key={s}
                  aria-current={stage === i ? "step" : undefined}
                  className={`label-instrument flex items-center gap-2 text-[10px] transition-colors duration-500 ease-abyss md:text-[11px] ${
                    stage === i ? "text-mist" : "text-muted/70"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${stage >= i ? "bg-aqua" : "bg-line-strong"}`}
                    aria-hidden="true"
                  />
                  0{i + 1} {s}
                </li>
              ))}
            </ol>
            <p className="label-instrument hidden text-[10px] text-muted md:block">Scroll to process the brief</p>
          </div>
        </div>
      </div>

      {/* Hero copy sits in normal flow over the pinned layer. */}
      <section
        aria-labelledby="hero-title"
        className="absolute inset-x-0 top-0 flex h-svh items-start pt-28 md:items-center md:pt-0"
        style={{ opacity: 1 - heroFade, transform: `translateY(${-heroFade * 40}px)` }}
      >
        <div className="container-page">
          <div className="relative isolate mx-auto max-w-[980px] text-center">
            {/* Soft scrim keeps copy legible over the particle field. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 -inset-y-16 -z-10 md:-inset-x-10"
              style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(1,38,36,0.72) 0%, rgba(1,38,36,0) 100%)" }}
            />
            <p className="label-instrument text-mist/80">Scope intelligence for client work</p>
            <h1 id="hero-title" className="mt-6 text-hero font-medium text-heading text-balance">
              Turn vague client requests into scopes you can defend.
            </h1>
            <p className="mx-auto mt-6 max-w-[560px] text-[16px] text-body md:text-[17px]">
              Paste the client brief. ClientScope identifies pages, features, unanswered questions, effort, timeline and
              project boundaries before you quote.
            </p>
            <div className="mt-9 flex flex-col items-center gap-4">
              <ButtonLink href="/workspace" size="lg">
                Generate a scope
              </ButtonLink>
              <p className="label-instrument text-[10px] text-muted">No setup required · No account needed</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
