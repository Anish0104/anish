# Desk illustration assets

## Diet Coke can

**Expected file:** `public/images/illustration/diet-coke-can.png`

**Status: in place.** The homepage desk illustration renders this file. `Hero` checks for it on the server (`lib/assets.ts`) and passes the
path to `DeskIllustration`, which then renders it with an SVG `<image>` in
place of the drawn can. No component change is needed: drop the file in and it
appears.

### Prepare the file

1. Keep the supplied original untouched as
   `diet-coke-can-original.png` in this folder.
2. Check whether it already has an alpha channel:

   ```bash
   sips -g hasAlpha diet-coke-can-original.png
   ```

3. If the exterior background is opaque white, remove **only the exterior
   background**. On macOS the built-in subject lift works well:

   - Preview: open the image, Tools > Instant Alpha, or Markup > Instant Alpha,
     click the outer white area, delete, then export as PNG.
   - Or Photos / Preview: right-click the image in Finder, Quick Actions >
     Remove Background.

   Save the result as `diet-coke-can.png`.

4. Do **not** globally delete white pixels. The silver highlights, the white
   lettering details, and the white stripes on the straw are all white and must
   survive. Only the area outside the can outline should become transparent.

5. Do not substitute a CSS blend mode or an invert filter for a real cut-out.
   Those break in dark mode and tint the artwork.

### Placement

`CAN_BOX` in `components/DeskIllustration.tsx` controls position and size in
SVG user units:

```ts
const CAN_BOX = { x: 424, y: 126, w: 76, h: 126 };
```

- `y + h` = 252, the same desk surface the mug sits on.
- The box is proportioned for a can-with-straw at roughly 1:1.66, which is the
  supplied artwork's shape.
- `preserveAspectRatio="xMidYMax meet"` keeps the file's own proportions and
  pins its base to the desk, so whatever its exact ratio it never distorts, and
  the straw grows upward inside the 505 x 380 viewBox rather than clipping.
- The box sits clear of the mug (which ends at x 415) and the notebook
  (which starts at y 264).

The supplied source was 256 x 420 RGBA with a fully opaque white exterior. The
cut-out was produced by flood-filling the **connected exterior** from the image
border (threshold 238) rather than deleting white globally, so the silver
highlights, the whites inside the lettering, and the straw stripes all survive:
53% of pixels became transparent and 6,854 interior near-white pixels stayed
opaque. Edge pixels touching the removed area were feathered by whiteness so
the black outline keeps its weight.

Regenerating it: the original is beside this file as
`diet-coke-can-original.png`. If it is ever replaced, redo the exterior-only
flood fill; do not run a global "remove white" filter.

If the artwork is much taller or wider than the box, adjust `w` and `h`
together to match its aspect ratio and leave `y + h` at 252.
