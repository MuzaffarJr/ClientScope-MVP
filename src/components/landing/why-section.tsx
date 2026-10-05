import { ArrowIcon } from "../ui/button";
import { SectionLabel } from "../ui/section-label";

const BENEFITS = [
  {
    title: "Open questions",
    body: "Identify information that can change price or architecture before it becomes your problem.",
  },
  {
    title: "Scope boundaries",
    body: "Make assumptions, exclusions and change-request triggers visible to both sides.",
  },
  {
    title: "Estimation",
    body: "Convert vague text into workload and timeline ranges that widen honestly with uncertainty.",
  },
];

/** Scattered strokes on the left resolve into an ordered grid on the right. */
function ConvergenceDiagram() {
  const chaos = [
    [24, 40, 70, 22],
    [40, 120, 96, 150],
    [18, 210, 64, 186],
    [60, 280, 30, 320],
    [90, 70, 120, 100],
    [76, 236, 126, 250],
    [30, 360, 92, 344],
  ];
  return (
    <svg viewBox="0 0 420 400" className="h-auto w-full" role="img" aria-label="Unstructured lines converge into an ordered grid">
      {chaos.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#bbc7c6" strokeOpacity="0.35" strokeWidth="1" />
      ))}
      {chaos.map(([, , x2, y2], i) => (
        <path
          key={`c${i}`}
          d={`M${x2} ${y2} C ${190} ${y2}, ${200} ${60 + i * 46}, ${262} ${60 + i * 46}`}
          fill="none"
          stroke="#7de8df"
          strokeOpacity="0.28"
          strokeWidth="1"
        />
      ))}
      <circle cx="210" cy="200" r="4" fill="#fde9ff" />
      <circle cx="210" cy="200" r="22" fill="none" stroke="#edfffe" strokeOpacity="0.18" />
      {Array.from({ length: 7 }).map((_, i) => (
        <g key={`r${i}`}>
          <line x1="262" y1={60 + i * 46} x2="400" y2={60 + i * 46} stroke="#edfffe" strokeOpacity="0.12" />
          <circle cx="262" cy={60 + i * 46} r="2.5" fill="#7de8df" />
          <rect x="280" y={54 + i * 46} width={40 + ((i * 37) % 70)} height="3" rx="1.5" fill="#edfffe" fillOpacity="0.5" />
          <rect x="280" y={62 + i * 46} width={24 + ((i * 23) % 40)} height="2" rx="1" fill="#bbc7c6" fillOpacity="0.3" />
        </g>
      ))}
    </svg>
  );
}

export function WhySection() {
  return (
    <section id="product" aria-labelledby="why-title" className="relative bg-canvas py-28 md:py-40">
      <div className="container-page">
        <div className="grid items-center gap-16 md:grid-cols-[1.15fr_1fr] md:gap-20">
          <div className="reveal">
            <SectionLabel>Why ClientScope</SectionLabel>
            <h2 id="why-title" className="mt-8 text-section font-medium text-heading text-balance">
              Know what you are agreeing to before you quote.
            </h2>
            <p className="mt-8 max-w-[520px] text-[17px] text-body">
              Client briefs arrive as a few enthusiastic sentences. The missing details surface later, as unpaid revisions,
              surprise integrations and deadlines nobody agreed to. ClientScope reads the brief the way a senior
              producer would and shows you what is actually being asked, what is still unknown, and where the edges of
              the work should sit.
            </p>
          </div>
          <div className="reveal rounded-card bg-deep p-6 md:p-10">
            <div className="mb-6 flex items-center justify-between">
              <span className="label-instrument text-muted">Brief</span>
              <span className="label-instrument text-mist">Scope</span>
            </div>
            <ConvergenceDiagram />
          </div>
        </div>

        <ol className="mt-24 border-t border-line md:mt-32">
          {BENEFITS.map((b, i) => (
            <li key={b.title} className="reveal border-b border-line">
              <div className="grid items-start gap-4 py-12 md:grid-cols-[120px_1fr_1.3fr_40px] md:items-center md:gap-10">
                <span className="label-instrument text-mist/70">0{i + 1}</span>
                <h3 className="label-instrument text-[13px] text-heading">{b.title}</h3>
                <p className="max-w-[480px] text-[16px] text-body">{b.body}</p>
                <span className="hidden justify-self-end text-muted md:block" aria-hidden="true">
                  <ArrowIcon />
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
