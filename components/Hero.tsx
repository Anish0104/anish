import Link from "next/link";
import { profile, resume } from "@/data/profile";
import DeskIllustration, { CAN_IMAGE_PATH } from "./DeskIllustration";
import { hasPublicAsset } from "@/lib/assets";

export default function Hero() {
  return (
    /*
      Spacing is tuned for a one-line greeting rather than the three-line
      headline that used to sit here. The run-up from the nav is shorter, and
      the column ratio leans a little further toward the illustration, because
      the text block lost roughly two lines of height and an unchanged ratio
      left the drawing marooned beside empty space.
    */
    <section className="mt-10 grid grid-cols-1 items-center gap-9 sm:mt-12 lg:mt-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
      <div>
        {/*
          No hard-coded <br>. `text-balance` lets the browser split the
          headline evenly at whatever width it lands on, so it never breaks
          awkwardly on a narrow screen. The greeting fits on one line at every
          width, so in practice it never has to.
        */}
        <h1 className="text-balance text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[42px] lg:text-[50px]">
          {profile.headline}
        </h1>

        {/*
          A little tighter under the heading than before: one line of display
          type needs less clearance beneath it than three did. The measure is
          wide enough to keep the longer introduction to three even lines.
        */}
        <p className="mt-5 max-w-[50ch] text-pretty text-[16.5px] leading-[1.6] text-text-soft sm:text-[18px]">
          {profile.intro}
        </p>

        <p className="mt-4 text-[15px] text-muted sm:text-[16px]">{profile.location}</p>

        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          {profile.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              {...(link.href.startsWith("http")
                ? { target: "_blank", rel: "noreferrer noopener" }
                : {})}
              className="link-underline inline-flex items-center gap-1.5 font-mono text-[13px] text-accent"
            >
              {link.label}
              <span aria-hidden="true" className="text-[10px]">↗</span>
            </a>
          ))}

          {/*
            The resume sits with the contact links rather than in `profile.links`
            so it keeps reading its path from the `resume` config, which is the
            one place that knows whether the PDF is actually there. Same classes
            as the mapped links above, so it inherits their colour, type and
            arrow rather than restating them. The row already wraps, so this is
            simply a fourth item on it.
          */}
          {resume.available ? (
            <a
              href={resume.path}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline inline-flex items-center gap-1.5 font-mono text-[13px] text-accent"
            >
              View resume
              <span aria-hidden="true" className="text-[10px]">↗</span>
            </a>
          ) : null}
        </div>

        <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
          <Link
            href="/about"
            className="link-underline inline-flex items-center gap-1.5 font-mono text-[12.5px] text-muted transition-colors hover:text-accent"
          >
            About me &amp; my toolkit
            <span aria-hidden="true" className="text-[10px]">↗</span>
          </Link>
          <Link
            href="/misc"
            className="link-underline inline-flex items-center gap-1.5 font-mono text-[12.5px] text-muted transition-colors hover:text-accent"
          >
            Books &amp; art
            <span aria-hidden="true" className="text-[10px]">↗</span>
          </Link>
        </p>
      </div>

      <div>
        <DeskIllustration
          className="mx-auto w-full max-w-[380px] text-text lg:max-w-none"
          canImage={hasPublicAsset(CAN_IMAGE_PATH) ? CAN_IMAGE_PATH : null}
        />
      </div>
    </section>
  );
}
