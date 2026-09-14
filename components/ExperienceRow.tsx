import type { Experience } from "@/data/experience";

/**
 * One editorial row: role and organisation on the left, dates and location
 * held to the right. Not a card, not a timeline.
 */
export default function ExperienceRow({
  entry,
  detailed = false,
  headingLevel: Heading = "h3",
  documents,
}: {
  entry: Experience;
  detailed?: boolean;
  headingLevel?: "h2" | "h3";
  /**
   * Proof documents for this role, rendered by the caller so the existence
   * check stays on the server.
   */
  documents?: React.ReactNode;
}) {
  return (
    <li className="border-t border-border py-6 sm:py-7">
      <div className="flex flex-col gap-x-8 gap-y-1.5 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="min-w-0">
          <Heading className="text-[18px] font-semibold leading-snug sm:text-[20px]">
            {entry.role}
          </Heading>
          <p className="mt-0.5 text-[15px] leading-snug text-text-soft sm:text-[16px]">
            {entry.organization}
          </p>
        </div>
        <div className="shrink-0 font-mono text-[11.5px] leading-relaxed text-faint sm:text-right">
          <p>{entry.dates}</p>
          <p>{entry.location}</p>
        </div>
      </div>

      {detailed ? (
        <ul className="mt-5 space-y-3">
          {entry.highlights.map((line) => (
            <li
              key={line}
              className="flex gap-3 text-[14.5px] leading-[1.65] text-text-soft sm:text-[15.5px]"
            >
              <span aria-hidden="true" className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 max-w-[70ch] text-pretty text-[14.5px] leading-[1.6] text-muted sm:text-[15.5px]">
          {entry.summary}
        </p>
      )}
      {documents}
    </li>
  );
}
