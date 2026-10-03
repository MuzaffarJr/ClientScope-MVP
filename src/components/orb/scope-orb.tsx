"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { ORB_NODES } from "./orb-nodes";
import { OrbStatic } from "./orb-static";

const ScopeOrbCanvas = dynamic(() => import("./scope-orb-canvas"), { ssr: false });

type Mode = "pending" | "static" | "low" | "high";

let cachedMode: Mode | null = null;
const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeMode(onChange: () => void) {
  const mq = window.matchMedia(REDUCED);
  const handler = () => {
    cachedMode = null;
    onChange();
  };
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}

function getMode(): Mode {
  if (cachedMode === null) cachedMode = detectMode();
  return cachedMode;
}

const getServerMode = (): Mode => "pending";

function detectMode(): Mode {
  if (window.matchMedia(REDUCED).matches) return "static";
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return "static";
  } catch {
    return "static";
  }
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowCpu = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
  const small = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
  if (lowCpu && small) return "static";
  return small || lowCpu ? "low" : "high";
}

/**
 * The hero scene. Progressive: the static orb renders on the server, then the
 * WebGL orb fades in once loaded. `progressRef` (0–1) drives chaos → structure.
 */
export function ScopeOrb({
  progressRef,
  className = "",
}: {
  progressRef: RefObject<number>;
  className?: string;
}) {
  const mode = useSyncExternalStore(subscribeMode, getMode, getServerMode);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLElement | null)[]>([]);

  // Stop rendering entirely when the scene is off screen.
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (mode !== "high" && mode !== "low") return;
    // Give the canvas a frame to compile shaders before cross-fading.
    const t = window.setTimeout(() => setReady(true), 400);
    return () => window.clearTimeout(t);
  }, [mode]);

  const webgl = mode === "high" || mode === "low";

  return (
    <div ref={host} className={`pointer-events-none ${className}`} aria-hidden="true">
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-abyss ${
          webgl && ready ? "opacity-0" : "opacity-100"
        }`}
      >
        <OrbStatic className="aspect-square w-[min(78vw,560px)] md:w-[min(56vw,640px)]" />
      </div>

      {webgl ? (
        <div className={`absolute inset-0 transition-opacity duration-1000 ease-abyss ${ready ? "opacity-100" : "opacity-0"}`}>
          <ScopeOrbCanvas quality={mode} progressRef={progressRef} labelRefs={labelRefs} active={visible} />
          <OrbLabels labelRefs={labelRefs} />
        </div>
      ) : null}
    </div>
  );
}

function OrbLabels({ labelRefs }: { labelRefs: RefObject<(HTMLElement | null)[]> }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {ORB_NODES.map((label, i) => (
        <span
          key={label}
          ref={(el) => {
            labelRefs.current[i] = el;
          }}
          className="absolute left-0 top-0 opacity-0 will-change-transform"
        >
          <span className="label-instrument -translate-x-1/2 translate-y-3 whitespace-nowrap text-[10px] text-mist/80 inline-block">
            {label}
          </span>
        </span>
      ))}
    </div>
  );
}
