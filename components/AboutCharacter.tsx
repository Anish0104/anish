"use client";

import { useEffect, useRef, useState } from "react";
import CompanionSprite from "./companion/CompanionSprite";
import SpeechBubble from "./companion/SpeechBubble";
import { ABOUT_CHARACTER_ID } from "./companion/ids";
import { ABOUT_STATES, SIZES, sequenceDuration, type CompanionState } from "@/data/companion";
import { ABOUT_IDLE_MS, activityDuration, nextAboutActivity } from "@/lib/companion-machine";
import { useCompanionSuspension } from "@/lib/use-companion-suspension";

/**
 * Mini Anish beside the About introduction.
 *
 * He sits directly on the page: no card, no border, no floor line, no reserved
 * panel and no visible controls. Only his own transparency separates him from
 * the background, and his colours are identical in both themes.
 *
 * He greets once when the section first comes into view, then works through a
 * varied set of activities, returning to a short neutral idle between each so
 * poses never cut into one another and no action is interrupted part way.
 *
 * The roaming companion watches for this element and stands down while it is
 * on screen, so only one copy is ever visible.
 */
export default function AboutCharacter() {
  const { reducedMotion, tabVisible, overlayOpen } = useCompanionSuspension();
  const hostRef = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  const [state, setState] = useState<CompanionState>("idle");
  const [bubble, setBubble] = useState(false);

  const greetedRef = useRef(false);
  const previousRef = useRef<CompanionState | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const node = hostRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      rootMargin: "60px",
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const running = !reducedMotion && tabVisible && !overlayOpen && onScreen;

  useEffect(() => {
    if (!running) return;
    let cancelled = false;

    const queue = (ms: number, fn: () => void) => {
      timerRef.current = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const nextActivity = () => {
      if (cancelled) return;
      const activity = nextAboutActivity(previousRef.current);
      previousRef.current = activity.state;
      setState(activity.state);
      queue(activityDuration(activity), toIdle);
    };

    const toIdle = () => {
      if (cancelled) return;
      setState("idle");
      queue(ABOUT_IDLE_MS, nextActivity);
    };

    if (!greetedRef.current) {
      greetedRef.current = true;
      setState("wave");
      setBubble(true);
      queue(sequenceDuration("wave") + 400, () => {
        setBubble(false);
        toIdle();
      });
    } else {
      queue(600, nextActivity);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timerRef.current);
    };
  }, [running]);

  return (
    <div
      id={ABOUT_CHARACTER_ID}
      ref={hostRef}
      className="relative shrink-0"
      // Sized from the frame canvas so the cricket bat and the barbell have
      // transparent room and never overlap the introduction text.
      style={{ height: SIZES.about, width: Math.round((320 / 344) * SIZES.about) }}
    >
      <div className="absolute bottom-0 left-0">
        <SpeechBubble text="Hello!" visible={bubble} side="right" />
        <CompanionSprite
          state={state}
          height={SIZES.about}
          paused={!running}
          preloadStates={ABOUT_STATES}
        />
      </div>
    </div>
  );
}
