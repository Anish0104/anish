"use client";

import { useMemo, useRef, useState } from "react";
import type { ContributionDay } from "@/lib/github-contributions";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
/** Only these rows get a visible label, matching GitHub's restraint. */
const LABELLED_ROWS = [1, 3, 5];

const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;

/** Formats a plain YYYY-MM-DD without letting a timezone shift the day. */
function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function monthOf(iso: string) {
  return Number(iso.split("-")[1]) - 1;
}

/**
 * GitHub-style contribution grid.
 *
 * Accessibility: the grid is a roving-tabindex `role="grid"`, so it takes a
 * single tab stop and arrow keys move between days. Each cell carries a full
 * aria-label ("3 contributions on 8 February 2026"), and the same text appears
 * in a tooltip on hover and on focus.
 */
export default function ContributionCalendar({
  weeks,
  total,
  firstDate,
  lastDate,
}: {
  weeks: (ContributionDay | null)[][];
  total: number;
  firstDate: string;
  lastDate: string;
}) {
  const [active, setActive] = useState<{ w: number; d: number } | null>(null);
  const [hover, setHover] = useState<{ day: ContributionDay; x: number; y: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // First column index of each month, for the labels along the top.
  const monthLabels = useMemo(() => {
    const out: { index: number; label: string }[] = [];
    let last = -1;
    weeks.forEach((week, i) => {
      const first = week.find(Boolean);
      if (!first) return;
      const m = monthOf(first.date);
      if (m !== last) {
        // Skip a label that would collide with the previous one.
        if (!out.length || i - out[out.length - 1].index >= 3) {
          out.push({ index: i, label: MONTHS[m] });
        }
        last = m;
      }
    });
    return out;
  }, [weeks]);

  // Cheap enough to derive each render; the compiler memoizes it for us.
  const firstFocusable = findFirstDay(weeks);

  const current = active ?? firstFocusable;

  function move(dw: number, dd: number) {
    let { w, d } = current;
    for (let guard = 0; guard < 400; guard += 1) {
      w += dw;
      d += dd;
      if (d > 6) {
        d = 0;
        w += 1;
      }
      if (d < 0) {
        d = 6;
        w -= 1;
      }
      if (w < 0 || w >= weeks.length) return;
      if (weeks[w][d]) {
        setActive({ w, d });
        const el = gridRef.current?.querySelector<HTMLElement>(`[data-cell="${w}-${d}"]`);
        el?.focus();
        return;
      }
    }
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const map: Record<string, [number, number]> = {
      ArrowRight: [1, 0],
      ArrowLeft: [-1, 0],
      ArrowDown: [0, 1],
      ArrowUp: [0, -1],
    };
    const delta = map[event.key];
    if (delta) {
      event.preventDefault();
      move(delta[0], delta[1]);
    }
  }

  const width = weeks.length * STEP;
  const label = (day: ContributionDay) =>
    `${day.count === 0 ? "No contributions" : `${day.count} contribution${day.count === 1 ? "" : "s"}`} on ${formatDate(day.date)}`;

  return (
    <div className="relative">
      {/*
        The calendar scrolls inside its own box on narrow screens, so a year of
        columns never widens the page.
      */}
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div style={{ width: width + 34 }} className="relative">
          {/* month labels */}
          <div className="relative ml-[34px]" style={{ height: 16 }}>
            {monthLabels.map((m) => (
              <span
                key={`${m.label}-${m.index}`}
                className="absolute top-0 text-[10.5px] text-muted"
                style={{ left: m.index * STEP }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            {/* weekday labels */}
            <div className="relative w-[26px] shrink-0" style={{ height: 7 * STEP }}>
              {LABELLED_ROWS.map((r) => (
                <span
                  key={r}
                  className="absolute text-[10.5px] leading-none text-muted"
                  style={{ top: r * STEP + 2 }}
                >
                  {WEEKDAYS[r]}
                </span>
              ))}
            </div>

            <div
              ref={gridRef}
              role="grid"
              aria-label={`Contribution calendar: ${total} contributions from ${formatDate(firstDate)} to ${formatDate(lastDate)}. Use the arrow keys to move between days.`}
              onKeyDown={onKeyDown}
              className="relative"
              style={{ width, height: 7 * STEP }}
            >
              {WEEKDAYS.map((_, row) => (
                <div key={row} role="row" className="contents">
                  {weeks.map((week, col) => {
                    const day = week[row];
                    if (!day) {
                      return (
                        <div
                          key={`${col}-${row}`}
                          role="gridcell"
                          aria-hidden="true"
                          className="absolute"
                          style={{ left: col * STEP, top: row * STEP, width: CELL, height: CELL }}
                        />
                      );
                    }
                    const isCurrent = current.w === col && current.d === row;
                    return (
                      <div
                        key={`${col}-${row}`}
                        role="gridcell"
                        data-cell={`${col}-${row}`}
                        tabIndex={isCurrent ? 0 : -1}
                        aria-label={label(day)}
                        title={label(day)}
                        onFocus={(e) => {
                          setActive({ w: col, d: row });
                          const r = e.currentTarget.getBoundingClientRect();
                          setHover({ day, x: r.left + r.width / 2, y: r.top });
                        }}
                        onBlur={() => setHover(null)}
                        onMouseEnter={(e) => {
                          const r = e.currentTarget.getBoundingClientRect();
                          setHover({ day, x: r.left + r.width / 2, y: r.top });
                        }}
                        onMouseLeave={() => setHover(null)}
                        className={`absolute rounded-[2px] ring-1 ring-inset ring-black/[0.06] dark:ring-white/[0.04] ${levelClass(day.level)}`}
                        style={{ left: col * STEP, top: row * STEP, width: CELL, height: CELL }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* legend */}
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-muted">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span
            key={l}
            aria-hidden="true"
            className={`inline-block rounded-[2px] ring-1 ring-inset ring-black/[0.06] dark:ring-white/[0.04] ${levelClass(l as 0)}`}
            style={{ width: CELL, height: CELL }}
          />
        ))}
        <span>More</span>
      </div>

      {hover ? (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-[11.5px] text-text shadow-lift"
          style={{ left: hover.x, top: hover.y - 8 }}
        >
          {label(hover.day)}
        </div>
      ) : null}
    </div>
  );
}

/** The first real day in the grid, which owns the single tab stop. */
function findFirstDay(weeks: (ContributionDay | null)[][]) {
  for (let w = 0; w < weeks.length; w += 1) {
    for (let d = 0; d < 7; d += 1) {
      if (weeks[w][d]) return { w, d };
    }
  }
  return { w: 0, d: 0 };
}

/** GitHub-style green ramp, dimmed slightly in dark mode. */
function levelClass(level: 0 | 1 | 2 | 3 | 4) {
  switch (level) {
    case 1:
      return "bg-[#9be9a8] dark:bg-[#0e4429]";
    case 2:
      return "bg-[#40c463] dark:bg-[#006d32]";
    case 3:
      return "bg-[#30a14e] dark:bg-[#26a641]";
    case 4:
      return "bg-[#216e39] dark:bg-[#39d353]";
    default:
      return "bg-[#ebedf0] dark:bg-[#161b22]";
  }
}
