/** Canonical origin for metadata, sitemap and social cards. */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "https://client-scope-mvp.vercel.app";
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "ClientScope";
export const SITE_TAGLINE = "Turn vague client requests into scopes you can defend";
export const SITE_DESCRIPTION =
  "Paste the client brief. ClientScope identifies pages, features, unanswered questions, effort, timeline and project boundaries before you quote.";
