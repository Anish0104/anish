import AskBar from "@/components/AskBar";
import ExperienceRow from "@/components/ExperienceRow";
import Hero from "@/components/Hero";
import ConcaveCarousel from "@/components/ui/concave-carousel";
import SectionHeading from "@/components/SectionHeading";
import { experience } from "@/data/experience";
import { projects } from "@/data/projects";
import CompanionSurface from "@/components/companion/CompanionSurface";
import ImageCursorTrail from "@/components/ui/image-cursor-trail";

export default function HomePage() {
  return (
    <ImageCursorTrail>
      <Hero />
      <div className="relative">
        <CompanionSurface id="home-hero" height={52} offset={8} />
        <AskBar />
      </div>

      <section className="relative mt-16 border-t border-border pt-12 sm:mt-20">
        <CompanionSurface id="home-1" height={56} offset={10} />
        <SectionHeading
          title="Things I’ve built"
          action={{ label: "All projects", href: "/projects" }}
        />
        <div className="mt-6">
          <ConcaveCarousel projects={projects} />
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
    </ImageCursorTrail>
  );
}
