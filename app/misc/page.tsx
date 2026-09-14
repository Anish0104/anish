import type { Metadata } from "next";
import MiscTabs from "@/components/MiscTabs";
import { artworks } from "@/data/art";
import { books } from "@/data/books";
import CompanionSurface from "@/components/companion/CompanionSurface";
import { fixtureArtworks, fixtureBooks, withFixtures } from "@/data/fixtures";

export const metadata: Metadata = {
  title: "Misc",
  description:
    "Books and paintings: the personal corner of Anish Shirodkar's site.",
  alternates: { canonical: "/misc" },
};

export default function MiscPage() {
  const shownBooks = withFixtures(books, fixtureBooks);
  const shownArt = withFixtures(artworks, fixtureArtworks);

  return (
    <div className="mt-12 sm:mt-14">
      <h1 className="text-balance text-[32px] font-semibold tracking-[-0.03em] sm:text-[40px]">
        Misc
      </h1>
      <p className="mt-4 max-w-[58ch] text-pretty text-[16.5px] leading-[1.6] text-text-soft sm:text-[18px]">
        My corner of the site: what I&rsquo;m reading and what I&rsquo;ve been
        painting.
      </p>

      <div className="relative mt-10">
        <CompanionSurface id="misc-1" height={52} offset={8} />
        <MiscTabs
          books={shownBooks}
          artworks={shownArt}
          fixtures={{
            books: books.length === 0 && shownBooks.length > 0,
            art: artworks.length === 0 && shownArt.length > 0,
          }}
        />
      </div>
    </div>
  );
}
