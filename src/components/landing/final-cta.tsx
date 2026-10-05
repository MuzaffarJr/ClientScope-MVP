import { ButtonLink } from "../ui/button";

export function FinalCta() {
  return (
    <section aria-labelledby="final-title" className="bg-canvas px-4 pb-4 md:px-6 md:pb-6">
      <div className="reveal rounded-card bg-deep px-6 py-28 text-center md:py-40">
        <p className="label-instrument text-mist/70">Before the next quote</p>
        <h2 id="final-title" className="mx-auto mt-8 max-w-[900px] text-section font-medium text-heading text-balance">
          Know the scope before you make the promise.
        </h2>
        <div className="mt-12 flex justify-center">
          <ButtonLink href="/workspace" size="lg">
            Generate your first scope
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
