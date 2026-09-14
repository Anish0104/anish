# anishshirodkar.me

Personal site. Next.js App Router, TypeScript, Tailwind CSS.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm start   # production
npm run lint                 # eslint
npm run typecheck            # tsc --noEmit
```

To exercise the Misc layouts with placeholder content:

```bash
NEXT_PUBLIC_SHOW_FIXTURES=true npm run dev
```

## Routes

| Route | What |
| --- | --- |
| `/` | Hero, ask bar, three featured projects, experience preview |
| `/about` | Bio + avatar, education, skills, certifications |
| `/projects` | All eight projects, category filters, GitHub contribution calendar |
| `/projects/[slug]` | Individual project detail |
| `/experience` | Roles, publications & registered work, leadership |
| `/resume` | PDF view / download / desktop preview |
| `/misc` | Bookshelf, art wall |
| `/api/readme/[slug]` | Sanitized README HTML for the dialog |

Permanent redirects preserve the old deep links:

```
/writing        → /misc
/publications   → /experience#publications
/leadership     → /experience#leadership
/certifications → /about#certifications
```

## Design

System sans only: `-apple-system, BlinkMacSystemFont, "Segoe UI", …`. Nothing
from Apple is downloaded or redistributed. The one web font is **Caveat**, used
exclusively for the hand-lettered labels inside the desk illustration.

Colour tokens live as CSS variables in `app/globals.css`; the dark theme is a
variable swap, not a parallel set of utilities. Headlines use `text-wrap:
balance` rather than hard-coded `<br>`, so they never break awkwardly on narrow
screens.

## Where things live

| Path | What |
| --- | --- |
| `data/profile.ts` | Name, headline, links, resume + avatar flags |
| `data/projects.ts` | Eight projects, covers, stacks, verified demo links |
| `data/experience.ts` | Roles, publications, leadership |
| `data/skills.ts` | Tool groups, education, certifications |
| `data/books.ts`, `art.ts` | Misc content |
| `data/documents.ts` | Supporting proof documents for certifications and leadership |
| `data/fixtures/` | Dev-only placeholder content, gated + labelled |
| `data/readme-snapshots/` | Committed README fallback per project slug |
| `lib/readme.ts` | Fetch + snapshot fallback |
| `lib/markdown.ts` | Sanitized markdown → HTML pipeline |
| `lib/github.ts` | Server-side GitHub stats (cached 6h) |
| `lib/ask-demo.ts` | The ask bar's offline answer logic, one swappable contract |
| `data/companion.ts` | Character asset manifest; the switch for whether animation is possible |
| `lib/companion-machine.ts` | Companion behaviour, free of React and the DOM |
| `lib/companion-surfaces.ts` | Validates surface markers and builds the route graph |
| `components/companion/CompanionSurface.tsx` | Invisible marker declaring a walkable strip |
| `components/companion/` | The sprite renderer and the roaming overlay |
| `scripts/build-sprites.mjs` | Sprite pipeline: matting, segmentation, scale normalisation |
| `assets/companion/` | Untouched source character sheet, not served |
| `public/images/art/` | Paintings, with untouched originals under `originals/` |
| `public/images/projects/` | 16 cover SVGs (light + dark per project) |
| `lib/github-contributions.ts` | Contribution calendar data, GraphQL first, public mirror fallback |

**Adding content:** see [`docs/CONTENT.md`](docs/CONTENT.md) for resume, memoji,
covers, books, tracks, paintings, the ask bar's topics, and the optional
`GITHUB_TOKEN`.

## Mini Anish

An illustrated companion who walks, runs and occasionally waves along the
bottom of every page, plus a larger copy beside the About introduction that
dances, reads, codes, bats and lifts. Only one is visible at a time.

Frames are built from three supplied character sheets by
`scripts/build-sprites.mjs`, which mattes backgrounds without eating the white
sneakers, locates poses from pixel projections rather than a grid, and
normalises scale by head size.

He walks on explicit surfaces declared by `CompanionSurface` markers in the
page: section gaps, the band above the footer, and the clear margins beside the
project cards. Positions are document coordinates, so he stays attached to a
surface while the page scrolls. Movement is elapsed-time driven and validated
against real element bounds, so he never walks over text. He also climbs between surfaces, using the supplied climbing sheet. Each climb
frame carries its own contact anchor so the gripping hand stays on the edge,
and corridors are only offered when the whole swept route is clear. The one
source limitation is that every supplied climbing pose keeps the same arm
raised, so the legs alternate but the hands never swap grip; details in
[`docs/CONTENT.md`](docs/CONTENT.md#climbing).

Running, dancing, cricket, barbell, reading, waving and idle blinking are
complete. Walking runs on two frames and coding is a blinking seated pose,
because of specific gaps in the source art; both are documented with the exact
frames needed in
[`docs/CONTENT.md`](docs/CONTENT.md#mini-anish-the-character-companion).

## Ask bar

Curated, deterministic and offline. No model, no vector database, no API call:
`answerQuestion()` scores a small intent table against the question and builds
each answer from the typed data the pages already use. Submitting issues no
network request, the question is rendered as text and never as HTML, and every
source link resolves from a fixed id table rather than from anything typed.
Topics, scoring and the swap-for-RAG contract are documented in
[`docs/CONTENT.md`](docs/CONTENT.md#the-ask-bar).

## README dialog

Every project card opens its real README in an accessible modal.

READMEs are third-party content, so the pipeline is strict: raw HTML is parsed
(so text inside `<div>` wrappers survives) then sanitized with `rehype-sanitize`
against an allow-list: no scripts, no iframes, no event handlers, and only
`http`/`https`/`mailto` URLs. Images are restricted to a configured host list.
Relative links and images resolve against the correct repo, branch, and README
directory. Mermaid and other diagram fences render as readable code rather than
executing anything.

Content is fetched server-side from the repo's default branch (several README
filenames and locations are tried), cached for an hour, and falls back to the
committed snapshot in `data/readme-snapshots/` if GitHub is unreachable, so a
GitHub outage never breaks the page. The dialog footer says which source was
used.

## Content rules this site follows

Every factual claim comes from `data/`, sourced from the resume PDF, the
repository READMEs, or anishshirodkar.me. Specifically:

- Live demo links appear only for URLs that were checked and actually serve the
  app. SkillGap's `homepage` field is stale (404) and DocPilot's Streamlit app
  sits behind a login wall, so neither shows a demo link.
- The IMD work is described as a **copyright registration**, never a patent.
- QuantVision is a research sandbox, with no claim of guaranteed profit.
- Certification dates come from the issued credential where one is linked;
  otherwise they are omitted rather than guessed. No "Verified" badges.
- The contribution calendar's heading total is summed from the same days the
  squares render, and its source and refresh date are stated on the page.
- Paintings are empty until real content is supplied. Nothing is invented and
  attributed to Anish.
  catalogue, not by search-result order. Every title, artist, artwork and link
  is the iTunes Search API's own value; every preview was loaded in a browser
  and confirmed to play before being committed. Preview length is read from the
  media element rather than assumed, and each track links to the full version.
- Proof-document buttons only render when the file is actually committed:
  `lib/documents.ts` existence-checks every local path at render time.
- Authored copy contains no em dashes. Fetched README prose has them replaced
  at render time, while code, inline code, URLs and the cached snapshot are
  left untouched.

## Theme

Light by default. `components/ThemeScript.tsx` runs synchronously before paint
so there is no flash of the wrong theme; the choice persists in `localStorage`.
