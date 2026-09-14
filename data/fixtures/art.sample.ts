import type { Artwork } from "@/data/art";

/**
 * PLACEHOLDER DATA. NOT Anish's paintings.
 * Flat neutral SVG panels used only to exercise the gallery wall layout at
 * varied aspect ratios. No artwork is generated and attributed to him.
 */
export const sampleArtworks: Artwork[] = [
  { id: "a1", title: "Placeholder Panel I", src: "/images/art/placeholder-portrait.svg", width: 600, height: 800, medium: "Placeholder", year: "", alt: "A neutral grey placeholder panel in portrait orientation." },
  { id: "a2", title: "Placeholder Panel II", src: "/images/art/placeholder-landscape.svg", width: 900, height: 600, medium: "Placeholder", year: "", alt: "A neutral grey placeholder panel in landscape orientation." },
  { id: "a3", title: "Placeholder Panel III", src: "/images/art/placeholder-square.svg", width: 700, height: 700, medium: "Placeholder", year: "", alt: "A neutral grey placeholder panel in square orientation." },
];
