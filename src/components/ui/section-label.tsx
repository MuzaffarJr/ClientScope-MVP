import type { ReactNode } from "react";

export function SectionLabel({
  children,
  index,
  className = "",
  as: Tag = "p",
}: {
  children: ReactNode;
  index?: string;
  className?: string;
  as?: "p" | "h2" | "h3" | "span";
}) {
  return (
    <Tag className={`label-instrument flex items-center gap-3 text-muted ${className}`}>
      {index ? <span className="text-mist/70">{index}</span> : null}
      <span className="h-px w-6 bg-line-strong" aria-hidden="true" />
      <span>{children}</span>
    </Tag>
  );
}
