import type { Metadata } from "next";
import DocumentLinks from "@/components/DocumentLinks";
import ExperienceRow from "@/components/ExperienceRow";
import {
  experience,
  leadership,
  publications,
  teaching,
} from "@/data/experience";
import { existingDocuments } from "@/lib/documents";
import CompanionSurface from "@/components/companion/CompanionSurface";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Research and engineering roles, registered work, and community leadership by Anish Shirodkar.",
  alternates: { canonical: "/experience" },
};

export default function ExperiencePage() {
  return (
    <div className="mt-12 sm:mt-14">
      <h1 className="text-balance text-[32px] font-semibold tracking-[-0.03em] sm:text-[40px]">
        Experience
      </h1>

      {/*
        No introduction here on purpose. The heading leads straight into the
        entries, which say what the work was without a summary line in front of
        them. The gap is the one a heading normally takes above content, rather
        than the wider one that used to sit below a paragraph.
      */}
      <ol className="mt-8 border-b border-border sm:mt-9">
        {experience.map((entry) => (
          <ExperienceRow
            key={entry.slug}
            entry={entry}
            detailed
            headingLevel="h2"
            documents={
              entry.documents ? (
                <DocumentLinks
                  documents={existingDocuments(entry.documents)}
                  label={entry.organization}
                />
              ) : null
            }
          />
        ))}
      </ol>

      {/* Kept at /experience#publications so the old deep link still lands here. */}
      <section id="publications" className="relative mt-16 scroll-mt-8 sm:mt-20">
        <CompanionSurface id="exp-1" height={56} offset={10} />
        <h2 className="text-[24px] font-semibold tracking-[-0.026em] sm:text-[30px]">
          Publications &amp; registered work
        </h2>
        <ul className="mt-6 border-b border-border">
          {publications.map((item) => (
            <li key={item.title} className="border-t border-border py-6 sm:py-7">
              <div className="flex flex-col gap-x-8 gap-y-1.5 sm:flex-row sm:items-baseline sm:justify-between">
                <h3 className="max-w-[62ch] text-[17px] font-semibold leading-snug sm:text-[19px]">
                  {item.title}
                </h3>
                <p className="shrink-0 font-mono text-[11.5px] text-faint sm:text-right">
                  {item.year}
                </p>
              </div>
              <p className="mt-2 font-mono text-[12px] text-accent">{item.kind}</p>
              <p className="mt-1 font-mono text-[11.5px] text-muted">{item.registration}</p>
              <p className="mt-3 max-w-[68ch] text-[14.5px] leading-[1.65] text-muted sm:text-[15.5px]">
                {item.description}
              </p>
              <p className="mt-3 text-[13.5px] text-faint">
                {item.authors.join(" · ")}
              </p>
              {item.links.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                  {item.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="link-underline font-mono text-[12.5px] text-accent"
                      >
                        {link.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {/* Old /leadership deep link redirects to /experience#leadership. */}
      <section id="leadership" className="relative mt-16 scroll-mt-8 sm:mt-20">
        <CompanionSurface id="exp-2" height={56} offset={10} />
        <h2 className="text-[24px] font-semibold tracking-[-0.026em] sm:text-[30px]">
          Teaching &amp; leadership
        </h2>

        {/* Grouped teaching post sits above the student leadership roles. */}
        <ul className="mt-6 border-b border-border">
          {teaching.map((entry) => (
            <li key={entry.slug} className="border-t border-border py-6 sm:py-7">
              <div className="flex flex-col gap-x-8 gap-y-1.5 sm:flex-row sm:items-baseline sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-[17px] font-semibold leading-snug sm:text-[19px]">
                    {entry.organization}
                  </h3>
                  <p className="mt-0.5 text-[14.5px] text-text-soft sm:text-[15.5px]">
                    {entry.employment}
                  </p>
                </div>
                <p className="shrink-0 font-mono text-[11.5px] text-faint sm:text-right">
                  {entry.dates}
                </p>
              </div>

              <div className="mt-5 space-y-5">
                {entry.roles.map((role) => (
                  <section key={role.course}>
                    <h4 className="text-[14.5px] font-medium text-text sm:text-[15px]">
                      {role.title}, {role.course}
                    </h4>
                    <ul className="mt-2 space-y-2">
                      {role.points.map((point) => (
                        <li
                          key={point}
                          className="flex gap-3 text-[14.5px] leading-[1.65] text-muted sm:text-[15px]"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent"
                          />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>

              <DocumentLinks
                documents={existingDocuments(entry.documents)}
                label={`Teaching at ${entry.organization}`}
              />
            </li>
          ))}
        </ul>

        <ul className="border-b border-border">
          {leadership.map((entry) => (
            <li key={entry.slug} className="border-t border-border py-6 sm:py-7">
              <div className="flex flex-col gap-x-8 gap-y-1.5 sm:flex-row sm:items-baseline sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-[17px] font-semibold leading-snug sm:text-[19px]">
                    {entry.role}
                  </h3>
                  <p className="mt-0.5 text-[14.5px] text-text-soft sm:text-[15.5px]">
                    {entry.organization}
                  </p>
                </div>
                <p className="shrink-0 font-mono text-[11.5px] text-faint sm:text-right">
                  {entry.dates}
                </p>
              </div>
              <p className="mt-3 max-w-[70ch] text-[14.5px] leading-[1.6] text-muted sm:text-[15.5px]">
                {entry.description}
              </p>
              <DocumentLinks
                documents={existingDocuments(entry.documents)}
                label={`${entry.role}, ${entry.organization}`}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
