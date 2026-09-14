import type { Artwork } from "@/data/art";
import type { Book } from "@/data/books";
import { sampleBooks } from "./books.sample";
import { sampleArtworks } from "./art.sample";

/**
 * Development-only fixtures for exercising the Misc layouts before real
 * content exists.
 *
 * Gated on NEXT_PUBLIC_SHOW_FIXTURES === "true", which is never set in
 * production. The UI additionally labels any fixture-backed section, so
 * placeholder content can never be mistaken for Anish's real books or
 * paintings.
 */
export const fixturesEnabled =
  process.env.NEXT_PUBLIC_SHOW_FIXTURES === "true" &&
  process.env.NODE_ENV !== "production";

export function withFixtures<T>(real: T[], sample: T[]): T[] {
  if (real.length > 0) return real;
  return fixturesEnabled ? sample : [];
}

export const fixtureBooks: Book[] = sampleBooks;
export const fixtureArtworks: Artwork[] = sampleArtworks;
