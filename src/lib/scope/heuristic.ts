import type { Complexity, ScopeQuestion, ScopeResult } from "./schema";

/**
 * Deterministic scope engine. Runs without an API key, powers the landing
 * page live preview, and is the fallback when the Claude engine is
 * unavailable. Every rule is keyword based so results are explainable.
 */

interface ProjectType {
  id: string;
  label: string;
  match: RegExp;
  baseHours: number;
  defaultPages: string[];
}

const PROJECT_TYPES: ProjectType[] = [
  {
    id: "ecommerce",
    label: "E-commerce store",
    match: /\b(shopify|woocommerce|e-?commerce|online store|webshop|shop|products?|cart|checkout)\b/i,
    baseHours: 28,
    defaultPages: ["Home", "Collection", "Product", "Cart", "About", "Contact"],
  },
  {
    id: "saas",
    label: "Web application",
    match: /\b(saas|web ?app|dashboard|platform|portal|crm|app where users|user accounts?)\b/i,
    baseHours: 60,
    defaultPages: ["Landing", "Sign in", "Dashboard", "Settings"],
  },
  {
    id: "mobile",
    label: "Mobile app",
    match: /\b(ios|android|mobile app|react native|flutter|app store)\b/i,
    baseHours: 80,
    defaultPages: ["Onboarding", "Home", "Profile", "Settings"],
  },
  {
    id: "landing",
    label: "Landing page",
    match: /\b(landing page|one[- ]page|single page|launch page|waitlist)\b/i,
    baseHours: 10,
    defaultPages: ["Landing"],
  },
  {
    id: "portfolio",
    label: "Portfolio website",
    match: /\b(portfolio|showcase|photographer|my work)\b/i,
    baseHours: 14,
    defaultPages: ["Home", "Work", "About", "Contact"],
  },
  {
    id: "marketing",
    label: "Marketing website",
    match: /\b(website|site|redesign|homepage|company page)\b/i,
    baseHours: 18,
    defaultPages: ["Home", "Services", "About", "Contact"],
  },
];

const FALLBACK_TYPE: ProjectType = {
  id: "general",
  label: "Digital project",
  match: /$^/,
  baseHours: 20,
  defaultPages: ["Home", "About", "Contact"],
};

const PAGE_KEYWORDS: Array<[RegExp, string]> = [
  [/\bhome ?page|\bhome\b/i, "Home"],
  [/\bservices?\b/i, "Services"],
  [/\babout\b/i, "About"],
  [/\b(work|case stud(y|ies)|projects?)\b/i, "Work"],
  [/\bportfolio\b/i, "Portfolio"],
  [/\b(team|staff)\b/i, "Team"],
  [/\b(pricing|plans|packages)\b/i, "Pricing"],
  [/\b(blog|articles?|news)\b/i, "Blog"],
  [/\bfaq\b/i, "FAQ"],
  [/\b(testimonials?|reviews?)\b/i, "Testimonials"],
  [/\b(careers?|jobs|hiring)\b/i, "Careers"],
  [/\b(menu)\b/i, "Menu"],
  [/\b(gallery)\b/i, "Gallery"],
  [/\b(book(ing)?|appointments?|reservations?)\b/i, "Booking"],
  [/\b(contact|get in touch|enquir|inquir)/i, "Contact"],
  [/\b(dashboard)\b/i, "Dashboard"],
  [/\b(sign ?in|log ?in|sign ?up|register|accounts?)\b/i, "Sign in"],
  [/\b(checkout|cart)\b/i, "Cart"],
];

interface FeatureRule {
  match: RegExp;
  name: string;
  detail: string;
  hours: number;
  thirdParty?: string;
}

const FEATURE_RULES: FeatureRule[] = [
  {
    match: /\b(log ?in|sign ?up|accounts?|auth|members?|register)\b/i,
    name: "User accounts",
    detail: "Registration, sign in, password reset and session handling.",
    hours: 14,
  },
  {
    match: /\b(payments?|stripe|paypal|checkout|subscriptions?|billing)\b/i,
    name: "Payments",
    detail: "Payment provider integration with success, failure and refund paths.",
    hours: 16,
    thirdParty: "Payment provider transaction fees",
  },
  {
    match: /\b(book(ing)?|appointments?|reservations?|calendar|schedul)/i,
    name: "Booking",
    detail: "Availability, booking form, confirmations and calendar sync.",
    hours: 14,
    thirdParty: "Booking or calendar tool subscription",
  },
  {
    match: /\b(blog|cms|content management|edit (the )?content|update (the )?content)\b/i,
    name: "Content management",
    detail: "Editable content types so the client can publish without a developer.",
    hours: 10,
    thirdParty: "Headless CMS plan, if a hosted CMS is chosen",
  },
  {
    match: /\b(multi-?lingual|languages?|translations?|i18n|english and|russian|uzbek|arabic|spanish|french|german)\b/i,
    name: "Multilingual content",
    detail: "Locale routing, translated content and language switcher.",
    hours: 10,
  },
  {
    match: /\b(search|filters?|sort)\b/i,
    name: "Search and filtering",
    detail: "Search across content with filter and sort controls.",
    hours: 8,
  },
  {
    match: /\b(admin|back ?office|manage (orders|users|products))\b/i,
    name: "Admin panel",
    detail: "Internal views for managing records and users.",
    hours: 18,
  },
  {
    match: /\b(crm|hubspot|salesforce|mailchimp|newsletter|zapier|integrat)/i,
    name: "Third-party integrations",
    detail: "Data sync with the client's existing tools.",
    hours: 8,
    thirdParty: "Licences for connected tools (CRM, email marketing)",
  },
  {
    match: /\b(contact form|forms?|lead|enquir|inquir|quote request)\b/i,
    name: "Forms and lead capture",
    detail: "Validated forms with email notification and spam protection.",
    hours: 4,
  },
  {
    match: /\b(animations?|3d|interactive|motion|parallax|webgl)\b/i,
    name: "Custom motion",
    detail: "Bespoke animation and interaction beyond standard transitions.",
    hours: 12,
  },
  {
    match: /\b(seo|google|ranking|search engine)\b/i,
    name: "SEO foundation",
    detail: "Metadata, sitemap, structured data and performance budget.",
    hours: 4,
  },
  {
    match: /\b(analytics|tracking|metrics|pixel)\b/i,
    name: "Analytics",
    detail: "Event tracking and a reporting setup the client can read.",
    hours: 3,
  },
  {
    match: /\b(chat|messag|notifications?|real-?time)\b/i,
    name: "Messaging and notifications",
    detail: "In-app or email notifications triggered by user activity.",
    hours: 12,
  },
  {
    match: /\b(ai|chatbot|gpt|openai|claude|llm)\b/i,
    name: "AI feature",
    detail: "Model integration with prompt design, guardrails and cost limits.",
    hours: 16,
    thirdParty: "AI model usage billed per request",
  },
];

interface QuestionRule {
  /** Question is asked when the brief does NOT match this. */
  answeredBy: RegExp;
  question: ScopeQuestion;
  /** Only ask when this predicate holds. */
  when?: (ctx: Context) => boolean;
}

interface Context {
  text: string;
  type: ProjectType;
  features: FeatureRule[];
}

const QUESTION_RULES: QuestionRule[] = [
  {
    answeredBy: /\b(budget|\$|usd|eur|€|£|price range|cost)\b/i,
    question: {
      question: "What budget range has been approved for this project?",
      why: "Determines whether custom design and motion are realistic or a template is the better fit.",
      impact: "price",
    },
  },
  {
    answeredBy: /\b(deadline|launch|by (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|next|end of)|weeks?|months?|asap|urgent)\b/i,
    question: {
      question: "Is there a fixed launch date, and what is driving it?",
      why: "A hard date changes sequencing and may require cutting scope into phases.",
      impact: "timeline",
    },
  },
  {
    answeredBy: /\b(copy|content|texts?|photos?|images?|we (will )?provide|i (will )?provide)\b/i,
    question: {
      question: "Who writes the copy and supplies photography?",
      why: "Content creation is often assumed to be included and is a common source of delay.",
      impact: "timeline",
    },
  },
  {
    answeredBy: /\b(figma|design(s)? (is|are) ready|mockups?|wireframes?|brand ?book|style ?guide|logo)\b/i,
    question: {
      question: "Do brand assets or designs already exist, or is design part of this scope?",
      why: "Design from scratch can double the effort compared with implementing provided mockups.",
      impact: "price",
    },
  },
  {
    answeredBy: /\b(hosting|domain|vercel|netlify|aws|server)\b/i,
    question: {
      question: "Who owns hosting and the domain after launch?",
      why: "Defines handover responsibilities and recurring third-party costs.",
      impact: "architecture",
    },
  },
  {
    answeredBy: /\b(stripe|paypal|payme|click|square)\b/i,
    when: (ctx) => ctx.features.some((f) => f.name === "Payments"),
    question: {
      question: "Which payment provider and currencies must be supported?",
      why: "Provider choice affects checkout flow, fees, tax handling and regional availability.",
      impact: "architecture",
    },
  },
  {
    answeredBy: /\b(\d+\s+(languages?|locales?)|english and \w+)\b/i,
    when: (ctx) => ctx.features.some((f) => f.name === "Multilingual content"),
    question: {
      question: "How many languages are required at launch, and who provides translations?",
      why: "Each locale multiplies content entry and QA effort.",
      impact: "price",
    },
  },
  {
    answeredBy: /\b(\d+\s+products?|catalog of \d+)\b/i,
    when: (ctx) => ctx.type.id === "ecommerce",
    question: {
      question: "How many products and variants will launch, and who enters them?",
      why: "Catalogue size drives import tooling and data entry effort.",
      impact: "price",
    },
  },
  {
    answeredBy: /\b(roles?|permissions?|admin and|user types?)\b/i,
    when: (ctx) => ctx.features.some((f) => f.name === "User accounts" || f.name === "Admin panel"),
    question: {
      question: "Which user roles exist and what can each one see or change?",
      why: "Permission models shape the data architecture and are expensive to change later.",
      impact: "architecture",
    },
  },
  {
    answeredBy: /\b(maintenance|support|retainer|after launch)\b/i,
    question: {
      question: "Is post-launch support or maintenance expected?",
      why: "Ongoing support should be quoted separately rather than absorbed into the build.",
      impact: "price",
    },
  },
  {
    answeredBy: /\b(like|similar to|inspired by|reference|example sites?|https?:\/\/)\b/i,
    question: {
      question: "Which existing sites or products represent the quality bar the client expects?",
      why: "References turn subjective words like 'modern' or 'premium' into checkable expectations.",
      impact: "price",
    },
  },
];

const VAGUE_WORDS = /\b(modern|clean|premium|simple|nice|beautiful|professional|easy|fast|like apple|wow)\b/gi;

export const SAMPLE_BRIEF =
  "Hi! We need a modern website for our interior design studio. Something clean and premium, " +
  "like Apple. We want to show our projects, have a booking form for consultations, and a blog. " +
  "Maybe also Russian and English. Can you do it fast? Let me know the price.";

function detectType(text: string): ProjectType {
  return PROJECT_TYPES.find((t) => t.match.test(text)) ?? FALLBACK_TYPE;
}

function detectPages(text: string, type: ProjectType): string[] {
  if (type.id === "landing") return ["Landing", "Privacy policy"];
  const found = PAGE_KEYWORDS.filter(([re]) => re.test(text)).map(([, name]) => name);
  const pages = [...type.defaultPages];
  for (const page of found) {
    if (!pages.includes(page)) pages.push(page);
  }
  // A contact route is near-universal; keep it last.
  if (type.id !== "mobile" && !pages.includes("Contact")) pages.push("Contact");
  const contactIdx = pages.indexOf("Contact");
  if (contactIdx > -1 && contactIdx !== pages.length - 1) {
    pages.splice(contactIdx, 1);
    pages.push("Contact");
  }
  return pages;
}

function deriveName(text: string, type: ProjectType): string {
  const forMatch = text.match(/\bfor (?:our|my|a|an|the) ([a-z][a-z\s-]{2,40}?)(?:[.,!?]|\s(?:that|which|with|where|and)\b)/i);
  if (forMatch) {
    const subject = forMatch[1].trim().replace(/\s+/g, " ");
    return `${capitalize(subject)} ${type.id === "general" ? "project" : type.label.toLowerCase()}`;
  }
  return type.label;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function roundTo(n: number, step: number): number {
  return Math.max(step, Math.round(n / step) * step);
}

function complexityFor(hours: number): Complexity {
  if (hours < 40) return "low";
  if (hours < 160) return "medium";
  return "high";
}

export function analyzeBrief(rawBrief: string): ScopeResult {
  const text = rawBrief.replace(/\s+/g, " ").trim();
  const type = detectType(text);
  const features = FEATURE_RULES.filter((f) => f.match.test(text));
  const ctx: Context = { text, type, features };

  const pages = detectPages(text, type);

  const questions = QUESTION_RULES.filter(
    (rule) => !rule.answeredBy.test(text) && (rule.when ? rule.when(ctx) : true),
  ).map((rule) => rule.question);

  const vague = Array.from(new Set((text.match(VAGUE_WORDS) ?? []).map((w) => w.toLowerCase())));
  if (vague.length > 0) {
    questions.unshift({
      question: `What do "${vague.slice(0, 3).join('", "')}" mean in measurable terms?`,
      why: "Subjective adjectives are the most common source of revision rounds and disputes.",
      impact: "price",
    });
  }

  const pageHours = type.id === "landing" ? 0 : pages.length * 3;
  const featureHours = features.reduce((sum, f) => sum + f.hours, 0);
  const core = type.baseHours + pageHours + featureHours;
  // Uncertainty widens the range: every open question adds ~4% on top.
  const spread = 1.2 + Math.min(questions.length, 10) * 0.04;
  const minHours = roundTo(core, 5);
  const maxHours = roundTo(core * spread, 5);
  const complexity = complexityFor(maxHours);
  // Assume ~25 focused billable hours per week for a solo builder.
  const minWeeks = Math.max(1, Math.round(minHours / 25));
  const maxWeeks = Math.max(minWeeks + 1, Math.ceil(maxHours / 25));

  const included = [
    `${type.label} with ${pages.length} ${pages.length === 1 ? "page" : "pages"}: ${pages.join(", ")}`,
    "Responsive layouts for mobile, tablet and desktop",
    ...features.map((f) => f.name),
    "Two rounds of revisions per page",
    "Deployment to production and handover walkthrough",
  ];

  const excluded = [
    "Copywriting and translation unless separately agreed",
    "Photography, illustration and video production",
    "Ongoing maintenance after the warranty period",
  ];
  if (!features.some((f) => f.name === "Admin panel")) excluded.push("Custom admin tooling");
  if (type.id !== "mobile") excluded.push("Native mobile apps");

  const changeRequest = [
    "Pages or features not listed in this scope",
    "Revision rounds beyond the two included",
    "Changes to approved designs after development starts",
  ];
  if (features.some((f) => f.name === "Multilingual content")) {
    changeRequest.push("Additional languages beyond those confirmed at kickoff");
  }

  const thirdPartyCost = [
    "Domain and hosting",
    ...features.flatMap((f) => (f.thirdParty ? [f.thirdParty] : [])),
  ];
  if (type.id === "ecommerce") thirdPartyCost.push("Shopify plan and paid apps or themes");

  const deliverables = [
    type.id === "mobile" ? "Store-ready app builds" : "Production website on the client's domain",
    "Source code repository with access transferred",
    ...(features.some((f) => f.name === "Content management") ? ["CMS access and a short editing guide"] : []),
    "Launch checklist: performance, accessibility and SEO basics",
  ];

  const projectName = deriveName(text, type);
  const featureList = features.length > 0 ? features.map((f) => f.name.toLowerCase()).join(", ") : "no custom functionality";

  const summary =
    `${type.label} with ${pages.length} ${pages.length === 1 ? "page" : "pages"} and ${features.length} ` +
    `functional ${features.length === 1 ? "area" : "areas"}. ${questions.length} open ` +
    `${questions.length === 1 ? "question affects" : "questions affect"} price or timeline.`;

  const clientSummary = [
    `Project: ${projectName}`,
    "",
    `Based on your brief, this is a ${type.label.toLowerCase()} covering ${pages.join(", ")}, with ${featureList}.`,
    "",
    `Estimated effort is ${minHours}–${maxHours} hours, delivered over ${minWeeks}–${maxWeeks} weeks once content and approvals are in place.`,
    "",
    "Included: " + included.slice(1).join("; ") + ".",
    "Not included: " + excluded.join("; ") + ".",
    "",
    questions.length > 0
      ? `Before I send a fixed quote, I need answers to ${questions.length} ${questions.length === 1 ? "question" : "questions"}:`
      : "No open questions. I can send a fixed quote.",
    ...questions.map((q, i) => `${i + 1}. ${q.question}`),
  ].join("\n");

  return {
    overview: { projectName, projectType: type.label, summary },
    questions,
    pages,
    features: features.map(({ name, detail }) => ({ name, detail })),
    estimate: {
      hours: { min: minHours, max: maxHours },
      weeks: { min: minWeeks, max: maxWeeks },
      complexity,
      rationale:
        `${type.baseHours}h base for a ${type.label.toLowerCase()}, ${pageHours}h for pages, ` +
        `${featureHours}h for features. Range widened by ${Math.round((spread - 1) * 100)}% for open questions.`,
    },
    boundaries: { included, excluded, changeRequest, thirdPartyCost },
    deliverables,
    clientSummary,
  };
}
