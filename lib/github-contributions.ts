import "server-only";

const LOGIN = "Anish0104";
const PROFILE = `https://github.com/${LOGIN}`;

export type ContributionDay = {
  /** ISO date, kept as a plain "YYYY-MM-DD" string so no timezone can shift it. */
  date: string;
  count: number;
  /** 0 to 4, matching GitHub's own intensity buckets. */
  level: 0 | 1 | 2 | 3 | 4;
};

export type ContributionCalendar =
  | {
      status: "ok";
      profileUrl: string;
      login: string;
      /** Weeks of 7 days, Sunday first, padded so columns align. */
      weeks: (ContributionDay | null)[][];
      /** Summed from exactly the days rendered, never taken from elsewhere. */
      total: number;
      firstDate: string;
      lastDate: string;
      source: "github-graphql" | "jogruber";
      fetchedAt: string;
    }
  | {
      status: "unavailable";
      profileUrl: string;
      login: string;
      reason: string;
      /** What would need configuring to make it work. */
      setupHint: string;
    };

const LEVELS: Record<string, 0 | 1 | 2 | 3 | 4> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

/** Day of week for a plain date string, without constructing a local Date. */
function weekdayOf(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/**
 * Buckets a flat day list into week columns. The first column is padded with
 * nulls so every column has 7 rows and Sunday always sits in row 0.
 */
function toWeeks(days: ContributionDay[]): (ContributionDay | null)[][] {
  const weeks: (ContributionDay | null)[][] = [];
  let week: (ContributionDay | null)[] = Array(weekdayOf(days[0].date)).fill(null);
  for (const day of days) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

/**
 * Preferred path: GitHub's own GraphQL contributions calendar. It needs a
 * token, which is read server-side only and never exposed to the browser.
 */
async function fromGraphQL(token: string): Promise<ContributionDay[] | null> {
  const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{weeks{contributionDays{date contributionCount contributionLevel}}}}}}`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "anishshirodkar.me",
    },
    body: JSON.stringify({ query, variables: { login: LOGIN } }),
    next: { revalidate: 21600, tags: ["github-contributions"] },
  });
  if (!res.ok) return null;

  const json = (await res.json()) as {
    data?: {
      user?: {
        contributionsCollection?: {
          contributionCalendar?: {
            weeks: { contributionDays: { date: string; contributionCount: number; contributionLevel: string }[] }[];
          };
        };
      };
    };
  };

  const weeks = json.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
  if (!weeks?.length) return null;

  return weeks.flatMap((w) =>
    w.contributionDays.map((d) => ({
      // Already a plain YYYY-MM-DD from the API.
      date: d.date.slice(0, 10),
      count: d.contributionCount,
      level: LEVELS[d.contributionLevel] ?? 0,
    }))
  );
}

/**
 * Fallback: a long-standing community mirror of the public contribution graph.
 *
 * Limitation worth knowing: it reads the same public calendar GitHub renders
 * on a profile page, so it reflects public contributions only. Private
 * contributions appear solely if the account has "Include private
 * contributions on my profile" switched on. A token-backed GraphQL call has
 * the same visibility rules, so this is a practical, not a lossy, substitute.
 */
async function fromJogruber(): Promise<ContributionDay[] | null> {
  const res = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${LOGIN}?y=last`,
    {
      headers: { "User-Agent": "anishshirodkar.me" },
      next: { revalidate: 21600, tags: ["github-contributions"] },
    }
  );
  if (!res.ok) return null;

  const json = (await res.json()) as {
    contributions?: { date: string; count: number; level: number }[];
  };
  if (!json.contributions?.length) return null;

  return json.contributions.map((d) => ({
    date: d.date.slice(0, 10),
    count: d.count,
    level: (Math.max(0, Math.min(4, d.level)) as 0 | 1 | 2 | 3 | 4),
  }));
}

export async function getContributionCalendar(): Promise<ContributionCalendar> {
  const token = process.env.GITHUB_TOKEN; // server-only, never NEXT_PUBLIC_
  let days: ContributionDay[] | null = null;
  let source: "github-graphql" | "jogruber" = "jogruber";

  try {
    if (token) {
      days = await fromGraphQL(token);
      if (days) source = "github-graphql";
    }
    if (!days) {
      days = await fromJogruber();
      source = "jogruber";
    }
  } catch {
    days = null;
  }

  if (!days?.length) {
    return {
      status: "unavailable",
      profileUrl: PROFILE,
      login: LOGIN,
      reason: token
        ? "Neither GitHub's GraphQL API nor the fallback calendar source responded."
        : "The public contribution calendar source could not be reached.",
      setupHint:
        "Set GITHUB_TOKEN in the server environment (a classic token with read:user, or any fine-grained token) to read the calendar straight from GitHub's GraphQL API.",
    };
  }

  // Trim to the trailing 53 weeks so the grid is about one year, and align the
  // start to a Sunday so the columns are whole weeks.
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const maxDays = 371;
  let windowed = sorted.slice(-maxDays);
  while (windowed.length && weekdayOf(windowed[0].date) !== 0) windowed = windowed.slice(1);

  return {
    status: "ok",
    profileUrl: PROFILE,
    login: LOGIN,
    weeks: toWeeks(windowed),
    // Summed from exactly the days rendered, so the heading and the squares
    // can never disagree.
    total: windowed.reduce((n, d) => n + d.count, 0),
    firstDate: windowed[0].date,
    lastDate: windowed[windowed.length - 1].date,
    source,
    fetchedAt: new Date().toISOString(),
  };
}
