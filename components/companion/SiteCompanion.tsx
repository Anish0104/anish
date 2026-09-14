"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import CompanionDebug from "./CompanionDebug";
import CompanionSprite from "./CompanionSprite";
import SpeechBubble from "./SpeechBubble";
import { ABOUT_CHARACTER_ID } from "./ids";
import {
  CLIMBING_ENABLED,
  CLIMB_SCROLL_THRESHOLD,
  CLIMB_SPEED,
  DESCENT_ENABLED,
  DRAWN_WIDTH_RATIO,
  FALL_ENABLED,
  FALL_SCROLL_THRESHOLD,
  FALL_SIDE_BUFFER,
  GROUND_MARGIN,
  HEADER_BUBBLE_MS,
  HEADER_PEEK,
  HEADER_WAVE_GAP,
  MAX_DROP,
  MIN_DROP,
  SCROLL_GESTURE_IDLE_MS,
  SETTLE_MS,
  anchorXFor,
  ROAMING_STATES,
  SIZES,
  anchorFor,
  sequenceDuration,
  sequenceFor,
  spriteCanvas,
  type CompanionState,
} from "@/data/companion";
import {
  GREET_GAP_MS,
  MIN_TRIP,
  SPEED,
  nextActivity,
  randomBetween,
  stepFall,
  strideMatchedSpeed,
  type Activity,
} from "@/lib/companion-machine";
import {
  bestSpawn,
  buildGraph,
  fallCorridorClear,
  groundRuns,
  reattachFromGround,
  surfaceWidth,
  sweepBlocker,
  visibleClimbsFrom,
  walkableSpan,
  type Column,
  type SurfaceGraph,
} from "@/lib/companion-surfaces";
import { useCompanionSuspension } from "@/lib/use-companion-suspension";

/** Remembered for the session, so the greeting is not repeated per route. */
const GREETED_KEY = "mini-anish-greeted";

/**
 * How far he will walk along his surface to reach a clear margin before
 * letting go. A fall has to happen somewhere the whole drop is empty, and on
 * this layout that is the page margin rather than wherever he happens to be
 * standing. Beyond this it stops reading as a reaction to the scroll.
 */
const FALL_APPROACH_MAX = 280;

/**
 * How close a surface baseline has to come to his feet before he will step
 * back onto it from the ground. Small on purpose: the page has to bring the
 * surface to him, which is what makes the handover a step rather than a jump.
 */
const REATTACH_BAND = 26;

/** How far he will walk along the ground to reach a surface worth taking. */
const GROUND_APPROACH_MAX = 320;

/**
 * How long an upward gesture keeps him looking for a surface, in ms. Long
 * enough to cover a slow scroll bringing one down to him, short enough that a
 * gesture from a while ago does not surprise the reader later.
 */
const CLIMB_WANT_MS = 4000;

/**
 * Where he is standing.
 *
 *   surface   on a document surface, scrolling with the page
 *   falling   walking to a margin, or in the air
 *   grounded  resting on the ground line at the bottom of the window
 *
 * Exactly one of the three loops below runs at a time, so there is never a
 * second timer chain driving the same character.
 */
type Phase = "surface" | "falling" | "grounded";


/**
 * Mini Anish roaming the site.
 *
 * He stands on explicit surfaces declared by `CompanionSurface` markers in the
 * page, not on arbitrary elements. Positions are document coordinates, and the
 * overlay is absolutely positioned at the document origin, so he stays
 * attached to a surface as it scrolls rather than being pinned to the viewport.
 *
 * Movement is driven by elapsed time in an animation frame, so translation is
 * smooth and independent of sprite timing. Geometry is rebuilt only on layout
 * changes, never per frame.
 *
 * He only ever travels within one surface, or across surfaces that genuinely
 * touch, because climbing frames do not exist yet. He never teleports between
 * disconnected surfaces.
 */
/**
 * The perch above the surname.
 *
 * Only the top of the figure is shown, by clipping with `overflow: hidden`.
 * Nothing is painted behind him, so the letters and the page background show
 * through unchanged in both themes, and ducking away is the clip closing
 * rather than a rectangle covering him up.
 */
function HeaderPerch({
  box,
  origin,
  isDesktop,
  state,
  bubble,
}: {
  /** The surname's own rect, in DOCUMENT coordinates. */
  box: { left: number; top: number; width: number };
  /** Document position of the overlay this is drawn inside. */
  origin: { x: number; y: number };
  isDesktop: boolean;
  state: CompanionState;
  bubble: boolean;
}) {
  // Solve the sprite size from the visible character width rather than the
  // other way round, so he measures the same against the letters at any size.
  const targetWidth = isDesktop ? HEADER_PEEK.targetWidth.desktop : HEADER_PEEK.targetWidth.mobile;
  const scale = targetWidth / HEADER_PEEK.drawnWidth;
  const spriteHeight = Math.round(spriteCanvas.height * scale);
  const spriteWidth = Math.round(spriteCanvas.width * scale);
  // Drawn figure occupies the lower 87% of the canvas; the transparent band
  // above it must be cropped away, not counted as part of him.
  const padTop = spriteHeight * 0.13;
  const drawnHeight = spriteHeight - padTop;
  const visible = Math.round(drawnHeight * HEADER_PEEK.visibleFraction);
  /**
   * Centred over the back half of the surname, then converted out of document
   * space into the overlay's own.
   *
   * The overlay is `absolute`, so its coordinates are relative to whichever
   * ancestor happens to be positioned. Writing a document coordinate straight
   * into `left` only works while that ancestor is the document itself, and it
   * silently adds the ancestor's offset twice the moment anything above gains
   * `position: relative`. Subtracting the overlay's own origin makes the
   * placement correct under any wrapper.
   */
  const left = Math.round(box.left + box.width * 0.66 - spriteWidth / 2 - origin.x);
  const top = Math.round(box.top - visible - origin.y);

  return (
    <div className="absolute" style={{ left, top, width: spriteWidth }}>
      {/*
        Bubble beside him rather than above: over the head it was clipped by
        the top of the viewport on a phone. To his left also keeps it clear of
        the theme toggle in the top right.
      */}
      {bubble ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-full top-1/2 mr-1 -translate-y-1/2 whitespace-nowrap rounded-full bg-surface px-2 py-0.5 text-[10.5px] font-medium leading-none text-text shadow-card ring-1 ring-border"
        >
          Hi!
        </span>
      ) : null}
      {/* Clipped to the upper body. Nothing is painted behind him, so the page
          shows through in both themes and the cut lands at the letters. */}
      <div className="overflow-hidden" style={{ height: visible }}>
        <div style={{ marginTop: -padTop }}>
          <CompanionSprite state={state} height={spriteHeight} preloadStates={ROAMING_STATES} />
        </div>
      </div>
    </div>
  );
}

export default function SiteCompanion() {
  const pathname = usePathname();
  const { reducedMotion, tabVisible, overlayOpen } = useCompanionSuspension();

  const rootRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [graph, setGraph] = useState<SurfaceGraph>({
    surfaces: [],
    edges: new Map(),
    climbs: [],
    rejectedClimbs: [],
    blocked: [],
    obstacles: [],
    pinnedObstacles: [],
  });
  /**
   * Where the overlay itself sits, in document coordinates.
   *
   * Everything the character knows about the page is measured in document
   * space, but it is drawn inside an absolutely positioned overlay, so those
   * coordinates have to be converted before they are used as `left`/`top`.
   * Kept as state as well as a ref because the perch is rendered by React and
   * has to move when this changes; kept as a ref because `place` reads it from
   * an animation frame.
   */
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const originRef = useRef(origin);
  const [current, setCurrent] = useState(-1);
  const [onScreen, setOnScreen] = useState(true);
  const [debug, setDebug] = useState(false);

  const [phase, setPhase] = useState<Phase>("surface");
  const [state, setState] = useState<CompanionState>("idle");
  const [facing, setFacing] = useState<1 | -1>(1);
  const [bubble, setBubble] = useState(false);
  const [bubbleSide, setBubbleSide] = useState<"left" | "right">("right");
  /** Mirrors climbFrameRef for rendering; only set while a climb is running. */
  const [climbFrame, setClimbFrame] = useState<number | undefined>(undefined);

  /**
   * Header perch. One controller drives both placements, so there is never a
   * second timer chain or a second visible character.
   */
  const [headerBox, setHeaderBox] = useState<{ left: number; top: number; width: number } | null>(null);
  /**
   * True until the opening perch has played this session. The behaviour loop
   * normally waits for him to be on screen, but the introduction happens at
   * the header, so it must be allowed to start even when his roaming spawn
   * surface is out of view.
   */
  /**
   * Whether the greeting has already played this visit. Driven by a hysteresis
   * threshold below, so a few pixels of header scrolling past cannot make him
   * say hello again.
   */
  const [headerGreeted, setHeaderGreeted] = useState(false);
  /** Whether the surname is actually on screen, for suspension and greeting. */
  const [headerInView, setHeaderInView] = useState(false);
  /** Mirrors the travel target so the debug view can draw it without reading a ref in render. */
  const [debugTarget, setDebugTarget] = useState<number | null>(null);

  const size = isDesktop ? SIZES.companionDesktop : SIZES.companionMobile;
  const setPose = useCallback((next: CompanionState) => {
    stateRef.current = next;
    setState(next);
  }, []);
  const charWidth = Math.round((spriteCanvas.width / spriteCanvas.height) * size);

  const xRef = useRef(0);
  const currentRef = useRef(-1);
  const graphRef = useRef(graph);
  const targetRef = useRef<number | null>(null);
  const lastGreetRef = useRef(-GREET_GAP_MS);
  const lastKindRef = useRef<Activity["kind"] | null>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const rafRef = useRef<number | undefined>(undefined);
  /** Runs once when a walk reaches its target, used to start a climb. */
  const onArriveRef = useRef<(() => void) | null>(null);
  /**
   * Which way the reader is travelling, as an influence on where he chooses to
   * go next. It never moves him directly: scrolling is viewport motion, and
   * treating it as physical movement would read as falling or climbing that
   * never happened.
   */
  const scrollIntentRef = useRef<"up" | "down" | null>(null);
  /** Live document y of the contact point while climbing; null when standing. */
  const climbYRef = useRef<number | null>(null);
  /** Frame the climb runner is showing, so its anchor can position the body. */
  const climbFrameRef = useRef<number | null>(null);
  /** Document x of the edge being gripped, and which side of it he hangs on. */
  const climbEdgeRef = useRef(0);
  const climbSideRef = useRef<"left" | "right">("left");
  /**
   * The gait of the journey in progress. Held in a ref because the movement
   * loop deliberately does not restart when React state changes, so reading
   * `state` there would give a stale value and run at walking speed.
   */
  const gaitRef = useRef<"walk" | "run">("walk");
  /** Where the current journey started, for the acceleration ramp. */
  const travelStartRef = useRef(0);
  /** Current pose, readable from the movement loop without stale closures. */
  const stateRef = useRef<CompanionState>("idle");

  /* ---- falling and the ground ---------------------------------------
   *
   * Two coordinate spaces, never mixed. `modeRef` says which one is live:
   *
   *   doc       xRef is a document x and the surface baseline is the floor.
   *   viewport  viewXRef and feetYRef are viewport coordinates, the sprite is
   *             positioned `fixed`, and scrolling moves the page underneath
   *             him without moving him at all.
   *
   * The two conversions are in `releaseToViewport` and `returnToSurface`, and
   * both preserve the pixels on screen, so the handover is never a visible
   * jump. Scroll displacement is never added to `fallVRef`.
   */
  const phaseRef = useRef<Phase>("surface");
  const modeRef = useRef<"doc" | "viewport">("doc");
  /** Viewport x of the character's centre while in viewport mode. */
  const viewXRef = useRef(0);
  /** Viewport y of his feet while in viewport mode. */
  const feetYRef = useRef(0);
  /** Downward speed, px per second. Physical only: never a scroll delta. */
  const fallVRef = useRef(0);
  /** Where a pending fall will release from, chosen before he sets off. */
  const fallPlanRef = useRef<{ viewX: number; docX: number } | null>(null);
  /** `env(safe-area-inset-bottom)`, measured rather than assumed. */
  const safeBottomRef = useRef(0);
  /** Latest trigger functions, so the scroll listener never restarts. */
  const beginFallRef = useRef<() => boolean>(() => false);
  const leaveGroundRef = useRef<() => boolean>(() => false);
  /** Set by an upward gesture: he should look for a way back up. */
  const climbWantedRef = useRef(false);
  /** How long that request stays live, so a slow scroll still finds a surface. */
  const climbUntilRef = useRef(0);
  /** Lets the gesture listener nudge the ground loop without waiting on it. */
  const groundWakeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Mirrored into a ref so the scroll listener can read the live phase without
  // being torn down and rebuilt every time it changes.
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  /**
   * Measures `env(safe-area-inset-bottom)` instead of assuming it is zero, so
   * the landing clears the home indicator on a phone. A throwaway probe is the
   * only way to read an env() value from script.
   */
  useEffect(() => {
    if (!mounted) return;
    const measure = () => {
      const probe = document.createElement("div");
      probe.setAttribute("aria-hidden", "true");
      probe.style.cssText =
        "position:fixed;left:-9999px;bottom:0;width:0;pointer-events:none;height:env(safe-area-inset-bottom,0px)";
      document.body.appendChild(probe);
      safeBottomRef.current = probe.getBoundingClientRect().height || 0;
      probe.remove();
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [mounted]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const frame = window.requestAnimationFrame(() => {
      setDebug(new URLSearchParams(window.location.search).get("companionDebug") === "1");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 640px)");
    const sync = () => setIsDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Stand down while the About figure is on screen, so only one is visible.
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(ABOUT_CHARACTER_ID);
      if (!target) {
        setAboutVisible(false);
        return;
      }
      observer = new IntersectionObserver(([entry]) => setAboutVisible(entry.isIntersecting), {
        rootMargin: "60px",
      });
      observer.observe(target);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [pathname, mounted]);

  /**
   * The ground line: the viewport y his feet come to rest on.
   *
   * Read from the window every time rather than cached, so a rotation or a
   * resized window moves it immediately, and measured against the real safe
   * area inset rather than assuming zero.
   */
  const groundY = useCallback(
    () => window.innerHeight - safeBottomRef.current - GROUND_MARGIN,
    []
  );

  /** The viewport column his drawn body occupies at a given centre x. */
  const columnAt = useCallback(
    (viewX: number): Column => {
      // The canvas is padded for the cricket bat and the barbell, so the drawn
      // figure is much narrower than the sprite box. Testing a margin against
      // the padded width rejected corridors he clears easily.
      const half = (charWidth * DRAWN_WIDTH_RATIO) / 2 + FALL_SIDE_BUFFER;
      return { left: viewX - half, right: viewX + half };
    },
    [charWidth]
  );

  const place = useCallback(() => {
    const node = spriteRef.current;
    if (!node) return;

    if (modeRef.current === "viewport") {
      /**
       * Viewport space. `fixed` is the coordinate handover made explicit: the
       * element is taken out of the document flow, so the same transform keeps
       * him still while the page scrolls past. Nothing below this line reads a
       * surface or a document coordinate.
       */
      node.style.position = "fixed";
      const left = Math.round(viewXRef.current - charWidth / 2);
      const top = Math.round(feetYRef.current - size);
      node.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      return;
    }
    node.style.position = "absolute";

    const surface = graphRef.current.surfaces[currentRef.current];
    if (!surface) return;

    // Document space in, overlay space out. See `originRef`.
    const origin = originRef.current;
    // While climbing, the live vertical position wins. Climb frames hang from
    // the hands rather than standing, so they are anchored by CLIMB_HAND_ANCHOR
    // instead of the standing baseline.
    const climbing = climbYRef.current;
    const scale = size / spriteCanvas.height;
    let y: number;
    let left: number;

    if (climbing === null || Number.isNaN(climbing)) {
      y = surface.baseline - size;
      left = xRef.current - charWidth / 2;
    } else {
      // Both contact points come from the showing frame, so the gripping hand
      // sits on the real edge and the body hangs outside the container rather
      // than the sprite being centred on an imaginary line.
      const seq = sequenceFor(stateRef.current);
      const frame = seq.frames[Math.min(climbFrameRef.current ?? 0, seq.frames.length - 1)];
      const anchorY = frame ? anchorFor(frame) : spriteCanvas.baselineY;
      y = climbing - anchorY * scale;

      if (frame?.anchorX === undefined) {
        // A pose with no gripping hand, such as the landing frames. Centring
        // it on the edge would push half his body inside the container, so it
        // is placed wholly on the corridor side instead.
        left = climbSideRef.current === "right" ? climbEdgeRef.current : climbEdgeRef.current - charWidth;
      } else {
        // The art faces right. On a right-hand edge it is mirrored, so the
        // hand measured at anchorX appears at (canvasWidth - anchorX).
        const anchorX = anchorXFor(frame);
        const mirrored = climbSideRef.current === "right";
        const handOffset = mirrored
          ? (spriteCanvas.width - anchorX) * scale
          : anchorX * scale;
        left = climbEdgeRef.current - handOffset;

        /**
         * Then clamp so the drawn body never crosses the edge into the
         * container. The art puts the gripping hand inside the sprite rather
         * than at its outline, so placing the hand exactly on the border let
         * his shoulder overlap the card by about 16px. Contact gives way to
         * clearance: the hand sits as close to the edge as the pose allows.
         */
        const bodyRight = frame.bodyRight ?? spriteCanvas.width;
        if (mirrored) {
          // Container is to his left, so his drawn left edge must not pass it.
          const drawnLeftOffset = (spriteCanvas.width - bodyRight) * scale;
          left = Math.max(left, climbEdgeRef.current - drawnLeftOffset);
        } else {
          // Container is to his right, so his drawn right edge must not pass it.
          const drawnRightOffset = bodyRight * scale;
          left = Math.min(left, climbEdgeRef.current - drawnRightOffset);
        }
      }
    }
    node.style.transform =
      `translate3d(${Math.round(left - origin.x)}px, ${Math.round(y - origin.y)}px, 0)`;
  }, [charWidth, size]);

  /**
   * Rebuilds the surface graph. Called on layout changes only: resize, fonts
   * and images finishing, route changes and DOM mutations, never per frame.
   */
  /**
   * Tracks whether the surname is on screen. Drives both suspension of the
   * perch animation and when the greeting is allowed to play, so he never
   * says hello to an empty viewport.
   */
  useEffect(() => {
    if (!mounted) return;
    let observer: IntersectionObserver | null = null;
    const frame = window.requestAnimationFrame(() => {
      const node = document.querySelector<HTMLElement>("[data-companion-home]");
      if (!node) {
        setHeaderInView(false);
        return;
      }
      observer = new IntersectionObserver(([entry]) => setHeaderInView(entry.isIntersecting), {
        rootMargin: "0px",
      });
      observer.observe(node);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [mounted, pathname]);

  /**
   * Resets the greeting only once the header is comfortably out of view, so
   * scrolling it a few pixels past the edge cannot retrigger it.
   */
  useEffect(() => {
    if (!mounted) return;
    let timer: number | undefined;
    const check = () => {
      const node = document.querySelector<HTMLElement>("[data-companion-home]");
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const wellBelow = rect.top > window.innerHeight + 160;
      const wellAbove = rect.bottom < -160;
      if (wellBelow || wellAbove) setHeaderGreeted(false);
    };
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(check, 160);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", schedule);
    };
  }, [mounted]);

  /** Surname geometry in document coordinates, measured with the rest. */
  const measureHeader = useCallback(() => {
    const node = document.querySelector<HTMLElement>("[data-companion-home]");
    if (!node) {
      setHeaderBox(null);
      return;
    }
    const rect = node.getBoundingClientRect();
    if (rect.width <= 0) {
      setHeaderBox(null);
      return;
    }
    setHeaderBox({
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      width: rect.width,
    });
  }, []);

  /**
   * Reads the overlay's own document position, so document coordinates can be
   * converted into its local space. Measured with the rest of the geometry, on
   * layout changes only.
   */
  const measureOrigin = useCallback(() => {
    const node = rootRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const next = {
      x: Math.round(rect.left + window.scrollX),
      y: Math.round(rect.top + window.scrollY),
    };
    if (next.x === originRef.current.x && next.y === originRef.current.y) return;
    originRef.current = next;
    setOrigin(next);
  }, []);

  const rebuild = useCallback(() => {
    // Before anything else: every measurement below is converted against it.
    measureOrigin();
    measureHeader();
    const next = buildGraph({
      charWidth,
      charHeight: size,
      ignore: rootRef.current,
      climbing: CLIMBING_ENABLED,
    });
    graphRef.current = next;
    setGraph(next);

    if (next.surfaces.length === 0) {
      currentRef.current = -1;
      setCurrent(-1);
      return;
    }

    // Keep the surface he is on if it still exists and still holds him.
    const existing = next.surfaces.findIndex(
      (s) => s.id === graphRef.current.surfaces[currentRef.current]?.id
    );
    let index = currentRef.current >= 0 && existing >= 0 ? existing : -1;
    if (index < 0 || !next.surfaces[index]) index = bestSpawn(next);

    const surface = next.surfaces[index];
    currentRef.current = index;
    setCurrent(index);
    if (xRef.current < surface.start || xRef.current > surface.end) {
      xRef.current = surface.start + Math.min(60, surfaceWidth(surface) / 2);
    }
    place();
  }, [charWidth, size, place, measureHeader, measureOrigin]);

  // Route change: drop stale surfaces, come back to document space, and find
  // a fresh spawn. Leaving him grounded across a navigation would strand him
  // at the bottom of a page whose geometry he never measured.
  useEffect(() => {
    if (!mounted) return;
    currentRef.current = -1;
    xRef.current = 0;
    modeRef.current = "doc";
    fallVRef.current = 0;
    fallPlanRef.current = null;
    climbWantedRef.current = false;
    // The ref is the one the loops read, so it flips now; the state follows in
    // the same frame as the rebuild rather than synchronously in the effect.
    phaseRef.current = "surface";
    const frame = window.requestAnimationFrame(() => {
      setPhase("surface");
      rebuild();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, mounted, rebuild]);

  // Layout watchers, all debounced so nothing measures on a hot path.
  useEffect(() => {
    if (!mounted) return;
    let timer: number | undefined;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(rebuild, 180);
    };
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    document.fonts?.ready.then(schedule).catch(() => {});
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", schedule);
      observer.disconnect();
    };
  }, [mounted, rebuild]);

  /**
   * Accumulates scroll distance and only commits to a direction past a
   * threshold, so a nudge on a trackpad cannot keep flipping his intent. Rapid
   * events coalesce into the latest intent rather than queueing actions, and
   * the intent decays once scrolling stops.
   */
  useEffect(() => {
    if (!mounted) return;
    let accumulated = 0;
    let lastY = window.scrollY;
    let decay: number | undefined;
    const THRESHOLD = 140;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      // A reversal restarts the tally rather than fighting the previous one.
      if (Math.sign(delta) !== Math.sign(accumulated)) accumulated = 0;
      accumulated += delta;
      if (Math.abs(accumulated) >= THRESHOLD) {
        scrollIntentRef.current = accumulated > 0 ? "down" : "up";
        accumulated = 0;
      }
      window.clearTimeout(decay);
      // Held a little past the last scroll event, so the intent is still
      // current when he next reaches a safe point and picks a destination.
      // At 1400ms it expired in the gaps between ordinary scroll steps and
      // almost never reached a decision.
      decay = window.setTimeout(() => {
        scrollIntentRef.current = null;
        accumulated = 0;
      }, 2600);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(decay);
      window.removeEventListener("scroll", onScroll);
    };
  }, [mounted]);

  /**
   * Only animate while he is actually in view. Position is left alone, so he
   * stays attached to his surface instead of snapping back on scroll.
   *
   * Coalesced into an animation frame rather than debounced behind a trailing
   * timeout. A trailing timeout never fires during a continuous scroll,
   * because every event pushes it further out, so he stayed suspended for the
   * whole gesture and a fall could not be triggered by the very scrolling that
   * is supposed to cause one. The check itself only reads cached geometry and
   * `window`, so running it per frame measures nothing.
   */
  useEffect(() => {
    if (!mounted) return;
    let queued = false;
    let frame: number | undefined;
    const check = () => {
      // In viewport mode he is on screen by construction, and recomputing this
      // from a surface he has left would fade him out mid fall.
      if (modeRef.current === "viewport") {
        setOnScreen(true);
        return;
      }
      const surface = graphRef.current.surfaces[currentRef.current];
      if (!surface) return;
      const top = surface.baseline - size;
      const visible = top < window.scrollY + window.innerHeight + 80 && surface.baseline > window.scrollY - 80;
      setOnScreen(visible);
    };
    const schedule = () => {
      if (queued) return;
      queued = true;
      frame = window.requestAnimationFrame(() => {
        queued = false;
        check();
      });
    };
    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [mounted, size, current]);

  // Kept in a ref so the behaviour loop can read the latest geometry without
  // restarting. Synced in an effect, never written during render.
  const headerBoxRef = useRef(headerBox);
  useEffect(() => {
    headerBoxRef.current = headerBox;
  }, [headerBox]);

  const hasSurface = current >= 0;
  /**
   * One explicit placement policy, decided by where the visitor is:
   *
   *   Home                          header only, never roaming
   *   About with the figure in view  About figure only
   *   anywhere else                  roaming only
   *
   * Exactly one branch renders, so there is never a second character and no
   * condition is layered on top of an older transition.
   */
  const isHome = pathname === "/";
  const atHeader = isHome && headerBox !== null && !aboutVisible;
  /**
   * Off the document surfaces entirely. Home never reaches this, because the
   * fall is only ever triggered from the roaming placement, and the perch is
   * not a roaming placement.
   */
  const offSurface = phase !== "surface";
  const hidden = aboutVisible || (isHome && !atHeader) || (!isHome && !hasSurface && !offSurface);
  const running =
    mounted &&
    !reducedMotion &&
    tabVisible &&
    !overlayOpen &&
    !hidden &&
    (onScreen || atHeader || offSurface);

  // The sprite unmounts while the About figure is on screen, so it has to be
  // positioned again when it comes back rather than painting at the origin.
  useEffect(() => {
    if (hidden) return;
    const frame = window.requestAnimationFrame(place);
    return () => window.cancelAnimationFrame(frame);
  }, [hidden, place, current]);

  // After a long spell off screen, come back on a surface near the reader.
  // Deliberately slow and faded: this is a re-entry, never a jump mid journey.
  useEffect(() => {
    if (!mounted || onScreen || hidden) return;
    const timer = window.setTimeout(() => {
      currentRef.current = -1;
      rebuild();
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [mounted, onScreen, hidden, rebuild]);

  /**
   * The perch's own behaviour.
   *
   * Greets once when the header first becomes properly visible in this visit,
   * then settles into idle blinking with an infrequent wave. It never leaves
   * the name, so there are no departure timers, cooldowns or reappearances.
   */
  useEffect(() => {
    // Suspended while the header is off screen: no frames, no timers.
    if (!atHeader || !headerInView || reducedMotion || !tabVisible || overlayOpen) return;
    let cancelled = false;
    let timer: number | undefined;

    const queue = (ms: number, fn: () => void) => {
      timer = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const idleLoop = () => {
      if (cancelled) return;
      setPose(HEADER_PEEK.idleState);
      queue(randomBetween(HEADER_WAVE_GAP.min, HEADER_WAVE_GAP.max), () => {
        setPose(HEADER_PEEK.waveState);
        queue(sequenceDuration(HEADER_PEEK.waveState) + 300, idleLoop);
      });
    };

    // Scheduled rather than called, so nothing sets state synchronously
    // inside the effect body.
    queue(headerGreeted ? 0 : 260, () => {
      if (headerGreeted) {
        idleLoop();
        return;
      }
      setHeaderGreeted(true);
      setPose(HEADER_PEEK.waveState);
      setBubble(true);
      queue(HEADER_BUBBLE_MS, () => {
        setBubble(false);
        idleLoop();
      });
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [atHeader, headerInView, headerGreeted, reducedMotion, tabVisible, overlayOpen, setPose]);

  /* ---------------- behaviour ---------------- */
  useEffect(() => {
    // Home is the perch's territory; the roaming loop stays out of it, and so
    // does everything off the document surfaces: the fall and the ground each
    // have their own loop below, and only one of the three ever runs.
    if (!running || atHeader || phase !== "surface") return;
    let cancelled = false;

    const showBubble = () => {
      const surface = graphRef.current.surfaces[currentRef.current];
      const viewportX = xRef.current - window.scrollX;
      setBubbleSide(viewportX > window.innerWidth * 0.72 || (surface && xRef.current > surface.end - 80) ? "left" : "right");
      setBubble(true);
    };

    const schedule = (ms: number) => {
      timerRef.current = window.setTimeout(begin, ms);
    };

    const finishTravel = () => {
      targetRef.current = null;
      if (debug) setDebugTarget(null);
      setPose("idle");
      schedule(300);
    };

    const step = (now: number, previous: number) => {
      if (cancelled) return;
      const target = targetRef.current;
      const surface = graphRef.current.surfaces[currentRef.current];
      if (target === null || !surface) return;

      const dt = Math.min(64, now - previous) / 1000;
      const cruise = gaitRef.current === "run" ? SPEED.run : strideMatchedSpeed(size);

      /**
       * Ease in and out of a journey instead of snapping to full speed and
       * stopping dead. The ramp is a fraction of the trip, so a short hop is
       * still mostly cruise rather than all acceleration.
       */
      const total = Math.abs(target - travelStartRef.current) || 1;
      const covered = Math.abs(xRef.current - travelStartRef.current);
      const remaining = Math.max(0, total - covered);
      const ramp = Math.min(28, total * 0.28);
      const easeIn = ramp > 0 ? Math.min(1, covered / ramp) : 1;
      const easeOut = ramp > 0 ? Math.min(1, remaining / ramp) : 1;
      const speed = cruise * (0.35 + 0.65 * Math.min(easeIn, easeOut));
      const direction = target > xRef.current ? 1 : -1;
      let next = xRef.current + direction * speed * dt;

      const run = walkableSpan(graphRef.current, currentRef.current);
      if (next < run.start || next > run.end) {
        next = Math.min(Math.max(next, run.start), run.end);
        xRef.current = next;
        place();
        finishTravel();
        return;
      }

      const arrived = direction > 0 ? next >= target : next <= target;
      xRef.current = arrived ? target : next;
      place();
      if (arrived) {
        const onArrive = onArriveRef.current;
        onArriveRef.current = null;
        if (onArrive) {
          targetRef.current = null;
          onArrive();
          return;
        }
        finishTravel();
        return;
      }
      rafRef.current = window.requestAnimationFrame((t) => step(t, now));
    };

    /**
     * Walks to the corridor, then plays the climb phases while the character
     * is carried vertically by the climbing cycle itself.
     *
     * Unreachable while `CLIMBING_ENABLED` is false, and written out in full so
     * the only thing missing when frames arrive is the artwork.
     */
    function beginClimb(edge: {
      from: number; to: number; x: number; side: "left" | "right"; bottom: number; top: number;
    }) {
      const goingUp = currentRef.current === edge.from;
      if (!goingUp && !DESCENT_ENABLED) {
        setPose("idle");
        schedule(1400);
        return;
      }
      const targetSurface = goingUp ? edge.to : edge.from;

      climbEdgeRef.current = edge.x;
      climbSideRef.current = edge.side;
      // Mirrored on a right-hand edge so he faces the wall he is holding.
      setFacing(edge.side === "right" ? -1 : 1);
      // Walk to the spot in the corridor beside the edge, not onto it.
      const approach = edge.side === "left" ? edge.x - charWidth * 0.5 : edge.x + charWidth * 0.5;
      targetRef.current = approach;
      gaitRef.current = "walk";
      travelStartRef.current = xRef.current;
      setPose("walk");

      /** Plays one sequence frame by frame, positioning by each frame's anchor. */
      const playSequence = (
        pose: CompanionState,
        opts: { loop?: boolean; onFrame?: (i: number) => void; onDone?: () => void }
      ) => {
        const seq = sequenceFor(pose);
        setPose(pose);
        let i = 0;
        const show = () => {
          if (cancelled) return;
          climbFrameRef.current = i;
          setClimbFrame(i);
          opts.onFrame?.(i);
          place();
          const hold = seq.frames[i]?.ms ?? 200;
          timerRef.current = window.setTimeout(() => {
            if (cancelled) return;
            i += 1;
            if (i >= seq.frames.length) {
              if (opts.loop) { i = 0; show(); return; }
              opts.onDone?.();
              return;
            }
            show();
          }, hold);
        };
        show();
      };

      // walk -> stop -> reach -> climb -> pull up -> stand -> walk
      const atEdge = () => {
        if (cancelled) return;
        targetRef.current = null;
        setPose("idle");
        timerRef.current = window.setTimeout(() => {
          if (cancelled) return;
          // The reach starts from the surface, so the contact point begins at
          // the baseline and only becomes the hand once he takes hold.
          climbYRef.current = goingUp ? edge.bottom : edge.top;
          if (goingUp) playSequence("climbReach", { onDone: ascend });
          else descend();
        }, 240);
      };

      const ascend = () => {
        if (cancelled) return;
        const startY = edge.bottom;
        const distance = Math.abs(edge.top - startY);
        const durationMs = (distance / CLIMB_SPEED) * 1000;
        const t0 = performance.now();
        let done = false;

        playSequence("climbLoop", { loop: true });
        const rise = (now: number) => {
          if (cancelled || done) return;
          const progress = Math.min(1, (now - t0) / durationMs);
          climbYRef.current = startY + (edge.top - startY) * progress;
          place();
          if (progress < 1) { rafRef.current = window.requestAnimationFrame(rise); return; }
          done = true;
          window.clearTimeout(timerRef.current);
          playSequence("climbPullUp", { onDone: land });
        };
        rafRef.current = window.requestAnimationFrame(rise);
      };

      const descend = () => {
        if (cancelled) return;
        const startY = edge.top;
        const distance = Math.abs(edge.bottom - startY);
        const durationMs = (distance / CLIMB_SPEED) * 1000;
        const t0 = performance.now();
        let done = false;

        playSequence("climbDown", { loop: true });
        const drop = (now: number) => {
          if (cancelled || done) return;
          const progress = Math.min(1, (now - t0) / durationMs);
          climbYRef.current = startY + (edge.bottom - startY) * progress;
          place();
          if (progress < 1) { rafRef.current = window.requestAnimationFrame(drop); return; }
          done = true;
          window.clearTimeout(timerRef.current);
          land();
        };
        rafRef.current = window.requestAnimationFrame(drop);
      };

      const land = () => {
        if (cancelled) return;
        currentRef.current = targetSurface;
        setCurrent(targetSurface);
        climbYRef.current = null;
        climbFrameRef.current = null;
        setClimbFrame(undefined);
        setPose("idle");
        place();
        schedule(900);
      };

      onArriveRef.current = atEdge;
      timerRef.current = window.setTimeout(() => {
        if (cancelled) return;
        rafRef.current = window.requestAnimationFrame((t) => step(t, t));
      }, 140);
    }

    function begin() {
      if (cancelled) return;

      const surface = graphRef.current.surfaces[currentRef.current];
      if (!surface) {
        schedule(1200);
        return;
      }
      place();
      // Travel across the whole contiguous run, not just this fragment.
      const span = walkableSpan(graphRef.current, currentRef.current);
      const room = Math.max(span.end - span.start - 8, 0);

      // Climbs leaving this surface. Only ones the reader can actually see are
      // offered: a climb that happens entirely above or below the viewport is
      // work nobody witnesses, which is what made the feature look broken.
      const viewTop = window.scrollY;
      const viewBottom = viewTop + window.innerHeight;
      const reachable = CLIMBING_ENABLED
        ? graphRef.current.climbs
            .map((c, i) => ({ c, i }))
            .filter(({ c }) => c.from === currentRef.current || c.to === currentRef.current)
            .filter(({ c }) => c.top < viewBottom - 20 && c.bottom > viewTop + 20)
        : [];

      // Scrolling influences which destination he picks, never his position.
      // Reading downward encourages a move to a lower surface, reading upward
      // encourages a climb. The choice is only consulted here, at a safe point
      // between actions, so nothing is interrupted half way through.
      const intent = scrollIntentRef.current;
      const preferred = reachable.filter(({ c }) =>
        intent === "up"
          ? c.from === currentRef.current
          : intent === "down"
            ? c.to === currentRef.current
            : true
      );
      const climbOptions = (preferred.length > 0 ? preferred : reachable).map(({ i }) => i);

      const activity = nextActivity({
        sinceLastGreetMs: performance.now() - lastGreetRef.current,
        lastKind: lastKindRef.current,
        roomAvailable: room,
        climbOptions,
      });
      lastKindRef.current = activity.kind;

      if (activity.kind === "greet") {
        lastGreetRef.current = performance.now();
        setPose("wave");
        showBubble();
        timerRef.current = window.setTimeout(() => {
          if (cancelled) return;
          setBubble(false);
          setPose("idle");
          schedule(700);
        }, sequenceDuration("wave") + 500);
        return;
      }

      if (activity.kind === "climb") {
        // Reached only when climbing is enabled, which requires validated
        // artwork. Walk to the corridor, then hand over to the climb phases.
        const edge = graphRef.current.climbs[activity.edge];
        if (!edge) {
          setPose("idle");
          schedule(1200);
          return;
        }
        beginClimb(edge);
        return;
      }

      if (activity.kind === "rest" || room < MIN_TRIP) {
        setPose("idle");
        schedule(activity.kind === "rest" ? activity.ms : 1600);
        return;
      }

      const spaceRight = span.end - xRef.current;
      const spaceLeft = xRef.current - span.start;
      let direction: 1 | -1 = spaceRight >= spaceLeft ? 1 : -1;
      let distance = Math.min(activity.distance, direction > 0 ? spaceRight : spaceLeft);
      if (distance < MIN_TRIP) {
        direction = (direction * -1) as 1 | -1;
        distance = Math.min(activity.distance, direction > 0 ? spaceRight : spaceLeft);
      }
      if (distance < MIN_TRIP) {
        setPose("idle");
        schedule(1700);
        return;
      }

      setFacing(direction);
      targetRef.current = xRef.current + direction * distance;
      if (debug) setDebugTarget(targetRef.current);
      gaitRef.current = activity.state;
      travelStartRef.current = xRef.current;
      setPose(activity.state);
      // A beat between turning and setting off, so it is never a snap.
      timerRef.current = window.setTimeout(() => {
        if (cancelled) return;
        rafRef.current = window.requestAnimationFrame((t) => step(t, t));
      }, 140);
    }

    let firstGreeting = false;
    try {
      if (!sessionStorage.getItem(GREETED_KEY)) {
        sessionStorage.setItem(GREETED_KEY, "1");
        firstGreeting = true;
      }
    } catch {
      // sessionStorage may be unavailable; the greeting is optional.
    }

    const kickoff = window.setTimeout(() => {
      if (cancelled) return;

      if (!firstGreeting) {
        begin();
        return;
      }
      lastGreetRef.current = performance.now();
      setPose("wave");
      showBubble();
      timerRef.current = window.setTimeout(() => {
        if (cancelled) return;
        setBubble(false);
        setPose("idle");
        schedule(400);
      }, 1900);
    }, firstGreeting ? 250 : 700);

    return () => {
      cancelled = true;
      window.clearTimeout(kickoff);
      window.clearTimeout(timerRef.current);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
    // `state` is deliberately not a dependency: it changes constantly, and
    // restarting the loop on every pose would cancel journeys midway. The
    // movement loop reads the gait from `gaitRef` instead.
  }, [running, atHeader, phase, size, charWidth, place, debug, setPose]);

  /* ---------------- leaving a surface ---------------- */

  /**
   * Whether a downward gesture can become a fall, and where he lets go from.
   *
   * Held in a ref rather than wired straight into the scroll listener, so the
   * listener is attached once and never rebuilt as state changes underneath
   * it. Returns true only when a fall actually started, which is what makes
   * one gesture produce one fall.
   */
  useEffect(() => {
    // Only ever called with ?companionDebug=1 in a development build. Knowing
    // *why* a fall did not happen is most of the work of tuning one.
    const refuse = (reason: string) => {
      if (debug) {
        const at = graphRef.current.surfaces[currentRef.current];
        console.debug(
          `[mini-anish] no fall: ${reason} sy=${Math.round(window.scrollY)} ` +
            `surface=${at ? at.id : "none"}@${at ? Math.round(at.baseline) : "-"}`
        );
      }
      return false;
    };

    beginFallRef.current = () => {
      if (!FALL_ENABLED) return false;
      // Home is the perch, and the About figure owns the screen while visible.
      if (!running || atHeader || isHome) return refuse("suspended");
      if (phaseRef.current !== "surface") return refuse(`phase ${phaseRef.current}`);
      // Mid climb: let the climb finish rather than dropping him off an edge
      // he is holding.
      if (climbYRef.current !== null) return refuse("mid climb");

      const graph = graphRef.current;
      const surface = graph.surfaces[currentRef.current];
      if (!surface) return refuse("not standing on a surface");

      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      const feet = surface.baseline - scrollY;
      const ground = groundY();
      const drop = ground - feet;
      // Already at the bottom of the window, or too far up to be worth it.
      if (drop < MIN_DROP || drop > MAX_DROP) return refuse(`drop ${Math.round(drop)}px`);
      if (feet < 8) return refuse("above the window");

      const span = walkableSpan(graph, currentRef.current);
      const here = xRef.current - scrollX;

      /**
       * Where he already stands first, then outward in small steps. The first
       * clear corridor wins, so he takes the margin nearest to him rather than
       * crossing the page. If nothing within reach has a clear drop and a
       * clear landing, there is no fall: this is the case that leaves him on
       * the surface instead of sending him through the text.
       */
      const candidates = [here];
      for (let offset = 20; offset <= FALL_APPROACH_MAX; offset += 20) {
        candidates.push(here - offset, here + offset);
      }

      for (const viewX of candidates) {
        const docX = viewX + scrollX;
        if (docX < span.start || docX > span.end) continue;
        const column = columnAt(viewX);
        if (column.left < 2 || column.right > window.innerWidth - 2) continue;
        if (!fallCorridorClear(graph, column, feet, ground, size, scrollY)) continue;
        fallPlanRef.current = { viewX, docX };
        setPhase("falling");
        return true;
      }
      return refuse(
        `no clear margin within reach of x=${Math.round(here)} on span ` +
          `${Math.round(span.start - scrollX)}..${Math.round(span.end - scrollX)}`
      );
    };
  }, [running, atHeader, isHome, size, groundY, columnAt, debug]);

  /** An upward gesture asks him to leave the ground; the ground loop acts. */
  useEffect(() => {
    leaveGroundRef.current = () => {
      if (phaseRef.current !== "grounded" || !running) return false;
      climbWantedRef.current = true;
      // Held open rather than answered once. Scrolling up moves the page down
      // past him, so the surface he can take usually arrives a moment after
      // the gesture rather than at it.
      climbUntilRef.current = performance.now() + CLIMB_WANT_MS;
      groundWakeRef.current?.();
      return true;
    };
  }, [running]);

  /**
   * One scroll listener for both gestures.
   *
   * Distance is accumulated per direction and only acted on past a short
   * threshold, which is enough to ignore trackpad jitter without making the
   * reader work for it. Once a gesture has fired, it is spent until scrolling
   * actually stops, so a long flick produces one fall rather than one per
   * event and nothing is ever queued up behind it.
   */
  useEffect(() => {
    if (!mounted || reducedMotion) return;
    let down = 0;
    let up = 0;
    let spent = false;
    let lastY = window.scrollY;
    let idle: number | undefined;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      if (delta === 0) return;

      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        spent = false;
        down = 0;
        up = 0;
      }, SCROLL_GESTURE_IDLE_MS);

      // A reversal ends the previous gesture rather than fighting it.
      if (delta > 0) {
        up = 0;
        down += delta;
      } else {
        down = 0;
        up -= delta;
      }
      if (spent) return;

      if (down >= FALL_SCROLL_THRESHOLD) {
        if (beginFallRef.current()) spent = true;
        down = 0;
        return;
      }
      if (up >= CLIMB_SCROLL_THRESHOLD) {
        // Not marked spent: this starts no motion, it only keeps the request
        // to get back up alive, and a long slow scroll should keep renewing it
        // rather than expiring half way through.
        leaveGroundRef.current();
        up = 0;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(idle);
      window.removeEventListener("scroll", onScroll);
    };
  }, [mounted, reducedMotion]);

  /* ---------------- the fall ---------------- */

  /**
   * Walk to the margin, let go, fall, land, settle.
   *
   * Vertical motion is integrated from gravity by elapsed time and clamped per
   * frame, so a hidden tab resuming cannot advance the fall by a second in one
   * step. Collision is swept rather than sampled: the strip his feet cross
   * between two frames is tested as a whole, so terminal speed cannot carry
   * him through something thin.
   */
  useEffect(() => {
    if (!running || phase !== "falling") return;
    let cancelled = false;
    let timer: number | undefined;
    let raf: number | undefined;

    const cleanup = () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (raf) window.cancelAnimationFrame(raf);
    };

    const airborne = () => {
      setPose("fall");
      let last = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const dt = Math.min(64, now - last) / 1000;
        last = now;
        const body = stepFall({ y: feetYRef.current, v: fallVRef.current }, dt);
        const ground = groundY();
        const column = columnAt(viewXRef.current);
        // The strip his feet sweep through this step, against the live scroll
        // position, so content scrolled into the margin mid fall still stops
        // him rather than being passed through.
        const blocker = sweepBlocker(
          graphRef.current,
          column,
          feetYRef.current,
          body.y,
          window.scrollY,
          feetYRef.current
        );
        const stop = Math.min(ground, blocker ?? Infinity);
        if (body.y >= stop) {
          feetYRef.current = stop;
          fallVRef.current = 0;
          place();
          land();
          return;
        }
        feetYRef.current = body.y;
        fallVRef.current = body.v;
        place();
        raf = window.requestAnimationFrame(tick);
      };
      raf = window.requestAnimationFrame(tick);
    };

    const land = () => {
      // Crouch, then stand. Two frames and no rebound: the compression is the
      // whole of it.
      setPose("fallLand");
      timer = window.setTimeout(() => {
        if (cancelled) return;
        setPose("idle");
        timer = window.setTimeout(() => {
          if (cancelled) return;
          // He stops short only when something scrolled into the margin under
          // him. Carry on down once the way is clear again, otherwise settle
          // where the contact happened.
          const ground = groundY();
          if (feetYRef.current < ground - 4) {
            const clear = fallCorridorClear(
              graphRef.current,
              columnAt(viewXRef.current),
              feetYRef.current,
              ground,
              size,
              window.scrollY
            );
            if (clear) {
              fallVRef.current = 0;
              airborne();
              return;
            }
          }
          setPhase("grounded");
        }, SETTLE_MS);
      }, sequenceDuration("fallLand"));
    };

    const release = () => {
      if (cancelled) return;
      const graph = graphRef.current;
      const surface = graph.surfaces[currentRef.current];
      const scrollY = window.scrollY;
      const ground = groundY();
      const feet = surface ? surface.baseline - scrollY : 0;
      const viewX = xRef.current - window.scrollX;

      // Re-checked at the moment of release, because the page kept scrolling
      // while he walked over. If the drop is no longer clear he simply stays.
      if (
        !surface ||
        ground - feet < MIN_DROP ||
        !fallCorridorClear(graph, columnAt(viewX), feet, ground, size, scrollY)
      ) {
        setPhase("surface");
        return;
      }

      /**
       * The conversion out of document space, and the only one. Both
       * coordinates are taken from where he is drawn at this instant, so the
       * switch to `fixed` positioning does not move a single pixel. Velocity
       * starts at zero: scroll displacement is not motion.
       */
      viewXRef.current = viewX;
      feetYRef.current = feet;
      fallVRef.current = 0;
      modeRef.current = "viewport";
      setPose("fallRelease");
      place();
      timer = window.setTimeout(() => {
        if (cancelled) return;
        airborne();
      }, sequenceDuration("fallRelease"));
    };

    const approach = (docX: number) => {
      const from = xRef.current;
      if (Math.abs(docX - from) < 6) {
        release();
        return;
      }
      setFacing(docX > from ? 1 : -1);
      setPose("run");
      let last = performance.now();
      const stride = (now: number) => {
        if (cancelled) return;
        const dt = Math.min(64, now - last) / 1000;
        last = now;
        const direction = docX > xRef.current ? 1 : -1;
        const next = xRef.current + direction * SPEED.run * dt;
        const arrived = direction > 0 ? next >= docX : next <= docX;
        xRef.current = arrived ? docX : next;
        place();
        if (arrived) {
          release();
          return;
        }
        raf = window.requestAnimationFrame(stride);
      };
      raf = window.requestAnimationFrame(stride);
    };

    // Already in the air: this is the effect restarting after a suspension,
    // so carry on from where he is rather than starting the fall again.
    if (modeRef.current === "viewport") {
      airborne();
      return cleanup;
    }

    const plan = fallPlanRef.current;
    fallPlanRef.current = null;
    if (!plan) {
      setPhase("surface");
      return cleanup;
    }
    approach(plan.docX);
    return cleanup;
  }, [running, phase, size, groundY, columnAt, place, setPose]);

  /* ---------------- the ground ---------------- */

  /**
   * Resting at the bottom of the window.
   *
   * The ground line is a viewport coordinate, so it does not move while the
   * reader keeps scrolling: he stays put and the page runs past him. Walking
   * is bounded by the clear runs at that height, so he paces the margin he
   * landed in rather than wandering across whatever text is at the bottom of
   * the window.
   *
   * Scrolling up asks him to get back on the page. He takes a surface only
   * when the page has actually brought one to his feet, and walks along the
   * ground to reach one when that is a short trip. If there is nothing to take
   * he stays down: no ladder is invented and nothing teleports.
   */
  useEffect(() => {
    if (!running || phase !== "grounded") return;
    let cancelled = false;
    let timer: number | undefined;
    let raf: number | undefined;
    let watcher: number | undefined;
    let attempts = 0;

    const bodyWidth = charWidth * DRAWN_WIDTH_RATIO + FALL_SIDE_BUFFER * 2;

    const runsHere = () =>
      groundRuns(
        graphRef.current,
        feetYRef.current,
        bodyWidth,
        size,
        window.scrollY,
        window.innerWidth
      );

    /**
     * The clear run he is standing in, narrowed to the part of it that some
     * document surface spans.
     *
     * Without the narrowing he drifts to the very edge of the margin, which is
     * outside every surface's walkable span, and then no surface can ever be
     * handed back to him however far the reader scrolls. Pacing the part of
     * the margin that a surface passes over keeps the way back open.
     */
    const runUnderHim = () => {
      const run =
        runsHere().find(
          (r) => viewXRef.current >= r.start - 1 && viewXRef.current <= r.end + 1
        ) ?? null;
      if (!run) return null;

      const scrollX = window.scrollX;
      let start = Infinity;
      let end = -Infinity;
      for (const surface of graphRef.current.surfaces) {
        const low = Math.max(surface.start - scrollX, run.start);
        const high = Math.min(surface.end - scrollX, run.end);
        if (high - low < MIN_TRIP) continue;
        start = Math.min(start, low);
        end = Math.max(end, high);
      }
      if (start > end) return run;
      // Only narrow while he is inside the narrowed part; being pushed sideways
      // because a surface moved would be motion he never took.
      if (viewXRef.current < start - 1 || viewXRef.current > end + 1) return run;
      return { start, end };
    };

    const rest = (ms: number) => {
      setPose("idle");
      timer = window.setTimeout(decide, ms);
    };

    /** Walks along the ground line, in viewport space. */
    const travel = (to: number, then: () => void) => {
      setFacing(to > viewXRef.current ? 1 : -1);
      setPose("walk");
      let last = performance.now();
      const stride = (now: number) => {
        if (cancelled) return;
        const dt = Math.min(64, now - last) / 1000;
        last = now;
        const direction = to > viewXRef.current ? 1 : -1;
        const next = viewXRef.current + direction * strideMatchedSpeed(size) * dt;
        const arrived = direction > 0 ? next >= to : next <= to;
        viewXRef.current = arrived ? to : next;
        place();
        if (arrived) {
          raf = undefined;
          setPose("idle");
          then();
          return;
        }
        raf = window.requestAnimationFrame(stride);
      };
      raf = window.requestAnimationFrame(stride);
    };

    /**
     * Steps onto a surface, tracking its baseline as the page keeps moving, so
     * the handover lands exactly on it instead of snapping the last few px.
     */
    const stepOnto = (index: number) => {
      // Interpolated in DOCUMENT space, not on screen. Interpolating a screen
      // position towards a target that is itself racing down the window during
      // an upward scroll made the last frames of the step lurch; in document
      // space he takes hold of the page immediately and the only motion left
      // is the step itself, which is never more than REATTACH_BAND.
      const from = feetYRef.current + window.scrollY;
      const started = performance.now();
      setPose("idle");
      const tween = (now: number) => {
        if (cancelled) return;
        const surface = graphRef.current.surfaces[index];
        if (!surface) {
          rest(700);
          return;
        }
        const progress = Math.min(1, (now - started) / 150);
        feetYRef.current =
          from + (surface.baseline - from) * progress - window.scrollY;
        place();
        if (progress < 1) {
          raf = window.requestAnimationFrame(tween);
          return;
        }
        /**
         * The conversion back into document space. His viewport x plus the
         * current scroll is his document x, and the surface baseline he has
         * just been brought to is his floor, so the pixels do not move.
         */
        currentRef.current = index;
        setCurrent(index);
        xRef.current = viewXRef.current + window.scrollX;
        modeRef.current = "doc";
        fallVRef.current = 0;
        climbYRef.current = null;
        climbFrameRef.current = null;
        setClimbFrame(undefined);
        setPose("idle");
        place();
        setPhase("surface");
      };
      raf = window.requestAnimationFrame(tween);
    };

    /**
     * A surface worth walking to along the ground: its baseline is level with
     * his feet, his body fits on it, and the walk stays inside the clear run
     * he is already standing in. Surfaces a visible climb leaves from are
     * preferred, because an ascent is what the upward scroll asked for.
     */
    const surfaceWithinReach = () => {
      const graph = graphRef.current;
      const run = runUnderHim();
      if (!run) return null;
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      let best: { index: number; x: number; distance: number; climbable: boolean } | null = null;
      graph.surfaces.forEach((surface, index) => {
        if (Math.abs(surface.baseline - scrollY - feetYRef.current) > REATTACH_BAND) return;
        // The nearest point of the surface that is also inside the clear run.
        const low = Math.max(surface.start - scrollX, run.start);
        const high = Math.min(surface.end - scrollX, run.end);
        if (high - low < 4) return;
        const x = Math.min(Math.max(viewXRef.current, low), high);
        const distance = Math.abs(x - viewXRef.current);
        if (distance > GROUND_APPROACH_MAX) return;
        const climbable =
          visibleClimbsFrom(graph, index, scrollY, window.innerHeight).length > 0;
        if (
          best === null ||
          (climbable && !best.climbable) ||
          (climbable === best.climbable && distance < best.distance)
        ) {
          best = { index, x, distance, climbable };
        }
      });
      return best as { index: number; x: number; distance: number; climbable: boolean } | null;
    };

    /** The surface under his feet right now, if the page has brought one. */
    const surfaceAtFeet = () =>
      reattachFromGround(
        graphRef.current,
        viewXRef.current,
        feetYRef.current,
        window.scrollY,
        window.scrollX,
        REATTACH_BAND
      );

    /**
     * While an upward gesture is live, watch for a surface arriving at his
     * feet and take it the moment it does.
     *
     * Polled per frame rather than at the next decision point, because the
     * surface sweeps past his feet in a few hundred ms of scrolling and the
     * rests between decisions are measured in seconds. Nothing here moves him:
     * it only decides when the page has put something real under him.
     */
    const watchForSurface = (now: number) => {
      if (cancelled) return;
      watcher = undefined;
      if (!climbWantedRef.current || now > climbUntilRef.current) {
        climbWantedRef.current = false;
        return;
      }
      const here = surfaceAtFeet();
      if (here) {
        climbWantedRef.current = false;
        window.clearTimeout(timer);
        if (raf) window.cancelAnimationFrame(raf);
        raf = undefined;
        stepOnto(here.index);
        return;
      }
      watcher = window.requestAnimationFrame(watchForSurface);
    };

    function decide() {
      if (cancelled) return;

      if (climbWantedRef.current) {
        const here = surfaceAtFeet();
        if (here) {
          climbWantedRef.current = false;
          stepOnto(here.index);
          return;
        }
        // Nothing at his feet yet. Walking to a surface that is level with him
        // is the one move available: a blank margin is a corridor to fall
        // down, not a wall to climb, so nothing is invented when there is none.
        const reachable = surfaceWithinReach();
        if (reachable && attempts < 3) {
          attempts += 1;
          travel(reachable.x, decide);
          return;
        }
        attempts = 0;
      }

      const run = runUnderHim();
      if (!run || run.end - run.start < MIN_TRIP) {
        rest(randomBetween(1400, 2600));
        return;
      }
      if (Math.random() < 0.45) {
        rest(randomBetween(1600, 3200));
        return;
      }
      const spaceRight = run.end - viewXRef.current;
      const spaceLeft = viewXRef.current - run.start;
      const direction = spaceRight >= spaceLeft ? 1 : -1;
      const distance = Math.min(
        randomBetween(40, 140),
        direction > 0 ? spaceRight : spaceLeft
      );
      if (distance < MIN_TRIP) {
        rest(randomBetween(1400, 2400));
        return;
      }
      travel(viewXRef.current + direction * distance, () => rest(randomBetween(900, 2000)));
    }

    // Woken by an upward gesture rather than waiting for the next decision.
    groundWakeRef.current = () => {
      if (cancelled) return;
      if (watcher === undefined) watcher = window.requestAnimationFrame(watchForSurface);
      // Only interrupt a rest. A walk in progress finishes and decides at its
      // own end, so the gesture never snaps him mid stride.
      if (raf === undefined) {
        window.clearTimeout(timer);
        decide();
      }
    };

    // Keep the landing baseline honest when the window itself changes size.
    const onResize = () => {
      if (cancelled) return;
      feetYRef.current = groundY();
      const run = runUnderHim();
      if (run) {
        viewXRef.current = Math.min(Math.max(viewXRef.current, run.start), run.end);
      }
      place();
    };
    window.addEventListener("resize", onResize);

    place();
    timer = window.setTimeout(decide, 420);

    return () => {
      cancelled = true;
      groundWakeRef.current = null;
      window.removeEventListener("resize", onResize);
      window.clearTimeout(timer);
      if (raf) window.cancelAnimationFrame(raf);
      if (watcher) window.cancelAnimationFrame(watcher);
    };
  }, [running, phase, size, charWidth, groundY, place, setPose]);

  if (!mounted) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      // Absolute at the document origin: the character scrolls with the page
      // and stays on his surface. pointer-events-none keeps the page usable.
      className="pointer-events-none absolute left-0 top-0 z-30 h-0 w-0 select-none"
    >
      {debug ? (
        <CompanionDebug graph={graph} current={current} target={debugTarget} charWidth={charWidth} />
      ) : null}
      {atHeader ? (
        <HeaderPerch
          box={headerBox}
          origin={origin}
          isDesktop={isDesktop}
          state={state}
          bubble={bubble}
        />
      ) : hidden ? null : (
        <div
          ref={spriteRef}
          className="absolute left-0 top-0 transition-opacity duration-500 will-change-transform"
          style={{ opacity: onScreen ? 1 : 0 }}
        >
          <div className="relative">
            <SpeechBubble text="Hi!" visible={bubble} side={bubbleSide} />
            <CompanionSprite
              state={state}
              height={size}
              facing={facing}
              paused={!running}
              preloadStates={ROAMING_STATES}
              frameIndex={climbFrame}
            />
          </div>
        </div>
      )}
    </div>
  );
}
