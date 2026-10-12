"use client";

import { useMemo, useState } from "react";
import ActivityHeatmap, { type ActivityDay } from "@/components/ui/activity-heatmap";
import styles from "@/components/ui/activity-heatmap-utils/activity-heatmap.module.css";

// Keep the same color scale in both ranges, even when one includes an outlier.
const THRESHOLDS: [number, number, number] = [2, 5, 10];

/** Both views share the real days fetched on the server. */
export default function GitHubActivity({ days }: { days: ActivityDay[] }) {
  const [range, setRange] = useState<"year" | "quarter">("year");
  const [view, setView] = useState<"2d" | "3d">("2d");
  const [selected, setSelected] = useState<string | null>(null);
  const visibleDays = useMemo(
    () => (range === "year" ? days : days.slice(-90)),
    [days, range],
  );
  const period = range === "year" ? "the last year" : "the last 90 days";

  return (
    <ActivityHeatmap
      days={visibleDays}
      label={`GitHub contributions in ${period}. Use arrow keys to explore days and Enter to select.`}
      period={period}
      view={view}
      thresholds={THRESHOLDS}
      selectedDate={selected}
      onSelectDate={setSelected}
      actions={
        <div className={styles.controls}>
          <div
            role="group"
            aria-label="Contribution date range"
            className={styles.switchGroup}
          >
            {([
              ["year", "Last year"],
              ["quarter", "90 days"],
            ] as const).map(([value, text]) => (
              <button
                key={value}
                type="button"
                aria-pressed={range === value}
                onClick={() => setRange(value)}
                className={styles.rangeButton}
              >
                {text}
              </button>
            ))}
          </div>
          <div
            role="group"
            aria-label="Contribution display"
            className={styles.switchGroup}
          >
            {(["2d", "3d"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={styles.viewButton}
                aria-label={
                  value === "2d" ? "2D calendar view" : "3D contribution landscape"
                }
                aria-pressed={view === value}
                title={value === "2d" ? "2D calendar" : "3D landscape"}
                onClick={() => setView(value)}
              >
                {value === "2d" ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z M3 7l9 5 9-5 M12 12v10" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      }
    />
  );
}
