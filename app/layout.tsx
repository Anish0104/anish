import type { Metadata } from "next";
import { Caveat } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteCompanion from "@/components/companion/SiteCompanion";
import SiteFooter from "@/components/SiteFooter";
import WallBackground from "@/components/WallBackground";
import ThemeScript from "@/components/ThemeScript";

/**
 * The only web font on the site, and it is used *only* for the hand-lettered
 * labels inside the desk illustration. All UI type is the native system sans
 * stack declared in globals.css, and nothing from Apple is downloaded or shipped.
 */
const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://anishshirodkar.me"),
  title: {
    default: "Anish Shirodkar",
    template: "%s · Anish Shirodkar",
  },
  description:
    "Anish Shirodkar, MS Computer Science student at Rutgers focused on ML and AI engineering: clinical transformers, information retrieval, and full-stack AI applications.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Anish Shirodkar",
    description:
      "MS Computer Science student at Rutgers focused on ML and AI engineering.",
    type: "website",
    url: "/",
    siteName: "Anish Shirodkar",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={caveat.variable}>
      <body className="min-h-dvh bg-bg text-text">
        <ThemeScript />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2 focus:font-mono focus:text-sm focus:text-accent focus:shadow-lift"
        >
          Skip to content
        </a>
        <WallBackground />
        {/*
          `relative z-10` puts the content above the two decorative layers,
          which sit at z-0. It is `z-index` alone and never a transform: a
          transform here would become the containing block for Mini Anish's
          `position: fixed` while he is falling, and he would stop landing at
          the bottom of the window.
        */}
        <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-shell flex-col px-5 sm:px-8 lg:px-10">
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <SiteCompanion />
        </div>
      </body>
    </html>
  );
}
