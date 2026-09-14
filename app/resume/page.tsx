import type { Metadata } from "next";
import { email, resume } from "@/data/profile";

export const metadata: Metadata = {
  title: "Resume",
  description: "Resume for Anish Shirodkar: view or download the PDF.",
  alternates: { canonical: "/resume" },
};

const linkClass =
  "inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 font-mono text-[12.5px] text-text transition-colors hover:border-border-strong hover:bg-surface-2";

export default function ResumePage() {
  if (!resume.available) return <ResumeComingSoon />;

  return (
    <section className="mt-12 sm:mt-14">
      <h1 className="text-balance text-[32px] font-semibold tracking-[-0.03em] sm:text-[40px]">
        Resume
      </h1>
      <p className="mt-4 max-w-[54ch] text-[16.5px] leading-[1.6] text-text-soft sm:text-[18px]">
        The current version, as a PDF.
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <a href={resume.path} target="_blank" rel="noreferrer noopener" className={linkClass}>
          View PDF
          <span aria-hidden="true" className="text-[11px]">↗</span>
        </a>
        <a href={resume.path} download={resume.downloadAs} className={linkClass}>
          Download resume
          <span aria-hidden="true" className="text-[11px]">↓</span>
        </a>
      </div>

      {/*
        Desktop-only preview. <object> degrades on its own: a browser that
        cannot render an inline PDF shows the child content instead, so the
        fallback link is real rather than decorative. Hidden below lg because
        inline PDF viewers are unusable at phone widths.
      */}
      <div className="mt-10 hidden lg:block">
        <object
          data={resume.path}
          type="application/pdf"
          aria-label="Resume PDF preview"
          className="h-[900px] w-full rounded-xl border border-border bg-surface"
        >
          <div className="p-8">
            <p className="text-[15px] leading-relaxed text-text-soft">
              Your browser can’t display the PDF inline.
            </p>
            <p className="mt-3">
              <a
                href={resume.path}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline font-mono text-[12.5px] text-accent"
              >
                Open the resume in a new tab ↗
              </a>
            </p>
          </div>
        </object>
      </div>

      <p className="mt-8 text-[14.5px] leading-relaxed text-muted lg:mt-10">
        On a phone the inline preview is hidden, so use{" "}
        <a href={resume.path} target="_blank" rel="noreferrer noopener" className="text-accent hover:underline">
          View PDF
        </a>{" "}
        or{" "}
        <a href={resume.path} download={resume.downloadAs} className="text-accent hover:underline">
          Download
        </a>
        . Prefer a conversation?{" "}
        <a href={`mailto:${email}`} className="text-accent hover:underline">
          {email}
        </a>
      </p>
    </section>
  );
}

function ResumeComingSoon() {
  return (
    <section className="mt-12 max-w-[58ch] sm:mt-14">
      <h1 className="text-[32px] font-semibold tracking-[-0.03em] sm:text-[40px]">Resume</h1>
      <p className="mt-5 font-mono text-[11px] uppercase tracking-label text-faint">Coming soon</p>
      <p className="mt-3 text-[16.5px] leading-[1.65] text-text-soft sm:text-[18px]">
        The PDF isn’t up yet. Rather than leave a link that goes nowhere, here’s
        the honest version: email me and I’ll send it straight over.
      </p>
      <p className="mt-6">
        <a href={`mailto:${email}`} className="link-underline font-mono text-[12.5px] text-accent">
          {email} ↗
        </a>
      </p>
    </section>
  );
}
