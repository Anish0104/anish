/**
 * Builds the favicon set from Mini Anish's existing idle artwork.
 *
 *   node scripts/build-favicon.mjs
 *
 * The source is `public/images/companion/idle-01.png`, the same frame the
 * header perch uses. It is read only: no sprite, sheet or site asset is
 * modified, and everything here is written to `app/` and `assets/favicon/`.
 *
 * Composition. The whole head is used, hair down to the beard and chin, with
 * the thin outer hair wisps cropped away so the dense head fills the square.
 * Only the outline needs room at the edges. There is no perch line and no
 * peeking crop: at tab size the head itself has to carry the identification,
 * and giving it the full tile is worth more than any added device.
 *
 * Sizes are tuned separately, because a tab renders 16 or 32 CSS pixels no
 * matter how much resolution it is handed. What changes between them is how
 * much of the drawing survives: at 48 the curls still read, at 32 they start
 * to average together, and at 16 only three shapes survive, so that size gets
 * a deliberately simplified rendering rather than a sharpened downscale. See
 * SIZES.
 *
 * Dark tabs. The hair is near black, so a transparent icon loses its top edge
 * against a dark tab strip. Every size carries a thin warm off-white outline
 * built by dilating the alpha channel, sized so it separates the silhouette
 * without eating into the face.
 *
 * TWO SOURCES, ON PURPOSE.
 *
 * The tab sizes (16, 32, 48, everything inside favicon.ico) are a drawn glyph,
 * not the photograph. Scaling the art down keeps its real proportions, and in
 * the art the hair is about 60% of the head, which at 16px leaves a face a few
 * pixels tall: correct, and unreadable. The glyph deliberately breaks those
 * proportions, enlarging the face against the hair and reducing the curls to a
 * few clear shapes, which is the only way the features survive at tab size.
 *
 * The large icons (apple-icon at 180, the 512 master) still come from the
 * artwork, because at that size it reads beautifully and nothing needs faking.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "public/images/companion/idle-01.png";
const APP_DIR = "app";
const MASTER_DIR = "assets/favicon";

/** The flat tone hair is crushed to when detail is dropped. */
const HAIR = { r: 26, g: 24, b: 26 };
/** Beard, kept a touch lighter than hair so the jaw stays readable. */
const BEARD = { r: 54, g: 44, b: 42 };
/** Warm off-white, matching the site's `--bg`. */
const OFF_WHITE = { r: 250, g: 248, b: 245 };

/**
 * The three tones the 16px poster pass snaps to.
 *
 * `skin` is the measured mean of the drawn skin (229,158,106), so the face
 * keeps its own colour rather than a guessed one. Brows, lashes and pupils are
 * simply not skin, so they land on `hair` and stay the darkest thing in the
 * face, which is all that is needed at this size.
 *
 * Deliberately three and not four: a separate near black "feature" tone
 * applied inside a box drew a visible rectangle across the face wherever the
 * box edge crossed hair or ear shadow, and it differed from `hair` by six
 * values, which no one can see anyway.
 */
const POSTER = {
  hair: { r: 26, g: 24, b: 26 },
  beard: { r: 82, g: 60, b: 50 },
  skin: { r: 229, g: 158, b: 106 },
};

/**
 * The head, measured from the frame.
 *
 * Left and right are inset from the true silhouette (54 and 257): those
 * columns hold only thin flyaway strands, which cost real tile area and
 * average into grey haze at tab size. `bottom` is the underside of the beard,
 * just above where the hoodie collar starts at y=236.
 */
const HEAD = { left: 66, top: 48, right: 247, bottom: 233 };

/**
 * Zones, in source coordinates.
 *
 * These are boxes rather than rows on purpose. The hair runs down BOTH SIDES
 * of the face to about y=210, well below the brow line, so splitting on a row
 * alone paints those side curls with the beard tone and the whole face turns
 * muddy brown. `face` bounds the zones horizontally to the face itself and
 * leaves everything outside it as hair.
 */
const ZONES = {
  /** Horizontal bounds of the face. Outside this, dark means hair. */
  faceLeft: 98,
  faceRight: 228,
  /** Brows, eyes and nose bridge: features, never flattened. */
  featureTop: 156,
  featureBottom: 202,
  /** Moustache, mouth and beard. */
  beardTop: 204,
};

/** Eye box in source coordinates. */
const EYES = { left: 112, right: 212, top: 174, bottom: 201 };

/**
 * Per size tuning.
 *
 * `margin`    fraction of the tile left free for the outline.
 * `face`      lift toward white. 1 means the skin is left exactly as drawn.
 * `eye`       local contrast in the eye box: pupil darker, sclera lighter.
 * `grow`      dilation of the pupils only, in source pixels.
 * `flatHair`  how far hair is crushed toward one flat tone.
 * `flatBeard` the same for the beard, always gentler so the jaw still reads.
 * `sharpen`   post resize sharpening. Off at 16, where it only adds crunch.
 */
const SIZES = {
  // Photographic, from the artwork. Large enough that it needs no help.
  512: { margin: 0.035, face: 1, eye: 1, grow: 0, flatHair: 0, flatBeard: 0, sharpen: 0 },
  180: { margin: 0.04, face: 1, eye: 1.05, grow: 0, flatHair: 0.15, flatBeard: 0.1, sharpen: 0.3 },

  // Tab sizes: the drawn glyph, tuned per size.
  48: { glyph: { brows: true, catchlight: true, lips: true, eyeRX: 1.8, eyeRY: 2.0 } },
  32: { glyph: { brows: true, catchlight: true, lips: true, eyeRX: 1.85, eyeRY: 2.05 } },
  /**
   * 16px drops everything that cannot survive three pixels: brows merge into
   * the eyes, a catchlight is a single pale dot in the middle of a pupil, and
   * lips vanish. What is left is the shape that still reads, so the eyes grow
   * slightly and the beard loses its moustache rise.
   */
  16: {
    glyph: {
      brows: false,
      catchlight: false,
      lips: false,
      simple: true,
      eyeRX: 2.05,
      eyeRY: 2.25,
      eyeY: 18.8,
    },
  },
};

const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));

/** Glyph palette. Skin is the measured mean of the drawn skin. */
const G = {
  hair: "#1A181A",
  skin: "#E59E6A",
  beard: "#392B24",
  eye: "#141010",
  white: "#FFF8F0",
  lip: "#9A5546",
};

/** Face outline, shared by the skin fill and the beard clip. */
const FACE =
  "M6.5,15 C6.5,9.8 10.4,7.6 16,7.6 C21.6,7.6 25.5,9.8 25.5,15 L25.5,19.2 " +
  "C25.5,24.8 21.4,28.9 16,28.9 C10.6,28.9 6.5,24.8 6.5,19.2 Z";

/**
 * Beard outlines.
 *
 * The detailed one has a W shaped top edge, which is what a short beard does:
 * high at the sideburns, dipping across the bare cheek, rising again at the
 * moustache. A straight edge reads as a chin strap, and carving a skin
 * coloured shape out of the middle reads as a muzzle. The simple one drops the
 * moustache rise for 16px, where it is three pixels wide and only muddies.
 */
const BEARD_FULL =
  "M5.2,15.5 C5.8,19.6 7.2,22.6 9.6,23.6 C11.4,24.3 12.8,23.4 13.3,22.3 " +
  "C14.2,21.7 17.8,21.7 18.7,22.3 C19.2,23.4 20.6,24.3 22.4,23.6 " +
  "C24.8,22.6 26.2,19.6 26.8,15.5 L26.8,32 L5.2,32 Z";
const BEARD_SIMPLE =
  "M5.2,15.5 C5.8,20.4 7.6,23.2 10.2,24.2 C12,24.9 13.8,25.1 16,25.1 " +
  "C18.2,25.1 20,24.9 21.8,24.2 C24.4,23.2 26.2,20.4 26.8,15.5 L26.8,32 L5.2,32 Z";

/** Draws the glyph on a 32 unit grid. Every size renders from this. */
function glyph(p) {
  const {
    brows = true,
    catchlight = true,
    lips = true,
    simple = false,
    eyeRX = 1.9,
    eyeRY = 2.1,
    eyeY = 18.3,
    browY = 14.7,
    browH = 1.5,
  } = p;
  // A few clear curl shapes, not hair texture. Fewer and larger when simple.
  const bumps = (
    simple
      ? [[10, 7.2, 5.4], [16.5, 5.2, 5.8], [23, 7.6, 5.2], [6.0, 12.0, 4.0], [26.6, 12.4, 4.0]]
      : [[9, 7.6, 4.6], [15, 5.3, 5.0], [21.5, 6, 4.8], [25.4, 10.2, 4.2], [6.2, 11.4, 3.9], [26.4, 14, 3.5]]
  )
    .map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <defs><clipPath id="f"><path d="${FACE}"/></clipPath></defs>
  <path d="${FACE}" fill="${G.skin}"/>
  <g clip-path="url(#f)">
    <path d="${simple ? BEARD_SIMPLE : BEARD_FULL}" fill="${G.beard}"/>
    ${lips ? `<path d="M13.4,23.6 C14.5,23.0 17.5,23.0 18.6,23.6 C17.5,24.4 14.5,24.4 13.4,23.6 Z" fill="${G.lip}"/>` : ""}
  </g>
  <g fill="${G.hair}">
    <path d="M4.6,17 C3.6,8 9.2,2.6 16,2.6 C22.8,2.6 28.4,8 27.4,17 C26.9,13.4 25.6,11.4 24.4,10.6 C22.2,12.6 19.4,13.3 16,13.3 C12.6,13.3 9.8,12.6 7.6,10.6 C6.4,11.4 5.1,13.4 4.6,17 Z"/>
    ${bumps}
    <path d="M5.0,13.6 C4.6,17.4 5.0,20.0 6.0,21.6 C5.5,18.8 5.4,16.2 5.9,14.0 Z"/>
    <path d="M27.0,13.6 C27.4,17.4 27.0,20.0 26.0,21.6 C26.5,18.8 26.6,16.2 26.1,14.0 Z"/>
  </g>
  ${brows ? `<path d="M9.2,${browY + browH} C9.6,${browY - 0.2} 13.2,${browY - 0.3} 14.4,${browY + 0.5} C13.0,${browY + 0.4} 10.2,${browY + 0.7} 9.2,${browY + browH} Z" fill="${G.hair}"/>
  <path d="M22.8,${browY + browH} C22.4,${browY - 0.2} 18.8,${browY - 0.3} 17.6,${browY + 0.5} C19.0,${browY + 0.4} 21.8,${browY + 0.7} 22.8,${browY + browH} Z" fill="${G.hair}"/>` : ""}
  <ellipse cx="11.9" cy="${eyeY}" rx="${eyeRX}" ry="${eyeRY}" fill="${G.eye}"/>
  <ellipse cx="20.1" cy="${eyeY}" rx="${eyeRX}" ry="${eyeRY}" fill="${G.eye}"/>
  ${catchlight ? `<circle cx="12.6" cy="${eyeY - 0.8}" r=".7" fill="${G.white}"/><circle cx="20.8" cy="${eyeY - 0.8}" r=".7" fill="${G.white}"/>` : ""}
  </svg>`;
}

/** Rasterises the glyph at `size`, then gives it the same dark tab outline. */
async function renderGlyph(size, cfg) {
  const art = await sharp(Buffer.from(glyph(cfg.glyph)), { density: 72 * (size / 32) * 4 })
    .resize(size, size, { kernel: "lanczos3" })
    .png()
    .toBuffer();
  const halo = await outlineFor(art, Math.max(1, size * 0.012));
  return sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: halo }, { input: art }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * Re-tones the cropped head so its zones stay separable once the tile is only
 * a few pixels across: hair, skin, beard, and the dark features in the face.
 */
async function tone(buffer, cfg, crop) {
  const { face, eye, grow, flatHair, flatBeard, poster = false } = cfg;
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const out = Buffer.from(data);

  // Source rows and columns, expressed in the crop's own coordinates.
  const xFace0 = ZONES.faceLeft - crop.left;
  const xFace1 = ZONES.faceRight - crop.left;
  const yFeatureTop = ZONES.featureTop - crop.top;
  const yFeatureBottom = ZONES.featureBottom - crop.top;
  const yBeard = ZONES.beardTop - crop.top;
  const xEye0 = EYES.left - crop.left;
  const xEye1 = EYES.right - crop.left;
  const yEyeTop = EYES.top - crop.top;
  const yEyeBottom = EYES.bottom - crop.top;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (out[i + 3] < 8) continue;
      const r = out[i];
      const g = out[i + 1];
      const b = out[i + 2];
      const lum = (r * 299 + g * 587 + b * 114) / 1000;
      const isSkin = lum > 90 && r > b + 18;

      const inFaceX = x >= xFace0 && x <= xFace1;
      // Brows, eyes and nose bridge. Left exactly as drawn: these are the
      // features the whole icon depends on, so nothing flattens them.
      const isFeature = inFaceX && y >= yFeatureTop && y <= yFeatureBottom;
      const isBeard = inFaceX && y >= yBeard;

      if (poster) {
        /**
         * Snap to four flat tones.
         *
         * At 16px nothing survives but large shapes, so rather than tone
         * mapping a photograph down and hoping, the head is reduced to hair,
         * skin, beard and features first. The resize then averages between
         * four clean colours instead of hundreds, which is what keeps the
         * face shape and the eyes legible.
         */
        let t;
        if (isSkin) t = POSTER.skin;
        else if (isBeard) t = POSTER.beard;
        else t = POSTER.hair;
        out[i] = t.r;
        out[i + 1] = t.g;
        out[i + 2] = t.b;
        continue;
      }

      if (!isSkin && !isFeature && lum < 170) {
        /**
         * Flatten the dark masses.
         *
         * The art gives every curl a bright highlight. Downscaled, those
         * highlights average with the black around them and the head turns
         * mid grey. Hair and beard are crushed separately and to different
         * tones, so the jaw survives as a tonal step rather than merging with
         * the hair into one silhouette.
         */
        const amount = isBeard ? flatBeard : flatHair;
        const target = isBeard ? BEARD : HAIR;
        if (amount > 0) {
          out[i] = clamp(r + (target.r - r) * amount);
          out[i + 1] = clamp(g + (target.g - g) * amount);
          out[i + 2] = clamp(b + (target.b - b) * amount);
          continue;
        }
      }

      if (isSkin && face !== 1) {
        // Lift toward white, never by multiplying: multiplying clips red first
        // and turns the skin orange at exactly the sizes that need the lift.
        const k = (face - 1) * 0.8;
        out[i] = clamp(r + (255 - r) * k);
        out[i + 1] = clamp(g + (255 - g) * k);
        out[i + 2] = clamp(b + (255 - b) * k);
      }

      const inEyes = x >= xEye0 && x <= xEye1 && y >= yEyeTop && y <= yEyeBottom;
      if (inEyes && eye !== 1) {
        /**
         * Local contrast, not blanket darkening. An eye reads at a few pixels
         * across because a dark pupil sits on a light sclera, so the two are
         * pushed apart. Darkening everything produces one smudge.
         */
        const k = (eye - 1) * 0.5;
        if (lum < 105) {
          out[i] = clamp(r * (1 - k));
          out[i + 1] = clamp(g * (1 - k));
          out[i + 2] = clamp(b * (1 - k));
        } else if (lum > 150) {
          out[i] = clamp(r + (255 - r) * k);
          out[i + 1] = clamp(g + (255 - g) * k);
          out[i + 2] = clamp(b + (255 - b) * k);
        }
      }
    }
  }

  // Thicken pupils so they survive the resize. Confined to the eye box and to
  // rows below the brows, so dilation cannot weld brow and eye into one band.
  if (grow > 0) {
    const src = Buffer.from(out);
    const dark = (x, y) => {
      const i = (y * W + x) * 4;
      if (src[i + 3] < 8) return false;
      return (src[i] * 299 + src[i + 1] * 587 + src[i + 2] * 114) / 1000 < 100;
    };
    const gy0 = poster ? yFeatureTop : yEyeTop;
    const gy1 = poster ? yFeatureBottom : yEyeBottom;
    for (let y = Math.max(1, gy0); y <= Math.min(H - 2, gy1); y++) {
      for (let x = Math.max(1, xEye0); x <= Math.min(W - 2, xEye1); x++) {
        const i = (y * W + x) * 4;
        if (src[i + 3] < 8 || dark(x, y)) continue;
        let near = false;
        for (let dy = -grow; dy <= grow && !near; dy++) {
          for (let dx = -grow; dx <= grow; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
            if (dark(nx, ny)) {
              near = true;
              break;
            }
          }
        }
        if (near) {
          // In poster mode grow to the flat hair tone, so a thickened pupil
          // stays one colour instead of becoming a muddy intermediate.
          if (poster) {
            out[i] = POSTER.hair.r;
            out[i + 1] = POSTER.hair.g;
            out[i + 2] = POSTER.hair.b;
          } else {
            out[i] = clamp(out[i] * 0.6);
            out[i + 1] = clamp(out[i + 1] * 0.6);
            out[i + 2] = clamp(out[i + 2] * 0.6);
          }
        }
      }
    }
  }

  return sharp(out, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
}

/** An off-white halo, from the character's own dilated alpha. */
async function outlineFor(headPng, thickness) {
  const { width, height } = await sharp(headPng).metadata();
  /**
   * Dilate the alpha, then use it AS the alpha channel. Compositing the mask
   * as an image instead paints an opaque rectangle over the bounding box,
   * which is exactly what a dark tab then shows.
   */
  const spread = await sharp(await sharp(headPng).extractChannel("alpha").toBuffer())
    .blur(Math.max(0.3, thickness * 0.55))
    .linear(5, -90)
    .toColourspace("b-w")
    .raw()
    .toBuffer();
  return sharp({ create: { width, height, channels: 3, background: OFF_WHITE } })
    .joinChannel(spread, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();
}

/** Renders one square icon at `size`. */
async function render(size) {
  /**
   * Fall back to the 180 entry, not the 48 one. Sizes not listed here are all
   * large (the apple icon renders its art at 148), and 48 is now a glyph
   * config, so falling back to it silently turned the apple icon into the
   * drawn glyph instead of the artwork.
   */
  const cfg = SIZES[size] ?? SIZES[180];
  if (cfg.glyph) return renderGlyph(size, cfg);
  const crop = {
    left: HEAD.left,
    top: HEAD.top,
    width: HEAD.right - HEAD.left + 1,
    height: HEAD.bottom - HEAD.top + 1,
  };

  const toned = await tone(await sharp(SRC).extract(crop).png().toBuffer(), cfg, crop);

  // Fit the head inside the tile, leaving only the outline its room.
  const box = Math.round(size * (1 - 2 * cfg.margin));
  const scale = Math.min(box / crop.width, box / crop.height);
  const headW = Math.max(1, Math.round(crop.width * scale));
  const headH = Math.max(1, Math.round(crop.height * scale));
  const headLeft = Math.round((size - headW) / 2);
  const headTop = Math.round((size - headH) / 2);

  const head = await sharp(toned).resize(headW, headH, { kernel: "lanczos3" }).png().toBuffer();

  /**
   * At least one pixel at every size. A plain fraction rounds to a quarter of
   * a pixel at 16 and 32 and silently produces no outline at exactly the two
   * sizes that need it most on a dark tab.
   */
  const thickness = Math.max(1, size * 0.012);
  const halo = await outlineFor(head, thickness);

  let img = sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  }).composite([
    { input: halo, left: headLeft, top: headTop },
    { input: head, left: headLeft, top: headTop },
  ]);

  if (cfg.sharpen > 0) img = sharp(await img.png().toBuffer()).sharpen({ sigma: cfg.sharpen });
  return img.png({ compressionLevel: 9 }).toBuffer();
}

/** Packs PNGs into an ICO container. */
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  const dir = Buffer.alloc(16 * entries.length);
  let offset = header.length + dir.length;
  entries.forEach(({ size, data }, i) => {
    const at = i * 16;
    dir[at] = size >= 256 ? 0 : size;
    dir[at + 1] = size >= 256 ? 0 : size;
    dir.writeUInt16LE(1, at + 4);
    dir.writeUInt16LE(32, at + 6);
    dir.writeUInt32LE(data.length, at + 8);
    dir.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });

  return Buffer.concat([header, dir, ...entries.map((e) => e.data)]);
}

async function main() {
  fs.mkdirSync(MASTER_DIR, { recursive: true });

  /**
   * The master is kept as a source artifact and deliberately NOT served.
   *
   * Next emits a <link> for every icon file in app/, so shipping a 512px
   * icon.png alongside favicon.ico gives the browser a second candidate for
   * the tab and lets it downscale the big one itself, throwing away the per
   * size tuning above. One .ico owns the tab; apple-icon.png owns iOS.
   */
  fs.writeFileSync(path.join(MASTER_DIR, "favicon-master-512.png"), await render(512));

  const ico = [];
  for (const size of [16, 32, 48]) {
    const data = await render(size);
    fs.writeFileSync(path.join(MASTER_DIR, `favicon-${size}.png`), data);
    ico.push({ size, data });
  }
  fs.writeFileSync(path.join(APP_DIR, "favicon.ico"), buildIco(ico));

  /**
   * Apple touch icon. iOS draws it on an opaque tile and applies its own
   * rounding, so this one is flattened onto the off-white background with
   * padding rather than shipped transparent and edge to edge.
   */
  const pad = 16;
  const apple = await sharp({
    create: { width: 180, height: 180, channels: 4, background: { ...OFF_WHITE, alpha: 1 } },
  })
    .composite([{ input: await render(180 - 2 * pad), left: pad, top: pad }])
    .flatten({ background: OFF_WHITE })
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(APP_DIR, "apple-icon.png"), apple);
  fs.writeFileSync(path.join(MASTER_DIR, "apple-icon-180.png"), apple);

  for (const f of ["favicon.ico", "apple-icon.png"]) {
    console.log(`${f.padEnd(16)} ${fs.statSync(path.join(APP_DIR, f)).size} bytes`);
  }
}

main();
