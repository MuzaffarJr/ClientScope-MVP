"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "./ui/button";
import { Logo } from "./ui/logo";

const LINKS = [
  { href: "/#product", id: "product", label: "Product" },
  { href: "/#how-it-works", id: "how-it-works", label: "How it works" },
  { href: "/#pricing", id: "pricing", label: "Pricing" },
];

export function SiteNav({ variant = "landing" }: { variant?: "landing" | "app" }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (variant !== "landing") return;
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [variant]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const solid = scrolled || open || variant === "app";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color] duration-500 ease-abyss ${
        solid ? "border-b border-line bg-canvas/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between md:h-20">
        <Logo />

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-10">
            {LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  aria-current={active === link.id ? "true" : undefined}
                  className={`label-instrument inline-flex min-h-11 items-center text-[12px] transition-colors duration-300 ease-abyss hover:text-heading ${
                    active === link.id ? "text-heading" : "text-body"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {variant === "app" ? (
            <span className="hidden sm:block">
              <ButtonLink href="/" variant="secondary">
                Overview
              </ButtonLink>
            </span>
          ) : (
            <span className="hidden sm:block">
              <ButtonLink href="/workspace">Generate a scope</ButtonLink>
            </span>
          )}
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-control border border-line text-mist md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              {open ? (
                <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.25" />
              ) : (
                <path d="M2 6h14M2 12h14" stroke="currentColor" strokeWidth="1.25" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-line bg-canvas md:hidden">
          <ul className="container-page flex flex-col py-4">
            {LINKS.map((link) => (
              <li key={link.id} className="border-b border-line last:border-none">
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="label-instrument flex min-h-14 items-center text-[12px] text-body hover:text-heading"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-4">
              <ButtonLink href="/workspace" className="w-full" onClick={() => setOpen(false)}>
                {variant === "app" ? "New analysis" : "Generate a scope"}
              </ButtonLink>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
