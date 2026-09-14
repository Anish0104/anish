/**
 * The wall the site hangs on: a plaster texture, and window light falling
 * across the top right of the page.
 *
 * Two layers, both purely decorative:
 *
 *   `.wall-texture`  fixed to the viewport, so the grain sits behind the whole
 *                    document however long it is and never tiles into view as
 *                    a seam when the reader scrolls.
 *   `.wall-light`    absolute at the top of the document, so the window falls
 *                    once, at the top, and scrolls away. It is not repeated at
 *                    every section and it fades out well above the first row
 *                    of project cards.
 *
 * Both are marked `data-decorative`, which does three things at once:
 * `aria-hidden` keeps them out of the accessibility tree, `pointer-events:
 * none` keeps them from intercepting a single click, and
 * `lib/companion-surfaces` skips the attribute entirely so Mini Anish never
 * mistakes a painted viewport-sized layer for something to stand on or walk
 * around.
 *
 * Nothing here animates. No parallax, no cursor tracking, no transition: the
 * light is where it is, exactly as it would be on a wall.
 *
 * The colours, opacities and scale all live in `app/globals.css` next to the
 * theme tokens, because the dark treatment is a different wall rather than the
 * same one dimmed, and the phone treatment is a smaller, fainter window.
 */
export default function WallBackground() {
  return (
    <div aria-hidden="true" data-decorative="" className="pointer-events-none">
      <div className="wall-texture" />
      <div className="wall-light" />
    </div>
  );
}
