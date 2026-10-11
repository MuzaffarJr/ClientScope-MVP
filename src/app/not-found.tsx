import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <>
      <SiteNav variant="app" />
      <main id="main" className="flex min-h-dvh items-center bg-canvas">
        <div className="container-page py-32">
          <p className="label-instrument text-muted">404 · Out of scope</p>
          <h1 className="mt-6 max-w-[720px] text-section font-medium text-heading text-balance">
            This page is not part of the project.
          </h1>
          <p className="mt-6 max-w-[520px] text-[17px] text-body">
            The link may be outdated or mistyped. Start a new scope or head back to the overview.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/workspace">Generate a scope</ButtonLink>
            <ButtonLink href="/" variant="secondary">
              Back to home
            </ButtonLink>
          </div>
        </div>
      </main>
    </>
  );
}
