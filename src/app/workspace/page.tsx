import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { Workspace } from "@/components/workspace/workspace";

export const metadata: Metadata = {
  title: "Workspace",
};

export default function WorkspacePage() {
  return (
    <>
      <SiteNav variant="app" />
      <main id="main" className="min-h-dvh bg-canvas">
        <Workspace />
      </main>
    </>
  );
}
