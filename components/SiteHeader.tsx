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
      <div className="flex items-start justify-between gap-4 sm:gap-8">
        <div>
          <Link
            href="/"
            className="text-[28px] font-semibold leading-none tracking-[-0.032em] sm:text-[36px]"
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
          <SiteNav />
        </div>
        <div className="-mt-1 shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
