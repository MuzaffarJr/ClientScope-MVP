import { SectionLabel } from "../ui/section-label";

// Facts about the product itself, not marketing claims.
const METRICS = [
  { value: "7", label: "Analysis stages", body: "From raw brief to client-ready summary in one pass." },
  { value: "11+", label: "Question checks", body: "Budget, deadline, content, ownership, roles, payments and more." },
  { value: "4", label: "Boundary types", body: "Included, excluded, change request and third-party cost." },
  { value: "0", label: "Setup steps", body: "Paste a brief. No account, template or onboarding required." },
];

export function MetricsSection() {
  return (
    <section aria-labelledby="metrics-title" className="bg-canvas py-28 md:py-40">
      <div className="container-page">
        <div className="reveal">
          <SectionLabel>Key metrics</SectionLabel>
          <h2 id="metrics-title" className="mt-8 max-w-[760px] text-section font-medium text-heading text-balance">
            Built to be read in under a minute.
          </h2>
        </div>
        <dl className="mt-16 grid gap-x-10 gap-y-14 border-t border-line pt-14 sm:grid-cols-2 lg:grid-cols-4 md:mt-20">
          {METRICS.map((m) => (
            <div key={m.label} className="reveal flex flex-col">
              <dt className="label-instrument order-2 mt-4 text-mist">{m.label}</dt>
              <dd className="order-1 text-[clamp(64px,7vw,104px)] font-medium leading-none tracking-[-0.05em] text-stat">{m.value}</dd>
              <dd className="order-3 mt-4 max-w-[260px] text-[15px] text-body">{m.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
