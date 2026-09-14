"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import type { Artwork } from "@/data/art";
import type { Book } from "@/data/books";
import ArtWall from "./ArtWall";
import Bookshelf from "./Bookshelf";

const TABS = [
  { id: "bookshelf", label: "bookshelf", heading: "Bookshelf", showHeading: false },
  { id: "art-wall", label: "art wall", heading: "Art wall", showHeading: false },
] as const;

type TabId = (typeof TABS)[number]["id"];

function isTabId(value: string): value is TabId {
  return TABS.some((t) => t.id === value);
}

/**
 * The URL hash is external state, so it's read through useSyncExternalStore
 * rather than an effect: the server snapshot is null (renders the first tab),
 * and React swaps in the real hash after hydration without a cascading render.
 */
function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getSnapshot(): TabId | null {
  const hash = window.location.hash.replace("#", "");
  return isTabId(hash) ? hash : null;
}

export default function MiscTabs({
  books,
  artworks,
  fixtures,
}: {
  books: Book[];
  artworks: Artwork[];
  fixtures: { books: boolean; art: boolean };
}) {
  const hashTab = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const [picked, setPicked] = useState<TabId | null>(null);
  const tab: TabId = picked ?? hashTab ?? "bookshelf";

  const select = useCallback((id: TabId) => {
    setPicked(id);
    // Keeps the panel linkable without scrolling the page.
    window.history.replaceState(null, "", `#${id}`);
  }, []);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Misc sections"
        className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[13px]"
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={active}
              aria-controls={`panel-${t.id}`}
              onClick={() => select(t.id)}
              className={`py-1.5 transition-colors ${
                active
                  ? "text-accent underline decoration-accent decoration-1 underline-offset-[6px]"
                  : "text-muted hover:text-text"
              }`}
            >
              <span className={active ? "" : "text-faint"}>[</span>
              {t.label}
              <span className={active ? "" : "text-faint"}>]</span>
            </button>
          );
        })}
      </div>

      <div className="mt-9">
        {TABS.map((t) => (
          <div
            key={t.id}
            role="tabpanel"
            id={`panel-${t.id}`}
            aria-labelledby={`tab-${t.id}`}
            hidden={tab !== t.id}
          >
            {/*
              The visible tab already names the panel, but the document needs
              a heading here so the outline does not jump from h1 to the h3s
              inside each panel.
            */}
            <h2
              className={
                t.showHeading
                  ? "mb-5 text-[22px] font-semibold tracking-[-0.026em] sm:text-[26px]"
                  : "sr-only"
              }
            >
              {t.heading}
            </h2>
            {t.id === "bookshelf" ? <Bookshelf books={books} isFixture={fixtures.books} /> : null}
            {t.id === "art-wall" ? <ArtWall artworks={artworks} isFixture={fixtures.art} /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
