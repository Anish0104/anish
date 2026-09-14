"use client";

import { useEffect, useRef, useState } from "react";
import {
  SMALL_MAX_HEIGHT,
  frameSrcsFor,
  sequenceFor,
  smallSrc,
  spriteCanvas,
  type CompanionState,
} from "@/data/companion";

/**
 * Draws Mini Anish at a given height.
 *
 * Frames are held for their own durations rather than a single fps, so a blink
 * can be 70ms inside an idle that holds for three seconds. Every frame shares
 * one canvas and one floor line, so a frame change can never resize or shift
 * the character.
 *
 * Small displays use the 45% art so a 70px sprite does not download the 150px
 * set. All frames of every state this instance can enter are decoded on mount,
 * which is what stops a blank frame appearing at a state change.
 *
 * A plain <img> rather than next/image: frames are authored at fixed sizes, so
 * there is nothing for the optimizer to choose between, and routing them
 * through /_next/image previously hung on the small srcset candidate.
 *
 * The art is never recoloured, filtered, inverted or blended, so it looks the
 * same in both themes.
 */
export default function CompanionSprite({
  state,
  height,
  facing = 1,
  paused = false,
  preloadStates,
  frameIndex,
}: {
  state: CompanionState;
  height: number;
  facing?: 1 | -1;
  paused?: boolean;
  /** Every state this instance may enter, so none of them pops in later. */
  preloadStates: CompanionState[];
  /**
   * Externally driven frame. Used during a climb, where the caller has to know
   * which frame is showing so it can position the character by that frame's
   * own contact anchor.
   */
  frameIndex?: number;
}) {
  const sequence = sequenceFor(state);
  const useSmall = height <= SMALL_MAX_HEIGHT;
  const [frame, setFrame] = useState(0);

  // Restart on state change, adjusted during render so no paint shows the
  // previous state's frame.
  const [renderedState, setRenderedState] = useState(state);
  if (renderedState !== state) {
    setRenderedState(state);
    setFrame(0);
  }

  const preloaded = useRef(false);
  useEffect(() => {
    if (preloaded.current) return;
    preloaded.current = true;
    for (const src of frameSrcsFor(preloadStates, useSmall)) {
      const img = new window.Image();
      img.decoding = "async";
      img.src = src;
    }
  }, [preloadStates, useSmall]);

  // Each frame schedules the next, honouring per-frame durations. Skipped
  // entirely while the caller is driving the frame.
  useEffect(() => {
    if (frameIndex !== undefined || paused || sequence.frames.length < 2) return;
    const last = sequence.frames.length - 1;
    if (!sequence.loop && frame >= last) return;

    const timer = window.setTimeout(() => {
      setFrame((current) => (current >= last ? (sequence.loop ? 0 : current) : current + 1));
    }, sequence.frames[Math.min(frame, last)].ms);

    return () => window.clearTimeout(timer);
  }, [sequence, frame, paused, frameIndex]);

  const active = frameIndex ?? frame;
  const raw = sequence.frames[Math.min(active, sequence.frames.length - 1)].src;
  const src = useSmall ? smallSrc(raw) : raw;
  const width = Math.round((spriteCanvas.width / spriteCanvas.height) * height);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={width}
      height={height}
      decoding="async"
      loading="eager"
      draggable={false}
      className="block max-w-none select-none"
      style={{
        width,
        height,
        // Facing mirrors the art. Walk and run are drawn facing right.
        transform: facing === -1 ? "scaleX(-1)" : undefined,
      }}
    />
  );
}
