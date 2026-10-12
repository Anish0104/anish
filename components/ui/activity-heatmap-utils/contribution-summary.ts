export type ContributionStreak = {
  days: number;
  start: string | null;
  end: string | null;
};

const DAY = 86_400_000;
const iso = (time: number) => new Date(time).toISOString().slice(0, 10);

/** Counts are calendar days in UTC, including any quiet days inside the range. */
export function contributionSummary(start: number, counts: number[]) {
  let total = 0;
  let busiestCount = 0;
  let busiestDate: string | null = null;
  let run = 0;
  let longest: ContributionStreak = { days: 0, start: null, end: null };
  counts.forEach((count, index) => {
    total += count;
    if (count > busiestCount) {
      busiestCount = count;
      busiestDate = iso(start + index * DAY);
    }
    run = count > 0 ? run + 1 : 0;
    if (run > longest.days) {
      longest = {
        days: run,
        start: iso(start + (index - run + 1) * DAY),
        end: iso(start + index * DAY),
      };
    }
  });
  // The streak ends at the latest day in this displayed range. No invented
  // grace days, and a historical 90-day range never claims to be today's streak.
  const current: ContributionStreak = {
    days: run,
    start: run ? iso(start + (counts.length - run) * DAY) : null,
    end: run ? iso(start + (counts.length - 1) * DAY) : null,
  };
  return { total, busiestCount, busiestDate, longest, current };
}
