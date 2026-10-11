import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How ClientScope handles the client briefs you paste and the scopes it generates.",
};

const SECTIONS = [
  {
    title: "What you send",
    body: "When you generate a scope, the brief you paste is sent to our server to be analysed. We do not ask for your name, email or any account details, and we do not set tracking cookies.",
  },
  {
    title: "How a brief is analysed",
    body: "Briefs are analysed either by a built-in rule-based engine or, when enabled, by Anthropic's Claude API. When Claude is used, the brief is sent to Anthropic to produce the scope and is handled under Anthropic's commercial API terms, which do not use API inputs to train models by default.",
  },
  {
    title: "What we keep",
    body: "We do not store briefs or generated scopes in a database. Your recent scopes are saved only in your own browser's local storage, and you can remove them by clearing this site's data. Our hosting provider keeps short-lived technical logs, such as IP addresses and request times, to operate the service and limit abuse.",
  },
  {
    title: "What to avoid pasting",
    body: "Remove passwords, payment details and other sensitive personal data from a brief before you paste it. ClientScope does not need them to scope a project.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <SiteNav variant="app" />
      <main id="main" className="bg-canvas">
        <div className="container-page max-w-[860px] pb-28 pt-40 md:pb-40">
          <p className="label-instrument text-muted">Privacy</p>
          <h1 className="mt-6 text-section font-medium text-heading text-balance">Your briefs stay yours.</h1>
          <p className="mt-6 text-[17px] text-body">Last updated 11 October 2026.</p>
          <dl className="mt-16 border-t border-line">
            {SECTIONS.map((section) => (
              <div key={section.title} className="grid gap-3 border-b border-line py-8 md:grid-cols-[220px_1fr] md:gap-10">
                <dt className="label-instrument text-mist">{section.title}</dt>
                <dd className="text-[16px] leading-relaxed text-body">{section.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
