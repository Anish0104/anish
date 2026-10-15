"use client";

import Image from "next/image";
import Link from "next/link";
import { coverAlt, githubUrl, type Project } from "@/data/projects";

/**
 * Neo-brutalist Project Card styled after bugblazer.dev.
 *
 * Features:
 * - 2.5px solid border, rounded corners, and hard drop shadow.
 * - Top 16:10 banner with top-left pill badge (Live, 1st Place, Playable, etc.).
 * - Clean monospace category, bold headline, readable description.
 * - Dot-separated tech stack list.
 * - Signature orange "Case study →" primary button with tactile push down.
 * - Secondary "Visit ↗" / "README" button and underlined "Source" link.
 */
export default function ProjectCard({
  project,
  onOpenReadme,
  priority = false,
  headingLevel: Heading = "h3",
}: {
  project: Project;
  onOpenReadme: (project: Project) => void;
  priority?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const repoUrl = githubUrl(project);
  const { cover } = project;

  // Determine top-left badge
  let badgeText = "Project";
  let isOrangeBadge = false;

  if (project.award) {
    badgeText = "1st Place 🏆";
    isOrangeBadge = true;
  } else if (project.demo) {
    badgeText = "Live";
    isOrangeBadge = true;
  } else if (project.category === "AI agents") {
    badgeText = "AI Agent";
  } else if (project.category === "Computer vision") {
    badgeText = "Vision";
  } else if (project.category === "Retrieval & RAG") {
    badgeText = "RAG";
  } else if (project.category === "Machine learning") {
    badgeText = "PyTorch / ML";
  } else if (project.category === "Systems & Performance") {
    badgeText = "Systems";
  }

  // Join tech stack with middot
  const stackString = project.tags.join(" · ");

  return (
    <article className="group flex flex-col overflow-hidden rounded-[12px] border-[2.5px] border-black dark:border-white/80 bg-white dark:bg-[#1a1b1e] shadow-[5px_5px_0_#000] dark:shadow-[5px_5px_0_rgba(255,255,255,0.85)] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#000] dark:hover:shadow-[7px_7px_0_rgba(255,255,255,0.95)]">
      {/* Top Banner / Cover */}
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b-[2.5px] border-black dark:border-white/80 bg-neutral-950">
        {/* Pill Badge */}
        <div
          className={`absolute left-3.5 top-3.5 z-10 inline-flex items-center gap-1 rounded-[5px] border-[1.5px] border-black px-2.5 py-0.5 font-mono text-[11px] font-black uppercase tracking-wider shadow-[1.5px_1.5px_0_#000] ${
            isOrangeBadge
              ? "bg-[#ff7a00] text-black"
              : "bg-white text-black"
          }`}
        >
          {badgeText}
        </div>

        <Image
          src={cover.src}
          alt={coverAlt(cover)}
          width={1600}
          height={1000}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 540px"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        />
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Category / Subtitle in Monospace */}
        <p className="font-mono text-[12px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          {project.category}
        </p>

        {/* Title */}
        <Heading className="mt-1.5 text-[22px] sm:text-[24px] font-black tracking-tight text-neutral-900 dark:text-neutral-100 leading-tight">
          <Link
            href={`/projects/${project.slug}`}
            className="transition-colors hover:text-[#ff7a00] dark:hover:text-[#ff7a00]"
          >
            {project.title}
          </Link>
        </Heading>

        {/* Blurb / Description */}
        <p className="mt-2.5 text-pretty text-[14px] sm:text-[14.5px] leading-relaxed text-neutral-600 dark:text-neutral-300 flex-1">
          {project.blurb}
        </p>

        {/* Tech Stack string */}
        <p className="mt-4 font-mono text-[12.5px] font-bold text-neutral-700 dark:text-neutral-300">
          {stackString}
        </p>

        {/* Action Buttons row matching Bugblazer */}
        <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
          {/* Primary Case study button */}
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center justify-center rounded-[8px] border-[2px] border-black bg-[#ff7a00] px-4 py-2 font-mono text-[13px] font-black text-black shadow-[3px_3px_0_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4.5px_4.5px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            Case study →
          </Link>

          {/* Secondary Live demo / Visit button */}
          {project.demo ? (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center justify-center rounded-[8px] border-[2px] border-black dark:border-white/80 bg-white dark:bg-neutral-900 px-3.5 py-2 font-mono text-[13px] font-black text-black dark:text-white shadow-[3px_3px_0_#000] dark:shadow-[3px_3px_0_#fff] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4.5px_4.5px_0_#000] dark:hover:shadow-[4.5px_4.5px_0_#fff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              Visit ↗
            </a>
          ) : null}

          {/* README button */}
          <button
            type="button"
            onClick={() => onOpenReadme(project)}
            className="inline-flex items-center justify-center rounded-[8px] border-[2px] border-black dark:border-white/80 bg-white dark:bg-neutral-900 px-3 py-2 font-mono text-[12.5px] font-black text-black dark:text-white shadow-[3px_3px_0_#000] dark:shadow-[3px_3px_0_#fff] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4.5px_4.5px_0_#000] dark:hover:shadow-[4.5px_4.5px_0_#fff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            README
          </button>

          {/* Tertiary Underlined Source Link */}
          <a
            href={project.links.find((l) => l.label.toLowerCase() === "github")?.href || repoUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="ml-1 inline-flex items-center text-[13.5px] font-extrabold text-neutral-900 dark:text-neutral-100 underline decoration-[#ff7a00] decoration-2 underline-offset-4 transition-colors hover:text-[#ff7a00]"
          >
            Source
          </a>
        </div>
      </div>
    </article>
  );
}
