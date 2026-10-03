import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ClientScope — Turn vague client requests into scopes you can defend",
    template: "%s · ClientScope",
  },
  description:
    "Paste the client brief. ClientScope identifies pages, features, unanswered questions, effort, timeline and project boundaries before you quote.",
};

export const viewport: Viewport = {
  themeColor: "#012624",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Marks JS as available before paint so reveal styles never hide content without JS. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-raised focus:px-4 focus:py-3 focus:text-heading"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
