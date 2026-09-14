import Image from "next/image";
import type { Artwork } from "@/data/art";

/**
 * A gallery wall: a subtle wall surface, restrained frames with matting, and
 * natural shadows. Each painting keeps its own aspect ratio and is fitted with
 * `object-contain`, so nothing is cropped into a uniform tile and no frame is
 * rotated at random.
 *
 * The grid is one column on mobile and two from the `sm` breakpoint, so the
 * two portrait paintings hang side by side on desktop and stack vertically on
 * a phone. The wall is width-capped so tall portraits do not tower over the
 * rest of the page.
 *
 * **Display only.** The paintings hang here and that is all they do: no click
 * target, no lightbox, no zoom, no next/previous, no link to the original
 * photograph, no pointer cursor and no hover lift. Nothing on this wall is
 * focusable, because there is nothing for a keyboard to activate, and the
 * absence of any affordance is the point rather than an omission. Each
 * painting is a `<figure>` with its title as the caption and a description in
 * `alt` for anyone who cannot see it.
 *
 * Removing the viewer removed the only state, the only effects and the only
 * event handlers on the wall, so the file no longer needs `"use client"`. It
 * is still bundled for the browser, because `MiscTabs` is a client component
 * and imports it, but it is now markup and nothing else.
 */
export default function ArtWall({
  artworks,
  isFixture = false,
}: {
  artworks: Artwork[];
  isFixture?: boolean;
}) {
  if (artworks.length === 0) return null;

  return (
    <div>
      {isFixture ? (
        <p className="mb-6 rounded-lg border border-dashed border-border bg-surface-2 px-4 py-3 font-mono text-[11.5px] leading-relaxed text-muted">
          Development fixtures: neutral placeholder panels, not Anish&rsquo;s
          paintings. Hidden in production builds.
        </p>
      ) : null}

      {/*
        No container panel: the frames are the only chrome. Each painting is
        capped so the wall reads as a pair of modest prints rather than two
        full height posters, and the pair is centred as a group. The sizes and
        spacing are unchanged from when the wall was clickable.
      */}
      <ul className="mx-auto flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-center sm:gap-6">
        {artworks.map((art) => (
          <li key={art.id} className="w-full max-w-[190px]">
            <figure className="m-0">
              {/* frame with a thin inner mat */}
              <span className="block rounded-[3px] bg-[var(--surface)] p-[6px] shadow-lift ring-1 ring-border">
                <span className="block bg-[var(--surface-2)] p-[7px] ring-1 ring-border/70">
                  <Image
                    src={art.src}
                    alt={art.alt}
                    width={art.width}
                    height={art.height}
                    loading="lazy"
                    sizes="190px"
                    className="h-auto w-full object-contain"
                  />
                </span>
              </span>
              <figcaption className="mt-3 block">
                <span className="block text-[15.5px] font-medium leading-snug">
                  {art.title}
                </span>
                {caption(art) ? (
                  <span className="mt-0.5 block text-[13px] text-muted">{caption(art)}</span>
                ) : null}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Medium and year are optional and have not been supplied for either
 * painting, so the caption collapses to nothing rather than showing a stray
 * comma or a guessed value.
 */
function caption(art: Artwork) {
  return [art.medium, art.year].filter(Boolean).join(", ");
}
