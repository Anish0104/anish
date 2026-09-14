"use client";

/**
 * A small greeting bubble that travels with the character.
 *
 * Decorative and silent: no audio, no buttons, no panel behind the character.
 * It is rendered inside the companion's overlay, so it inherits
 * `pointer-events: none` and cannot block anything underneath.
 */
export default function SpeechBubble({
  text,
  visible,
  side = "right",
}: {
  text: string;
  visible: boolean;
  /** Which way the tail points, so the bubble stays inside the viewport. */
  side?: "left" | "right";
}) {
  return (
    <span
      aria-hidden="true"
      className={[
        "pointer-events-none absolute bottom-full z-10 mb-1 whitespace-nowrap rounded-full px-2.5 py-1",
        "bg-surface text-[11px] font-medium leading-none text-text shadow-card ring-1 ring-border",
        "transition-opacity duration-300",
        side === "right" ? "left-1/2" : "right-1/2",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      {text}
    </span>
  );
}
