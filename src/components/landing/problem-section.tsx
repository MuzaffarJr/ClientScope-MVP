import { SectionLabel } from "../ui/section-label";

const ROWS = [
  {
    without: "“Modern, clean, like Apple” goes into the quote as-is.",
    with: "Vague adjectives are turned into questions with measurable answers.",
  },
  {
    without: "The booking system turns out to need calendar sync and payments.",
    with: "Hidden integrations are listed with their third-party costs.",
  },
  {
    without: "One number, guessed under pressure on a call.",
    with: "Hour and week ranges that widen honestly with uncertainty.",
  },
  {
    without: "Extra pages arrive as “small tweaks” after launch.",
    with: "Change-request triggers are agreed before work starts.",
  },
];

export function ProblemSection() {
  return (
    <section aria-labelledby="problem-title" className="bg-deep py-28 md:py-40">
      <div className="container-page">
        <div className="reveal max-w-[760px]">
          <SectionLabel>Problem / solution</SectionLabel>
          <h2 id="problem-title" className="mt-8 text-section font-medium text-heading text-balance">
            Underquoting starts with an unread brief.
          </h2>
        </div>

        <div className="mt-16 md:mt-20">
          <div className="hidden grid-cols-2 gap-10 border-b border-line pb-4 md:grid">
            <p className="label-instrument text-muted">Quoting from the brief</p>
            <p className="label-instrument text-mist">Quoting from a scope</p>
          </div>
          <ul>
            {ROWS.map((row) => (
              <li key={row.with} className="reveal grid gap-4 border-b border-line py-8 md:grid-cols-2 md:gap-10">
                <p className="text-[16px] text-muted">
                  <span className="label-instrument mb-2 block text-[10px] md:hidden">Quoting from the brief</span>
                  {row.without}
                </p>
                <p className="text-[16px] text-heading">
                  <span className="label-instrument mb-2 block text-[10px] text-mist md:hidden">Quoting from a scope</span>
                  {row.with}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
