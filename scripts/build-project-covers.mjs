/**
 * Builds the project cover images.
 *
 *   node scripts/build-project-covers.mjs
 *
 * Sources live in `assets/projects/` and are never modified or served. Each
 * cover is written once, at one size and one aspect ratio, and is used by the
 * homepage cards, the Projects page and the project detail pages alike.
 *
 * What a source is, per project, is recorded in `COVERS` below and repeated in
 * `data/projects.ts` as `cover.kind`, which the site shows to the reader:
 *
 *   screenshot   a capture of the project actually running
 *   frame        a frame lifted from output the project itself produced
 *   illustration artwork, including the photographic concept images here
 *
 * **The seven concept images are illustrations, not photographs of real work.**
 * They are generated conceptual images with photographic styling: a staged
 * paper, a staged reader panel, a staged chart. None is a screenshot, a
 * captured model output, a published paper or a measured result, and nothing
 * written inside them is quoted anywhere else on this site.
 * `cover.provenance` in `data/projects.ts` says so for each one.
 *
 * Covers are **full bleed**: no inset, no padding, no hairline, no surround.
 * The card already supplies the rounded corner and the rule under the image,
 * and a frame drawn inside a photograph reads as a second border. That also
 * means a cover is identical in both themes, so there is one file per project
 * rather than a light and a dark copy of the same pixels.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC_DIR = "assets/projects";
const OUT_DIR = "public/images/projects";

/**
 * 16:10, matching `aspect-cover` in the Tailwind config, at roughly twice the
 * largest size a card ever draws and about 1.5x the detail page.
 */
const CANVAS = { width: 1600, height: 1000 };

/**
 * `crop` is a fraction of the source, applied before anything else, and it is
 * where the judgement lives. Each one was chosen by looking at the image at
 * card size: keep the subject and its annotation legible, drop the parts that
 * only add clutter, and drop anything that would read as a claim.
 *
 * Every crop is solved to exactly 16:10 from the `width` fraction, so no
 * source is ever stretched and the framing is reproducible.
 */
const COVERS = [
  {
    slug: "semantic-search",
    kind: "illustration",
    source: "concepts/semantic-search.png",
    // A staged page with one passage highlighted and a small search control
    // beside it. Pulled in slightly so the highlight and the control hold up
    // at card size. No title block, author line or venue appears anywhere in
    // this image, which is why it is safe to use: it suggests a paper without
    // implying a publication.
    crop: { left: 0.08, top: 0.08, width: 0.84 },
  },
  {
    slug: "skillgap",
    kind: "illustration",
    source: "concepts/skillgap.png",
    // Two sheets side by side with a few skills joined between them. Cropped
    // to put both headings and the connecting lines across the middle of the
    // frame rather than the desk around them.
    crop: { left: 0.05, top: 0.04, width: 0.9 },
  },
  {
    slug: "vouch",
    kind: "illustration",
    source: "concepts/vouch.png",
    // A card being presented to a reader, with a small scope annotation.
    // Shifted left of centre so the reader, the card and the annotation sit
    // together instead of drifting toward the empty doorway.
    crop: { left: 0.06, top: 0.1, width: 0.84 },
  },
  {
    slug: "docpilot",
    kind: "illustration",
    source: "concepts/docpilot.png",
    /**
     * A printed page with a passage highlighted and a short answer card
     * pointing back at it, which is the shape of a grounded answer.
     *
     * Cropped hard from the left on purpose. The left page of the source
     * carries a small chart captioned as validation loss, with a series
     * labelled "Ours" beating a baseline. That is generated sample artwork,
     * but on a portfolio card it would read as a measured result, so it is
     * cropped out entirely rather than merely made small.
     */
    crop: { left: 0.25, top: 0.12, width: 0.75 },
  },
  {
    slug: "vtrack",
    kind: "frame",
    source: "vtrack-source.png",
    /**
     * Unchanged artwork. A frame from the pipeline's own annotated output,
     * with the detection boxes, track ids, per-vehicle speed and running class
     * counts it drew. The one cover here that is real output rather than a
     * staged image.
     *
     * The same crop as before, expressed as a fraction: from the left edge, so
     * the counter overlay in the corner survives. Only the surround it used to
     * sit in is gone, so that it matches the other seven.
     */
    crop: { left: 0, top: 0, width: 0.9 },
  },
  {
    slug: "quantvision",
    kind: "illustration",
    source: "concepts/quantvision.png",
    // A staged market chart with one understated annotation on it. Nearly the
    // full frame: it is already tightly composed, and the annotation is small
    // enough that cropping further would lose it.
    crop: { left: 0.04, top: 0.04, width: 0.92 },
  },
  {
    slug: "sunspot-transformer",
    kind: "illustration",
    source: "concepts/sunspot-transformer.png",
    // The solar surface with two spots marked. Nearly the full frame: the
    // granulation is the texture that makes it read as the sun rather than an
    // abstract orange field, and cropping in loses it.
    crop: { left: 0.03, top: 0.03, width: 0.94 },
  },
  {
    slug: "veritasai",
    kind: "illustration",
    source: "concepts/veritasai.png",
    // Clippings from more than one paper, two of them marked as separate
    // sources, which is what an aggregator gathers before it composes a front
    // page. Cropped in a little to keep both marked passages and the line
    // between them across the middle of the card.
    crop: { left: 0.06, top: 0.06, width: 0.88 },
  },
];

/** Solves a fractional crop to an exact 16:10 pixel rect inside the source. */
function pixelCrop(crop, meta) {
  const targetRatio = CANVAS.width / CANVAS.height;
  const width = Math.round(meta.width * crop.width);
  const height = Math.round(width / targetRatio);
  const left = Math.round(meta.width * crop.left);
  const top = Math.round(meta.height * crop.top);

  if (left + width > meta.width) {
    throw new Error(
      `${crop.left}+${crop.width} runs past the right edge (${left + width} > ${meta.width})`
    );
  }
  if (top + height > meta.height) {
    throw new Error(`crop runs past the bottom (${top + height} > ${meta.height})`);
  }
  return { left, top, width, height };
}

async function build(cover) {
  const from = path.join(SRC_DIR, cover.source);
  if (!fs.existsSync(from)) throw new Error(`missing source ${from}`);

  const image = sharp(from);
  const meta = await image.metadata();
  const rect = pixelCrop(cover.crop, meta);

  const out = path.join(OUT_DIR, `${cover.slug}.webp`);
  await image
    .extract(rect)
    // Already exactly 16:10 by construction, so this only ever scales.
    .resize(CANVAS.width, CANVAS.height, { fit: "fill", kernel: "lanczos3" })
    /**
     * WebP rather than AVIF. These are photographic and AVIF would be smaller,
     * but Next's image optimizer re-encodes on the way out anyway, so the gain
     * would land only on the file in the repository while the slower decode
     * landed on the build. Quality 80 holds the paper grain and the
     * granulation on the sun without visible blocking at card size.
     */
    .webp({ quality: 80, effort: 6 })
    .toFile(out);

  return { out, rect, source: `${meta.width}x${meta.height}` };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // One file per project now. Clear out the old light/dark pairs so a stale
  // `-dark` file cannot linger and be served by an old reference.
  for (const file of fs.readdirSync(OUT_DIR)) {
    if (file.endsWith("-dark.webp")) fs.unlinkSync(path.join(OUT_DIR, file));
  }

  let total = 0;
  for (const cover of COVERS) {
    const { out, rect, source } = await build(cover);
    const bytes = fs.statSync(out).size;
    total += bytes;
    console.log(
      `${cover.slug.padEnd(20)} ${cover.kind.padEnd(13)} ` +
        `${source} -> ${rect.width}x${rect.height} @ ${rect.left},${rect.top}  ` +
        `${(bytes / 1024).toFixed(0)}kB`
    );
  }
  console.log(
    `\n${COVERS.length} covers at ${CANVAS.width}x${CANVAS.height}, ` +
      `${(total / 1024).toFixed(0)}kB total, in ${OUT_DIR}`
  );
}

main();
