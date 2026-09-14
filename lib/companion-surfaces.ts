/**
 * Turns the surface markers on the page into validated, walkable surfaces and
 * a small navigation graph.
 *
 * Everything here is in DOCUMENT coordinates. Rects from the DOM arrive in
 * viewport space and are converted once, on entry, by adding the current
 * scroll offset. Nothing downstream mixes the two.
 *
 * A marker only proposes a surface. It becomes usable only where the
 * character's entire body, plus room for the greeting bubble, fits clear of
 * text, media and controls.
 */

export type DocRect = { left: number; top: number; right: number; bottom: number };

export type Surface = {
  id: string;
  kind: string;
  /** Walkable span of character centre positions, in document coordinates. */
  start: number;
  end: number;
  /** Document y the character's feet rest on. */
  baseline: number;
};

export type SurfaceGraph = {
  surfaces: Surface[];
  /** Indexes of surfaces reachable from each surface, by index. */
  edges: Map<number, number[]>;
  /** Validated vertical connections. Empty while climbing is disabled. */
  climbs: ClimbEdge[];
  /** Corridors that were declared but failed validation, for the debug view. */
  rejectedClimbs: { corridor: DocRect; reason: string }[];
  /** Regions that blocked space, kept for the debug view. */
  blocked: DocRect[];
  /**
   * Every obstacle on the page, in DOCUMENT coordinates. Measured once with
   * the rest of the geometry so the fall can test a corridor without touching
   * the DOM on a hot path.
   */
  obstacles: DocRect[];
  /**
   * Obstacles that do not scroll: anything computed `fixed` or `sticky`, plus
   * open overlays. In VIEWPORT coordinates, because that is the space they
   * live in. Kept apart from `obstacles` so the two are never mixed.
   */
  pinnedObstacles: DocRect[];
};

/** A validated vertical route between two surfaces. */
export type ClimbEdge = {
  id: string;
  /** Index of the lower surface. */
  from: number;
  /** Index of the upper surface. */
  to: number;
  /**
   * Document x of the edge itself, which is the container border his hands
   * hold. His body sits on the corridor side of it, outside the container.
   */
  x: number;
  /** Which side of the container the corridor lies on. */
  side: "left" | "right";
  /** Document y of the lower and upper baselines. */
  bottom: number;
  top: number;
};

/** Content the character must never cover. */
const OBSTACLE_SELECTOR = [
  "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "li", "a", "button", "input", "textarea", "select", "label",
  "img", "svg", "canvas", "video", "table", "form", "blockquote", "pre", "code",
  "[role='dialog']", "[role='tablist']", "[role='tab']", "nav", "footer",
].join(",");

/**
 * Page decoration: the wall texture and the window light behind the content.
 *
 * Skipped entirely. These layers are painted, viewport sized and `fixed` or
 * `absolute`, so without this they would be collected as solid panels and the
 * character would refuse to walk anywhere on the page. Nothing marked this way
 * is in the accessibility tree or takes pointer events either.
 */
const DECORATIVE = "[data-decorative]";

/** Clearance beyond the character's own width. */
const SIDE_BUFFER = 6;
/** Headroom reserved above the character for the greeting bubble. */
export const BUBBLE_HEADROOM = 26;
/** A surface narrower than this cannot hold the character usefully. */
const MIN_SURFACE = 40;

/** Room above the upper baseline needed to finish a pull-up. */
const PULL_UP_HEADROOM = 18;

/**
 * Longest climb worth offering.
 *
 * A corridor can span a whole card grid, which connected surfaces 1343px
 * apart: 51 seconds of climbing at the tuned speed. Short hops read as part of
 * a journey; a minute of climbing reads as a stuck animation.
 */
const MAX_CLIMB = 460;

/** Vertical slice height used when sweeping a corridor for obstacles. */
const SWEEP_STEP = 24;

const toDoc = (r: DOMRect): DocRect => ({
  left: r.left + window.scrollX,
  top: r.top + window.scrollY,
  right: r.right + window.scrollX,
  bottom: r.bottom + window.scrollY,
});

/** The same rect left in viewport space, for things that do not scroll. */
const viewportRect = (r: DOMRect): DocRect => ({
  left: r.left,
  top: r.top,
  right: r.right,
  bottom: r.bottom,
});

/** Whether a computed background-color actually paints something. */
function isPaintedBackground(color: string) {
  if (!color || color === "transparent") return false;
  const alpha = color.startsWith("rgba(") ? Number(color.split(",")[3]) : 1;
  return Number.isFinite(alpha) ? alpha > 0.02 : true;
}

/**
 * Whether an element or any ancestor is taken out of the scrolling flow.
 *
 * Walks up rather than testing the element alone, because a paragraph inside a
 * sticky bar is itself statically positioned and would otherwise be recorded
 * at a document position it never occupies.
 */
function isPinned(node: HTMLElement) {
  let at: HTMLElement | null = node;
  let depth = 0;
  while (at && depth < 24) {
    const position = getComputedStyle(at).position;
    if (position === "fixed" || position === "sticky") return true;
    at = at.parentElement;
    depth += 1;
  }
  return false;
}

/**
 * Reads every marker, checks it against real content, and returns the usable
 * surfaces with a graph connecting the ones that genuinely touch.
 *
 * `climbing` stays false until climbing frames exist, so vertical edges are
 * built but never offered. Without them the character simply stays on the
 * surface he is on, which is correct: he must never teleport between
 * disconnected surfaces.
 */
export function buildGraph(options: {
  charWidth: number;
  charHeight: number;
  ignore?: Element | null;
  climbing?: boolean;
}): SurfaceGraph {
  const { charWidth, charHeight, ignore, climbing = false } = options;
  const empty: SurfaceGraph = {
    surfaces: [],
    edges: new Map(),
    climbs: [],
    rejectedClimbs: [],
    blocked: [],
    obstacles: [],
    pinnedObstacles: [],
  };
  if (typeof document === "undefined") return empty;

  const markers = document.querySelectorAll<HTMLElement>("[data-companion-surface]");
  if (markers.length === 0) return empty;

  // Obstacles are gathered once and reused for every surface.
  const obstacles: DocRect[] = [];
  const pinnedObstacles: DocRect[] = [];
  for (const node of document.querySelectorAll<HTMLElement>(OBSTACLE_SELECTOR)) {
    if (ignore && ignore.contains(node)) continue;
    if (node.closest(DECORATIVE)) continue;
    if (node.closest("[data-companion-surface]")) continue;
    const rect = node.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;
    // A sticky or fixed ancestor means this rect does not move with the
    // document, so converting it to document space would put it in the wrong
    // place the moment the reader scrolls. Keep it in viewport space instead.
    if (isPinned(node)) pinnedObstacles.push(viewportRect(rect));
    else obstacles.push(toDoc(rect));
  }

  /**
   * Containers with a real drawn border, which is what makes an edge something
   * to hold rather than a line in open space. Collected separately from the
   * obstacle list, which is text and media and has no border of its own.
   */
  const borderedEdges: { rect: DocRect; leftBorder: boolean; rightBorder: boolean }[] = [];
  /**
   * Panels: anything drawn as a surface of its own rather than as page
   * background. A card is one shape to a reader even where its middle happens
   * to be empty, so the fall and the ground treat the whole rect as solid.
   * The walkable surfaces deliberately do not use this list, because their
   * markers are placed inside those containers on purpose.
   */
  const panels: DocRect[] = [];
  const pinnedPanels: DocRect[] = [];
  const pageWidth = document.documentElement.clientWidth;
  for (const node of document.querySelectorAll<HTMLElement>("article, section, aside, li > div, div")) {
    if (ignore && ignore.contains(node)) continue;
    if (node.closest(DECORATIVE)) continue;
    const rect = node.getBoundingClientRect();
    if (rect.width < 120 || rect.height < 120) continue;
    const style = getComputedStyle(node);
    const leftBorder = parseFloat(style.borderLeftWidth) > 0;
    const rightBorder = parseFloat(style.borderRightWidth) > 0;

    // Full-bleed wrappers are the page, not a panel on it.
    if (rect.width < pageWidth * 0.98) {
      const painted =
        leftBorder ||
        rightBorder ||
        parseFloat(style.borderTopWidth) > 0 ||
        parseFloat(style.borderBottomWidth) > 0 ||
        isPaintedBackground(style.backgroundColor);
      // Held back until the surfaces have been built, then merged in below.
      // Adding them now would change which surfaces are walkable at all, and
      // the markers inside these containers are deliberate.
      if (painted) {
        if (isPinned(node)) pinnedPanels.push(viewportRect(rect));
        else panels.push(toDoc(rect));
      }
    }

    if (!leftBorder && !rightBorder) continue;
    borderedEdges.push({ rect: toDoc(rect), leftBorder, rightBorder });
  }

  const surfaces: Surface[] = [];
  const blocked: DocRect[] = [];

  for (const marker of markers) {
    const rect = marker.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;
    const band = toDoc(rect);

    // The character stands on the bottom of the band. The space it needs is
    // its own height plus headroom for the bubble, measured upward.
    const needed = charHeight + BUBBLE_HEADROOM;
    const bodyTop = band.bottom - needed;
    if (band.bottom - band.top < charHeight * 0.5) continue;

    const pad = charWidth / 2 + SIDE_BUFFER;
    const spans: { start: number; end: number }[] = [];
    for (const o of obstacles) {
      // Only content that would actually touch the character's body box.
      if (o.bottom <= bodyTop || o.top >= band.bottom) continue;
      spans.push({ start: o.left - pad, end: o.right + pad });
      blocked.push(o);
    }

    const bounds = { start: band.left + pad, end: band.right - pad };
    let free: { start: number; end: number }[] = [];
    if (spans.length === 0) {
      free = [bounds];
    } else {
      spans.sort((a, b) => a.start - b.start);
      const merged = [spans[0]];
      for (const s of spans.slice(1)) {
        const last = merged[merged.length - 1];
        if (s.start <= last.end) last.end = Math.max(last.end, s.end);
        else merged.push({ ...s });
      }
      let cursor = bounds.start;
      for (const m of merged) {
        if (m.start > cursor) free.push({ start: cursor, end: Math.min(m.start, bounds.end) });
        cursor = Math.max(cursor, m.end);
        if (cursor >= bounds.end) break;
      }
      if (cursor < bounds.end) free.push({ start: cursor, end: bounds.end });
    }

    const id = marker.dataset.surfaceId ?? "surface";
    const kind = marker.dataset.companionSurface ?? "divider";
    free
      .filter((f) => f.end - f.start >= MIN_SURFACE)
      .forEach((f, i) => {
        surfaces.push({
          id: `${id}${i > 0 ? `-${i}` : ""}`,
          kind,
          start: f.start,
          end: f.end,
          baseline: band.bottom,
        });
      });
  }

  surfaces.sort((a, b) => a.baseline - b.baseline || a.start - b.start);

  // Edges. Horizontal: surfaces level with each other whose spans touch, so he
  // can walk straight across. Vertical: reserved for climbing, never offered
  // while the frames are missing.
  const edges = new Map<number, number[]>();
  for (let i = 0; i < surfaces.length; i++) edges.set(i, []);
  for (let i = 0; i < surfaces.length; i++) {
    for (let j = i + 1; j < surfaces.length; j++) {
      const a = surfaces[i];
      const b = surfaces[j];
      const level = Math.abs(a.baseline - b.baseline) <= 4;
      const touching = a.end >= b.start - 2 && b.end >= a.start - 2;
      if (level && touching) {
        edges.get(i)!.push(j);
        edges.get(j)!.push(i);
        continue;
      }
    }
  }

  // ---- vertical connections -------------------------------------------
  const climbs: ClimbEdge[] = [];
  const rejectedClimbs: { corridor: DocRect; reason: string }[] = [];

  for (const marker of document.querySelectorAll<HTMLElement>("[data-companion-climb]")) {
    const rect = marker.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;
    const corridor = toDoc(rect);
    const id = marker.dataset.climbId ?? "climb";

    if (corridor.right - corridor.left < charWidth + 4) {
      rejectedClimbs.push({ corridor, reason: "corridor narrower than the character" });
      continue;
    }

    const side = (marker.dataset.companionClimb === "right" ? "right" : "left") as "left" | "right";
    // The edge is the container border the corridor is flush against.
    const edgeX = side === "left" ? corridor.right : corridor.left;
    // He stands in the corridor, so route membership is tested at its middle.
    const x = (corridor.left + corridor.right) / 2;

    /**
     * There must be something real to hold. A marker establishes clearance but
     * not a climbable edge, so the corridor is only accepted where a drawn
     * border runs along it: the outer border of the project cards, here.
     */
    const edgeSupport = borderedEdges
      .filter((e) => (side === "left" ? e.leftBorder : e.rightBorder))
      .filter((e) => Math.abs((side === "left" ? e.rect.left : e.rect.right) - edgeX) <= 8)
      .filter((e) => e.rect.bottom > corridor.top && e.rect.top < corridor.bottom)
      .map((e) => e.rect);
    if (edgeSupport.length === 0) {
      rejectedClimbs.push({ corridor, reason: "no visible border to grip" });
      continue;
    }

    // The surfaces this corridor could join: ones whose span contains x and
    // whose baseline falls inside the corridor.
    const candidates = surfaces
      .map((s, i) => ({ s, i }))
      .filter(({ s }) => x >= s.start && x <= s.end && s.baseline >= corridor.top - 4 && s.baseline <= corridor.bottom + 4)
      .sort((a, b) => a.s.baseline - b.s.baseline);

    if (candidates.length < 2) {
      rejectedClimbs.push({ corridor, reason: "fewer than two surfaces meet this corridor" });
      continue;
    }

    for (let k = 0; k + 1 < candidates.length; k++) {
      const lower = candidates[k + 1];
      const upper = candidates[k];
      const bottom = lower.s.baseline;
      const top = upper.s.baseline;
      if (bottom - top < charHeight * 0.75) {
        rejectedClimbs.push({ corridor, reason: "surfaces too close to be worth a climb" });
        continue;
      }
      if (bottom - top > MAX_CLIMB) {
        rejectedClimbs.push({ corridor, reason: `climb too long (${Math.round(bottom - top)}px)` });
        continue;
      }

      // Sweep the whole route, not just its ends: the reach at the bottom, the
      // climb, and the pull-up at the top, each as the character's full box.
      const sweepLeft = x - charWidth / 2 - SIDE_BUFFER;
      const sweepRight = x + charWidth / 2 + SIDE_BUFFER;
      const sweepTop = top - charHeight - PULL_UP_HEADROOM - BUBBLE_HEADROOM;
      const sweepBottom = bottom;

      let blockedBy: DocRect | null = null;
      for (let y = sweepTop; y <= sweepBottom; y += SWEEP_STEP) {
        const sliceTop = y;
        const sliceBottom = Math.min(y + SWEEP_STEP, sweepBottom);
        const hit = obstacles.find(
          (o) => o.right > sweepLeft && o.left < sweepRight && o.bottom > sliceTop && o.top < sliceBottom
        );
        if (hit) { blockedBy = hit; break; }
      }
      if (blockedBy) {
        rejectedClimbs.push({ corridor, reason: "content blocks the swept corridor" });
        continue;
      }

      // The edge must actually run the height of this climb, not just touch it.
      const spansClimb = edgeSupport.some((o) => o.top <= top + 8 && o.bottom >= bottom - 8);
      if (!spansClimb) {
        rejectedClimbs.push({ corridor, reason: "edge does not span this climb" });
        continue;
      }

      climbs.push({ id: `${id}-${k}`, from: lower.i, to: upper.i, x: edgeX, side, bottom, top });
      if (climbing) {
        edges.get(lower.i)!.push(upper.i);
        edges.get(upper.i)!.push(lower.i);
      }
    }
  }

  /**
   * Panels join the obstacle lists only now, after the walkable surfaces and
   * the climb corridors have been decided from real content alone. From here
   * on "obstacle" means solid space, which is what the fall and the ground
   * need: a card is one shape to a reader even where its middle is empty.
   */
  obstacles.push(...panels);
  pinnedObstacles.push(...pinnedPanels);

  return { surfaces, edges, climbs, rejectedClimbs, blocked, obstacles, pinnedObstacles };
}

/** The surface a document position sits on, if any. */
export function surfaceAt(graph: SurfaceGraph, x: number, y: number): number {
  return graph.surfaces.findIndex(
    (s) => Math.abs(s.baseline - y) <= 4 && x >= s.start - 2 && x <= s.end + 2
  );
}

/**
 * Where to appear on a fresh page.
 *
 * Prefers the widest surface that is already near the reader's viewport, so
 * the character is somewhere visible rather than parked at the bottom of a
 * long document. Falls back to the widest surface anywhere.
 */
export function bestSpawn(graph: SurfaceGraph): number {
  if (graph.surfaces.length === 0) return -1;
  const top = window.scrollY - 200;
  const bottom = window.scrollY + window.innerHeight + 200;

  let near = -1;
  let nearWidth = 0;
  let closest = -1;
  let closestGap = Infinity;
  let climbable = -1;
  let climbableWidth = 0;
  const centre = window.scrollY + window.innerHeight / 2;

  // Surfaces a validated climb actually leaves from, so standing on one means
  // a climb can be offered rather than merely existing somewhere on the page.
  const connected = new Set<number>();
  for (const c of graph.climbs) {
    if (c.top < bottom && c.bottom > top) { connected.add(c.from); connected.add(c.to); }
  }

  graph.surfaces.forEach((s, i) => {
    const w = s.end - s.start;
    const onScreen = s.baseline >= top && s.baseline <= bottom;
    if (onScreen && w > nearWidth) { nearWidth = w; near = i; }
    if (onScreen && connected.has(i) && w > climbableWidth) { climbableWidth = w; climbable = i; }
    const gap = Math.abs(s.baseline - centre);
    if (gap < closestGap) { closestGap = gap; closest = i; }
  });

  // Preference order: a visible surface with a climb off it, then the widest
  // visible surface, then the nearest one. Without the first case he tended to
  // spawn on a wide but unconnected strip and could never climb at all, which
  // is why climbing was effectively invisible during normal browsing.
  if (climbable >= 0) return climbable;
  return near >= 0 ? near : closest;
}

export const surfaceWidth = (s: Surface) => s.end - s.start;

/**
 * The contiguous run a surface belongs to, following horizontal edges.
 *
 * Level surfaces that touch are walkable as one stretch, so travel is planned
 * across the whole run. Without this he would pace a narrow fragment while a
 * wider connected one sat right beside him.
 */
export function walkableSpan(
  graph: SurfaceGraph,
  index: number
): { start: number; end: number; members: number[] } {
  const start = graph.surfaces[index];
  if (!start) return { start: 0, end: 0, members: [] };

  const seen = new Set<number>([index]);
  const queue = [index];
  while (queue.length) {
    const at = queue.pop()!;
    for (const next of graph.edges.get(at) ?? []) {
      if (seen.has(next)) continue;
      // Level neighbours only: a climb is a separate, explicit journey.
      if (Math.abs(graph.surfaces[next].baseline - start.baseline) > 4) continue;
      seen.add(next);
      queue.push(next);
    }
  }

  const members = [...seen];
  return {
    start: Math.min(...members.map((i) => graph.surfaces[i].start)),
    end: Math.max(...members.map((i) => graph.surfaces[i].end)),
    members,
  };
}

/* ------------------------------------------------------------------ */
/* Falling: corridors, swept collision and the ground                  */
/* ------------------------------------------------------------------ */

/**
 * Everything below works in VIEWPORT coordinates, because a fall ends at the
 * bottom of the visible window rather than at a place in the document. The
 * only conversion happens here, in one place: document obstacles have the
 * current scroll subtracted as they are tested, and pinned obstacles are
 * already in viewport space and are left alone.
 */

/** A vertical slice of the viewport the character's drawn body occupies. */
export type Column = { left: number; right: number };

const overlapsColumn = (rect: DocRect, column: Column) =>
  rect.right > column.left && rect.left < column.right;

/**
 * The highest obstacle top inside a swept box, in viewport coordinates, or
 * null when the box is clear.
 *
 * The box is the union of the character's body over a whole step, so a fast
 * fall cannot pass between two frames without the obstacle in the middle being
 * tested. `floor` keeps the answer from ever being above where he already is.
 */
export function sweepBlocker(
  graph: SurfaceGraph,
  column: Column,
  boxTop: number,
  boxBottom: number,
  scrollY: number,
  floor = -Infinity
): number | null {
  let highest: number | null = null;
  const consider = (top: number, bottom: number) => {
    if (bottom <= boxTop || top >= boxBottom) return;
    const stop = Math.max(top, floor);
    if (highest === null || stop < highest) highest = stop;
  };
  for (const o of graph.obstacles) {
    if (!overlapsColumn(o, column)) continue;
    consider(o.top - scrollY, o.bottom - scrollY);
  }
  for (const o of graph.pinnedObstacles) {
    if (!overlapsColumn(o, column)) continue;
    consider(o.top, o.bottom);
  }
  return highest;
}

/**
 * Whether a fall down `column` from `fromFeet` to `toFeet` is clear the whole
 * way, landing area included.
 *
 * Checked as one swept box rather than at the two ends, so a card sitting half
 * way down a margin rejects the corridor instead of being passed through. The
 * box starts a body height above the release point so his head is covered too.
 */
export function fallCorridorClear(
  graph: SurfaceGraph,
  column: Column,
  fromFeet: number,
  toFeet: number,
  charHeight: number,
  scrollY: number
) {
  if (toFeet <= fromFeet) return false;
  // Only the space he moves into is his to claim. Anything level with where he
  // already stands was cleared when the surface itself was validated.
  return sweepBlocker(graph, column, fromFeet - 2, toFeet, scrollY) === null
    // and the landing box, which is taller than the strip he fell through.
    && sweepBlocker(graph, column, toFeet - charHeight, toFeet, scrollY, toFeet - charHeight) === null;
}

/**
 * Clear horizontal runs along a ground line, in viewport coordinates.
 *
 * Used both to choose where a fall may land and to bound walking once he is
 * down there, so he paces the clear margin rather than wandering across the
 * text that happens to be at the bottom of the window.
 */
export function groundRuns(
  graph: SurfaceGraph,
  groundFeet: number,
  charWidth: number,
  charHeight: number,
  scrollY: number,
  viewportWidth: number
): { start: number; end: number }[] {
  const top = groundFeet - charHeight;
  const pad = charWidth / 2;
  const spans: { start: number; end: number }[] = [];

  const consider = (rect: DocRect, offset: number) => {
    if (rect.bottom - offset <= top || rect.top - offset >= groundFeet) return;
    spans.push({ start: rect.left - pad, end: rect.right + pad });
  };
  for (const o of graph.obstacles) consider(o, scrollY);
  for (const o of graph.pinnedObstacles) consider(o, 0);

  const bounds = { start: pad + 2, end: viewportWidth - pad - 2 };
  if (spans.length === 0) return [bounds];

  spans.sort((a, b) => a.start - b.start);
  const merged = [spans[0]];
  for (const span of spans.slice(1)) {
    const last = merged[merged.length - 1];
    if (span.start <= last.end) last.end = Math.max(last.end, span.end);
    else merged.push({ ...span });
  }

  const free: { start: number; end: number }[] = [];
  let cursor = bounds.start;
  for (const m of merged) {
    if (m.start > cursor) free.push({ start: cursor, end: Math.min(m.start, bounds.end) });
    cursor = Math.max(cursor, m.end);
    if (cursor >= bounds.end) break;
  }
  if (cursor < bounds.end) free.push({ start: cursor, end: bounds.end });
  return free;
}

/**
 * A document surface he can step back onto from the ground.
 *
 * Only surfaces whose baseline has scrolled to within `band` of his feet
 * qualify, and only where his body actually fits on them. That is what keeps
 * the return a step across rather than a jump: the page brings a surface to
 * him, and he takes it at the position he is already standing in.
 *
 * Returns the surface index and the document x to hand over at, or null.
 */
export function reattachFromGround(
  graph: SurfaceGraph,
  viewX: number,
  feetY: number,
  scrollY: number,
  scrollX: number,
  band: number
): { index: number; x: number } | null {
  const docX = viewX + scrollX;
  let best: { index: number; x: number; gap: number } | null = null;

  graph.surfaces.forEach((surface, index) => {
    const baseline = surface.baseline - scrollY;
    const gap = Math.abs(baseline - feetY);
    if (gap > band) return;
    if (docX < surface.start || docX > surface.end) return;
    if (best === null || gap < best.gap) best = { index, x: docX, gap };
  });

  if (best === null) return null;
  const found = best as { index: number; x: number; gap: number };
  return { index: found.index, x: found.x };
}

/**
 * Climbs whose lower end is standing on a surface, for choosing where to go
 * when the reader scrolls up. A climb is only worth walking towards when its
 * whole run is on screen, since the point of it is being seen.
 */
export function visibleClimbsFrom(
  graph: SurfaceGraph,
  surfaceIndex: number,
  scrollY: number,
  viewportHeight: number
) {
  return graph.climbs
    .map((climb, index) => ({ climb, index }))
    .filter(({ climb }) => climb.from === surfaceIndex || climb.to === surfaceIndex)
    .filter(
      ({ climb }) =>
        climb.top - scrollY < viewportHeight - 20 && climb.bottom - scrollY > 20
    );
}
