"use client";

import Image from "next/image";
import Link from "next/link";
import { coverAlt, githubUrl, type Project } from "@/data/projects";

/**
 * The card is NOT a link. A clickable wrapper containing buttons nests
 * interactive elements, which breaks keyboard and screen-reader semantics,
 * so the cover is inert and every action is its own control in the footer row.
 */
export default function ProjectCard({
  project,
  onOpenReadme,
  priority = false,
  // On /projects the cards follow the page h1 directly; on the homepage they
  // sit under a section h2. The level has to move so the outline has no gaps.
  headingLevel: Heading = "h3",
}: {
  project: Project;
  onOpenReadme: (project: Project) => void;
  priority?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const repoUrl = githubUrl(project);
  const { cover } = project;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-[transform,box-shadow] duration-300 hover:shadow-lift motion-safe:hover:-translate-y-0.5">
      {/*
        Full bleed. The cover fills the aspect box edge to edge: the rounded
        corner comes from the card and the rule under it from this border, so
        the image itself carries no frame of its own. One file, not a pair:
        these covers are identical in both themes.
      */}
      <div className="relative aspect-cover overflow-hidden border-b border-border bg-surface-2">
        <Image
          src={cover.src}
          alt={coverAlt(cover)}
          width={1600}
          height={1000}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 520px"
          className="h-full w-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[11px] uppercase tracking-label text-accent">
            {project.category}
          </span>
        </div>

        <Heading className="mt-2 text-[19px] font-semibold leading-snug sm:text-[21px]">
          <Link
            href={`/projects/${project.slug}`}
            className="link-underline text-text transition-colors hover:text-accent"
          >
            {project.title}
          </Link>
        </Heading>

        <p className="mt-2 text-pretty text-[14.5px] leading-[1.6] text-muted sm:text-[15px]">
          {project.blurb}
        </p>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-md bg-surface-2 px-2 py-1 font-mono text-[10.5px] leading-none text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 font-mono text-[12px]">
          <Link
            href={`/projects/${project.slug}`}
            className="text-accent transition-colors hover:text-accent-hover hover:underline"
          >
            Details
          </Link>
          <button
            type="button"
            onClick={() => onOpenReadme(project)}
            className="text-muted transition-colors hover:text-text hover:underline"
          >
            README
          </button>
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-muted transition-colors hover:text-text hover:underline"
          >
            GitHub ↗
          </a>
          {project.demo ? (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer noopener"
              className="text-muted transition-colors hover:text-text hover:underline"
            >
              Live demo ↗
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
