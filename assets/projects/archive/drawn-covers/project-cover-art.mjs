/**
 * Hand-authored cover illustrations, as SVG.
 *
 * These exist because there is no raster image generator available in this
 * toolchain. They are drawings, not renders and not screenshots, and every
 * cover that uses one is marked `kind: "illustration"` in `data/projects.ts`
 * so the card says so in the image's accessible name.
 *
 * **House rules, so eight scenes read as one set.**
 *
 * 1. One palette, below, drawn from the `--il-*` tokens already in
 *    `app/globals.css` plus the muted daylight of the VTrack frame, which is
 *    the visual reference for the whole set.
 * 2. One light direction: soft, from the upper left. Every cast shadow falls
 *    down and to the right, and every top face is the lighter tone of its pair.
 * 3. Mid-value grounds. Nothing sits on white, because the reference frame is
 *    grey asphalt in daylight and a white card beside it would read as a
 *    different collection.
 * 4. Depth comes from overlap, cast shadow and scale, never from perspective
 *    tricks that fall apart at card size.
 * 5. No SVG filters. librsvg support for them is uneven, so shadows are drawn
 *    as explicit translucent shapes and soft light as gradients. What renders
 *    here is exactly what ships.
 * 6. **No legible text anywhere.** Writing is drawn as grey bars, the standard
 *    illustration convention. That keeps a drawing from being mistaken for a
 *    capture of a real screen, and it means no cover can carry an invented
 *    number, quote or result. It also keeps project names out of the artwork,
 *    which the card renders as real HTML above it.
 * 7. Nothing smaller than about 8px of stroke or 40px of shape, because a
 *    cover is drawn at roughly a third of this size on a card.
 *
 * Authored at the exact size of the inset artwork in
 * `scripts/build-project-covers.mjs`, so nothing is rescaled or cropped.
 */

export const ART_WIDTH = 1532;
export const ART_HEIGHT = 932;

const C = {
  ink: "#23262c",
  ink2: "#3b4048",
  ink3: "#565c66",
  paper: "#f4f1ea",
  paper2: "#e7e2d7",
  paper3: "#d8d1c2",
  line: "#b6b0a3",
  lineSoft: "#cdc7ba",
  ground: "#b5ae9f",
  groundHi: "#c9c2b2",
  groundLo: "#968f80",
  groundDeep: "#7d7768",
  accent: "#2f5fd0",
  accentSoft: "#a8bde8",
  accentDeep: "#1f3f8f",
  green: "#5d8a52",
  greenHi: "#7fae70",
  amber: "#d2a044",
  amberSoft: "#eed9a8",
  brown: "#6b4423",
  brownHi: "#8a5c33",
  steel: "#aab0b8",
  steelHi: "#d3d8dd",
  steelLo: "#7f858d",
  sky: "#a8cbe6",
  skyLo: "#8ab6d8",
};

/** Deterministic PRNG, so a rebuild produces byte-identical artwork. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const n = (value) => Math.round(value * 100) / 100;

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

/**
 * The soft cast shadow used everywhere. Three stacked translucent rounded
 * rectangles, growing and fading, which reads as a blur at card size and
 * costs nothing to render.
 */
function shadow(x, y, w, h, r = 10, strength = 0.16) {
  let out = "";
  for (let i = 3; i >= 1; i--) {
    const spread = i * 5;
    out +=
      `<rect x="${n(x - spread + i * 2)}" y="${n(y - spread + i * 3)}" ` +
      `width="${n(w + spread * 2)}" height="${n(h + spread * 2)}" rx="${n(r + spread)}" ` +
      `fill="${C.ink}" opacity="${n(strength / (i * 1.7))}"/>`;
  }
  return out;
}

/** A line of "writing": a grey bar. Never a glyph. */
const bar = (x, y, w, h, fill = C.line, opacity = 1, r = null) =>
  `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(r ?? h / 2)}" fill="${fill}" opacity="${opacity}"/>`;

/** A paragraph of writing: several bars with a ragged right edge. */
function textBlock(x, y, w, rows, opts = {}) {
  const { gap = 26, thickness = 9, fill = C.line, seed = 7, opacity = 1 } = opts;
  const random = rng(seed);
  let out = "";
  for (let i = 0; i < rows; i++) {
    const last = i === rows - 1;
    const width = w * (last ? 0.42 + random() * 0.25 : 0.82 + random() * 0.18);
    out += bar(x, y + i * gap, width, thickness, fill, opacity);
  }
  return out;
}

/** A sheet of paper, optionally rotated about its own centre. */
function sheet(x, y, w, h, opts = {}) {
  const { rotate = 0, tone = C.paper, edge = C.paper3, radius = 6, children = "" } = opts;
  const transform = rotate
    ? ` transform="rotate(${n(rotate)} ${n(x + w / 2)} ${n(y + h / 2)})"`
    : "";
  return (
    `<g${transform}>` +
    shadow(x, y, w, h, radius, 0.18) +
    `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${radius}" fill="${tone}"/>` +
    // A hairline along the lit top edge, so sheets separate when they overlap.
    `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="3" rx="1.5" fill="#ffffff" opacity="0.5"/>` +
    `<rect x="${n(x)}" y="${n(y + h - 3)}" width="${n(w)}" height="3" rx="1.5" fill="${edge}" opacity="0.8"/>` +
    children +
    `</g>`
  );
}

/** A rounded panel: cards, screens, readers. */
function panel(x, y, w, h, opts = {}) {
  const { fill = C.paper, stroke = null, radius = 14, children = "", withShadow = true } = opts;
  return (
    `<g>` +
    (withShadow ? shadow(x, y, w, h, radius, 0.2) : "") +
    `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${radius}" fill="${fill}"` +
    (stroke ? ` stroke="${stroke}" stroke-width="3"` : "") +
    `/>` +
    children +
    `</g>`
  );
}

/**
 * The ground every scene sits on: a warm surface lit from the upper left,
 * with the far edge falling into shade. Identical construction in all seven,
 * which is most of what makes them look related.
 */
function desk(id, opts = {}) {
  const { horizon = 300 } = opts;
  return (
    `<defs>` +
    `<linearGradient id="wall${id}" x1="0" y1="0" x2="0.35" y2="1">` +
    `<stop offset="0" stop-color="${C.groundHi}"/>` +
    `<stop offset="1" stop-color="${C.ground}"/>` +
    `</linearGradient>` +
    `<linearGradient id="top${id}" x1="0.1" y1="0" x2="0.9" y2="1">` +
    `<stop offset="0" stop-color="${C.groundHi}"/>` +
    `<stop offset="0.55" stop-color="${C.ground}"/>` +
    `<stop offset="1" stop-color="${C.groundLo}"/>` +
    `</linearGradient>` +
    `<radialGradient id="glow${id}" cx="0.24" cy="0.14" r="0.9">` +
    `<stop offset="0" stop-color="#ffffff" stop-opacity="0.46"/>` +
    `<stop offset="0.45" stop-color="#ffffff" stop-opacity="0.08"/>` +
    `<stop offset="1" stop-color="${C.groundDeep}" stop-opacity="0.46"/>` +
    `</radialGradient>` +
    `</defs>` +
    `<rect width="${ART_WIDTH}" height="${ART_HEIGHT}" fill="url(#wall${id})"/>` +
    `<rect y="${n(horizon)}" width="${ART_WIDTH}" height="${n(ART_HEIGHT - horizon)}" fill="url(#top${id})"/>` +
    // The seam where the surface meets the backdrop, with its contact shadow.
    `<rect y="${n(horizon)}" width="${ART_WIDTH}" height="26" fill="${C.groundDeep}" opacity="0.22"/>` +
    `<rect y="${n(horizon)}" width="${ART_WIDTH}" height="4" fill="#ffffff" opacity="0.28"/>` +
    `<rect width="${ART_WIDTH}" height="${ART_HEIGHT}" fill="url(#glow${id})"/>`
  );
}

const svg = (id, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${ART_WIDTH}" height="${ART_HEIGHT}" ` +
  `viewBox="0 0 ${ART_WIDTH} ${ART_HEIGHT}">${body}</svg>`;

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

/**
 * Semantic Search: a query finding passages inside a pile of documents.
 *
 * A spread of sheets on a desk, three of them drawn forward and stepped like a
 * ranking, each with a passage picked out in amber. A magnifier lies across
 * the top one; the writing under its lens is drawn larger, which is the whole
 * idea of the picture.
 */
function semanticSearch() {
  const random = rng(31);
  let scatter = "";
  // The unranked pile: sheets at shallow angles, receding into the back.
  const back = [
    [70, 292, -9],
    [242, 250, 6],
    [424, 286, -4],
    [606, 246, 8],
    [796, 296, -6],
    [978, 254, 5],
    [1158, 300, -8],
    [1322, 258, 7],
  ];
  for (const [x, y, rot] of back) {
    scatter += sheet(x, y, 190, 250, {
      rotate: rot,
      tone: C.paper2,
      children: textBlock(x + 22, y + 34, 146, 6, { gap: 26, thickness: 7, seed: Math.floor(random() * 999), opacity: 0.75 }),
    });
  }

  // The three results, stepped so the order is readable without numbering.
  const results = [
    { x: 210, y: 470, w: 360, h: 400, rot: -3, hi: [2, 3] },
    { x: 590, y: 510, w: 340, h: 370, rot: 2, hi: [1] },
    { x: 950, y: 545, w: 320, h: 340, rot: -2, hi: [4] },
  ];
  let ranked = "";
  results.forEach((r, i) => {
    let inner = textBlock(r.x + 30, r.y + 48, r.w - 60, 9, {
      gap: 30,
      thickness: 9,
      seed: 100 + i,
    });
    // The matched passage, lifted out of the page.
    for (const row of r.hi) {
      inner =
        `<rect x="${n(r.x + 22)}" y="${n(r.y + 40 + row * 30 - 8)}" width="${n(r.w - 44)}" height="30" rx="8" fill="${C.amberSoft}"/>` +
        inner;
    }
    // A solid rank pip on the shoulder of each sheet.
    inner +=
      `<circle cx="${n(r.x + r.w - 44)}" cy="${n(r.y + 40)}" r="20" fill="${C.accent}" opacity="${1 - i * 0.22}"/>`;
    ranked += sheet(r.x, r.y, r.w, r.h, { rotate: r.rot, tone: C.paper, children: inner });
  });

  // Magnifier over the first result, tilted along the light. The writing it
  // covers is drawn again inside the lens, larger: the whole point of the
  // picture is that the glass is finding a passage, not just lying there.
  const cx = 452;
  const cy = 606;
  const rad = 168;
  const glass =
    `<g transform="rotate(-16 ${cx} ${cy})">` +
    // Handle first, so the barrel overlaps its top end.
    `<g transform="rotate(34 ${cx} ${cy})">` +
    shadow(cx - 26, cy + rad - 10, 52, 220, 26, 0.3) +
    `<rect x="${cx - 26}" y="${cy + rad - 10}" width="52" height="220" rx="26" fill="${C.ink2}"/>` +
    `<rect x="${cx - 18}" y="${cy + rad + 4}" width="14" height="190" rx="7" fill="#ffffff" opacity="0.2"/>` +
    `<rect x="${cx - 30}" y="${cy + rad - 16}" width="60" height="48" rx="16" fill="${C.steelLo}"/>` +
    `</g>` +
    shadow(cx - rad, cy - rad, rad * 2, rad * 2, rad, 0.32) +
    // The lens: a pale wash, so what is underneath still shows through.
    `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${C.paper}" opacity="0.86"/>` +
    `<g clip-path="url(#lens)">` +
    `<rect x="${cx - 130}" y="${cy - 78}" width="260" height="46" rx="12" fill="${C.amberSoft}"/>` +
    bar(cx - 116, cy - 66, 214, 22, C.amber, 1) +
    bar(cx - 116, cy - 12, 232, 20, C.ink3, 0.72) +
    bar(cx - 116, cy + 32, 160, 20, C.ink3, 0.72) +
    `</g>` +
    // Rim: a bright outer ring with a darker inner one, lit from upper left.
    `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="${C.steelHi}" stroke-width="26"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${rad + 11}" fill="none" stroke="${C.steelLo}" stroke-width="6" opacity="0.7"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${rad - 12}" fill="none" stroke="${C.steelLo}" stroke-width="5" opacity="0.45"/>` +
    // A single specular sweep across the glass.
    `<path d="M${cx - 118} ${cy - 74} a168 168 0 0 1 96 -70" fill="none" stroke="#ffffff" ` +
    `stroke-width="16" stroke-linecap="round" opacity="0.5"/>` +
    `</g>`;

  return svg(
    "ss",
    desk("ss", { horizon: 250 }) +
      `<defs><clipPath id="lens"><circle cx="${cx}" cy="${cy}" r="${rad - 12}"/></clipPath></defs>` +
      scatter +
      ranked +
      glass
  );
}

/**
 * SkillGap: a résumé and a role on the same desk, with the skills between them.
 *
 * The chips arcing across the gap are the point: solid ones are held, hollow
 * ones are missing. No counts, no scores, nothing measured.
 */
function skillGap() {
  const resumeX = 130;
  const resumeY = 210;
  const resume = sheet(resumeX, resumeY, 420, 560, {
    rotate: -2,
    tone: C.paper,
    children:
      // Header: a portrait block and the name lines beside it.
      `<rect x="${resumeX + 40}" y="${resumeY + 46}" width="96" height="96" rx="12" fill="${C.accentSoft}"/>` +
      `<circle cx="${resumeX + 88}" cy="${resumeY + 82}" r="22" fill="${C.paper2}"/>` +
      `<path d="M${resumeX + 56} ${resumeY + 138} a32 32 0 0 1 64 0 z" fill="${C.paper2}"/>` +
      bar(resumeX + 158, resumeY + 62, 190, 15, C.ink2, 0.85) +
      bar(resumeX + 158, resumeY + 92, 140, 10, C.line) +
      bar(resumeX + 158, resumeY + 114, 110, 10, C.line) +
      `<rect x="${resumeX + 40}" y="${resumeY + 180}" width="340" height="3" fill="${C.lineSoft}"/>` +
      textBlock(resumeX + 40, resumeY + 212, 340, 4, { seed: 11 }) +
      `<rect x="${resumeX + 40}" y="${resumeY + 336}" width="340" height="3" fill="${C.lineSoft}"/>` +
      textBlock(resumeX + 40, resumeY + 368, 340, 5, { seed: 12 }) +
      // Held skills, as filled chips down the foot of the sheet.
      `<g>` +
      [0, 1, 2]
        .map((i) =>
          `<rect x="${resumeX + 40 + i * 106}" y="${resumeY + 496}" width="92" height="34" rx="17" fill="${C.green}" opacity="0.85"/>`
        )
        .join("") +
      `</g>`,
  });

  // The role, pinned a little further back and higher, so the eye travels up.
  const jobX = 960;
  const jobY = 250;
  const job = sheet(jobX, jobY, 400, 470, {
    rotate: 3,
    tone: C.paper2,
    children:
      `<rect x="${jobX + 38}" y="${jobY + 48}" width="150" height="34" rx="10" fill="${C.accent}" opacity="0.82"/>` +
      bar(jobX + 38, jobY + 110, 300, 15, C.ink2, 0.8) +
      bar(jobX + 38, jobY + 140, 210, 12, C.line) +
      `<rect x="${jobX + 38}" y="${jobY + 188}" width="324" height="3" fill="${C.lineSoft}"/>` +
      textBlock(jobX + 38, jobY + 218, 324, 6, { seed: 21 }) +
      // Required skills: two held, two still open.
      `<rect x="${jobX + 38}" y="${jobY + 396}" width="92" height="34" rx="17" fill="${C.green}" opacity="0.8"/>` +
      `<rect x="${jobX + 142}" y="${jobY + 396}" width="92" height="34" rx="17" fill="${C.green}" opacity="0.8"/>` +
      `<rect x="${jobX + 246}" y="${jobY + 396}" width="92" height="34" rx="17" fill="none" stroke="${C.amber}" stroke-width="4" stroke-dasharray="12 9"/>`,
  });

  // The gap itself: chips stepping up from the résumé to the role. The last
  // two are hollow, which is the whole subject of the picture.
  const arc = [
    [592, 600, true],
    [688, 530, true],
    [784, 472, true],
    [880, 430, false],
    [960, 404, false],
  ];
  let chips = "";
  for (let i = 0; i < arc.length - 1; i++) {
    const [x1, y1] = arc[i];
    const [x2, y2] = arc[i + 1];
    chips +=
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.ink3}" ` +
      `stroke-width="4" opacity="0.3" stroke-dasharray="${i > 1 ? "10 10" : "0"}"/>`;
  }
  for (const [x, y, held] of arc) {
    chips += held
      ? `<circle cx="${x}" cy="${y}" r="26" fill="${C.green}"/>` +
        `<circle cx="${x - 7}" cy="${y - 8}" r="9" fill="#ffffff" opacity="0.28"/>`
      : `<circle cx="${x}" cy="${y}" r="26" fill="${C.groundHi}" stroke="${C.amber}" stroke-width="6" stroke-dasharray="13 10"/>`;
  }

  // A pen across the résumé, for weight and a second cast shadow.
  const pen =
    `<g transform="rotate(24 700 800)">` +
    shadow(596, 786, 300, 26, 13, 0.2) +
    `<rect x="596" y="786" width="300" height="26" rx="13" fill="${C.ink2}"/>` +
    `<rect x="604" y="791" width="270" height="8" rx="4" fill="#ffffff" opacity="0.18"/>` +
    `<path d="M896 786 l52 13 -52 13 z" fill="${C.steel}"/>` +
    `<rect x="646" y="786" width="44" height="26" fill="${C.accent}"/>` +
    `</g>`;

  return svg("sg", desk("sg", { horizon: 190 }) + resume + job + chips + pen);
}

/**
 * Vouch: scoped access, drawn as keys and a reader rather than as a diagram.
 *
 * One key is on a short tether and turned in the reader, which shows green.
 * Another is shut in a case, and a third hangs unused on the ring. That is
 * allow, deny and unused, without a legend.
 */
function vouch() {
  /** One key, drawn from a bow, a shaft and two teeth. */
  const key = (x, y, rot, tone, hi, scale = 1) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${scale})">` +
    shadow(-58, -58, 268, 116, 58, 0.24) +
    `<circle cx="0" cy="0" r="58" fill="${tone}"/>` +
    `<circle cx="0" cy="0" r="26" fill="${C.groundLo}"/>` +
    `<circle cx="-18" cy="-20" r="18" fill="${hi}" opacity="0.55"/>` +
    `<rect x="46" y="-19" width="164" height="38" rx="11" fill="${tone}"/>` +
    `<rect x="56" y="-14" width="140" height="10" rx="5" fill="${hi}" opacity="0.6"/>` +
    `<rect x="158" y="19" width="24" height="42" rx="7" fill="${tone}"/>` +
    `<rect x="196" y="19" width="18" height="30" rx="6" fill="${tone}"/>` +
    `</g>`;

  // The credential, lying face up with its lanyard coiled behind it rather
  // than running off the top of the frame, which read as two blue pipes.
  const cardX = 130;
  const cardY = 300;
  const lanyard =
    `<path d="M300 320 C 150 250 120 150 250 120 C 400 92 470 190 392 250 C 340 292 320 300 330 330" ` +
    `fill="none" stroke="${C.accentDeep}" stroke-width="30" stroke-linecap="round" opacity="0.92"/>` +
    `<path d="M300 320 C 150 250 120 150 250 120 C 400 92 470 190 392 250" ` +
    `fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" opacity="0.16"/>`;
  const card = panel(cardX, cardY, 470, 320, {
    fill: C.paper,
    radius: 24,
    children:
      `<rect x="${cardX}" y="${cardY}" width="470" height="76" rx="24" fill="${C.accent}"/>` +
      `<rect x="${cardX}" y="${cardY + 52}" width="470" height="24" fill="${C.accent}"/>` +
      `<rect x="${cardX + 200}" y="${cardY - 16}" width="70" height="34" rx="10" fill="${C.steelLo}"/>` +
      `<rect x="${cardX + 36}" y="${cardY + 116}" width="128" height="142" rx="14" fill="${C.accentSoft}"/>` +
      `<circle cx="${cardX + 100}" cy="${cardY + 168}" r="30" fill="${C.paper2}"/>` +
      `<path d="M${cardX + 58} ${cardY + 254} a42 42 0 0 1 84 0 z" fill="${C.paper2}"/>` +
      bar(cardX + 192, cardY + 126, 228, 17, C.ink2, 0.8) +
      bar(cardX + 192, cardY + 162, 160, 12, C.line) +
      bar(cardX + 192, cardY + 190, 190, 12, C.line) +
      `<rect x="${cardX + 192}" y="${cardY + 222}" width="80" height="58" rx="10" fill="${C.amber}"/>` +
      `<rect x="${cardX + 205}" y="${cardY + 237}" width="54" height="8" rx="4" fill="${C.paper}" opacity="0.8"/>` +
      `<rect x="${cardX + 205}" y="${cardY + 257}" width="54" height="8" rx="4" fill="${C.paper}" opacity="0.8"/>`,
  });

  // The reader: a plate with a lit slot and a shut lock below it.
  const rx = 1080;
  const ry = 250;
  const reader = panel(rx, ry, 340, 470, {
    fill: C.ink2,
    radius: 28,
    children:
      `<rect x="${rx + 30}" y="${ry + 36}" width="280" height="158" rx="18" fill="${C.ink}"/>` +
      bar(rx + 58, ry + 78, 180, 13, C.steelLo, 0.9) +
      bar(rx + 58, ry + 110, 126, 13, C.steelLo, 0.65) +
      bar(rx + 58, ry + 142, 212, 13, C.steelLo, 0.45) +
      `<circle cx="${rx + 170}" cy="${ry + 306}" r="84" fill="${C.steelLo}"/>` +
      `<circle cx="${rx + 170}" cy="${ry + 306}" r="66" fill="${C.steel}"/>` +
      `<circle cx="${rx + 154}" cy="${ry + 288}" r="24" fill="${C.steelHi}" opacity="0.6"/>` +
      `<circle cx="${rx + 286}" cy="${ry + 420}" r="22" fill="${C.greenHi}"/>` +
      `<circle cx="${rx + 286}" cy="${ry + 420}" r="38" fill="${C.greenHi}" opacity="0.24"/>`,
  });

  // The scoped key: on a short tether, and the only one through the plate.
  const tether =
    `<path d="M600 500 C 760 546 880 560 1020 556" stroke="${C.accent}" stroke-width="13" ` +
    `fill="none" stroke-linecap="round" stroke-dasharray="36 22" opacity="0.9"/>`;
  const grantedKey = key(1006, 556, 4, C.amber, "#f6e2b6", 1);

  // The refused key, shut in a barred case in the near foreground so its scale
  // matches the granted one and the contrast between them is legible. The
  // padlock sits on the lid rather than floating above it.
  const caseX = 520;
  const caseY = 686;
  const lockedCase =
    `<rect x="${caseX + 176}" y="${caseY - 56}" width="96" height="74" rx="16" fill="${C.ink2}"/>` +
    `<path d="M${caseX + 200} ${caseY - 56} v-30 a24 24 0 0 1 48 0 v30" fill="none" stroke="${C.ink2}" stroke-width="16"/>` +
    `<circle cx="${caseX + 224}" cy="${caseY - 18}" r="11" fill="${C.groundHi}"/>` +
    panel(caseX, caseY, 480, 250, {
      fill: C.groundLo,
      radius: 24,
      children:
        `<rect x="${caseX + 20}" y="${caseY + 20}" width="440" height="210" rx="16" fill="${C.groundHi}" opacity="0.42"/>` +
        key(caseX + 128, caseY + 130, -14, C.steelLo, C.steel, 0.86) +
        [0, 1, 2, 3, 4, 5]
          .map(
            (i) =>
              `<rect x="${caseX + 58 + i * 72}" y="${caseY + 20}" width="15" height="210" rx="5" fill="${C.ink2}" opacity="0.68"/>`
          )
          .join("") +
        `<rect x="${caseX + 20}" y="${caseY + 20}" width="440" height="16" rx="8" fill="${C.ink2}" opacity="0.45"/>`,
    });

  // The ring with the unused key, near the credential.
  const ring =
    shadow(150, 638, 172, 172, 86, 0.2) +
    `<circle cx="236" cy="724" r="84" fill="none" stroke="${C.steelLo}" stroke-width="26"/>` +
    `<circle cx="236" cy="724" r="84" fill="none" stroke="${C.steelHi}" stroke-width="10" opacity="0.8"/>` +
    key(264, 782, 40, C.steel, C.steelHi, 0.74);

  return svg(
    "vo",
    desk("vo", { horizon: 240 }) + lanyard + card + reader + tether + ring + lockedCase + grantedKey
  );
}

/**
 * DocPilot: an open document with passages picked out, and the answer beside
 * it, tied back to the passage it came from by a thin leader line.
 */
function docPilot() {
  // Open spread: two pages meeting at a soft gutter.
  const bx = 110;
  const by = 250;
  const bw = 820;
  const bh = 560;
  const spread =
    shadow(bx, by, bw, bh, 12, 0.24) +
    `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="10" fill="${C.paper3}"/>` +
    `<rect x="${bx + 10}" y="${by + 10}" width="${bw / 2 - 14}" height="${bh - 20}" rx="6" fill="${C.paper}"/>` +
    `<rect x="${bx + bw / 2 + 4}" y="${by + 10}" width="${bw / 2 - 14}" height="${bh - 20}" rx="6" fill="${C.paper}"/>` +
    // The gutter: a soft shade either side of the fold.
    `<rect x="${bx + bw / 2 - 34}" y="${by + 10}" width="68" height="${bh - 20}" fill="${C.groundLo}" opacity="0.2"/>` +
    `<rect x="${bx + bw / 2 - 2}" y="${by + 10}" width="4" height="${bh - 20}" fill="${C.paper3}"/>`;

  const leftText =
    textBlock(bx + 56, by + 70, 300, 5, { seed: 41, gap: 32, thickness: 10 }) +
    // Two picked-out passages on the left page.
    `<rect x="${bx + 44}" y="${by + 234}" width="326" height="38" rx="10" fill="${C.amberSoft}"/>` +
    textBlock(bx + 56, by + 244, 300, 1, { seed: 42, thickness: 10, fill: C.ink3 }) +
    textBlock(bx + 56, by + 292, 300, 3, { seed: 43, gap: 32, thickness: 10 }) +
    `<rect x="${bx + 44}" y="${by + 396}" width="326" height="38" rx="10" fill="${C.amberSoft}"/>` +
    textBlock(bx + 56, by + 406, 300, 1, { seed: 44, thickness: 10, fill: C.ink3 }) +
    textBlock(bx + 56, by + 454, 300, 2, { seed: 45, gap: 32, thickness: 10 });

  const rightText =
    textBlock(bx + bw / 2 + 50, by + 70, 300, 6, { seed: 46, gap: 32, thickness: 10 }) +
    `<rect x="${bx + bw / 2 + 38}" y="${by + 266}" width="326" height="38" rx="10" fill="${C.amberSoft}"/>` +
    textBlock(bx + bw / 2 + 50, by + 276, 300, 1, { seed: 47, thickness: 10, fill: C.ink3 }) +
    textBlock(bx + bw / 2 + 50, by + 324, 300, 5, { seed: 48, gap: 32, thickness: 10 });

  // The answer, floating above the page on its own card.
  const ax = 900;
  const ay = 200;
  const answer = panel(ax, ay, 520, 400, {
    fill: C.paper,
    radius: 22,
    children:
      // The question, as a filled bar with a leading mark.
      `<rect x="${ax + 34}" y="${ay + 40}" width="452" height="62" rx="16" fill="${C.accentSoft}" opacity="0.45"/>` +
      `<circle cx="${ax + 66}" cy="${ay + 71}" r="15" fill="${C.accent}"/>` +
      bar(ax + 96, ay + 64, 330, 14, C.ink3, 0.7) +
      `<rect x="${ax + 34}" y="${ay + 136}" width="452" height="3" fill="${C.lineSoft}"/>` +
      textBlock(ax + 34, ay + 170, 452, 5, { seed: 51, gap: 34, thickness: 12 }) +
      // The citation the leader line runs back from.
      `<circle cx="${ax + 54}" cy="${ay + 350}" r="18" fill="${C.amber}"/>` +
      bar(ax + 84, ay + 342, 170, 12, C.line),
  });

  // Leader line: the citation on the answer card back to the passage it came
  // from. One shallow arc, drawn over the page and under the card, so the eye
  // follows it without it crossing anything it should not.
  const leader =
    `<path d="M${ax + 36} ${ay + 350} C ${ax - 90} ${ay + 372} ${bx + 560} ${by + 470} ${bx + 380} ${by + 415}" ` +
    `stroke="${C.amber}" stroke-width="6" fill="none" stroke-dasharray="16 13" stroke-linecap="round" opacity="0.9"/>` +
    `<circle cx="${bx + 380}" cy="${by + 415}" r="15" fill="${C.amber}"/>` +
    `<circle cx="${bx + 380}" cy="${by + 415}" r="26" fill="${C.amber}" opacity="0.25"/>`;

  // A pencil on the desk below the spread, clear of it, for weight and a
  // second cast shadow in the foreground.
  const pencil =
    `<g transform="rotate(-7 640 878)">` +
    shadow(430, 866, 400, 28, 14, 0.24) +
    `<rect x="430" y="866" width="400" height="28" rx="7" fill="${C.amber}"/>` +
    `<rect x="430" y="871" width="400" height="8" fill="#ffffff" opacity="0.24"/>` +
    `<path d="M830 866 l62 14 -62 14 z" fill="${C.paper2}"/>` +
    `<path d="M873 875 l19 5 -19 5 z" fill="${C.ink2}"/>` +
    `<rect x="392" y="866" width="38" height="28" rx="5" fill="${C.steel}"/>` +
    `<rect x="374" y="868" width="20" height="24" rx="6" fill="#d98d8d"/>` +
    `</g>`;

  return svg(
    "dp",
    desk("dp", { horizon: 210 }) + spread + leftText + rightText + pencil + leader + answer
  );
}

/**
 * QuantVision: a research desk. A screen with a drawn market line, a printed
 * copy of the same kind of curve, a notebook and a cup.
 *
 * The curve carries no axis values and no figures of any kind. It is a drawing
 * of the shape of a market, not a report of one.
 */
function quantVision() {
  const random = rng(77);

  /** A plausible but explicitly invented walk, drawn as a smooth polyline. */
  const walk = (x, y, w, h, steps, drift) => {
    const pts = [];
    let v = 0.35;
    for (let i = 0; i <= steps; i++) {
      v += (random() - 0.46) * 0.16 + drift;
      v = Math.max(0.06, Math.min(0.94, v));
      pts.push([x + (w * i) / steps, y + h - v * h]);
    }
    return pts;
  };
  const poly = (pts) => pts.map(([px, py]) => `${n(px)},${n(py)}`).join(" ");

  // Monitor, seen slightly from the left so it has a side face.
  const mx = 620;
  const my = 170;
  const mw = 760;
  const mh = 470;
  const screenPts = walk(mx + 60, my + 90, mw - 120, mh - 200, 46, 0.012);
  const monitor =
    shadow(mx, my, mw, mh, 18, 0.26) +
    `<rect x="${mx}" y="${my}" width="${mw}" height="${mh}" rx="18" fill="${C.ink2}"/>` +
    `<rect x="${mx + 22}" y="${my + 22}" width="${mw - 44}" height="${mh - 66}" rx="8" fill="${C.ink}"/>` +
    // Grid, kept faint so the line is the subject.
    [1, 2, 3]
      .map((i) => `<rect x="${mx + 40}" y="${my + 60 + i * 90}" width="${mw - 80}" height="2" fill="${C.steelLo}" opacity="0.28"/>`)
      .join("") +
    `<polygon points="${poly(screenPts)} ${n(mx + mw - 60)},${n(my + mh - 110)} ${n(mx + 60)},${n(my + mh - 110)}" ` +
    `fill="${C.accent}" opacity="0.22"/>` +
    `<polyline points="${poly(screenPts)}" fill="none" stroke="${C.accentSoft}" stroke-width="7" stroke-linejoin="round"/>` +
    // A second, flatter line: the benchmark the strategy is read against.
    `<polyline points="${poly(walk(mx + 60, my + 130, mw - 120, mh - 260, 46, 0.006))}" fill="none" ` +
    `stroke="${C.steelLo}" stroke-width="5" stroke-dasharray="16 12" opacity="0.75"/>` +
    // Stand.
    `<rect x="${mx + mw / 2 - 44}" y="${my + mh}" width="88" height="70" fill="${C.steelLo}"/>` +
    `<rect x="${mx + mw / 2 - 150}" y="${my + mh + 64}" width="300" height="26" rx="13" fill="${C.steel}"/>`;

  // A printed sheet of the same curve, lying to the left.
  const px = 110;
  const py = 470;
  const printPts = walk(px + 46, py + 90, 330, 180, 30, 0.01);
  const printout = sheet(px, py, 420, 380, {
    rotate: -5,
    tone: C.paper,
    children:
      bar(px + 46, py + 46, 180, 14, C.ink2, 0.75) +
      `<polyline points="${poly(printPts)}" fill="none" stroke="${C.accent}" stroke-width="6" stroke-linejoin="round"/>` +
      `<rect x="${px + 46}" y="${py + 286}" width="330" height="3" fill="${C.lineSoft}"/>` +
      textBlock(px + 46, py + 310, 330, 2, { seed: 61, gap: 26, thickness: 9 }),
  });

  // Notebook and cup, for depth in the near foreground.
  const notebook = sheet(470, 740, 360, 200, {
    rotate: 7,
    tone: C.paper2,
    children: textBlock(506, 786, 290, 4, { seed: 62, gap: 30, thickness: 9 }),
  });
  const cup =
    shadow(1160, 700, 190, 190, 95, 0.24) +
    `<ellipse cx="1255" cy="880" rx="104" ry="26" fill="${C.ink}" opacity="0.14"/>` +
    `<path d="M1160 706 h190 l-18 150 a78 78 0 0 1 -154 0 z" fill="${C.paper}"/>` +
    `<path d="M1350 736 a52 52 0 0 1 0 96" fill="none" stroke="${C.paper}" stroke-width="22"/>` +
    `<ellipse cx="1255" cy="706" rx="95" ry="26" fill="${C.brownHi}"/>` +
    `<ellipse cx="1255" cy="704" rx="80" ry="19" fill="${C.brown}"/>`;

  return svg("qv", desk("qv", { horizon: 300 }) + printout + monitor + notebook + cup);
}

/**
 * Sunspot Transformer: the solar surface itself, close enough to see
 * granulation and the penumbra around each spot, with one restrained curve
 * along the foot of the frame for the forecast.
 */
function sunspots() {
  const random = rng(1749);
  const cx = 720;
  const cy = 366;
  const r = 492;

  // Granulation: many small warm cells, denser toward the centre, fading at
  // the limb so the disc reads as a sphere rather than a circle.
  let cells = "";
  for (let i = 0; i < 620; i++) {
    const a = random() * Math.PI * 2;
    const d = Math.sqrt(random()) * r * 0.97;
    const x = cx + Math.cos(a) * d;
    const y = cy + Math.sin(a) * d;
    const size = 10 + random() * 26 * (1 - d / r) + 6;
    const warm = random();
    const fill = warm > 0.62 ? "#f6d9a0" : warm > 0.3 ? "#e8b96f" : "#d09a4e";
    cells +=
      `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(size)}" ry="${n(size * (0.62 + random() * 0.4))}" ` +
      `fill="${fill}" opacity="${n(0.16 + random() * 0.3)}"/>`;
  }

  /** A spot: dark umbra, fibrous penumbra, sitting in a shallow dimple. */
  const spot = (x, y, size, squash) =>
    `<g transform="translate(${x} ${y}) scale(${squash} 1)">` +
    `<ellipse rx="${size * 2.05}" ry="${size * 1.5}" fill="#a86a2c" opacity="0.5"/>` +
    `<ellipse rx="${size * 1.62}" ry="${size * 1.14}" fill="#8a5322" opacity="0.85"/>` +
    `<ellipse rx="${size}" ry="${size * 0.7}" fill="#3a2412"/>` +
    `<ellipse cx="${-size * 0.22}" cy="${-size * 0.2}" rx="${size * 0.5}" ry="${size * 0.3}" fill="#22150a"/>` +
    `</g>`;

  const disc =
    `<defs>` +
    `<radialGradient id="sunface" cx="0.38" cy="0.32" r="0.78">` +
    `<stop offset="0" stop-color="#fbe3b4"/>` +
    `<stop offset="0.55" stop-color="#eab868"/>` +
    `<stop offset="0.86" stop-color="#cf8f3f"/>` +
    `<stop offset="1" stop-color="#9c6528"/>` +
    `</radialGradient>` +
    `<clipPath id="discClip"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>` +
    `</defs>` +
    shadow(cx - r, cy - r, r * 2, r * 2, r, 0.3) +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#sunface)"/>` +
    `<g clip-path="url(#discClip)">` +
    cells +
    spot(cx - 132, cy - 52, 70, 1.05) +
    spot(cx + 36, cy + 26, 42, 0.95) +
    spot(cx + 204, cy - 168, 54, 0.86) +
    spot(cx + 106, cy + 222, 30, 0.9) +
    // Limb darkening, painted over the lot.
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#8a5722" stroke-width="130" opacity="0.34"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#6f4319" stroke-width="56" opacity="0.36"/>` +
    `</g>`;

  // The forecast: the observed cycle solid, the next stretch dashed. No axis,
  // no values, nothing that could be read as a measurement.
  const baseY = 824;
  let observed = "";
  let predicted = "";
  const amp = 62;
  for (let i = 0; i <= 130; i++) {
    const x = 80 + i * 8.6;
    const t = i / 130;
    const y = baseY - Math.sin(t * Math.PI * 4.1) * amp * (0.6 + 0.4 * Math.sin(t * Math.PI));
    const point = `${n(x)},${n(y)}`;
    if (t <= 0.7) observed += `${point} `;
    if (t >= 0.69) predicted += `${point} `;
  }
  // The band the curve sits in, fading upward, so it reads as a strip of
  // instrument panel below the disc rather than a bar laid across it.
  const curve =
    `<defs><linearGradient id="band" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="#0d1016" stop-opacity="0"/>` +
    `<stop offset="0.45" stop-color="#0d1016" stop-opacity="0.82"/>` +
    `<stop offset="1" stop-color="#0d1016" stop-opacity="0.95"/>` +
    `</linearGradient></defs>` +
    `<rect x="0" y="${baseY - 168}" width="${ART_WIDTH}" height="${ART_HEIGHT - baseY + 168}" fill="url(#band)"/>` +
    `<polyline points="${observed.trim()}" fill="none" stroke="${C.paper}" stroke-width="7" ` +
    `stroke-linecap="round" stroke-linejoin="round" opacity="0.92"/>` +
    `<polyline points="${predicted.trim()}" fill="none" stroke="${C.amberSoft}" stroke-width="7" ` +
    `stroke-linecap="round" stroke-dasharray="18 16" opacity="0.95"/>` +
    // The one mark that says "next": a hollow pip where the dashes begin.
    `<circle cx="${n(80 + 91 * 8.6)}" cy="${n(baseY - Math.sin(0.7 * Math.PI * 4.1) * amp * (0.6 + 0.4 * Math.sin(0.7 * Math.PI)))}" ` +
    `r="17" fill="${C.ink}" stroke="${C.amberSoft}" stroke-width="6"/>`;

  const sky =
    `<defs><linearGradient id="space" x1="0" y1="0" x2="0.4" y2="1">` +
    `<stop offset="0" stop-color="#2a2f3a"/><stop offset="1" stop-color="#13161d"/>` +
    `</linearGradient></defs>` +
    `<rect width="${ART_WIDTH}" height="${ART_HEIGHT}" fill="url(#space)"/>`;

  return svg("st", sky + disc + curve);
}

/**
 * VeritasAI: the composed front page the project is for.
 *
 * A broadsheet on a table with a masthead, a lead story and its picture, and
 * columns running under it, with the raw clippings it was built from stacked
 * beside it. Every word is a bar, so nothing here is a headline anyone wrote.
 */
function veritasAi() {
  const px = 300;
  const py = 170;
  const pw = 880;
  const ph = 700;

  const column = (x, y, w, rows, seed) =>
    textBlock(x, y, w, rows, { gap: 24, thickness: 8, seed, fill: C.line });

  const front = sheet(px, py, pw, ph, {
    rotate: -1.5,
    tone: C.paper,
    radius: 4,
    children:
      // Masthead: one heavy bar between two rules.
      `<rect x="${px + 60}" y="${py + 52}" width="${pw - 120}" height="4" fill="${C.ink2}" opacity="0.55"/>` +
      `<rect x="${px + 232}" y="${py + 76}" width="${pw - 464}" height="34" rx="6" fill="${C.ink2}" opacity="0.85"/>` +
      `<rect x="${px + 60}" y="${py + 132}" width="${pw - 120}" height="4" fill="${C.ink2}" opacity="0.55"/>` +
      // Lead story: picture block, then a two-line headline under it.
      `<rect x="${px + 60}" y="${py + 168}" width="${pw - 120}" height="230" rx="6" fill="${C.skyLo}"/>` +
      `<path d="M${px + 60} ${py + 398} l190 -150 130 96 150 -120 240 174 z" fill="${C.green}" opacity="0.55"/>` +
      `<circle cx="${px + 700}" cy="${py + 226}" r="34" fill="${C.amberSoft}" opacity="0.9"/>` +
      `<rect x="${px + 60}" y="${py + 424}" width="${pw - 220}" height="26" rx="6" fill="${C.ink2}" opacity="0.8"/>` +
      `<rect x="${px + 60}" y="${py + 464}" width="${pw - 420}" height="26" rx="6" fill="${C.ink2}" opacity="0.8"/>` +
      // Three columns of body copy, with a rule between each.
      column(px + 60, py + 528, 230, 6, 81) +
      `<rect x="${px + 316}" y="${py + 524}" width="3" height="150" fill="${C.lineSoft}"/>` +
      column(px + 344, py + 528, 230, 6, 82) +
      `<rect x="${px + 600}" y="${py + 524}" width="3" height="150" fill="${C.lineSoft}"/>` +
      column(px + 628, py + 528, 190, 6, 83),
  });

  // The clippings it was composed from, stacked at an angle beside the page.
  const clip = (x, y, w, h, rot, seed) =>
    sheet(x, y, w, h, {
      rotate: rot,
      tone: C.paper2,
      radius: 4,
      children:
        `<rect x="${x + 20}" y="${y + 22}" width="${w - 70}" height="15" rx="4" fill="${C.ink2}" opacity="0.7"/>` +
        textBlock(x + 20, y + 58, w - 40, 3, { gap: 22, thickness: 7, seed }),
    });

  const clippings =
    clip(1140, 590, 330, 160, 9, 91) +
    clip(1170, 520, 320, 150, -5, 92) +
    clip(1130, 452, 310, 140, 4, 93) +
    // A clip holding the pile together.
    `<path d="M1290 430 v-46 a34 34 0 0 1 68 0 v70 a20 20 0 0 1 -40 0 v-56" fill="none" ` +
    `stroke="${C.steelLo}" stroke-width="13" stroke-linecap="round"/>`;

  // A loose clipping in the near foreground, half off the frame.
  const loose = clip(60, 690, 300, 200, -11, 94);

  return svg("va", desk("va", { horizon: 150 }) + loose + front + clippings);
}

export const SCENES = {
  "semantic-search": semanticSearch,
  skillgap: skillGap,
  vouch,
  docpilot: docPilot,
  quantvision: quantVision,
  "sunspot-transformer": sunspots,
  veritasai: veritasAi,
};
