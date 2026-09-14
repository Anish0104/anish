"use client";

import Link from "next/link";
import { useId, useState } from "react";
import ToolIcon from "./icons/ToolIcon";
import { featuredTools, skillGroups } from "@/data/skills";

/**
 * A shelf of eight tools, one shared detail area beneath it, and the rest of
 * the toolkit behind a plain disclosure.
 *
 * Nothing here is ranked or scored. The eight on the shelf are a selection,
 * and the detail area only ever says how a tool is used and which projects
 * were verified to use it: those links come from `featuredTools`, where each
 * one carries the evidence it was checked against.
 *
 * Selection is a real button with `aria-pressed`, changed on click only.
 * Hovering never changes it, because a detail area that follows the pointer is
 * unreadable and unreachable from a keyboard.
 */
export default function SkillGroups() {
  const [selectedName, setSelectedName] = useState(featuredTools[0].name);
  const [open, setOpen] = useState(false);
  const toolkitId = useId();

  const selected =
    featuredTools.find((tool) => tool.name === selectedName) ?? featuredTools[0];

  /**
   * The disclosure drops an entry that is exactly one of the eight above, so
   * the shelf is not simply repeated underneath itself. Compound entries such
   * as "Git and CI/CD" or "Supabase (PostgreSQL + RLS)" stay, because they say
   * more than the shelf label does. Nothing is lost either way: every skill is
   * either on the shelf or in this list.
   */
  const featuredNames = new Set(featuredTools.map((tool) => tool.name));
  const remaining = skillGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !featuredNames.has(item)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    /*
      Capped rather than run to the full content column. Across 1100px the four
      items ended up 400px apart and the shelf stopped reading as a shelf; at
      this measure the row is compact and the rule under it is short enough to
      belong to the items sitting on it.
    */
    <div className="max-w-[780px]">
      <p className="text-[15px] leading-[1.6] text-muted sm:text-[16px]">
        A few tools from my toolkit.
      </p>

      {/*
        The shelf. Two rows of four on desktop, two of two on a phone, where
        four columns would put "PostgreSQL" on its own cramped line.

        The rule under each item is what makes it a shelf: with no column gap
        the borders meet and read as one continuous line across the row,
        including the last one, and it reflows by itself at any column count.
        No card, no panel, no pill.
      */}
      <ul className="mt-6 grid grid-cols-2 sm:grid-cols-4">
        {featuredTools.map((tool) => {
          const active = tool.name === selected.name;
          return (
            <li key={tool.name} className="border-b border-border">
              <button
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedName(tool.name)}
                className="group relative flex w-full flex-col items-center gap-2.5 rounded-t-lg px-2 pb-5 pt-4 motion-safe:transition-colors hover:bg-surface-2"
              >
                <ToolIcon
                  name={tool.icon}
                  size={32}
                  brand
                  className="shrink-0"
                />
                <span
                  className={`text-center text-[14px] leading-snug sm:text-[15px] ${
                    active ? "font-medium text-accent" : "text-text-soft"
                  }`}
                >
                  {tool.name}
                </span>
                {/*
                  The selected marker: a short accent bar sitting on the shelf
                  rule itself, so the item reads as the one currently open
                  without a box, a fill or a change of size.
                */}
                <span
                  aria-hidden="true"
                  className={`absolute -bottom-px left-1/2 h-[2px] w-7 -translate-x-1/2 rounded-full bg-accent motion-safe:transition-opacity ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>

      {/*
        One shared detail area, never a popup. `aria-live` announces the change
        for a screen reader without moving focus, which stays on the button
        that was pressed.

        `min-h` reserves room for the tallest of the eight so switching between
        them does not shove the disclosure up and down. It is a minimum, not a
        fixed height, so nothing is ever clipped.
      */}
      <div
        aria-live="polite"
        className="mt-6 min-h-[8.5rem] sm:min-h-[7rem]"
      >
        <h3 className="text-[16px] font-semibold sm:text-[17px]">{selected.name}</h3>
        <p className="mt-1.5 max-w-[62ch] text-pretty text-[14.5px] leading-[1.65] text-muted sm:text-[15px]">
          {selected.use}
        </p>

        {selected.projects.length > 0 ? (
          <p className="mt-3 text-[13px] text-faint">
            Used in{" "}
            {selected.projects.map((project, i) => (
              <span key={project.slug}>
                {i > 0 ? (i === selected.projects.length - 1 ? " and " : ", ") : ""}
                <Link
                  href={`/projects/${project.slug}`}
                  className="link-underline text-accent"
                >
                  {project.title}
                </Link>
              </span>
            ))}
          </p>
        ) : selected.noProjectsNote ? (
          <p className="mt-3 max-w-[62ch] text-[13px] leading-[1.6] text-faint">
            {selected.noProjectsNote}
          </p>
        ) : null}
      </div>

      {/* The rest of the toolkit, as plain text behind a plain disclosure. */}
      <div className="mt-6 border-t border-border pt-5">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={toolkitId}
          onClick={() => setOpen((was) => !was)}
          className="inline-flex items-center gap-1.5 text-[14px] text-accent motion-safe:transition-colors hover:text-accent-hover"
        >
          {open ? "Show less" : "Full toolkit"}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`motion-safe:transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <div id={toolkitId} hidden={!open} className="mt-5">
          <p className="text-[12.5px] text-faint">
            The eight above are not repeated here.
          </p>

          <dl className="mt-4 sm:columns-2 sm:gap-x-12">
            {remaining.map((group) => (
              <div
                key={group.id}
                className="mb-5 break-inside-avoid last:mb-0 sm:[break-inside:avoid-column]"
              >
                <dt className="flex items-center gap-2 text-[13.5px] font-medium">
                  <ToolIcon name={group.icon} size={15} className="shrink-0 text-accent" />
                  {group.label}
                </dt>
                <dd className="ml-[23px] mt-1 text-[14px] leading-[1.6] text-muted">
                  {group.items.join(", ")}
                  {group.usedIn?.length ? (
                    <span className="mt-1 block text-[12.5px] text-faint">
                      Used in{" "}
                      {group.usedIn.map((project, i) => (
                        <span key={project.slug}>
                          {i > 0 ? " and " : ""}
                          <Link
                            href={`/projects/${project.slug}`}
                            className="link-underline text-accent"
                          >
                            {project.title}
                          </Link>
                        </span>
                      ))}
                    </span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
