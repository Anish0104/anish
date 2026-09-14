/**
 * Mini Anish: the companion character's art assets.
 *
 * Frames are generated from the supplied character sheets by
 * `scripts/build-sprites.mjs`. The untouched sheets are kept in
 * `assets/companion/`, outside `public/` so they are never served.
 *
 * Every frame shares one 320x372 canvas with the floor at y=371, so switching
 * state or frame cannot make the character jump or resize. Frames are centred
 * on the torso rather than the head, which keeps the body steady while leaving
 * the intentional head movement in the dance and cricket rows intact.
 *
 * Two sizes are generated. `sm/` is 45% scale for the roaming companion, which
 * never draws above about 70px; the full size is for the 150px About figure.
 */

export type CompanionState =
  | "idle"
  | "walk"
  | "run"
  | "wave"
  | "dance"
  | "code"
  | "cricket"
  | "barbell"
  | "read"
  /* Climbing. Declared so the route system and state machine are complete;
     every sequence below is empty until artwork exists. */
  | "climbReach"
  | "climbLoop"
  | "climbPullUp"
  | "climbDown"
  /* Falling. Built from poses on the climbing sheet; see `sequences` below. */
  | "fallRelease"
  | "fall"
  | "fallLand";

/**
 * A frame and how long it is held. Durations vary within a sequence.
 *
 * `anchorY` is the canvas y of the contact point holding the character up:
 * the gripping hand while climbing. Frames without it stand on their feet and
 * use the canvas baseline. A single anchor does not fit every generated pose,
 * so each climbing frame carries its own.
 */
export type SpriteFrame = {
  src: string;
  ms: number;
  anchorY?: number;
  /** Canvas x of the gripping hand, so it can meet a real edge. */
  anchorX?: number;
  /** Canvas x bounds of the drawn body, so it never crosses that edge. */
  bodyLeft?: number;
  bodyRight?: number;
};

export type SpriteSequence = {
  frames: SpriteFrame[];
  loop: boolean;
};

export const spriteCanvas = {
  width: 320,
  height: 372,
  baselineY: 371,
  /** Torso anchor, at the canvas midline. */
  anchorX: 160,
  /** Scale of the `sm/` variant. */
  smallScale: 0.45,
};

/** Above this display height the full size art is used. */
export const SMALL_MAX_HEIGHT = 96;

const f = (
  name: string,
  ms: number,
  anchorY?: number,
  anchorX?: number,
  body?: [number, number]
): SpriteFrame => ({
  src: `/images/companion/${name}.png`,
  ms,
  ...(anchorY === undefined ? {} : { anchorY }),
  ...(anchorX === undefined ? {} : { anchorX }),
  ...(body === undefined ? {} : { bodyLeft: body[0], bodyRight: body[1] }),
});

/** Swaps a frame path to the small variant. */
export function smallSrc(src: string) {
  return src.replace("/images/companion/", "/images/companion/sm/");
}

/**
 * Sequences.
 *
 * Timing is per frame, not a single fps, so a held pose can last seconds while
 * a blink or a passing frame lasts under a fifth of a second.
 *
 * `walk` has two frames on purpose. Both supplied walking rows contain two
 * distinct poses duplicated rather than four; see docs/CONTENT.md. `run` is a
 * genuine four pose cycle.
 */
export const sequences: Record<CompanionState, SpriteSequence> = {
  // Eyes open for seconds at a time, then a brief blink. Never a blink loop.
  idle: {
    frames: [f("idle-01", 3200), f("idle-02", 70), f("idle-03", 110), f("idle-02", 70), f("idle-04", 2700)],
    loop: true,
  },
  // 2 frames x 235ms = 470ms per cycle. At the walk speed in
  // lib/companion-machine that is about 16px per cycle, which matches the
  // stride drawn in the art.
  walk: {
    frames: [f("walk-01", 235), f("walk-02", 235)],
    loop: true,
  },
  // 4 frames x 110ms = 440ms per cycle, covering roughly 35px at run speed.
  run: {
    frames: [f("run-01", 110), f("run-02", 110), f("run-03", 110), f("run-04", 110)],
    loop: true,
  },
  wave: {
    frames: [
      f("wave-01", 150),
      f("wave-02", 180),
      f("wave-03", 180),
      f("wave-02", 180),
      f("wave-03", 180),
      f("wave-04", 260),
    ],
    loop: false,
  },
  // Playful and quick, looped for a few beats by the caller.
  dance: {
    frames: [f("dance-01", 190), f("dance-02", 170), f("dance-03", 190), f("dance-04", 170)],
    loop: true,
  },
  /**
   * Sitting at a sky blue laptop. The four supplied poses differ only in the
   * eyes (1.4% to 2.6% silhouette difference), so this is a seated pose with
   * blinking, not an animated typing motion. Timed as long holds rather than
   * pretending to be hand movement.
   */
  code: {
    frames: [f("code-01", 2600), f("code-02", 1500), f("code-03", 320), f("code-04", 2400)],
    loop: true,
  },
  // One swing: stance, backlift, top, strike, recover.
  cricket: {
    frames: [
      f("cricket-01", 520),
      f("cricket-04", 220),
      f("cricket-02", 190),
      f("cricket-03", 430),
      f("cricket-01", 480),
    ],
    loop: true,
  },
  // One curl: down, mid, top, mid, down. Both hands stay on the bar.
  barbell: {
    frames: [
      f("barbell-01", 420),
      f("barbell-02", 190),
      f("barbell-03", 430),
      f("barbell-04", 190),
      f("barbell-01", 320),
    ],
    loop: true,
  },
  read: {
    frames: [f("read-01", 2800), f("read-02", 1500), f("read-03", 620), f("read-04", 2600)],
    loop: true,
  },

  /**
   * Climbing, from the supplied climbing sheet.
   *
   * `anchorY` values are measured from the art: they are the y of the raised
   * gripping hand in each frame. Frames with feet on a surface carry no anchor
   * and stand on the baseline instead, which is what makes the handover at the
   * start of a climb and the end of a pull-up read correctly.
   */

  // Standing, leaning in, reaching up. Feet stay on the lower surface, so
  // these are baseline anchored; the last frame takes hold of the edge.
  climbReach: {
    frames: [f("climbReach-01", 160), f("climbReach-02", 190), f("climbReach-03", 210, 98, 244, [56, 260])],
    loop: false,
  },

  /**
   * The climb itself. The hanging frame from the reach row opens the loop.
   *
   * Honest limitation: the supplied poses keep the same arm raised throughout,
   * so the legs and the lower arm alternate but the hands do not swap grip.
   * It reads as climbing effort rather than a true alternating hand cycle.
   */
  climbLoop: {
    frames: [
      f("climbReach-04", 200, 133, 231, [49, 271]),
      f("climbLoop-01", 210, 103, 217, [43, 256]),
      f("climbLoop-02", 210, 90, 232, [45, 250]),
      f("climbLoop-03", 210, 97, 219, [51, 236]),
      f("climbLoop-04", 210, 84, 228, [36, 257]),
    ],
    loop: true,
  },

  // Hand anchored while hauling up, then baseline anchored once the feet are
  // over the edge and standing on the new surface.
  climbPullUp: {
    frames: [
      f("climbPullUp-01", 200, 123, 233, [49, 249]),
      f("climbPullUp-02", 220, 153, 252, [50, 268]),
      f("climbPullUp-03", 240),
      f("climbPullUp-04", 260),
    ],
    loop: false,
  },

  /**
   * Falling.
   *
   * There is no dedicated falling sheet, so these three sequences are built
   * from poses on the climbing sheet that genuinely read as a fall rather than
   * from an upright frame translated downward. Each was previewed at 70px
   * against a moving background before `FALL_ENABLED` was switched on:
   *
   *   fallRelease  climbReach-03. Feet still down, both knees soft, the arm
   *                thrown up. Held for a beat at zero velocity, so it reads as
   *                losing the surface rather than as the start of the descent.
   *   fall         climbReach-04. Off the ground entirely: torso pitched back
   *                about 30 degrees, one arm overhead, both knees drawn up and
   *                no contact anywhere. Held for the whole airborne phase.
   *   fallLand     climbPullUp-03 then climbPullUp-04. The first is a deep
   *                crouch with the torso pitched forward and the trailing arm
   *                behind, which is the compression; the second is the return
   *                to standing. Two frames only, so nothing bounces twice.
   *
   * Deliberately not used: climbLoop and climbDown. Those poses are braced
   * against a wall, and playing them in open air is the substitution this
   * feature is not allowed to make. See docs/CONTENT.md for the dedicated
   * falling row that would replace all three.
   *
   * None of these frames carries an anchor, so every one stands on the shared
   * canvas baseline. That is what keeps the lowest drawn point continuous from
   * the airborne pose through the crouch and back up to standing.
   */
  fallRelease: {
    frames: [f("climbReach-03", 120)],
    loop: false,
  },
  fall: {
    // One held pose. A single frame also means CompanionSprite starts no timer
    // of its own, so the airborne phase is driven only by the fall runner.
    frames: [f("climbReach-04", 1000)],
    loop: false,
  },
  fallLand: {
    frames: [f("climbPullUp-03", 150), f("climbPullUp-04", 170)],
    loop: false,
  },

  // Descent, ending with the feet back on the lower surface.
  climbDown: {
    frames: [
      f("climbDown-01", 210, 109, 224, [47, 264]),
      f("climbDown-02", 210, 84, 219, [43, 265]),
      f("climbDown-03", 220, 115, 228, [52, 249]),
      f("climbDown-04", 240),
    ],
    loop: false,
  },
};

export function sequenceFor(state: CompanionState): SpriteSequence {
  return sequences[state];
}

/** One full pass of a sequence, in ms. */
export function sequenceDuration(state: CompanionState) {
  return sequences[state].frames.reduce((total, frame) => total + frame.ms, 0);
}

/** Frame paths for a set of states, for preloading. */
export function frameSrcsFor(states: CompanionState[], small: boolean) {
  const seen = new Set<string>();
  for (const state of states) {
    for (const frame of sequences[state].frames) seen.add(small ? smallSrc(frame.src) : frame.src);
  }
  return [...seen];
}

/** States the roaming companion uses. Only these are preloaded site wide. */
export const ROAMING_STATES: CompanionState[] = [
  "idle",
  "walk",
  "run",
  "wave",
  "climbReach",
  "climbLoop",
  "climbPullUp",
  "climbDown",
  // The fall poses reuse climbing frames, so nothing extra is downloaded.
  // Listed anyway, so the set stays correct if the artwork is ever replaced.
  "fallRelease",
  "fall",
  "fallLand",
];

/** States the About figure uses. */
export const ABOUT_STATES: CompanionState[] = [
  "idle",
  "wave",
  "dance",
  "read",
  "code",
  "cricket",
  "barbell",
];

export const hasAnimationAssets = true;

/**
 * Climbing.
 *
 * Enabled, from the dedicated climbing sheet. `climbAssetsReady` below is the
 * guard: the route system builds vertical edges either way, and offers them
 * only while every sequence has real frames, so removing the artwork disables
 * the feature rather than leaving him drifting upward in a standing pose.
 */
export const CLIMB_STATES: CompanionState[] = ["climbReach", "climbLoop", "climbPullUp", "climbDown"];

/**
 * What each missing sequence must contain. Kept next to the empty sequences so
 * the requirement travels with the code.
 */
export const CLIMB_ASSET_SPEC: Record<string, string> = {
  climbReach: "Reach and grab the edge: 2 to 3 frames, standing to both hands on the lip.",
  climbLoop: "Alternating hands and feet against the edge: at least 4 frames forming a loop.",
  climbPullUp: "Pull up and settle onto the surface: 3 to 4 frames ending in the standing pose.",
  climbDown: "Descent with hand and foot movement: at least 4 frames, or omit to disable descending.",
};

/** True only when every climb sequence has real frames. */
export const climbAssetsReady = CLIMB_STATES.every(
  (state) => (sequences[state]?.frames.length ?? 0) > 1
);

/**
 * Ascent is enabled: the reach, climb and pull-up sequences were previewed at
 * 70px and 150px on both grounds before this was switched on.
 */
export const CLIMBING_ENABLED = true && climbAssetsReady;

/**
 * Descent is tracked separately from ascent so one can ship without the other.
 * The descent row also previewed cleanly and ends with the feet back down.
 */
export const DESCENT_ENABLED = true && (sequences.climbDown?.frames.length ?? 0) > 1;

/**
 * Vertical speed, px per second. Started at 26 and raised to 30 after watching
 * playback: 26 made even a short hop feel like hauling.
 */
export const CLIMB_SPEED = 30;

/** Vertical contact point for a frame: its own anchor, or the standing baseline. */
export function anchorFor(frame: SpriteFrame) {
  return frame.anchorY ?? spriteCanvas.baselineY;
}

/**
 * Horizontal contact point: the gripping hand where the art has one, else the
 * canvas midline. Used to put the hand on a real edge rather than centring the
 * body on an imaginary line in open space.
 */
export function anchorXFor(frame: SpriteFrame) {
  return frame.anchorX ?? spriteCanvas.anchorX;
}

/* ------------------------------------------------------------------ */
/* Falling                                                             */
/* ------------------------------------------------------------------ */

export const FALL_STATES: CompanionState[] = ["fallRelease", "fall", "fallLand"];

/** True only when every fall sequence has frames of its own. */
export const fallAssetsReady = FALL_STATES.every(
  (state) => (sequences[state]?.frames.length ?? 0) > 0
);

/**
 * Falling is on.
 *
 * It was switched on only after watching the whole sequence at 70px on a real
 * page: the release beat, the airborne hold accelerating down a page margin,
 * contact at the ground line, the crouch, and the return to standing. The
 * poses are repurposed from the climbing sheet rather than drawn for this, and
 * exactly which frame backs which phase is written out above `fallRelease` in
 * `sequences`, so the substitution is on the record rather than hidden.
 */
export const FALL_ENABLED = true && fallAssetsReady;

/**
 * Gravity, in px per second squared, and the terminal speed it is capped at.
 *
 * Raised from 1400 / 420. At 420 the drop held a constant slow speed for most
 * of its length and read as being lowered rather than falling. At 1900 / 760
 * terminal speed arrives after about 150px, so a short drop is all
 * acceleration and a long one still visibly speeds up before it settles.
 */
export const GRAVITY = 1900;
export const MAX_FALL_SPEED = 760;

/**
 * Shortest drop worth showing. Below this the release and landing beats
 * overlap and it reads as a twitch, so he simply stays where he is.
 */
export const MIN_DROP = 90;

/** Longest drop, in px. Beyond a screen height it stops reading as one fall. */
export const MAX_DROP = 900;

/**
 * How far above the bottom of the visible window his feet come to rest, on top
 * of whatever `env(safe-area-inset-bottom)` reports. Small enough to read as
 * the bottom of the window, large enough that he is not tangent to the edge.
 */
export const GROUND_MARGIN = 12;

/**
 * Scroll accumulated in one gesture before a fall is considered, in px.
 *
 * Short on purpose: this is only there to ignore trackpad jitter, not to make
 * the reader work for it. The gesture then has to end, with no scroll events
 * for `SCROLL_GESTURE_IDLE_MS`, before another fall can be triggered, so one
 * long flick produces one fall rather than one per event.
 */
export const FALL_SCROLL_THRESHOLD = 48;
export const SCROLL_GESTURE_IDLE_MS = 220;

/** The same, for the upward gesture that asks him to leave the ground. */
export const CLIMB_SCROLL_THRESHOLD = 48;

/**
 * Fraction of the sprite canvas the figure is actually drawn across.
 *
 * The canvas is padded so the cricket bat and the barbell fit, so testing a
 * corridor against the full canvas width would reject margins he clears
 * comfortably. Measured from the widest roaming frame.
 */
export const DRAWN_WIDTH_RATIO = 206 / 320;

/** Clearance either side of the drawn body, for corridor and landing tests. */
export const FALL_SIDE_BUFFER = 6;

/** How long he holds the landing crouch before standing up, in ms. */
export const SETTLE_MS = 260;

/** Display heights, in px. Art is scaled to these, never cropped. */
export const SIZES = {
  companionMobile: 54,
  companionDesktop: 70,
  about: 150,
};

/**
 * Travel per walk cycle as a fraction of display height, matched to the
 * stride drawn in the art so the planted foot does not skate.
 */
export const STEP_RATIO = 0.23;

/**
 * Perching on the header name.
 *
 * There is no dedicated peeking artwork. The idle and wave frames are cropped
 * to the upper body, which shows complete hair, face, chin and a little hoodie
 * with the cut landing at the top of the letters, so nothing is sliced across
 * the eyes and no seam is exposed.
 *
 * What the art cannot do is rest his hands on the surname. The wave frames put
 * a hand up beside his head, not flat on a horizontal line. See
 * docs/CONTENT.md for the pose that would complete the mockup.
 */
export const HEADER_PEEK = {
  /**
   * Fraction of the drawn figure kept. The neck sits at 53% in these frames,
   * so 0.66 clears the chin and takes in the shoulders. An earlier 0.46 cut
   * straight across the eyes.
   */
  visibleFraction: 0.66,
  /** Drawn width of the figure, in canvas px, used to solve for display size. */
  drawnWidth: 206,
  /** Target visible character width, tuned against the real header. */
  targetWidth: { desktop: 52, mobile: 40 },
  idleState: "idle" as CompanionState,
  waveState: "wave" as CompanionState,
};

/** How long the greeting bubble stays up, in ms. */
export const HEADER_BUBBLE_MS = 2000;

/** Gap between the infrequent idle waves while perched, in ms. */
export const HEADER_WAVE_GAP = { min: 24000, max: 48000 };

export const CHARACTER_ALT =
  "Mini Anish, an illustrated character with wavy black hair, a short beard and a charcoal hoodie.";
