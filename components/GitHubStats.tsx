import ContributionCalendar from "./ContributionCalendar";
import { getGitHubStats } from "@/lib/github";
import { getContributionCalendar } from "@/lib/github-contributions";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** For full timestamps, where local formatting is what we want. */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * For plain YYYY-MM-DD values. Parsing these with `new Date` treats them as
 * UTC midnight and then prints them in the local zone, which slides the date
 * back a day west of Greenwich. Splitting the string avoids that entirely.
 */
function formatDayOnly(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function relative(iso: string) {
  const days = Math.round((Date.now() - Date.parse(iso)) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.round(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

/** Server component, so the token, if any, never reaches the browser. */
export default async function GitHubStats() {
  // Both are server-side; any token stays out of the client bundle.
  const [stats, calendar] = await Promise.all([
    getGitHubStats(),
    getContributionCalendar(),
  ]);

  return (
    <section className="mt-20 border-t border-border pt-12 sm:mt-24">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="text-[24px] font-semibold sm:text-[28px]">On GitHub</h2>
        <a
          href={stats.profileUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="link-underline font-mono text-[12.5px] text-accent"
        >
          @Anish0104 ↗
        </a>
      </div>

      {calendar.status === "ok" ? (
        <div className="mt-7 rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3 className="text-[16px] font-semibold sm:text-[17px]">
              {calendar.total.toLocaleString()} contributions in the last year
            </h3>
            <p className="font-mono text-[11px] text-faint">
              {formatDayOnly(calendar.firstDate)} to {formatDayOnly(calendar.lastDate)}
            </p>
          </div>

          <div className="mt-5">
            <ContributionCalendar
              weeks={calendar.weeks}
              total={calendar.total}
              firstDate={calendar.firstDate}
              lastDate={calendar.lastDate}
            />
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-faint">
            {calendar.source === "github-graphql"
              ? "Read from GitHub's GraphQL contributions API"
              : "Read from the public contribution calendar via github-contributions-api.jogruber.de, which mirrors the graph shown on the GitHub profile. Private contributions appear only if they are made public on the profile"}
            . Updated {formatDayOnly(calendar.fetchedAt)}, cached for six hours.
          </p>
        </div>
      ) : (
        <div className="mt-7 rounded-xl border border-border bg-surface-2 p-6">
          <h3 className="text-[16px] font-semibold">Contribution calendar unavailable</h3>
          <p className="mt-2 max-w-[70ch] text-[14.5px] leading-relaxed text-muted">
            {calendar.reason}
          </p>
          <p className="mt-2 max-w-[70ch] text-[12.5px] leading-relaxed text-faint">
            {calendar.setupHint}
          </p>
          <p className="mt-3">
            <a
              href={calendar.profileUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="font-mono text-[12.5px] text-accent hover:underline"
            >
              View the contribution graph on GitHub ↗
            </a>
          </p>
        </div>
      )}

      {stats.status === "unavailable" ? (
        <div className="mt-6 rounded-xl border border-border bg-surface-2 p-6">
          <p className="text-[15px] text-muted">
            GitHub stats aren’t available right now. {stats.reason}
          </p>
          <p className="mt-3">
            <a
              href={stats.profileUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="font-mono text-[12.5px] text-accent hover:underline"
            >
              View the profile on GitHub ↗
            </a>
          </p>
        </div>
      ) : (
        <>
          <h3 className="mt-10 text-[13px] font-medium text-text-soft">
            Repositories
          </h3>
          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat label="Public repositories" value={String(stats.publicRepos)} hint="owned, excluding forks" />
            <Stat label="Stars received" value={String(stats.totalStars)} hint="across those repositories" />
            <Stat label="Primary languages" value={String(stats.languages.length)} hint={stats.languages.slice(0, 4).join(", ")} />
          </dl>

          <h3 className="mt-9 text-[13px] font-medium text-text-soft">
            Recently updated
          </h3>
          <ul className="mt-3 border-b border-border">
            {stats.recent.map((repo) => (
              <li
                key={repo.name}
                className="flex flex-col gap-x-6 gap-y-1 border-t border-border py-4 sm:flex-row sm:items-baseline sm:justify-between"
              >
                <div className="min-w-0">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="link-underline font-mono text-[13.5px] text-text hover:text-accent"
                  >
                    {repo.name}
                  </a>
                  {repo.description ? (
                    <p className="mt-1 max-w-[60ch] text-[14px] leading-relaxed text-muted">
                      {repo.description}
                    </p>
                  ) : null}
                </div>
                <p className="shrink-0 font-mono text-[11.5px] text-faint sm:text-right">
                  {repo.language ? `${repo.language} · ` : ""}
                  {relative(repo.pushedAt)}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-5 font-mono text-[11px] leading-relaxed text-faint">
            Repository figures updated {formatDate(stats.fetchedAt)}.
          </p>
        </>
      )}
    </section>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <dt className="font-mono text-[11px] uppercase tracking-label text-muted">{label}</dt>
      <dd className="mt-2 text-[28px] font-semibold leading-none tabular-nums">{value}</dd>
      {hint ? <p className="mt-2 text-[12.5px] leading-snug text-faint">{hint}</p> : null}
    </div>
  );
}
