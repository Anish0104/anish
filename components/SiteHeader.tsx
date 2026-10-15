import Link from "next/link";
import { profile } from "@/data/profile";
import SiteNav from "./SiteNav";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader() {
  return (
    // Top padding carries the minimum clearance the perched character needs: his
    // clipped upper body is 41px on a phone and 54px on desktop, and at the old
    // pt-10 / pt-12 his hair was cut off by the top of the viewport.
    <header className="pt-[52px] sm:pt-16">
      <div className="flex items-start justify-between gap-3 sm:gap-8">
        <div className="min-w-0">
          <Link
            href="/"
            className="text-[clamp(23px,7.2vw,28px)] font-semibold leading-none tracking-[-0.032em] sm:text-[36px]"
          >
            {/*
              Still one text link with the same font, size, colour and click
              target. The surname is marked so the companion can find it and
              perch above it; nothing about the text itself changes.
            */}
            {profile.name.split(" ").map((word, i, all) =>
              i === all.length - 1 ? (
                <span key={word} data-companion-home="">
                  {word}
                </span>
              ) : (
                <span key={word}>{word} </span>
              )
            )}
          </Link>
        </div>
        <div className="shrink-0 pt-1.5 sm:pt-0 flex items-center gap-2 sm:gap-2.5">
          <Link
            href="/terminal"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 font-mono text-[11px] sm:text-[12px] text-muted transition-all hover:border-accent hover:text-accent hover:bg-surface-2 active:scale-95"
            title="Open CLI Terminal Mode"
            aria-label="Open CLI Terminal Mode"
          >
            <span className="font-bold text-accent">&gt;_</span>
            <span className="hidden sm:inline">terminal</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
      <SiteNav />
    </header>
  );
}
