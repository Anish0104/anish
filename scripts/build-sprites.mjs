/**
 * Builds Mini Anish's sprite frames from the supplied character sheets.
 *
 *   node scripts/build-sprites.mjs
 *
 * Sources live in assets/companion/ and are never modified or served. All
 * three are generated images rather than production atlases, so this script
 * deals with what is actually in them:
 *
 * 1. No alpha. The first sheet has a transparency checkerboard baked into the
 *    pixels; the other two sit on flat white. Background is detected as
 *    near-neutral and light, then removed by a flood fill seeded from the
 *    border. The fill only travels through background, so the character's grey
 *    and white sneakers, enclosed by dark outlines, survive. A global "erase
 *    light pixels" pass would have destroyed them.
 *
 * 2. No reliable grid. Rows and poses are located from opaque-pixel
 *    projections, never by dividing the canvas into equal cells. Props are
 *    included automatically because the bounding box comes from opaque pixels.
 *
 * 3. Different scale per sheet. Each sheet is scaled to match the base sheet's
 *    head width so old and new frames agree. Scale is normalised by head size
 *    and never by silhouette height, which would inflate the seated poses.
 *
 * Frames are placed on one shared canvas, bottom aligned onto a single floor
 * line, and centred on the TORSO rather than the head. Anchoring on the head
 * would hold it perfectly still and cancel the intentional head movement in
 * the dance and cricket rows.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = "public/images/companion";

/**
 * `keep` selects which poses of a row are shipped, in playback order.
 * A row with duplicated poses ships only its distinct ones.
 */
const SHEETS = [
  {
    file: "assets/companion/mini-anish-sprites-original.png",
    scale: 1,
    rows: [
      { key: "idle", keep: [0, 1, 2, 3] },
      { key: null }, // superseded by the movement sheet's walk row
      { key: "wave", keep: [0, 1, 2, 3] },
      { key: "read", keep: [0, 1, 2, 3] },
    ],
  },
  {
    file: "assets/companion/mini-anish-activities-original.png",
    scale: 1,
    rows: [
      { key: "dance", keep: [0, 1, 2, 3] },
      { key: "code", keep: [0, 1, 2, 3] },
      { key: "cricket", keep: [0, 1, 2, 3] },
      { key: "barbell", keep: [0, 1, 2, 3] },
    ],
  },
  {
    file: "assets/companion/mini-anish-climbing-original.png",
    // Anchored on the standing pose: this sheet's standing figure is 309px
    // tall against the base sheet's 324px. Hair width is unusable here because
    // every pose is in profile with an arm raised beside the head.
    scale: 1.05,
    rows: [
      { key: "climbReach", keep: [0, 1, 2, 3] },
      { key: "climbLoop", keep: [0, 1, 2, 3] },
      { key: "climbPullUp", keep: [0, 1, 2, 3] },
      { key: "climbDown", keep: [0, 1, 2, 3] },
    ],
  },
  {
    file: "assets/companion/mini-anish-movement-original.png",
    // Measured: base hair width 202.8, movement sheet 277.6.
    scale: 0.73,
    rows: [
      // Poses 3 and 4 repeat 1 and 2 (7.7% and 7.3% silhouette difference,
      // against 20%+ between the distinct pair), so only the pair ships.
      { key: "walk", keep: [0, 1] },
      { key: "run", keep: [0, 1, 2, 3] },
    ],
  },
];

// Wide enough that an asymmetric pose stays inside the frame: the cricket
// bat swings well to one side of the torso anchor, and the barbell is the
// widest prop.
const CANVAS = { width: 320, height: 372 };

/**
 * A second, smaller set for the roaming companion, which never draws larger
 * than about 70px. Loading the full size for a 70px sprite would ship roughly
 * four times the bytes on every page for no visible gain.
 */
const SMALL_SCALE = 0.45;

function loadMask(data, W, H, C) {
  const isBgLike = (x, y) => {
    const i = (y * W + x) * C;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    return Math.max(r, g, b) - Math.min(r, g, b) <= 16 && (r + g + b) / 3 >= 200;
  };
  const bg = new Uint8Array(W * H);
  const stack = [];
  for (let x = 0; x < W; x++) stack.push([x, 0], [x, H - 1]);
  for (let y = 0; y < H; y++) stack.push([0, y], [W - 1, y]);
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    const k = y * W + x;
    if (bg[k] || !isBgLike(x, y)) continue;
    bg[k] = 1;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return bg;
}

function segment(bg, W, H, expectedRows) {
  const opaque = (x, y) => !bg[y * W + x];
  const density = [];
  for (let y = 0; y < H; y++) {
    let n = 0;
    for (let x = 0; x < W; x++) if (opaque(x, y)) n++;
    density.push(n);
  }

  let bands = [];
  let s = null;
  for (let y = 0; y < H; y++) {
    if (density[y] > 3) { if (s === null) s = y; }
    else if (s !== null) { if (y - s > 40) bands.push([s, y - 1]); s = null; }
  }
  if (s !== null) bands.push([s, H - 1]);

  // Rows whose poses overlap vertically arrive as one band. Split the tallest
  // at its thinnest row rather than assuming an even grid.
  if (expectedRows && bands.length < expectedRows) {
    const median = [...bands].map(([a, b]) => b - a).sort((a, b) => a - b)[Math.floor(bands.length / 2)] || 0;
    let guard = 0;
    while (bands.length < expectedRows && guard++ < 8) {
      let widest = 0;
      bands.forEach(([a, b], i) => { if (b - a > bands[widest][1] - bands[widest][0]) widest = i; });
      const [a, b] = bands[widest];
      if (b - a < median * 1.4) break;
      const from = a + Math.round((b - a) * 0.35);
      const to = a + Math.round((b - a) * 0.65);
      let cut = from;
      for (let y = from; y <= to; y++) if (density[y] < density[cut]) cut = y;
      bands.splice(widest, 1, [a, cut - 1], [cut + 1, b]);
      bands.sort((x, y) => x[0] - y[0]);
    }
  }

  return bands.map(([y0, y1]) => {
    const cols = [];
    let cs = null;
    for (let x = 0; x < W; x++) {
      let n = 0;
      for (let y = y0; y <= y1; y++) if (opaque(x, y)) n++;
      if (n > 2) { if (cs === null) cs = x; }
      else if (cs !== null) { if (x - cs > 30) cols.push([cs, x - 1]); cs = null; }
    }
    if (cs !== null) cols.push([cs, W - 1]);
    return cols.map(([x0, x1]) => {
      let top = y1, bottom = y0;
      for (let y = y0; y <= y1; y++) { let hit = false; for (let x = x0; x <= x1; x++) if (opaque(x, y)) { hit = true; break; } if (hit) { top = y; break; } }
      for (let y = y1; y >= y0; y--) { let hit = false; for (let x = x0; x <= x1; x++) if (opaque(x, y)) { hit = true; break; } if (hit) { bottom = y; break; } }
      return { x0, y0: top, w: x1 - x0 + 1, h: bottom - top + 1 };
    });
  });
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (f.endsWith(".png") || f === "frames.json") fs.unlinkSync(path.join(OUT_DIR, f));
  }
  fs.rmSync(path.join(OUT_DIR, "sm"), { recursive: true, force: true });

  const manifest = {};
  const report = [];

  for (const sheetDef of SHEETS) {
    const { data, info } = await sharp(sheetDef.file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const W = info.width, H = info.height, C = info.channels;
    const bg = loadMask(data, W, H, C);

    let kept = 0;
    for (let i = 0; i < W * H; i++) {
      if (bg[i]) continue;
      const r = data[i * C], g = data[i * C + 1], b = data[i * C + 2];
      if (Math.max(r, g, b) - Math.min(r, g, b) <= 16 && (r + g + b) / 3 >= 200) kept++;
    }
    const removed = bg.reduce((s, v) => s + v, 0);
    report.push(
      `${path.basename(sheetDef.file)}: removed ${(removed / (W * H) * 100).toFixed(1)}% background, ` +
      `kept ${kept} light pixels inside the character, scale ${sheetDef.scale}`
    );

    const rgba = Buffer.alloc(W * H * 4);
    for (let i = 0; i < W * H; i++) {
      rgba[i * 4] = data[i * C];
      rgba[i * 4 + 1] = data[i * C + 1];
      rgba[i * 4 + 2] = data[i * C + 2];
      rgba[i * 4 + 3] = bg[i] ? 0 : 255;
    }
    const matted = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
    const rows = segment(bg, W, H, sheetDef.rows.length);

    for (let r = 0; r < sheetDef.rows.length; r++) {
      const def = sheetDef.rows[r];
      if (!def.key) continue;
      const row = rows[r];
      if (!row) throw new Error(`${sheetDef.file}: row ${r + 1} not found`);
      manifest[def.key] = [];

      for (let n = 0; n < def.keep.length; n++) {
        const c = row[def.keep[n]];
        const sw = Math.max(1, Math.round(c.w * sheetDef.scale));
        const sh = Math.max(1, Math.round(c.h * sheetDef.scale));
        const frame = await sharp(matted)
          .extract({ left: c.x0, top: c.y0, width: c.w, height: c.h })
          .resize(sw, sh, { fit: "fill", kernel: "lanczos3" })
          .raw()
          .toBuffer();

        // Torso centroid, not head: anchoring on the head would freeze it and
        // flatten the dance and cricket head movement.
        let sx = 0, count = 0;
        const y0 = Math.round(sh * 0.40), y1 = Math.round(sh * 0.70);
        for (let y = y0; y < y1; y++) {
          for (let x = 0; x < sw; x++) if (frame[(y * sw + x) * 4 + 3] > 128) { sx += x; count++; }
        }
        const torsoX = count ? sx / count : sw / 2;

        const left = Math.round(CANVAS.width / 2 - torsoX);
        const top = CANVAS.height - sh; // one floor line for every pose

        const png = await sharp(frame, { raw: { width: sw, height: sh, channels: 4 } }).png().toBuffer();
        const file = `${def.key}-${String(n + 1).padStart(2, "0")}.png`;
        const full = await sharp({
          create: { width: CANVAS.width, height: CANVAS.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
        })
          .composite([{ input: png, left, top }])
          .png({ compressionLevel: 9, palette: true, quality: 90 })
          .toBuffer();
        fs.writeFileSync(path.join(OUT_DIR, file), full);

        // Small variant, scaled from the finished frame so both sizes share
        // exactly the same alignment.
        fs.mkdirSync(path.join(OUT_DIR, "sm"), { recursive: true });
        await sharp(full)
          .resize(Math.round(CANVAS.width * SMALL_SCALE), Math.round(CANVAS.height * SMALL_SCALE), { kernel: "lanczos3" })
          .png({ compressionLevel: 9, palette: true, quality: 90 })
          .toFile(path.join(OUT_DIR, "sm", file));

        manifest[def.key].push({ file, placedW: sw, placedH: sh });
      }
      console.log(`${def.key.padEnd(8)} ${manifest[def.key].length} frames  ${manifest[def.key].map((m) => `${m.placedW}x${m.placedH}`).join(" ")}`);
    }
  }

  fs.writeFileSync(
    path.join(OUT_DIR, "frames.json"),
    JSON.stringify({ canvas: CANVAS, smallScale: SMALL_SCALE, frames: manifest }, null, 2)
  );
  console.log("\n" + report.join("\n"));
  console.log(`\ncanvas ${CANVAS.width}x${CANVAS.height}, ${Object.values(manifest).flat().length} frames in ${OUT_DIR}`);
}

main();
