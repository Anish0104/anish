"use client";

import Image from "next/image";
import Link from "next/link";
import { coverAlt, githubUrl, type Project } from "@/data/projects";

/**
 * Editorial Project Card with bugblazer layout, adapted to the site's refined aesthetic.
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

  const isLive = Boolean(project.demo);
  const isAward = Boolean(project.award);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all duration-300 hover:border-border-strong hover:shadow-lift motion-safe:hover:-translate-y-0.5">
      {/* Top Banner / Cover */}
      <div className="relative aspect-cover w-full overflow-hidden border-b border-border bg-surface-2">
        {/* Status / Category Badge */}
        <div className="absolute left-3.5 top-3.5 z-10">
          {isAward ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-amber-700 backdrop-blur-md dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300">
              1st Place 🏆
            </span>
          ) : isLive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-700 backdrop-blur-md dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-border/80 bg-surface/90 px-2.5 py-0.5 font-mono text-[11px] font-medium text-text-soft shadow-sm backdrop-blur-md">
              {project.category}
            </span>
          )}
        </div>

        <Image
          src={cover.src}
          alt={coverAlt(cover)}
          width={1600}
          height={1000}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 540px"
          className="h-full w-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.02]"
        />
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Category in Monospace */}
        <span className="font-mono text-[11px] uppercase tracking-label text-accent font-medium">
          {project.category}
        </span>

        {/* Title */}
        <Heading className="mt-1.5 text-[19px] sm:text-[21px] font-semibold leading-snug tracking-[-0.015em] text-text">
          <Link
            href={`/projects/${project.slug}`}
            className="transition-colors hover:text-accent"
          >
            {project.title}
          </Link>
        </Heading>

        {/* Blurb / Description */}
        <p className="mt-2 text-pretty text-[14px] sm:text-[14.5px] leading-relaxed text-muted flex-1">
          {project.blurb}
        </p>

        {/* Tech Stack string */}
        <p className="mt-4 font-mono text-[12px] font-medium text-text-soft">
          {project.tags.join(" · ")}
        </p>

        {/* Action Controls row */}
        <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3 border-t border-border pt-4">
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center justify-center rounded-lg bg-text text-bg px-3.5 py-1.5 font-mono text-[12px] font-medium transition-all hover:opacity-90"
          >
            Details →
          </Link>

          {project.demo ? (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-surface-2 px-3 py-1.5 font-mono text-[12px] font-medium text-text transition-colors hover:bg-surface hover:border-border-strong"
            >
              Live demo ↗
            </a>
          ) : null}

          <button
            type="button"
            onClick={() => onOpenReadme(project)}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-surface-2 px-3 py-1.5 font-mono text-[12px] font-medium text-muted transition-colors hover:bg-surface hover:border-border-strong hover:text-text"
          >
            README
          </button>

          <a
            href={project.links.find((l) => l.label.toLowerCase() === "github")?.href || repoUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="ml-auto inline-flex items-center gap-1 font-mono text-[12px] text-muted transition-colors hover:text-accent link-underline"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </article>
  );
}
