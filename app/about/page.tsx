import type { Metadata } from "next";
import CourseworkList from "@/components/CourseworkList";
import DocumentLinks from "@/components/DocumentLinks";
import AboutCharacter from "@/components/AboutCharacter";
import SkillGroups from "@/components/SkillGroups";
import { aboutIntro, profile } from "@/data/profile";
import { certifications, education } from "@/data/skills";
import { existingDocuments } from "@/lib/documents";
import CompanionSurface from "@/components/companion/CompanionSurface";

export const metadata: Metadata = {
  title: "About",
  description:
    "Anish Shirodkar, MS Computer Science student at Rutgers focused on ML and AI engineering, spanning clinical transformers, information retrieval, and full-stack AI applications.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mt-12 sm:mt-14">
      <h1 className="text-balance text-[32px] font-semibold tracking-[-0.03em] sm:text-[40px]">
        About
      </h1>

      <div className="mt-8 flex flex-col gap-7 sm:flex-row sm:items-start sm:gap-10">
        <AboutCharacter />
        <div className="max-w-[56ch] space-y-4 text-pretty text-[16.5px] leading-[1.7] text-text-soft sm:text-[18px]">
          <p>{aboutIntro}</p>
          <p>{profile.location}</p>
        </div>
      </div>

      <section className="relative mt-16 sm:mt-20">
        <CompanionSurface id="about-1" height={56} offset={10} />
        <h2 className="text-[24px] font-semibold tracking-[-0.026em] sm:text-[30px]">
          Education
        </h2>
        <p className="mt-3 max-w-[62ch] text-[14.5px] leading-[1.6] text-muted sm:text-[15px]">
          Course names below are a selection, not a full transcript.
        </p>
        <ul className="mt-6 border-b border-border">
          {education.map((entry) => (
            <li key={entry.institution} className="border-t border-border py-6">
              <div className="flex flex-col gap-x-8 gap-y-1.5 sm:flex-row sm:items-baseline sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-[17px] font-semibold leading-snug sm:text-[18px]">
                    {entry.institution}
                  </h3>
                  <p className="mt-1 text-[14.5px] leading-snug text-muted sm:text-[15.5px]">
                    {entry.credential}
                    {entry.detail ? ` · ${entry.detail}` : ""}
                  </p>
                  {entry.note ? (
                    <p className="mt-1 text-[14.5px] leading-snug text-muted sm:text-[15.5px]">
                      {entry.note}
                    </p>
                  ) : null}
                </div>
                <p className="shrink-0 font-mono text-[11.5px] text-faint">{entry.dates}</p>
              </div>
              {entry.coursework ? (
                <CourseworkList
                  groups={entry.coursework}
                  institution={entry.institution}
                />
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="relative mt-16 sm:mt-20">
        <CompanionSurface id="about-2" height={56} offset={10} />
        <h2 className="text-[24px] font-semibold tracking-[-0.026em] sm:text-[30px]">
          What I work with
        </h2>
        {/* The supporting line lives in SkillGroups, next to the shelf it introduces. */}
        <div className="mt-3">
          <SkillGroups />
        </div>
      </section>

      {/* Old /certifications deep link redirects to /about#certifications. */}
      <section id="certifications" className="relative mt-16 scroll-mt-8 sm:mt-20">
        <CompanionSurface id="about-cert" height={56} offset={10} />
        <h2 className="text-[24px] font-semibold tracking-[-0.026em] sm:text-[30px]">
          Certifications
        </h2>
        <ul className="mt-6 border-b border-border">
          {certifications.map((cert) => (
            <li
              key={`${cert.issuer}-${cert.name}`}
              className="border-t border-border py-5 sm:py-6"
            >
              <div className="flex flex-col gap-x-8 gap-y-1 sm:flex-row sm:items-baseline sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-[16px] font-semibold leading-snug sm:text-[17px]">
                    {cert.name}
                  </h3>
                  <p className="mt-0.5 text-[14px] text-muted sm:text-[15px]">{cert.issuer}</p>
                </div>
                {cert.date ? (
                  <p className="shrink-0 font-mono text-[11.5px] text-faint">{cert.date}</p>
                ) : null}
              </div>
              <p className="mt-2 max-w-[70ch] text-[14px] leading-[1.6] text-muted sm:text-[14.5px]">
                {cert.description}
              </p>
              {cert.credentialId ? (
                <p className="mt-1.5 font-mono text-[11.5px] text-faint">
                  Credential ID {cert.credentialId}
                </p>
              ) : null}
              <DocumentLinks
                documents={existingDocuments(cert.documents)}
                label={cert.name}
              />
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-[74ch] font-mono text-[11px] leading-relaxed text-faint">
          Dates come from the issued credential where one is linked. Where no
          credential page was available to check, the date comes from the
          source noted in the content data, or is omitted rather than guessed.
        </p>
      </section>

      <section className="relative mt-16 sm:mt-20">
        <CompanionSurface id="about-3" height={56} offset={10} />
        <h2 className="font-mono text-[11px] font-normal uppercase tracking-label text-muted">
          Elsewhere
        </h2>
        <ul className="mt-4 flex flex-wrap gap-x-7 gap-y-2">
          {profile.links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                {...(link.href.startsWith("http")
                  ? { target: "_blank", rel: "noreferrer noopener" }
                  : {})}
                className="link-underline inline-flex items-center gap-1.5 py-1 font-mono text-[12.5px] text-accent"
              >
                {link.label}
                <span aria-hidden="true" className="text-[10px]">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
