import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Tag from "@/components/Tag";
import { coverAlt, getProject, githubUrl, projects } from "@/data/projects";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Not found" };
  return {
    title: project.title,
    description: project.blurb,
    alternates: { canonical: `/projects/${project.slug}` },
  };
}

const linkClass =
  "link-underline inline-flex items-center gap-1.5 font-mono text-[12.5px] text-accent";

export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const repoUrl = githubUrl(project);

  return (
    <article className="mt-12 sm:mt-14">
      <p className="font-mono text-[11px] uppercase tracking-label text-accent">
        {project.category}
      </p>

      <h1 className="mt-2 text-balance text-[32px] font-semibold tracking-[-0.03em] sm:text-[40px]">
        {project.title}
      </h1>

      <p className="mt-4 max-w-[62ch] text-pretty text-[16.5px] leading-[1.65] text-text-soft sm:text-[18px]">
        {project.summary}
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
        <a href={repoUrl} target="_blank" rel="noreferrer noopener" className={linkClass}>
          GitHub<span aria-hidden="true" className="text-[10px]">↗</span>
        </a>
        {project.demo ? (
          <a href={project.demo} target="_blank" rel="noreferrer noopener" className={linkClass}>
            Live demo<span aria-hidden="true" className="text-[10px]">↗</span>
          </a>
        ) : null}
        {project.links.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noreferrer noopener" className={linkClass}>
            {link.label}<span aria-hidden="true" className="text-[10px]">↗</span>
          </a>
        ))}
      </div>

      <div className="relative mt-10 aspect-cover overflow-hidden rounded-2xl border border-border bg-surface-2">
        <Image
          src={project.cover.src}
          alt={coverAlt(project.cover)}
          width={1600}
          height={1000}
          priority
          sizes="(max-width: 1100px) 100vw, 1040px"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mt-12 max-w-[68ch]">
        <h2 className="font-mono text-[11px] uppercase tracking-label text-muted">
          What it does
        </h2>
        <ul className="mt-4 space-y-3">
          {project.details.map((detail) => (
            <li
              key={detail}
              className="flex gap-3 text-[15px] leading-[1.65] text-text-soft sm:text-[16px]"
            >
              <span aria-hidden="true" className="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-accent" />
              <span>{detail}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-12 font-mono text-[11px] uppercase tracking-label text-muted">
          Built with
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {project.stack.map((item) => (
            <li key={item}>
              <Tag>{item}</Tag>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-16 border-t border-border pt-8">
        <Link href="/projects" className="link-underline font-mono text-[12.5px] text-accent">
          ← All projects
        </Link>
      </p>
    </article>
  );
}
