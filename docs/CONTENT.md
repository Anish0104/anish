# Where to add content

Everything on this site is driven by typed files under `data/`. Nothing here
needs a CMS or an admin screen. Edit a file, commit, redeploy.

---

## 1. Resume PDF

**File:** `public/resume/anish-shirodkar-resume.pdf` (replace in place)
**Flag:** `data/profile.ts` → `resume.available`

```ts
export const resume = {
  available: true,
  path: "/resume/anish-shirodkar-resume.pdf",
  downloadAs: "anish-shirodkar-resume.pdf",
} as const;
```

Replacing the file is enough, because the path never changes. Set `available: false`
to fall back to the honest "coming soon" state instead of a link that 404s.

---

## 2. Memoji / avatar

**File:** `public/avatar/anish-avatar.png`
**Flag:** `data/profile.ts` → `avatar`

```ts
export const avatar = {
  available: true,               // flip once the file exists
  path: "/avatar/anish-avatar.png",
  alt: "Anish’s illustrated avatar giving a thumbs-up.",
  hasNavyBackground: true,       // see below
  width: 1024, height: 1024,     // the image's real pixel size
} as const;
```

- Keep the **original, unmodified** file as the source of truth.
- `hasNavyBackground: true` frames it on a matching navy tile. Use this when
  the image still has its dark navy background.
- If you produce a **clean transparent PNG** (hair, face, beard and the full
  thumbs-up hand intact), set `hasNavyBackground: false`.
- Do **not** try to remove the background with `mix-blend-mode` or CSS filters:
  on a near-white page they grey out the artwork and eat dark hair.
- Rendered at 120px (mobile) / 168px (desktop) with `height: auto`. There is no
  circular crop, because a circle clips the thumbs-up hand.

---

## 3. Project cover images

**Sources:** `assets/projects/` (never served)
**Built by:** `node scripts/build-project-covers.mjs`
**Output:** `public/images/projects/<slug>.webp`, one file per project
**Referenced from:** `data/projects.ts` → `project.cover`

Covers are **generated**, not hand-placed. The untouched sources stay in
`assets/projects/` and the build writes one 1600x1000 file per project (16:10,
matching `aspect-cover`), used by the homepage cards, the Projects page and the
detail pages alike.

They are **full bleed**: no inset, no padding, no hairline, no surround. The
card supplies the rounded corner and the rule beneath the image, so a frame
drawn inside the picture would read as a second border. That also means a cover
is identical in both themes, which is why there is no `-dark` variant any more
and `ProjectCard` renders a single `<Image>`.

### What a cover is allowed to be

`cover.kind` records where the image came from, and `ProjectCard` puts it in
front of the reader as the first words of the image's alternative text:

| kind | meaning |
| --- | --- |
| `screenshot` | a capture of the project actually running |
| `frame` | a frame lifted from output the project itself produced |
| `illustration` | artwork, including images that merely look photographic |

**Looking like a photograph is not the same as being one.** Seven of the eight
covers are generated conceptual images in a photographic style: a staged page,
a staged reader panel, a staged chart. They are classified as illustrations and
the card says so before describing them. The eighth, VTrack, is real output
from the project.

`cover.provenance` records what each image actually is. Nothing written inside
one of these images, on a staged page or a staged chart, is ever treated as a
fact about the project: it is not quoted in a description, a metric, a research
claim or an Ask bar answer. Where a staged detail would have read as a measured
result, the crop in `scripts/build-project-covers.mjs` removes it. The DocPilot
source is the working example: its left page carried a chart captioned as
validation loss with a series beating a baseline, so the cover is cropped hard
from the left and that chart is not in the shipped image at all.

Earlier covers are kept under `assets/projects/archive/`: real screenshots of
four of these projects running, and the drawn vector scenes these replaced,
alongside the generator that produced them.

### Current state

| Project | Kind | What it shows |
| --- | --- | --- |
| Semantic Search | illustration | A staged page with one passage highlighted and a small search control beside it. No title, author line or venue anywhere in it. |
| SkillGap | illustration | A staged resume and job description side by side, with three skills joined between them. |
| Vouch | illustration | A blank card presented to an access reader showing green, with a scoped access label. |
| DocPilot | illustration | A staged printed page with a highlighted paragraph and a short answer card citing it. |
| VTrack | **frame** | Real output: a frame from the pipeline's own annotated video, with its boxes, track ids, speeds and counts. |
| QuantVision | illustration | A staged market chart with one understated annotation. No ticker, date, axis value or return. |
| Sunspot Transformer | illustration | A staged solar surface with two spots ringed. Not an observation and not model output. |
| VeritasAI | illustration | Staged newspaper clippings, two passages tagged as separate sources and joined. |

### A note on VeritasAI

The source-annotation concept was checked against the project's own README
before being used. VeritasAI aggregates live coverage of a topic from many
outlets and composes it into a front page, so clippings from more than one
paper with two of them marked as separate sources is a fair picture of what it
gathers. The two tags stand for **more than one outlet on one story**, not for
fact-checking or verification: the README claims aggregation, editorial
synthesis, sentiment and word-cloud insight, and no veracity scoring. The alt
text and provenance say so explicitly, and the project's own description was
not touched.

### Adding or replacing a cover

Drop the untouched source into `assets/projects/`, add or edit its entry in
`COVERS` in `scripts/build-project-covers.mjs`, rerun the script, and update
`cover.kind`, `cover.alt` and `cover.provenance` in `data/projects.ts`.

`crop` is a fraction of the source (`left`, `top`, `width`) and the height is
solved from `width` so the result is exactly 16:10 and nothing is ever
stretched. Choose it by looking at the cover at card size, not at full size:
keep the subject and its annotation legible, and crop out anything that would
read as a claim.

**Inspect the image before mapping it.** The seven concept images arrived with
two filenames swapped: the file named `docpilot` held the newspaper clippings
and the one named `veritasai` held the printed page with the answer card. They
are stored in `assets/projects/concepts/` under the project each one actually
belongs to, by content.

---

## 4. Books

**File:** `data/books.ts` → `books: Book[]`

```ts
export const books: Book[] = [
  {
    id: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    status: "reading",            // "reading" | "finished"
    cover: "/images/books/atomic-habits.jpg",
    coverWidth: 329,              // native pixels, keeps the aspect ratio
    coverHeight: 500,
    coverSource: {
      provider: "Open Library Covers API",
      url: "https://covers.openlibrary.org/b/id/XXXXXX-L.jpg",
      edition: "Avery, 2018",
      isbn13: "9780735211292",
    },
    startedOn: "March 2026",
    notes: "…",
    link: "https://…",
    progress: 40,                 // optional, only ever a real number
  },
];
```

- Put cover images in `public/images/books/` and record `coverWidth`,
  `coverHeight`, and `coverSource` (provider, url, edition, ISBN) so the
  provenance stays auditable and nothing is cropped.
- Books stand **face out** on the shelf. Missing or failed images fall back to
  a typographic front rather than a broken image.
- Never set `progress` unless it's an actual figure.
- The two current covers came from the Open Library Covers API:
  *The Silent Patient* (Celadon Books, 5 Feb 2019, ISBN 9781250301697) and
  *Days at the Morisaki Bookshop* (Harper Perennial / HarperCollins, 2023,
  ISBN 9780063278677, translated by Eric Ozawa). Neither is claimed to be the
  exact physical copy Anish owns. If you supply photos of your editions, drop
  them in and update `coverSource`.

---

## 6. Paintings (art wall)

**File:** `data/art.ts` → `artworks: Artwork[]`
**Images:** `public/images/art/`

```ts
{
  id: "harbour",
  title: "Harbour at Dusk",
  src: "/images/art/harbour.jpg",
  width: 1600, height: 1200,   // real pixel size, required
  medium: "Acrylic on canvas",
  year: "2025",
  alt: "Describe the painting itself, not just the title.",
}
```

`width`/`height` must be the real dimensions so the wall reserves the right
space and nothing is cropped.

The wall is **display only**: each painting is a `<figure>` with its title as
the caption, and nothing on it is clickable, focusable or hoverable. See the
Paintings section further down.

---

## 7. Experience, teaching, publications, leadership

**File:** `data/experience.ts`

`teaching` holds grouped teaching posts: one organisation, one employment
basis, one date range, and a `roles` array so each course keeps its own
responsibilities. It renders above the student leadership entries under the
"Teaching & leadership" heading. Courses taught are deliberately **not** added
to `education[].coursework`, which lists courses taken.

Each experience entry carries a `source` field (`"resume"` or `"website"`) so
it's clear what backs it. The CognoRise InfoTech role is `"website"`, because it comes
from anishshirodkar.me and is not on the latest resume.

---

## 8. Skills, education, certifications

**File:** `data/skills.ts`

### The tool shelf

`featuredTools` is the eight tools on the shelf in "What I work with" on
`/about`. It is a selection, not a ranking and not the whole toolkit: nothing
carries a score, a level or a percentage, and nothing ever should.

Each entry has a one-sentence `use` and a `projects` array. **Every project
link has to be verified against that project's own evidence**, either its
`stack` in `data/projects.ts` or its README snapshot in
`data/readme-snapshots/`, and the evidence goes in a comment above the entry.
A tool is never attached to a project just because both appear somewhere on
this site. Two cases that were nearly got wrong and are worth remembering:

- DocPilot's README names PyTorch, but as one of the documentation sets it
  indexes, not as a dependency. It is not a PyTorch project.
- Vouch's README says outright that its state is persisted to JSON files
  rather than to Postgres. It is not a PostgreSQL project.

Where a tool has no project that claims it, `projects` stays empty and
`noProjectsNote` says why, rather than linking eight weak matches. Git is the
current example: a `git clone` line in an install guide shows a repository
exists, not that Git is part of that project's stack.

`skillGroups` is unchanged and is still the canonical collection. The "Full
toolkit" disclosure renders it, dropping any entry that is exactly one of the
eight above so the shelf is not repeated underneath itself. Compound entries
such as "Git and CI/CD" or "Supabase (PostgreSQL + RLS)" stay, because they say
more than the shelf label does. **Do not edit `skillGroups` casually**:
`lib/ask-demo.ts` reads its items directly to answer questions about the stack.

### Icons

`components/icons/brand-paths.ts` holds the marks, as inline path data copied
from Simple Icons (CC0 1.0). Only the marks actually used are copied in; the
library is not a dependency and nothing fetches an icon font or a sprite.

Alongside the paths are two small maps:

- `brandColors` paints each mark in its own published hue. `null` means the
  brand mark is monochrome black, which would vanish on a dark page, so it
  renders in `currentColor` instead. That is the only exception: no filter,
  inversion or blend is applied to any mark.
- `brandScales` corrects optical size. All marks are on the same 24x24 grid,
  but a solid disc fills it and an open ring does not, so these multipliers
  even them out and stop one logo dominating the shelf.

Adding a tool means adding its path and both map entries, then adding it to
`featuredTools` with verified projects.

### Certifications

Certifications carry a required `source`:

- `"credential"`: the linked certificate page was read directly.
- `"website"`: only anishshirodkar.me listed it.
- `"linkedin-export"`: from the LinkedIn export text Anish supplied.
- `"resume"`: from the latest resume PDF.

If none can confirm a date, leave `date` off entirely rather than guessing.
Proof documents go in `documents` (see section 12). Education entries also
carry `coursework` (see section 13).

---

## 9. GitHub stats (optional credentials)

`lib/github.ts` reads **`GITHUB_TOKEN`** from the server environment.

```bash
# .env.local, never commit this, never rename it to NEXT_PUBLIC_*
GITHUB_TOKEN=ghp_xxx
```

- Entirely optional. Without it the section still works using GitHub's
  unauthenticated API (60 requests/hour), which is plenty given the 6-hour
  cache.
- With it, the rate limit rises to 5,000/hour.
- The token is read in a server component only and never reaches the browser.
- **Contribution calendar** (`lib/github-contributions.ts`): the main visual in
  the On GitHub section. It prefers GitHub's own GraphQL contributions API when
  `GITHUB_TOKEN` is set, and otherwise reads
  `github-contributions-api.jogruber.de`, which mirrors the public graph from
  the profile page. Either way the heading total is summed from exactly the
  days rendered, so the number and the squares can never disagree. Dates are
  handled as plain `YYYY-MM-DD` strings, never parsed with `new Date`, because
  that shifts the day west of Greenwich.

  Limitation of the fallback: it sees only what the profile shows publicly.
  Private contributions appear only if "Include private contributions on my
  profile" is enabled. Setting `GITHUB_TOKEN` removes the third-party
  dependency but has the same visibility rules.

---

## 10. Development fixtures

`data/fixtures/` holds **placeholder** books, tracks, and art used only to
exercise the Misc layouts. They are:

- gated behind `NEXT_PUBLIC_SHOW_FIXTURES=true` **and** `NODE_ENV !== production`;
- only used when the corresponding real array is empty;
- visibly labelled in the UI as fixtures.

```bash
NEXT_PUBLIC_SHOW_FIXTURES=true npm run dev
```

They can never appear in a production build. Once real content is added, the
real array wins automatically.

---

## 11. Essays

**File:** `data/writing.ts`

Retained for later, but **nothing renders it**. The essay list was removed from
`/misc`, and `/writing` now redirects to `/misc` with no anchor.

---

## 12. Proof documents

**Folders:** `public/documents/certifications/`, `public/documents/leadership/`
**Type:** `data/documents.ts` → `SupportingDocument`

```ts
documents: [
  { label: "View certificate", href: "/documents/certifications/x.pdf", kind: "pdf" },
  { label: "Verify credential", href: "https://issuer.example/verify/123", kind: "link" },
]
```

- `kind` is `"pdf"`, `"image"`, or `"link"`.
- Local paths are **existence-checked on the server** (`lib/documents.ts`), so
  an entry whose file is not committed renders no button instead of a broken
  link. That means you can add the data entry and the file in either order.
- `"link"` entries open at the issuer directly, which is the point of a
  verification URL. `"pdf"` and `"image"` open in the in-page viewer with
  open-in-new-tab, download, and a plain-link fallback.
- Use an accurate label: "View certificate", "Verify credential", "View
  appointment letter". Do not add a badge that claims verification.

Waiting on files:

| Entry | Expected path |
| --- | --- |
| President, IEI-TCET | `public/documents/leadership/iei-tcet-president-appointment-2023.pdf` |

Other leadership roles and certifications have empty `documents` arrays. Add
entries as the files arrive.

---

## 13. Coursework

**File:** `data/skills.ts` → `education[].coursework`

Course **names only**. Do not publish course numbers, section numbers, credits,
instructors, meeting times, rooms, campuses, or exam schedules. A course that
meets on several days is listed once. The About page labels the list as a
selection, not a transcript.

---

## The wall background

**Component:** `components/WallBackground.tsx`
**Styles and tokens:** `app/globals.css`, the `--wall-*` variables

Two decorative layers behind everything: a plaster texture and window light.

| Layer | Position | Why |
| --- | --- | --- |
| `.wall-texture` | `fixed` | Sits behind the whole document however long the page is, and cannot scroll a tile boundary into view. |
| `.wall-light` | `absolute` at the top | The window falls once, at the top, and scrolls away. It is not repeated at every section and it fades out above the first row of cards. |

**The texture is two things.** A 200px noise tile from `feTurbulence` with
`stitchTiles="stitch"`, which is the part that makes the tile edges match:
without it a 200px grid of seams appears across a wide page. Then two very
broad gradients that never repeat, which give the plaster its uneven patches. A
tile alone reads as screen noise; the mottling is what makes it read as a wall.

**The window is a repeating gradient plus a mask.** Every stop fades over about
34px rather than switching at a hard line, because a shadow on plaster has no
edge, and the zero-alpha stop is the same colour as the bar rather than
`transparent`, which would interpolate through grey and leave a dirty rim. The
mask is a radial fade anchored in the top right corner, which is what keeps the
bars to three and keeps them out of the text.

**Tune it by measuring, not by eye alone.** The first pass was correctly
stacked and entirely visible and still read as a plain warm page, because the
bars only moved the luminance by about 17 levels out of 255. Sample a row of
pixels across the top right of a screenshot: around 40 levels of spread with
three distinct troughs is what makes it read as window light, and about 10
levels of spread in an empty margin is the grain being present without being
noisy.

**Both are inert.** The wrapper carries `data-decorative`, which does three
things at once: `aria-hidden` keeps it out of the accessibility tree,
`pointer-events: none` stops it intercepting a click, and
`lib/companion-surfaces` skips the attribute entirely so Mini Anish never
mistakes a painted viewport-sized layer for a panel to walk around. Without
that last one he refuses to walk anywhere.

**Nothing animates.** No parallax, no cursor tracking, no transition.

Dark mode is a different wall rather than the same one dimmed: charcoal plaster
takes a coarser grain before it shows, and the window becomes a faint wash,
because a bright pane on a dark page reads as glare. On a phone the bars scale
to about half and the whole layer fades further, so the pattern never becomes
stripes across a single column of text.

`--bg` is a warm off-white (`#faf8f5`) rather than the old near-blue white, so
the texture reads as plaster instead of dirt on a screen. Cards stay
`--surface`, which is opaque white, so nothing behind them affects readability.

**Two things to know before changing the layout.**

The content wrapper in `app/layout.tsx` is `relative z-10` to sit above these
layers. It must stay `z-index` only and never gain a transform, filter or
`will-change`, any of which would become the containing block for Mini Anish's
`position: fixed` while he is falling and stop him landing at the bottom of the
window.

That `relative` also made the wrapper an **offset parent**, which broke the
companion once already: it measures the page in document coordinates and draws
inside an absolutely positioned overlay, so every `left` gained the wrapper's
own left edge a second time. At 390px the wrapper starts at 0 and the bug was
invisible; at 1920px the perch sat 410px to the right of the surname. The fix
is in `SiteCompanion`: `measureOrigin` records where the overlay itself sits
and `place` and `HeaderPerch` subtract it, so placement is correct under any
wrapper. If you ever see the character drifting sideways by exactly the page
margin, that conversion is what is missing.

---

## 14. Em dashes

Authored copy uses none. Use a colon, comma, parentheses, or a new sentence.
Fetched README prose is cleaned at render time by `rehypeProseEmDashes` in
`lib/markdown.ts`, which skips code, inline code, and URL-like link text and
never touches the cached snapshot on disk.

---

## The ask bar

The bar on the home page is a curated lookup, not a model. There is no
training, no hosted LLM, no vector database and no paid API. Everything is
computed in the browser from the same typed data the rest of the site renders,
so an answer cannot drift from a page. The interface never claims to be
powered by an LLM: the only disclosure is "Answers from my portfolio."

### The contract

`lib/ask-demo.ts` is the whole answering layer, and the UI knows only this:

```ts
answerQuestion(question: string): AskResponse

type AskResponse = {
  status: "answered" | "clarify" | "unsupported";
  question: string;        // echoed, rendered as text and never as HTML
  answer: string;
  sources: AskSource[];    // { id, label, href }
  suggestedQuestions: string[];
};
```

Replacing this with a real RAG backend later means rewriting that one file and
keeping the signature. `components/AskBar.tsx` holds no answer content.

### Adding a topic

Append to `intents` in `lib/ask-demo.ts`:

```ts
{
  id: "publications",
  label: "Has he published anything?",   // shown as a clarify choice
  strong: ["publication", "published", "paper"],  // +10 each
  aliases: ["journal", "conference", "doi"],      // +3 each
  build: () => ({ answer: "...", sources: ["resume", "project:vtrack"] }),
}
```

Matching is deterministic and whole-word: the question is lowercased, stripped
to letters, digits, `+`, `#` and `.`, then split. Both the raw token and a
dot-trimmed copy are indexed, so "research." matches `research` while
"next.js" still matches as itself. A single-word alias never matches inside a
longer word, which is why `ta` cannot fire on "database". Multi-word phrases
are matched against the normalised string instead.

Two near-equal weak matches (top score under 10, within 3 of the runner-up)
return `clarify` with the competing intent labels rather than presenting a
guess as an answer. Nothing matching at all returns `unsupported` with a fixed
string. Do not reword it without checking the copy elsewhere:

> I don't have that information here. You can explore my projects or get in touch.

### Sources

A question can never produce a URL. `sources` is a list of ids resolved
against a fixed table (`projects`, `experience`, `about`, `resume`, `contact`)
plus `project:<slug>`, which is looked up in `data/projects.ts` and dropped if
the slug does not exist. Source links set `prefetch={false}`, so showing a
curated answer issues no network request at all.

### Behaviour

- No fake typing, no streaming, no artificial delay. The answer is present in
  the same frame as the submit.
- The panel expands in place below the bar. Nothing goes full screen and the
  page is never scrolled for the visitor.
- The panel is a `role="status" aria-live="polite"` region and takes focus with
  `preventScroll`, so a screen reader lands on the answer without a jump.
- Escape is handled on the whole section, not just the input, because focus
  has moved into the panel by then. Escape and the close button both clear the
  answer and return focus to the input.

## Paintings

Two of Anish's paintings hang on the art wall in `/misc`, under the art wall tab.

### What is stored

| File | Size | What it is |
| --- | --- | --- |
| `public/images/art/originals/sunset-at-the-pier-original.jpg` | 2244x3382 | The supplied photograph, byte for byte. |
| `public/images/art/sunset-at-the-pier.jpg` | 1400x2110 | Display derivative, scaled only. |
| `public/images/art/originals/under-a-shooting-star-original.jpg` | 2268x3476 | The supplied photograph, byte for byte. |
| `public/images/art/under-a-shooting-star.jpg` | 1400x2145 | Display derivative, scaled only. |

The derivatives were produced by resizing to 1400px wide at JPEG quality 82.
Nothing was cropped, recoloured, straightened or stretched. Both signatures
sit on the paper **below** the painted area, so cropping to the painted
rectangle would cut them off: keep the full sheet in frame.

### Titles

The titles are Anish's own: "Sunset at the Pier" and "Under a Shooting Star".
Medium and year are optional in `Artwork` and are omitted, because he has not
supplied them. Do not infer a medium from looking at the image.

### Display only

The paintings hang and that is all they do. There is no lightbox, no zoom, no
next/previous, no link to the original photograph, no pointer cursor and no
hover lift, and nothing in the wall is focusable, because there is nothing for
a keyboard to activate. Each painting is a `<figure>` with the title in its
`<figcaption>` and a description of the painting in `alt`.

`components/ArtWall.tsx` has no state, no effects and no handlers as a result,
and no longer declares `"use client"`. The viewer that used to live there is
gone; the shared `components/Dialog.tsx` it never used is untouched and still
serves the book dialogs, the proof-document viewer and the project READMEs.

The `original` and `description` fields were removed from `Artwork` with it:
both existed only for the viewer, and a field nobody reads goes stale. The
untouched photographs are still on disk at
`public/images/art/originals/<id>-original.jpg`.

### Adding another

Put the original under `public/images/art/originals/`, make a scaled
derivative beside it in `public/images/art/`, then add an entry to
`data/art.ts` with the derivative's real pixel dimensions and an `alt` that
describes the painting rather than repeating the label.

## Mini Anish, the character companion

Mini Anish walks, runs, rests and waves along the bottom of every page, and a
larger copy beside the About introduction cycles through activities. Only one
is visible at a time: the roaming one stands down while the About figure is on
screen.

### The artwork

Three supplied sheets are kept untouched in `assets/companion/`, outside
`public/` so they are never served. Frames are generated by:

```
node scripts/build-sprites.mjs
```

| Sheet | Rows |
| --- | --- |
| `mini-anish-sprites-original.png` | idle and blink, an early walk row (unused), wave, reading |
| `mini-anish-activities-original.png` | dance, coding, cricket batting, barbell curls |
| `mini-anish-movement-original.png` | walking, running |

None of them is a production atlas, and the script exists for three reasons.

**None had an alpha channel.** The first sheet has a transparency checkerboard
painted into the pixels; the other two sit on flat white. Background is removed
by a flood fill seeded from the border, travelling only through near-neutral
light pixels. Because it cannot pass a dark outline, the character's white and
grey sneakers survive: 7793, 10593 and 12091 light pixels are preserved inside
the character on the three sheets. A global "erase light pixels" pass would
have destroyed the shoes.

**The rows are not on a uniform grid.** Poses are found from opaque-pixel
projections. Props are included automatically, since the bounding box is taken
from opaque pixels, which is what keeps the cricket bat and the barbell whole.

**The sheets are drawn at different scales.** Measured hair width is 202.8 on
the base sheet and 277.6 on the movement sheet, so movement frames are scaled
by 0.73; the activities sheet already matches. Scale is normalised by head
size, never by silhouette height, which would inflate the seated poses.

Frames are bottom aligned onto one floor line and centred on the **torso**, not
the head. Anchoring on the head would hold it perfectly still and cancel the
intentional head movement in the dance and cricket rows. Measured across all 34
frames: baseline spread 0px, torso drift at most 0.9px per state.

Two sizes are produced. `sm/` is 45% scale for the roaming companion, which
never draws above about 70px; the full size serves the 150px About figure. That
keeps the site-wide sprite payload near 170KB instead of 476KB.

### What works, and what does not

| State | Frames | Status |
| --- | --- | --- |
| idle | 4 | Works. Seconds of eyes open, a brief blink, then open again. |
| run | 4 | Works. A genuine four pose cycle, minimum pair difference 12.3%, foot spreads 252/179/276/222. Clearly distinct from the walk. |
| wave | 4 | Works. Plays once and hands back to idle. |
| dance | 4 | Works. Four distinct poses, 14% to 29% apart. |
| cricket | 4 | Works. Stance, backlift, top, strike, recover. |
| barbell | 4 | Works. Down, mid, top, mid, down, both hands on the bar throughout. |
| read | 4 | Works. Long holds with an occasional page movement. |
| code | 4 | Seated pose with blinking only. See below. |
| walk | 2 of 4 | Partial. See below. |

**Coding is not a typing animation.** The four supplied poses differ by 1.4% to
2.6%, which is the eyes alone. It is a seated pose at a sky blue laptop with
blinking, timed as long holds rather than pretending to be hand movement. To
make it typing, the source needs frames with the hands and forearms in
different positions over the keyboard.

**Both walking rows are short two frames.** The original sheet's walk row and
the new movement sheet's walk row each contain two distinct poses duplicated,
not four:

| Row | Pose 1 vs 3 | Pose 2 vs 4 | Foot spread |
| --- | --- | --- | --- |
| original sheet | 5.5% | 5.4% | 142 / 57 / 145 / 57 |
| movement sheet | 7.7% | 7.3% | 230 / 109 / 240 / 98 |

Both pairs repeat the same leading leg, so neither row is an opposite-leg
stride. Only the distinct pair from the movement sheet ships, as `walk-01`
(contact) and `walk-02` (passing). The legs visibly change and travel is
matched to the stride, but it reads as a shuffle rather than a full walk.

**To finish the walk, two frames need drawing**, matching the movement sheet's
style, scale and right-facing view:

1. Opposite contact: the other leg leading, still facing right.
2. Opposite passing: the other leg raised.

Add them to `sequences.walk` in `data/companion.ts` in contact, passing,
opposite-contact, opposite-passing order and the cycle completes with no other
change. Running already has all four and needs nothing.

### Surfaces and routes

Mini Anish stands on explicit surfaces, not on whatever happens to be under
him. A surface is declared by a `CompanionSurface` marker placed deliberately
in the page:

| Marker | Where | Typical clearance |
| --- | --- | --- |
| `footer` | The gap above the site footer, every page | 78px band, page wide |
| `about-*`, `home-*`, `exp-*` | The gap above each major section | 56px band, page wide |
| `cards-*` | Beside the project card rows | page margins either side |
| `projects-1`, `misc-1` | Above the gallery and the tab panel | 52px band |

The marker is invisible, inert and takes no layout space. It never draws a
platform, track or panel.

A marker only *proposes* a surface. `lib/companion-surfaces.ts` then measures
every piece of text, media and control on the page, grows each by the
character's width plus a buffer, and keeps only the spans where his whole body
fits, with headroom reserved for the greeting bubble. One marker often yields
several surfaces: the card-row markers span the page, the cards block the
middle, and what survives is the clear outer margin on each side.

Everything is in **document coordinates**. DOM rects arrive in viewport space
and are converted once, on entry, by adding the scroll offset. The overlay is
absolutely positioned at the document origin, so he stays attached to his
surface as it scrolls rather than being pinned to the viewport, and he is never
snapped back to the bottom of the window.

Geometry is rebuilt only on layout changes: resize, fonts and images
finishing, route navigation, and a debounced `ResizeObserver` on the body.
Nothing measures the page on an animation frame.

Surfaces form a small graph. Horizontal edges join surfaces that are level and
touching, so he can walk straight across. Vertical edges are built behind
`CLIMBING_ENABLED` and never offered, because there is no climbing art.

Bleed is offset with `left: calc(50% - 50vw)` rather than a translate. A 100vw
box placed at `left: 50%` pushed the document 338px wider; the card markers
also had to move from the individual cards onto the grid container, since 50%
of a card is not 50% of the content column.

### Movement

Translation is elapsed-time driven in an animation frame, independent of sprite
timing, at a speed matched to the drawn stride. Measured in the browser: 34px/s
walking, 76px/s running.

Travel depends on the surface. On the footer surface of a 1440px window he
covers 488px across 101 distinct positions. Narrow surfaces produce short
strolls, and where nothing is clear he rests instead.

After a long spell off screen he re-enters on a surface near the reader, faded
rather than popped. That is a deliberate re-entry, not a jump: he never
teleports between disconnected surfaces mid journey.

On a phone there is usually no clear strip at all, so he hides rather than
walking over the text.

### Climbing

Climbing is enabled. Frames come from `mini-anish-climbing-original.png`,
preserved untouched in `assets/companion/` and processed by the same pipeline
as the other sheets.

**Preparing that sheet needed two fixes.** Its transparency was a baked
checkerboard, removed by the usual border flood fill (13520 light pixels kept
inside the character, so the sneakers survived). And its rows 3 and 4 overlap
vertically, so the band detector returned three bands instead of four; the
segmenter now splits an over-tall band at its thinnest row rather than falling
back to an even grid. Scale is anchored on the standing pose, 309px against the
base sheet's 324px, because every pose here is in profile with an arm raised
beside the head, which makes hair width useless.

**Frame-specific contact anchors.** Climb frames hang from the gripping hand,
not the feet, and the hand sits at a different height in every pose, so each
frame carries its own `anchorY` measured from the art (`climbLoop` hands at
y103, y90, y97, y84). Frames whose feet are on a surface carry no anchor and
stand on the baseline. The runtime drives climb frames itself so it always
knows which frame is showing and can place the body by that frame's contact
point, which is what keeps the hand on the edge instead of sliding along it.

**What the sequences do.**

| Sequence | Status |
| --- | --- |
| `climbReach` | Works. Standing, leaning in, taking hold. Feet stay down until the last frame. |
| `climbLoop` | Usable, with a limitation below. |
| `climbPullUp` | Works well. Hauls up, clears the edge, ends standing on the new surface. |
| `climbDown` | Works. Descent ending with the feet back on the lower surface. |

**Source-art limitation in the climb loop.** All four supplied climbing poses
keep the *same* arm raised. The legs and the lower arm alternate clearly, but
the hands never swap grip, so it reads as climbing effort rather than a true
alternating hand cycle. It is shipped because the leg movement is genuine and
the loop closes without a snap. Nothing was flipped to fake opposite limbs. To
finish it properly, the sheet needs poses with the *other* hand reaching above
the head.

**Tuning.** Climb speed started at the planned 26px/s and was raised to 30px/s
after watching: 26 made even a short hop feel like hauling. Walking stays at
34px/s and running at 76px/s.

**Route length.** A corridor can span a whole card grid, which first connected
surfaces 1343px apart, 51 seconds of climbing. Climbs longer than 460px are now
rejected, and the project grid carries eight evenly spaced margin surfaces, so
each climb is a 268px hop of roughly nine seconds. Measured on the projects
page at 1600px: 20 surfaces, 14 validated climbs, 0 rejected.

Ascent and descent are tracked separately (`CLIMBING_ENABLED` and
`DESCENT_ENABLED`) so one could ship without the other.

### Falling

`FALL_ENABLED` is now **on**. Scrolling down past a short threshold, while Mini
Anish is on a surface above the bottom of the window, makes him let go, drop
under gravity down a clear page margin, and land on a ground line just above
the bottom of the visible window.

**The artwork is repurposed, and that is on the record.** There is no falling
sheet. Three poses on the climbing sheet carry the sequence, and they were
previewed at 70px against a moving page before the flag was switched on:

| Sequence | Frame | Why it reads as a fall |
| --- | --- | --- |
| `fallRelease` | `climbReach-03` | Feet still down, knees soft, arm thrown up. Held at zero velocity, so it is losing the surface rather than descending. |
| `fall` | `climbReach-04` | Off the ground entirely: torso pitched back about 30°, one arm overhead, knees drawn up, no contact anywhere. Held for the whole airborne phase. |
| `fallLand` | `climbPullUp-03`, then `climbPullUp-04` | A deep crouch with the trailing arm behind, then the return to standing. Two frames, so nothing rebounds twice. |

Deliberately **not** used: `climbLoop` and `climbDown`. Those poses are braced
against a wall, and playing them in open air would be a descent dressed up as a
fall. To replace all three properly the sheet needs a dedicated row: release,
one or two airborne poses, a landing compression, and a recovery to standing,
added to `sequences` in `data/companion.ts` under the same names.

**Coordinates.** Surfaces are document-anchored; the ground line is a viewport
coordinate. The two conversions are `release` and `stepOnto` in
`SiteCompanion`, and both preserve the drawn position exactly, so the handover
is never a visible jump. While falling and while grounded the sprite is
`position: fixed`, so continued scrolling runs the page past him without moving
him and without ever being added to his velocity. Gravity is integrated from
elapsed time, clamped to 64ms a frame so a hidden tab resuming cannot advance
the fall in one step, and collision is **swept**: the strip his feet cross
between two frames is tested as a whole, against the live scroll position, so
terminal speed cannot carry him through something thin.

**Where he will not fall.** A fall needs a clear corridor for the whole drop
*and* a clear landing area, tested against text, media, controls, sticky
elements and whole card panels. He will walk up to 280px along his own surface
to reach one; if there is none, there is no fall. In practice that means:

- **1280px wide and above:** works on `/experience` and `/projects`.
- **Below about 1264px:** no fall. The page margins are too narrow to be
  walkable surfaces at all there, so he only ever stands on the footer strip.
  This is the existing `MIN_SURFACE` rule in `lib/companion-surfaces.ts`, not a
  fall-specific limit.
- **Phones:** no fall. At 390px there is no margin clear of the content column,
  so no corridor passes the check. He keeps roaming normally.

**Coming back up.** Scrolling up marks him as wanting to leave the ground for
four seconds, and a per-frame watcher takes the first document surface the page
brings to within 26px of his feet, stepping onto it in document space so the
handover tracks the scroll. He paces only the part of the margin some surface
spans, so the way back is always open. If nothing real is reachable he stays
down: no ladder is invented and nothing teleports. Once he is back on a
surface, an upward scroll intent makes the existing climb routes the preferred
destination, which is what produces a climb up a real card border.

**Diagnostics.** In a development build with `?companionDebug=1`, every refused
fall logs its reason to the console.

### Debug view

In a development build only, loading any page with `?companionDebug=1` draws
the usable surfaces, the regions that blocked space, and the current travel
target. It is compiled out of production: verified that the flag draws nothing
in a production build.

### About activities

The About figure greets once with a small bubble when the section enters view,
then works through dance, reading, coding, cricket and barbell curls, returning
to a short neutral idle between each. The next activity is never the one just
performed. Timed activities use whole passes where a motion must finish, so a
swing or a curl is never cut off mid-way.

### Behaviour and constraints

The overlay is `pointer-events: none`, so nothing underneath is ever blocked.
He holds still when a dialog or the mobile menu is open, when the tab is
hidden, when he scrolls out of view, and under `prefers-reduced-motion`, where
he shows a static pose. Greetings are at least 30 seconds apart and the
first-visit greeting is remembered in `sessionStorage`, so it does not repeat
on every route change. There is no audio and there are no visible controls.

All frames of every state an instance can enter are decoded on mount, so a
state change never shows a blank frame. The art is never recoloured, filtered,
inverted or blended, so it looks the same in both themes. Both figures carry
`aria-hidden="true"`, so a screen reader is not told about every frame.
