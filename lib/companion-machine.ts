import {
  GRAVITY,
  MAX_DROP,
  MAX_FALL_SPEED,
  MIN_DROP,
  STEP_RATIO,
  sequenceDuration,
  type CompanionState,
} from "@/data/companion";

/**
 * The companion's behaviour, with no React and no DOM.
 *
 * Movement is described as speeds rather than per-frame steps: the roaming
 * component advances the character by elapsed time each animation frame, so
 * translation stays smooth and is never coupled to sprite frame timing.
 */

/** Pixels per second. Walking is unhurried; a run is a short burst. */
export const SPEED = {
  walk: 34,
  run: 80,
};

/**
 * Speeds and stride agree by construction: one walk cycle lasts
 * `sequenceDuration("walk")` and covers `STEP_RATIO` of the character's height.
 * This returns the speed that satisfies that for a given display height, so
 * the feet do not skate at any size.
 */
export function strideMatchedSpeed(displayHeight: number) {
  const cycleSeconds = sequenceDuration("walk") / 1000;
  return (displayHeight * STEP_RATIO) / cycleSeconds;
}

export type Activity =
  | { kind: "rest"; state: CompanionState; ms: number }
  | { kind: "travel"; state: "walk" | "run"; distance: number }
  | { kind: "climb"; edge: number }
  | { kind: "greet" };

/**
 * The phases of a climb, in order.
 *
 * Movement is explicit rather than a single blended motion: he stops walking,
 * reaches for the edge, climbs, pulls up, stands, and only then walks again.
 * Vertical displacement is driven by the climb phase, so the body never slides
 * without the cycle running.
 *
 * Unused while climbing is disabled, and kept here so the sequence is defined
 * the moment frames arrive.
 */
export const CLIMB_PHASES = [
  { state: "climbReach" as CompanionState, moves: false },
  { state: "climbLoop" as CompanionState, moves: true },
  { state: "climbPullUp" as CompanionState, moves: false },
  { state: "idle" as CompanionState, moves: false },
];

/** Rest between trips, in ms. */
export const REST = { min: 1600, max: 3800 };

/** How far a trip tries to cover when there is room. */
export const TRIP = { min: 150, max: 350 };

/** Shortest gap between greetings, in ms. */
export const GREET_GAP_MS = 30000;

/** A trip shorter than this is not worth taking; rest instead. */
export const MIN_TRIP = 26;

export function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/**
 * Picks the next thing to do.
 *
 * Mostly walking trips with occasional runs and rests in between. Greetings
 * are offered only when enough time has passed, so the character does not
 * keep waving.
 */
export function nextActivity(options: {
  sinceLastGreetMs: number;
  lastKind: Activity["kind"] | null;
  roomAvailable: number;
  /** Validated climbs leaving the current surface, by edge index. */
  climbOptions?: number[];
}): Activity {
  const { sinceLastGreetMs, lastKind, roomAvailable, climbOptions = [] } = options;

  // A reachable climb is the most interesting thing available and the whole
  // reason the corridors exist, so take one most of the time it is offered.
  // At 0.4 a visitor could browse for the better part of a minute without ever
  // seeing one. Only back-to-back climbs are held off.
  if (climbOptions.length > 0 && lastKind !== "climb" && Math.random() < 0.8) {
    return { kind: "climb", edge: climbOptions[Math.floor(Math.random() * climbOptions.length)] };
  }

  if (sinceLastGreetMs >= GREET_GAP_MS && lastKind !== "greet" && Math.random() < 0.35) {
    return { kind: "greet" };
  }

  // Two trips in a row are fine, but a rest must follow eventually.
  if (lastKind === "travel" && Math.random() < 0.55) {
    return { kind: "rest", state: "idle", ms: randomBetween(REST.min, REST.max) };
  }

  if (roomAvailable < MIN_TRIP) {
    return { kind: "rest", state: "idle", ms: randomBetween(REST.min, REST.max) };
  }

  const wantsRun = Math.random() < 0.25;
  const distance = Math.min(roomAvailable, randomBetween(TRIP.min, TRIP.max));
  return { kind: "travel", state: wantsRun ? "run" : "walk", distance };
}

/* ------------------------------------------------------------------ */
/* About page activities                                               */
/* ------------------------------------------------------------------ */

export type AboutActivity = {
  state: CompanionState;
  /** How long to hold, or how many passes of the sequence to play. */
  ms?: number;
  loops?: number;
};

/**
 * The pool the About figure draws from. Durations follow the art: a held pose
 * such as reading or coding runs for several seconds, while dance, cricket and
 * the barbell are counted in whole passes so a swing or a curl always finishes.
 */
export const ABOUT_ACTIVITIES: AboutActivity[] = [
  { state: "dance", loops: 4 },
  { state: "read", ms: 7000 },
  { state: "code", ms: 7000 },
  { state: "cricket", loops: 2 },
  { state: "barbell", loops: 3 },
  { state: "wave", loops: 1 },
];

/** A short neutral beat between activities, so poses never cut into each other. */
export const ABOUT_IDLE_MS = 1600;

/**
 * Picks the next activity, never the one just performed, so the sequence stays
 * varied rather than repeating the same action.
 */
export function nextAboutActivity(previous: CompanionState | null): AboutActivity {
  const pool = ABOUT_ACTIVITIES.filter((a) => a.state !== previous);
  return pool[Math.floor(Math.random() * pool.length)];
}

/** How long an activity occupies, given its own sequence length. */
export function activityDuration(activity: AboutActivity) {
  if (activity.ms) return activity.ms;
  return sequenceDuration(activity.state) * (activity.loops ?? 1);
}

/* ------------------------------------------------------------------ */
/* Falling                                                             */
/* ------------------------------------------------------------------ */

/** A falling body: where its feet are and how fast they are moving. */
export type FallBody = { y: number; v: number };

/**
 * Advances a fall by one elapsed-time step.
 *
 * Velocity is integrated from gravity and capped at terminal speed, and
 * position comes from that velocity. Nothing here knows about scrolling: the
 * caller keeps the fall in viewport coordinates, so page movement never adds
 * to physical velocity. `dt` is clamped by the caller, which is what stops a
 * hidden tab resuming into a single enormous step.
 */
export function stepFall(body: FallBody, dtSeconds: number): FallBody {
  const v = Math.min(MAX_FALL_SPEED, body.v + GRAVITY * dtSeconds);
  return { y: body.y + v * dtSeconds, v };
}

/**
 * How long a clear drop of `distance` px takes, under the same model.
 *
 * Not used to drive the fall, which integrates frame by frame. It exists so
 * the timing can be reasoned about and checked without a browser.
 */
export function fallDuration(distance: number) {
  if (distance <= 0) return 0;
  // Distance covered before terminal speed: v^2 = 2*g*d.
  const rampDistance = (MAX_FALL_SPEED * MAX_FALL_SPEED) / (2 * GRAVITY);
  if (distance <= rampDistance) return Math.sqrt((2 * distance) / GRAVITY) * 1000;
  const rampMs = (MAX_FALL_SPEED / GRAVITY) * 1000;
  return rampMs + ((distance - rampDistance) / MAX_FALL_SPEED) * 1000;
}

/** Whether a drop is worth showing at all. */
export function dropIsWorthTaking(distance: number) {
  return distance >= MIN_DROP && distance <= MAX_DROP;
}
