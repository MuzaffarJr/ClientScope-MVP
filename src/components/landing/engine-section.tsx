import { SectionLabel } from "../ui/section-label";

const STEPS = [
  { label: "Brief", body: "Paste the request exactly as the client sent it: email, chat message or call notes." },
  { label: "Analysis", body: "Project type, audience and intent are separated from adjectives and wishes." },
  { label: "Questions", body: "Gaps that change price, architecture or timeline are listed and explained." },
  { label: "Pages & features", body: "Routes and functional areas are extracted as a structured list." },
  { label: "Workload & timeline", body: "Hours and weeks as ranges that widen when the brief is vague." },
  { label: "Boundaries", body: "Included, excluded, change-request triggers and third-party costs." },
  { label: "Client summary", body: "A polished scope note you can paste into your reply." },
];

export function EngineSection() {
  return (
    <section id="how-it-works" aria-labelledby="engine-title" className="bg-deep py-28 md:py-40">
      <div className="container-page">
        <div className="reveal grid gap-8 md:grid-cols-[1fr_1fr] md:items-end">
          <div>
            <SectionLabel>How the scope engine works</SectionLabel>
            <h2 id="engine-title" className="mt-8 text-section font-medium text-heading text-balance">
              One pass from ambiguity to structure.
            </h2>
          </div>
          <p className="max-w-[440px] text-[16px] text-body md:justify-self-end">
            Every analysis follows the same seven stages, so results are comparable across projects and easy to scan.
          </p>
        </div>

        <ol className="relative mt-20 grid gap-0 md:max-w-[640px] lg:max-w-none md:mt-28 lg:grid-cols-7">
          {/* Signal line connecting the stages. */}
          <span className="absolute left-[7px] top-0 h-full w-px bg-line lg:left-0 lg:top-[7px] lg:h-px lg:w-full" aria-hidden="true" />
          {STEPS.map((step, i) => (
            <li key={step.label} className="reveal relative pb-10 pl-10 lg:pb-0 lg:pl-0 lg:pr-6 lg:pt-12">
              <span
                className={`absolute left-0 top-1 h-[15px] w-[15px] rounded-full border lg:top-0 ${
                  i === STEPS.length - 1 ? "border-stat bg-stat/20" : "border-aqua/70 bg-canvas"
                }`}
                aria-hidden="true"
              />
              <p className="label-instrument text-mist/60">0{i + 1}</p>
              <h3 className="mt-3 text-[17px] font-medium text-heading">{step.label}</h3>
              <p className="mt-3 text-[14px] text-body">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
