import type { Metadata } from "next";
import GitHubStats from "@/components/GitHubStats";
import ProjectGallery from "@/components/ProjectGallery";
import { projects } from "@/data/projects";
import CompanionSurface from "@/components/companion/CompanionSurface";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Retrieval systems, AI agents, computer vision, and applied ML projects by Anish Shirodkar.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <>
      <section className="mt-12 sm:mt-14">
        <h1 className="text-balance text-[32px] font-semibold tracking-[-0.03em] sm:text-[40px]">
          Things I’ve built
        </h1>
        <p className="mt-4 max-w-[58ch] text-pretty text-[16.5px] leading-[1.6] text-text-soft sm:text-[18px]">
          Retrieval, agents, vision, and a few experiments. Every card links to
          the repository and can show its README without leaving the page.
        </p>

        <div className="relative mt-10">
          <CompanionSurface id="projects-1" height={52} offset={8} />
          <ProjectGallery projects={projects} showFilters priorityCount={2} headingLevel="h2" />
        </div>
      </section>

      <GitHubStats />
    </>
  );
}
