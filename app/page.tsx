import AskBar from "@/components/AskBar";
import ExperienceRow from "@/components/ExperienceRow";
import Hero from "@/components/Hero";
import ProjectGallery from "@/components/ProjectGallery";
import SectionHeading from "@/components/SectionHeading";
import { experience } from "@/data/experience";
import { featuredProjects } from "@/data/projects";
import CompanionSurface from "@/components/companion/CompanionSurface";

/** Featured order is fixed by the brief: Semantic Search, SkillGap, Vouch. */
const order = ["semantic-search", "skillgap", "vouch"];
const featured = [...featuredProjects].sort(
  (a, b) => order.indexOf(a.slug) - order.indexOf(b.slug)
);

export default function HomePage() {
  return (
    <>
      <Hero />
      <AskBar />

      <section className="relative mt-16 border-t border-border pt-12 sm:mt-20">
        <CompanionSurface id="home-1" height={56} offset={10} />
        <SectionHeading
          title="Things I’ve built"
          action={{ label: "All projects", href: "/projects" }}
        />
        <div className="mt-8">
          <ProjectGallery projects={featured} priorityCount={3} columns={3} />
        </div>
      </section>

      <section className="relative mt-16 sm:mt-20">
        <CompanionSurface id="home-2" height={56} offset={10} />
        <SectionHeading
          title="Where I’ve worked"
          action={{ label: "All experience", href: "/experience" }}
        />
        <ol className="mt-6 border-b border-border">
          {experience.slice(0, 2).map((entry) => (
            <ExperienceRow key={entry.slug} entry={entry} />
          ))}
        </ol>
      </section>
    </>
  );
}
