import { EngineSection } from "@/components/landing/engine-section";
import { FinalCta } from "@/components/landing/final-cta";
import { HeroScene } from "@/components/landing/hero-scene";
import { LivePreview } from "@/components/landing/live-preview";
import { MetricsSection } from "@/components/landing/metrics-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { WhySection } from "@/components/landing/why-section";
import { RevealObserver } from "@/components/reveal-observer";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main id="main">
        <HeroScene />
        <WhySection />
        <EngineSection />
        <LivePreview />
        <ProblemSection />
        <MetricsSection />
        <PricingSection />
        <FinalCta />
      </main>
      <SiteFooter />
      <RevealObserver />
    </>
  );
}
