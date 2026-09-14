"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Book } from "@/data/books";
import Dialog from "./Dialog";

/** Fallback tint, used only when a book has no cover image. */
function hashOf(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function fallbackFace(book: Book) {
  const hue = [210, 196, 155, 24, 268, 340][hashOf(book.title) % 6];
  return `linear-gradient(140deg, hsl(${hue} 24% 34%), hsl(${hue} 20% 26%))`;
}

/**
 * Spine presentation, using the colours sampled from the real cover where
 * they exist and a deterministic tint otherwise.
 */
function spineOf(book: Book) {
  const hash = hashOf(book.title);
  const base = book.spine?.base;
  if (!base) {
    const hue = [210, 196, 155, 24, 268, 340][hash % 6];
    const h = book.spine?.height ?? 170 + (hash % 5) * 9;
    return {
      width: book.spine?.width ?? 38 + (hash % 4) * 5,
      height: h,
      showAuthor:
        book.title.length * 5.5 + book.author.length * 4.75 + 8 <= h - 16,
      face: `linear-gradient(96deg, hsl(${hue} 24% 28%) 0%, hsl(${hue} 22% 38%) 26%, hsl(${hue} 20% 31%) 100%)`,
      top: `hsl(${hue} 20% 44%)`,
      rule: "rgba(255,255,255,0.28)",
      text: "#ffffff",
    };
  }
  const height = book.spine?.height ?? 184;
  // A long title can fill the whole board. Rather than clipping the author
  // mid-word, drop it: the label under the book and the dialog both carry it.
  const available = height - 16;
  const titleRun = book.title.length * 5.5;
  const authorRun = book.author.length * 4.75 + 8;
  return {
    width: book.spine?.width ?? 42,
    height,
    showAuthor: titleRun + authorRun <= available,
    // A soft sheen across the board, so it reads as a curved surface.
    face: `linear-gradient(96deg, color-mix(in srgb, ${base} 82%, #000) 0%, ${base} 26%, color-mix(in srgb, ${base} 88%, #000) 100%)`,
    top: `color-mix(in srgb, ${base} 78%, #fff)`,
    rule: `color-mix(in srgb, ${book.spine?.text ?? "#fff"} 35%, transparent)`,
    text: book.spine?.text ?? "#ffffff",
  };
}

function aspect(book: Book) {
  return book.coverWidth && book.coverHeight
    ? book.coverHeight / book.coverWidth
    : 1.52;
}

export default function Bookshelf({
  books,
  isFixture = false,
}: {
  books: Book[];
  isFixture?: boolean;
}) {
  const [view, setView] = useState<"shelf" | "list">("shelf");
  const [open, setOpen] = useState<Book | null>(null);

  // Currently reading first, so the bookmarked book leads the shelf.
  const ordered = useMemo(
    () =>
      [...books].sort((a, b) =>
        a.status === b.status ? 0 : a.status === "reading" ? -1 : 1
      ),
    [books]
  );

  if (books.length === 0) return <EmptyShelf />;

  return (
    <div>
      {isFixture ? <FixtureNotice kind="books" /> : null}

      <div className="mb-5 flex justify-end">
        <div
          className="inline-flex rounded-lg border border-border p-0.5"
          role="group"
          aria-label="Bookshelf view"
        >
          {(["shelf", "list"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              aria-pressed={view === mode}
              className={`rounded-md px-3 py-1.5 font-mono text-[11.5px] capitalize transition-colors ${
                view === mode ? "bg-surface-2 text-text" : "text-muted hover:text-text"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {view === "shelf" ? (
        <Shelf books={ordered} onSelect={setOpen} />
      ) : (
        <BookList books={ordered} onSelect={setOpen} />
      )}

      {open ? (
        <Dialog title={open.title} subtitle={open.author} onClose={() => setOpen(null)}>
          <BookDetail book={open} />
        </Dialog>
      ) : null}
    </div>
  );
}

/**
 * The resting shelf shows books as physical objects standing spine-out on a
 * ledge: a skewed top edge for thickness, page edges down one side, head and
 * tail bands, a soft sheen, and a contact shadow.
 *
 * Spine colours are sampled from each real cover (see data/books.ts). They are
 * a constructed typographic spine, not the publisher's spine artwork. The
 * authentic front cover is shown in the dialog when a book is opened.
 *
 * Sized to its contents, so two books look deliberate and more simply widen
 * the row and then wrap.
 */
function Shelf({ books, onSelect }: { books: Book[]; onSelect: (b: Book) => void }) {
  return (
    <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <div className="relative mx-auto w-fit">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-[16px] top-5 rounded-t-md bg-surface-2"
        />

        <ul className="relative flex flex-wrap items-end justify-center gap-x-3 gap-y-6 px-10 pb-[16px]">
          {books.map((book) => {
            const spine = spineOf(book);
            const reading = book.status === "reading";
            return (
              <li key={book.id} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => onSelect(book)}
                  className="group relative block transition-transform duration-200 ease-out focus-visible:outline-offset-4 motion-safe:hover:-translate-y-1.5 motion-safe:focus-visible:-translate-y-1.5"
                  style={{ width: spine.width, height: spine.height }}
                >
                  {/* top edge, giving the board its thickness */}
                  <span
                    aria-hidden="true"
                    className="absolute -top-[5px] left-[2px] right-[2px] h-[6px] rounded-t-[2px]"
                    style={{ background: spine.top, transform: "skewX(-22deg)" }}
                  />
                  {/* spine board */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-[2px_4px_4px_2px] shadow-card"
                    style={{ background: spine.face }}
                  />
                  {/* head and tail bands */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[5px] top-[11px] h-[1px]"
                    style={{ background: spine.rule }}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[5px] bottom-[11px] h-[1px]"
                    style={{ background: spine.rule }}
                  />
                  {/* page edges down the fore edge */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-[3px] right-0 w-[6px] rounded-r-[3px] bg-[linear-gradient(90deg,rgba(0,0,0,0.22),#efeae1_45%,#d9d2c6)]"
                  />
                  {/* hinge highlight along the joint */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-[2px] left-[3px] w-[2px] rounded bg-white/25"
                  />
                  {reading ? (
                    <span
                      aria-hidden="true"
                      className="absolute -top-[10px] right-[12px] h-9 w-[9px] rounded-b-[2px] bg-accent shadow-card"
                    />
                  ) : null}

                  <span
                    className="absolute inset-y-0 left-0 right-[6px] flex items-center justify-center px-1"
                    style={{
                      writingMode: "vertical-rl",
                      transform: "rotate(180deg)",
                      color: spine.text,
                    }}
                  >
                    <span className="max-h-full overflow-hidden whitespace-nowrap">
                      <span className="text-[11px] font-semibold tracking-tight">
                        {book.title}
                      </span>
                      {spine.showAuthor ? (
                        <span className="text-[9.5px] opacity-70"> · {book.author}</span>
                      ) : null}
                    </span>
                  </span>

                  <span className="sr-only">
                    {book.title} by {book.author},{" "}
                    {reading ? "currently reading" : "finished"}. Open details.
                  </span>
                </button>

                {/* contact shadow where the book meets the ledge */}
                <span
                  aria-hidden="true"
                  className="mt-[2px] h-[5px] rounded-[50%] bg-black/25 blur-[3px] dark:bg-black/60"
                  style={{ width: spine.width + 10 }}
                />
              </li>
            );
          })}
        </ul>

        {/* the ledge: top surface plus a front edge */}
        <div aria-hidden="true" className="relative">
          <div className="h-[7px] rounded-[2px] bg-border-strong" />
          <div className="h-[10px] rounded-b-md bg-[var(--border)] shadow-[0_10px_16px_-9px_rgba(0,0,0,0.5)]" />
        </div>

        <ul className="mt-4 flex justify-center gap-3 px-10">
          {books.map((book) => (
            <li
              key={book.id}
              className="text-center"
              style={{ width: (book.spine?.width ?? 42) + 10 }}
            >
              <span
                className={`text-[10.5px] ${
                  book.status === "reading" ? "text-accent" : "text-faint"
                }`}
              >
                {book.status === "reading" ? "Reading" : "Finished"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Falls back to a typographic front if the image is missing or fails to load. */
function CoverImage({ book, sizes = "132px" }: { book: Book; sizes?: string }) {
  const [failed, setFailed] = useState(false);

  if (!book.cover || failed) {
    return (
      <span
        className="flex h-full w-full flex-col justify-between p-3 text-white"
        style={{ background: fallbackFace(book) }}
      >
        <span className="text-[12.5px] font-semibold leading-snug">{book.title}</span>
        <span className="text-[10.5px] text-white/75">{book.author}</span>
      </span>
    );
  }

  return (
    <Image
      src={book.cover}
      alt={`Front cover of ${book.title} by ${book.author}`}
      fill
      sizes={sizes}
      onError={() => setFailed(true)}
      className="object-cover"
    />
  );
}

function BookList({ books, onSelect }: { books: Book[]; onSelect: (b: Book) => void }) {
  return (
    <ul className="border-b border-border">
      {books.map((book) => (
        <li key={book.id} className="border-t border-border">
          <button
            type="button"
            onClick={() => onSelect(book)}
            className="flex w-full items-center gap-4 py-4 text-left"
          >
            <span className="relative h-[62px] w-[41px] shrink-0 overflow-hidden rounded-[2px] ring-1 ring-border">
              <CoverImage book={book} sizes="41px" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium">{book.title}</span>
              <span className="block text-[13.5px] text-muted">{book.author}</span>
            </span>
            <span
              className={`shrink-0 text-[11.5px] ${
                book.status === "reading" ? "text-accent" : "text-faint"
              }`}
            >
              {book.status === "reading" ? "Currently reading" : "Finished"}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function BookDetail({ book }: { book: Book }) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      <div className="shrink-0">
        <div
          className="relative overflow-hidden rounded-[3px] shadow-lift ring-1 ring-black/10"
          style={{ width: 190, height: Math.round(190 * aspect(book)) }}
        >
          <CoverImage book={book} sizes="190px" />
        </div>
      </div>

      <dl className="min-w-0 flex-1 space-y-3 text-[14.5px]">
        <Row label="Author" value={book.author} />
        <Row
          label="Status"
          value={book.status === "reading" ? "Currently reading" : "Finished"}
        />
        {book.startedOn ? <Row label="Started" value={book.startedOn} /> : null}
        {book.finishedOn ? <Row label="Finished" value={book.finishedOn} /> : null}
        {typeof book.progress === "number" ? (
          <Row label="Progress" value={`${book.progress}%`} />
        ) : null}
        {book.notes ? <Row label="Notes" value={book.notes} /> : null}
        {book.coverSource ? (
          <div>
            <dt className="text-[11.5px] text-muted">Cover edition</dt>
            <dd className="mt-1 text-[13.5px] leading-relaxed text-text-soft">
              {book.coverSource.edition}
              {book.coverSource.isbn13 ? ` (ISBN ${book.coverSource.isbn13})` : ""}
              <span className="mt-0.5 block text-[12px] text-faint">
                Cover image via {book.coverSource.provider}. A widely available
                edition, not necessarily the copy on my shelf.
              </span>
            </dd>
          </div>
        ) : null}
        {book.link ? (
          <div>
            <dt className="text-[11.5px] text-muted">Link</dt>
            <dd className="mt-1">
              <a
                href={book.link}
                target="_blank"
                rel="noreferrer noopener"
                className="text-accent hover:underline"
              >
                More about this book ↗
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11.5px] text-muted">{label}</dt>
      <dd className="mt-1 text-text-soft">{value}</dd>
    </div>
  );
}

function EmptyShelf() {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface p-8 sm:p-10">
      <div
        aria-hidden="true"
        className="mx-auto flex h-[110px] w-full max-w-xs items-end justify-center gap-3 border-b-[6px] border-border-strong px-4"
      >
        {[0.7, 0.85].map((h, i) => (
          <span
            key={i}
            className="rounded-[2px] border border-dashed border-border"
            style={{ width: 54, height: `${h * 100}%` }}
          />
        ))}
      </div>
      <p className="mt-6 text-center text-[15px] text-muted">
        The shelf is empty for now. Books go up here as I read them.
      </p>
    </div>
  );
}

export function FixtureNotice({ kind }: { kind: string }) {
  return (
    <p className="mb-6 rounded-lg border border-dashed border-border bg-surface-2 px-4 py-3 font-mono text-[11.5px] leading-relaxed text-muted">
      Development fixtures: placeholder {kind}, not Anish&rsquo;s real{" "}
      {kind === "books" ? "reading list" : kind}. Hidden in production builds.
    </p>
  );
}
