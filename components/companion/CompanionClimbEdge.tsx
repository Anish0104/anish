/**
 * Marks a vertical corridor Mini Anish may climb, beside a section or card.
 *
 * Like the horizontal surfaces, a marker only proposes a route. The corridor
 * is accepted only when `lib/companion-surfaces` finds the entire swept path
 * clear: the reach at the bottom, the climb itself, and the pull-up at the
 * top, each checked with the character's full body box.
 *
 * The marker is invisible, inert and takes no layout space. It never draws a
 * ladder, rail or track.
 */
export default function CompanionClimbEdge({
  id,
  /** Which side of the parent the corridor runs along. */
  side = "left",
  /** Corridor width. Should reflect the real clear gap. */
  width = 76,
  /** Vertical extent, defaulting to the parent's height. */
  top = "0%",
  height = "100%",
}: {
  id: string;
  side?: "left" | "right";
  width?: number;
  top?: string;
  height?: string;
}) {
  return (
    <span
      aria-hidden="true"
      data-companion-climb={side}
      data-climb-id={id}
      className="pointer-events-none absolute block"
      style={{
        top,
        height,
        width,
        // Flush against the container's own edge, because that edge is what
        // he grips. The corridor lies in the margin immediately outside it, so
        // his hands land on the border while his body stays outside the box.
        //
        // `maxWidth` collapses the corridor as the margin disappears. Without
        // it the right-hand marker hung past the viewport on a phone and
        // widened the document.
        ...(side === "left" ? { right: "100%" } : { left: "100%" }),
        maxWidth: "max(0px, calc(50vw - 50%))",
      }}
    />
  );
}
