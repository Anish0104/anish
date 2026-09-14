import "server-only";

const OWNER = "Anish0104";
const PROFILE = `https://github.com/${OWNER}`;

export type RepoSummary = {
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
};

export type GitHubStats =
  | {
      status: "ok";
      profileUrl: string;
      /** Public, non-fork repositories owned by the account. */
      publicRepos: number;
      /** Sum of stargazers across those same owned public repos. */
      totalStars: number;
      /** Distinct primary languages across owned public repos. */
      languages: string[];
      recent: RepoSummary[];
      fetchedAt: string;
      /**
       * Contribution totals need the GraphQL API and a token. Without one we
       * say so rather than inferring a number from the public events feed.
       */
      contributionsAvailable: false;
    }
  | { status: "unavailable"; profileUrl: string; reason: string };

/**
 * Counts cover public repositories **owned by** Anish0104, excluding forks.
 * Paginated to 100 per page so the numbers stay right past the first page.
 */
export async function getGitHubStats(): Promise<GitHubStats> {
  const token = process.env.GITHUB_TOKEN; // server-only, never NEXT_PUBLIC_
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "anishshirodkar.me",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const all: RepoSummary[] = [];

    for (let page = 1; page <= 5; page += 1) {
      const res = await fetch(
        `https://api.github.com/users/${OWNER}/repos?per_page=100&page=${page}&sort=pushed&type=owner`,
        { headers, next: { revalidate: 21600, tags: ["github-stats"] } }
      );

      if (!res.ok) {
        return {
          status: "unavailable",
          profileUrl: PROFILE,
          reason:
            res.status === 403
              ? "GitHub’s rate limit is exhausted right now."
              : `GitHub responded with ${res.status}.`,
        };
      }

      const batch = (await res.json()) as Array<{
        name: string;
        html_url: string;
        description: string | null;
        language: string | null;
        stargazers_count: number;
        pushed_at: string;
        fork: boolean;
        private: boolean;
      }>;

      for (const repo of batch) {
        if (repo.private) continue;
        if (repo.fork) continue;
        all.push({
          name: repo.name,
          url: repo.html_url,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          pushedAt: repo.pushed_at,
        });
      }

      if (batch.length < 100) break;
    }

    if (all.length === 0) {
      return {
        status: "unavailable",
        profileUrl: PROFILE,
        reason: "No public repositories were returned.",
      };
    }

    const recent = [...all]
      .sort((a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt))
      .slice(0, 5);

    return {
      status: "ok",
      profileUrl: PROFILE,
      publicRepos: all.length,
      totalStars: all.reduce((sum, r) => sum + r.stars, 0),
      languages: [...new Set(all.map((r) => r.language).filter(Boolean) as string[])],
      recent,
      fetchedAt: new Date().toISOString(),
      contributionsAvailable: false,
    };
  } catch (error) {
    return {
      status: "unavailable",
      profileUrl: PROFILE,
      reason:
        error instanceof Error ? `Couldn’t reach GitHub (${error.message}).` : "Couldn’t reach GitHub.",
    };
  }
}
