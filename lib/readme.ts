import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { getProject, type Project } from "@/data/projects";
import { renderMarkdown } from "./markdown";

const OWNER = "Anish0104";

/**
 * READMEs are not all at README.md: casing and extensions vary between
 * repos, so candidates are tried in order.
 */
const CANDIDATES = [
  "README.md",
  "readme.md",
  "Readme.md",
  "README.MD",
  "README.markdown",
  "docs/README.md",
  ".github/README.md",
  "README.rst",
  "README.txt",
];

export type ReadmeResult =
  | {
      status: "ok";
      html: string;
      /** Where the bytes came from, surfaced in the dialog footer. */
      origin: "github" | "snapshot";
      sourceUrl: string;
      githubUrl: string;
      title: string;
      fetchedAt: string;
    }
  | { status: "missing"; githubUrl: string; title: string }
  | { status: "error"; githubUrl: string; title: string; message: string };

async function fetchFromGitHub(project: Project) {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.raw+json, text/plain",
    "User-Agent": "anishshirodkar.me",
  };
  // Server-side only. Never inlined into client bundles, never NEXT_PUBLIC_.
  if (token) headers.Authorization = `Bearer ${token}`;

  for (const candidate of CANDIDATES) {
    const url = `https://raw.githubusercontent.com/${OWNER}/${project.repo}/${project.branch}/${candidate}`;
    const res = await fetch(url, {
      headers,
      // Cached by the data cache; a GitHub outage falls back to the snapshot.
      next: { revalidate: 3600, tags: [`readme:${project.slug}`] },
    });
    if (res.ok) {
      const text = await res.text();
      if (text.trim()) {
        return { text, candidate, url };
      }
    }
  }
  return null;
}

async function readSnapshot(slug: string) {
  try {
    const file = path.join(process.cwd(), "data", "readme-snapshots", `${slug}.md`);
    const text = await readFile(file, "utf8");
    return text.trim() ? text : null;
  } catch {
    return null;
  }
}

export async function getReadme(slug: string): Promise<ReadmeResult> {
  const project = getProject(slug);
  if (!project) {
    return {
      status: "error",
      githubUrl: `https://github.com/${OWNER}`,
      title: slug,
      message: "Unknown project.",
    };
  }

  const githubUrl = `https://github.com/${OWNER}/${project.repo}`;

  let markdown: string | null = null;
  let origin: "github" | "snapshot" = "github";
  let candidate = "README.md";
  let sourceUrl = `${githubUrl}#readme`;

  try {
    const live = await fetchFromGitHub(project);
    if (live) {
      markdown = live.text;
      candidate = live.candidate;
      sourceUrl = `${githubUrl}/blob/${project.branch}/${live.candidate}`;
    }
  } catch {
    // Network failure, so fall through to the committed snapshot.
  }

  if (!markdown) {
    markdown = await readSnapshot(slug);
    if (markdown) origin = "snapshot";
  }

  if (!markdown) {
    return { status: "missing", githubUrl, title: project.title };
  }

  try {
    const dir = candidate.includes("/")
      ? candidate.slice(0, candidate.lastIndexOf("/"))
      : "";
    const html = await renderMarkdown(markdown, {
      owner: OWNER,
      repo: project.repo,
      branch: project.branch,
      dir,
    });
    return {
      status: "ok",
      html,
      origin,
      sourceUrl,
      githubUrl,
      title: project.title,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "error",
      githubUrl,
      title: project.title,
      message: error instanceof Error ? error.message : "Could not render this README.",
    };
  }
}
