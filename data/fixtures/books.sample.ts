import type { Book } from "@/data/books";

/**
 * PLACEHOLDER DATA. NOT Anish's reading list.
 * Public-domain titles with no cover images, used purely to exercise shelf
 * layout and the missing-cover fallback. Dev only.
 */
export const sampleBooks: Book[] = [
  { id: "s1", title: "The Art of War", author: "Sun Tzu", status: "reading" },
  { id: "s2", title: "Meditations", author: "Marcus Aurelius", status: "reading" },
  { id: "s3", title: "On the Origin of Species", author: "Charles Darwin", status: "finished" },
  { id: "s4", title: "Frankenstein", author: "Mary Shelley", status: "finished" },
  { id: "s5", title: "The Republic", author: "Plato", status: "finished" },
  { id: "s6", title: "Walden", author: "Henry David Thoreau", status: "finished" },
];
