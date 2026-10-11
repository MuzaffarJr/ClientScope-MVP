"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="flex min-h-dvh items-center bg-canvas">
      <div className="container-page py-32">
        <p className="label-instrument text-danger">Unexpected error</p>
        <h1 className="mt-6 max-w-[720px] text-section font-medium text-heading text-balance">
          Something broke on our side.
        </h1>
        <p className="mt-6 max-w-[520px] text-[17px] text-body">
          Your saved scopes are stored in this browser and are not affected. Try again, or go back to the overview.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button onClick={() => retry()}>Try again</Button>
          <ButtonLink href="/" variant="secondary">
            Back to home
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
