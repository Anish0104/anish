"use client";

import { useId, useState } from "react";
import type { CourseworkGroup } from "@/data/skills";

/**
 * Coursework as an academic reading list: sentence-case group labels, course
 * names one per line, no boxes and no badges. The current group carries a
 * single small accent rule rather than a badge on every course.
 *
 * Every institution gets the same toggle, collapsed by default, and each one
 * is independent because the state and the aria-controls id are local to the
 * component instance.
 */
export default function CourseworkList({
  groups,
  institution,
}: {
  groups: CourseworkGroup[];
  institution: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);

  const total = groups.reduce((n, g) => n + g.courses.length, 0);
  // Two balanced columns only for a single long list, which is TCET.
  const singleLongGroup = groups.length === 1 && groups[0].courses.length > 8;

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-accent"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
        {open ? "Hide courses" : "Show courses"}
        <span className="sr-only"> for {institution}</span>
        <span className="text-faint">({total})</span>
      </button>

      <div id={id} hidden={!open} className="mt-4">
        {groups.map((group, index) => {
          const isCurrent = /current/i.test(group.label);
          return (
            <section key={group.label} className={index === 0 ? "" : "mt-5"}>
              <h4
                className={`text-[13.5px] font-medium ${
                  isCurrent ? "text-accent" : "text-text-soft"
                }`}
              >
                {isCurrent ? (
                  <span
                    aria-hidden="true"
                    className="mr-2 inline-block h-[2px] w-4 translate-y-[-3px] bg-accent"
                  />
                ) : null}
                {group.label}
              </h4>
              <ul
                className={`mt-2 text-[14px] leading-[1.85] text-muted sm:text-[14.5px] ${
                  singleLongGroup ? "sm:columns-2 sm:gap-x-10" : ""
                }`}
              >
                {group.courses.map((course) => (
                  <li key={course} className="break-inside-avoid">
                    {course}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
