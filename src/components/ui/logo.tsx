import Link from "next/link";

/** Mark: a scope ring with a single resolved point — ambiguity reduced to a position. */
export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10.25" fill="none" stroke="#edfffe" strokeOpacity="0.35" strokeWidth="1" />
      <circle cx="12" cy="12" r="6" fill="none" stroke="#edfffe" strokeWidth="1" />
      <path d="M12 1.75v4M12 18.25v4M1.75 12h4M18.25 12h4" stroke="#edfffe" strokeOpacity="0.5" strokeWidth="1" />
      <circle cx="12" cy="12" r="1.75" fill="#fde9ff" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="inline-flex min-h-11 items-center gap-2.5 text-heading" aria-label="ClientScope home">
      <LogoMark />
      <span className="text-[17px] font-medium tracking-[-0.02em]">ClientScope</span>
    </Link>
  );
}
