import { ButtonLink } from "../ui/button";
import { SectionLabel } from "../ui/section-label";

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    cadence: "forever",
    body: "For trying ClientScope on your next enquiry.",
    features: ["5 analyses per month", "Questions, scope and estimate", "Copyable client summary"],
    cta: "Start free",
    primary: false,
  },
  {
    name: "Pro",
    price: "$19",
    cadence: "per month",
    body: "For freelancers quoting new work every week.",
    features: ["Unlimited analyses", "Project history", "Claude-powered analysis", "PDF export (soon)"],
    cta: "Generate a scope",
    primary: true,
  },
  {
    name: "Studio",
    price: "$49",
    cadence: "per month",
    body: "For small agencies with shared rates and templates.",
    features: ["Everything in Pro", "3 seats (soon)", "Shared hourly rates (soon)", "Branded scope notes (soon)"],
    cta: "Start with Studio",
    primary: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="bg-canvas pb-28 md:pb-40">
      <div className="container-page">
        <div className="reveal border-t border-line pt-28 md:pt-40">
          <SectionLabel>Pricing</SectionLabel>
          <h2 id="pricing-title" className="mt-8 max-w-[760px] text-section font-medium text-heading text-balance">
            Priced below one underquoted hour.
          </h2>
        </div>

        <ul className="mt-16 grid gap-4 md:mt-20 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <li
              key={plan.name}
              className={`reveal flex flex-col rounded-card p-6 md:p-8 ${plan.primary ? "bg-raised" : "bg-deep"}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="label-instrument text-heading">{plan.name}</h3>
                {plan.primary ? <span className="label-instrument text-[10px] text-lavender">Recommended</span> : null}
              </div>
              <p className="mt-8 flex items-baseline gap-3">
                <span className="text-[56px] font-medium leading-none tracking-[-0.04em] text-heading">{plan.price}</span>
                <span className="label-instrument text-[10px] text-muted">{plan.cadence}</span>
              </p>
              <p className="mt-4 text-[15px] text-body">{plan.body}</p>
              <ul className="mt-8 flex-1 border-t border-line">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-3 border-b border-line py-3 text-[15px] text-mist">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-aqua/80" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <ButtonLink href="/workspace" variant={plan.primary ? "primary" : "secondary"} className="mt-8 w-full">
                {plan.cta}
              </ButtonLink>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[13px] text-muted">Prices in USD. Billing is not live yet; every plan currently runs free during the beta.</p>
      </div>
    </section>
  );
}
