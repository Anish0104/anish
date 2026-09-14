# Avatar image

The memoji shown beside the opening introduction on `/about`.

## What is here

| File | Size | What it is |
| --- | --- | --- |
| `anish-memoji-original.png` | 396x474 | The supplied original, byte-for-byte. Never edited. |
| `anish-memoji.png` | 270x285 | The transparent derivative actually rendered. |

`data/profile.ts` points at the derivative:

```ts
export const avatar = {
  available: true,
  path: "/avatar/anish-memoji.png",
  alt: "Anish's memoji: a smiling illustrated avatar with a beard, giving a thumbs-up.",
  hasNavyBackground: false,
  width: 270,
  height: 285,
} as const;
```

Until `available` is `true`, `/about` renders a dashed placeholder tile rather
than a broken image.

## How the derivative was made

The original has a fully opaque dark navy background. It was removed by
flood-filling inward from the border, then trimming to the content box with a
6px pad. The key detail is that the background test is navy-specific rather
than merely dark, so the dark brown hair and beard survive:

```python
def is_bg(p):
    r, g, b, _ = p
    return max(r, g, b) <= 72 and b >= r + 4   # dark AND blue-dominant
```

That removed 143072 pixels, of which zero were red-dominant, which is the
check that the hair was untouched. The thumbs-up hand is fully inside the
trimmed box.

If you replace the source image, redo both steps and confirm the same two
things: no red-dominant pixels removed, and the hand not clipped by the trim.

## Rules

- Keep the original alongside any derivative. Do not overwrite it.
- Do not fake the cut-out with `mix-blend-mode` or CSS filters. On the cream
  background it greys out the artwork, and in dark mode it falls apart.
- No circular crop. The thumbs-up hand sits near the edge of the frame and a
  circle clips it.

## Sizing

`ProfileAvatar` renders 110px wide on mobile and 160px on desktop, with
`height: auto` so the aspect ratio is preserved. `width` and `height` are
passed explicitly from `data/profile.ts` so the space is reserved before the
image loads and nothing shifts.
