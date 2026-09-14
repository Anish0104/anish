"use client";

import { useMemo, useState } from "react";
import type { Project, ProjectCategory } from "@/data/projects";
import { githubUrl } from "@/data/projects";
import ProjectCard from "./ProjectCard";
import ReadmeDialog from "./ReadmeDialog";
import CompanionSurface from "@/components/companion/CompanionSurface";
import CompanionClimbEdge from "@/components/companion/CompanionClimbEdge";

/**
 * Owns the single README dialog for the whole grid, so only one is ever
 * mounted regardless of how many cards are on the page.
 */
export default function ProjectGallery({
  projects,
  showFilters = false,
  priorityCount = 0,
  headingLevel = "h3",
  columns = 2,
}: {
  projects: Project[];
  showFilters?: boolean;
  priorityCount?: number;
  headingLevel?: "h2" | "h3";
  /** 3 keeps the featured trio on one row; 2 suits the full nine-card grid. */
  columns?: 2 | 3;
}) {
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<ProjectCategory | "All">("All");

  const categories = useMemo(() => {
    const present = new Set(projects.map((p) => p.category));
    return (["All", ...present] as const).filter(Boolean) as (ProjectCategory | "All")[];
  }, [projects]);

  const visible = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.category === filter)),
    [projects, filter]
  );

  return (
    <>
      {showFilters && categories.length > 2 ? (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter projects by category">
          {categories.map((category) => {
            const active = filter === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setFilter(category)}
                aria-pressed={active}
                className={`rounded-full border px-3.5 py-1.5 font-mono text-[11.5px] transition-colors ${
                  active
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border bg-surface text-muted hover:border-border-strong hover:text-text"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      ) : null}

      <div
        className={
          columns === 3
            ? "relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            : "relative grid grid-cols-1 gap-6 md:grid-cols-2"
        }
      >
        {/*
          Surfaces beside the card rows, spaced down the grid. Anchored to the
          grid, which is the centred content column, so the bleed reaches the
          page margins; the cards block the middle, leaving the clear outer
          edges. Spacing them closely keeps each climb between neighbours a
          short hop rather than a minute of hauling.
        */}
        {visible.length > 0
          ? ["8%", "20%", "32%", "44%", "56%", "68%", "80%", "92%"].map((top, i) => (
              <CompanionSurface key={top} id={`cards-${i}`} kind="cards" height={72} top={top} />
            ))
          : null}
        {/*
          Vertical corridors down each page margin, joining the card-row
          surfaces. Declared, then validated: the whole swept route has to be
          clear before the route system will connect anything.
        */}
        {visible.length > 0 ? (
          <>
            <CompanionClimbEdge id="cards-left" side="left" />
            <CompanionClimbEdge id="cards-right" side="right" />
          </>
        ) : null}
        {visible.map((project, index) => (
          <ProjectCard
            key={project.slug}
            project={project}
            onOpenReadme={setOpenProject}
            priority={index < priorityCount}
            headingLevel={headingLevel}
          />
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface-2 p-6 text-[15px] text-muted">
          No projects in that category.
        </p>
      ) : null}

      {openProject ? (
        <ReadmeDialog
          slug={openProject.slug}
          title={openProject.title}
          githubUrl={githubUrl(openProject)}
          onClose={() => setOpenProject(null)}
        />
      ) : null}
    </>
  );
}
