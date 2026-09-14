/**
 * Marks a strip of deliberately clear page space that Mini Anish may stand on.
 *
 * Surfaces are declared explicitly, here and at the call sites, rather than
 * inferred by treating arbitrary DOM elements as platforms. A marker only
 * proposes a surface: `lib/companion-surfaces` still checks that the whole
 * character, and its greeting bubble, fit without covering anything.
 *
 * The marker is invisible, inert and takes no layout space. It never draws a
 * platform, track or panel.
 */
export default function CompanionSurface({
  id,
  kind = "divider",
  /** Height of the clear band, in px. Should match the real whitespace. */
  height = 64,
  /** Distance from the parent's top edge up into the gap above it. */
  offset = 8,
  /** Explicit top, for surfaces placed partway down a tall container. */
  top,
  /** Widen past the content column when the gap is clear across the page. */
  bleed = true,
}: {
  id: string;
  kind?: "divider" | "margin" | "footer" | "cards";
  height?: number;
  offset?: number;
  top?: string;
  bleed?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      data-companion-surface={kind}
      data-surface-id={id}
      className="pointer-events-none absolute block"
      style={{
        top: top ?? -(offset + height),
        height,
        // A gap between sections is empty across the full page width, not just
        // the content column, so the surface may bleed into the page margins.
        // Offsetting left rather than translating keeps the layout box inside
        // the viewport: a 100vw box placed at left:50% pushed the document
        // 348px wider. The inset also clears the scrollbar.
        ...(bleed
          ? { left: "calc(50% - 50vw + 10px)", width: "calc(100vw - 20px)" }
          : { left: 0, right: 0 }),
      }}
    />
  );
}
