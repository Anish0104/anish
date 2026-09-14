export type BookStatus = "reading" | "finished";

export type CoverSource = {
  /** Where the image came from, so the provenance is auditable. */
  provider: string;
  /** Direct URL the image was fetched from. */
  url: string;
  /** The edition the cover belongs to. */
  edition: string;
  isbn13?: string;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  /** Local path under /public/images/books. */
  cover?: string;
  /** Native pixel size of the cover, so nothing is cropped or stretched. */
  coverWidth?: number;
  coverHeight?: number;
  coverSource?: CoverSource;
  startedOn?: string;
  finishedOn?: string;
  notes?: string;
  link?: string;
  /** 0 to 100. Only ever set from a real figure, never estimated. */
  progress?: number;
  /**
   * Spine presentation. Colours are sampled from the real cover image, so the
   * spine sits in the book's own palette. It is a constructed typographic
   * spine, not the publisher's spine artwork.
   */
  spine?: {
    base: string;
    text: string;
    /** Millimetre-ish thickness on screen. */
    width?: number;
    height?: number;
  };
};

/**
 * Anish's actual books. Two is what there is: nothing is padded out to fill
 * the shelf, and no dates, percentages, ratings or reviews are recorded
 * because none were supplied.
 *
 * Covers are authentic publisher artwork fetched from the Open Library Covers
 * API and stored locally, rather than hotlinked from a search thumbnail. The
 * edition Anish physically owns was not specified, so a widely available
 * English edition was chosen for each and recorded below.
 */
export const books: Book[] = [
  {
    id: "the-silent-patient",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    status: "reading",
    cover: "/images/books/the-silent-patient.jpg",
    coverWidth: 329,
    coverHeight: 500,
    coverSource: {
      provider: "Open Library Covers API",
      url: "https://covers.openlibrary.org/b/id/8415060-L.jpg",
      edition: "Celadon Books, 5 February 2019",
      isbn13: "9781250301697",
    },
    // Sampled from the cover: its dominant tone is a pale cream (#d5c0ad),
    // with the title set in a deep red.
    spine: { base: "#cbb097", text: "#5d1f18", width: 46, height: 202 },
  },
  {
    id: "days-at-the-morisaki-bookshop",
    title: "Days at the Morisaki Bookshop",
    author: "Satoshi Yagisawa",
    status: "finished",
    cover: "/images/books/days-at-the-morisaki-bookshop.jpg",
    coverWidth: 332,
    coverHeight: 500,
    coverSource: {
      provider: "Open Library Covers API",
      url: "https://covers.openlibrary.org/b/id/13482084-L.jpg",
      // Translated by Eric Ozawa. Not the sequel, "More Days at the Morisaki
      // Bookshop", which carries a different ISBN and cover.
      edition: "Harper Perennial / HarperCollins, 2023",
      isbn13: "9780063278677",
    },
    // Sampled from the cover: the warm olive-gold of the bookshop facade
    // (#907830) is its most saturated recurring tone.
    spine: { base: "#8a7330", text: "#f6efdd", width: 38, height: 190 },
  },
];

export const currentlyReading = (list: Book[]) =>
  list.filter((b) => b.status === "reading");
export const finished = (list: Book[]) =>
  list.filter((b) => b.status === "finished");
