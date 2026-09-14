export type Artwork = {
  id: string;
  title: string;
  /** Path under /public/images/art or an absolute URL. */
  src: string;
  /** Intrinsic pixel dimensions, required so the wall reserves the right space. */
  width: number;
  height: number;
  /**
   * Omitted where Anish has not supplied it. Nothing here is guessed from
   * looking at the painting.
   */
  medium?: string;
  year?: string;
  /** Describes the painting for screen readers; never just the title. */
  alt: string;
};

/**
 * Anish's own paintings, with the titles Anish supplied.
 *
 * Dates and media have still not been supplied, so none are shown and none are
 * inferred from the images.
 *
 * Each entry points at a resized derivative. The photographs were only scaled
 * down: nothing was cropped, recoloured or stretched, and both signatures sit
 * on the paper below the painted area, so the full sheet is kept in frame.
 *
 * The unmodified source photographs are kept at
 * `public/images/art/originals/<id>-original.jpg`. They are no longer
 * addressed from here: the wall is display only, so there is no viewer to
 * offer a full resolution file and a field nobody reads would only go stale.
 * Fixtures: `data/fixtures/art.sample.ts` (dev only).
 */
export const artworks: Artwork[] = [
  {
    id: "sunset-at-the-pier",
    title: "Sunset at the Pier",
    src: "/images/art/sunset-at-the-pier.jpg",
    width: 1400,
    height: 2110,
    alt: "Painting of a sunset reflected on water beside a wooden pier.",
  },
  {
    id: "under-a-shooting-star",
    title: "Under a Shooting Star",
    src: "/images/art/under-a-shooting-star.jpg",
    width: 1400,
    height: 2145,
    alt: "Painting of a forest campsite beneath a blue night sky and shooting star.",
  },
];
