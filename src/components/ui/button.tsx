import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary";
type Size = "md" | "lg";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-control font-mono text-[13px] uppercase tracking-[0.12em] transition-[background-color,border-color,color,opacity,filter] duration-300 ease-abyss disabled:cursor-not-allowed disabled:opacity-40 select-none";

const variants: Record<Variant, string> = {
  // Aurora gradient is reserved for primary actions only.
  primary: "bg-aurora text-deep hover:brightness-[1.06] active:brightness-95",
  secondary: "border border-line-strong text-mist hover:border-mist/60 hover:text-heading",
};

const sizes: Record<Size, string> = {
  md: "px-4 py-2.5",
  lg: "px-6 py-3.5 text-[14px]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: CommonProps & Omit<ComponentProps<"button">, "children">) {
  return (
    <button className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: CommonProps & Omit<ComponentProps<typeof Link>, "children">) {
  return (
    <Link className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}

/** 32×32 inline arrow action. The visible hit area is extended to 44px for touch. */
export function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" className={className}>
      <path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function InlineArrow({ label, ...rest }: { label: string } & Omit<ComponentProps<"button">, "children">) {
  return (
    <button
      aria-label={label}
      className="relative inline-flex h-8 w-8 items-center justify-center rounded-control border border-line text-mist transition-colors duration-300 ease-abyss before:absolute before:-inset-1.5 before:content-[''] hover:border-line-strong hover:text-heading"
      {...rest}
    >
      <ArrowIcon />
    </button>
  );
}
