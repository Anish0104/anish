import Link from "next/link";
import AskBar from "@/components/AskBar";
import ExperienceRow from "@/components/ExperienceRow";
import Hero from "@/components/Hero";
import ProjectGallery from "@/components/ProjectGallery";
import SkillsSection from "@/components/SkillsSection";
import SectionHeading from "@/components/SectionHeading";
import { experience } from "@/data/experience";
import { projects } from "@/data/projects";
import CompanionSurface from "@/components/companion/CompanionSurface";
import ImageCursorTrail from "@/components/ui/image-cursor-trail";

export default function HomePage() {
  // Select top 6 high-impact projects to showcase on homepage
  const featuredProjects = projects.filter((p) => p.featured || ["vtrack", "quantvision"].includes(p.slug)).slice(0, 6);

  return (
    <ImageCursorTrail>
      <Hero />
      <div className="relative mt-8 sm:mt-10">
        <CompanionSurface id="home-hero" height={60} offset={10} bleed={false} />
        <AskBar />
      </div>

      {/* Projects Section styled after bugblazer.dev */}
      <section className="relative mt-16 border-t border-border pt-12 sm:mt-20">
        <CompanionSurface id="home-1" height={56} offset={10} />
        <SectionHeading
          title="Things I’ve built"
          action={{ label: "All projects", href: "/projects" }}
        />
        <div className="mt-8">
          <ProjectGallery projects={featuredProjects} columns={2} />
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-[8px] border-[2px] border-black dark:border-white/80 bg-[#ff7a00] px-6 py-3 font-mono text-[13.5px] font-black text-black shadow-[3.5px_3.5px_0_#000] dark:shadow-[3.5px_3.5px_0_#fff] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5.5px_5.5px_0_#000] dark:hover:shadow-[5.5px_5.5px_0_#fff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            Explore all {projects.length} projects →
          </Link>
        </div>
      </section>

      {/* Skills Section styled after bugblazer.dev */}
      <section className="relative mt-16 border-t border-border pt-12 sm:mt-20">
        <CompanionSurface id="home-skills" height={56} offset={10} />
        <SkillsSection />
      </section>

      {/* Experience Section */}
      <section className="relative mt-16 border-t border-border pt-12 sm:mt-20">
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
    </ImageCursorTrail>
  );
}
