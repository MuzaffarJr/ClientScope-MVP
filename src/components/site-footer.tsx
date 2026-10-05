import Link from "next/link";
import { Logo } from "./ui/logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/workspace", label: "Workspace" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#pricing", label: "Pricing" },
    ],
  },
  {
    title: "Built for",
    links: [
      { href: "/#product", label: "Freelancers" },
      { href: "/#product", label: "Web designers" },
      { href: "/#product", label: "Small agencies" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-deep">
      <div className="container-page grid gap-12 py-20 md:grid-cols-[1.5fr_1fr_1fr] md:py-24">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-5 text-[15px] text-body">
            Scope intelligence for freelancers and small studios. Know what you are agreeing to before you quote.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="label-instrument text-muted">{col.title}</p>
            <ul className="mt-5 space-y-1">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="inline-flex min-h-11 items-center text-[15px] text-body hover:text-heading">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-6 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ClientScope</p>
          <p className="label-instrument">Estimates are guidance, not guarantees</p>
        </div>
      </div>
    </footer>
  );
}
