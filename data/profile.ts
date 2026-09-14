export type ProfileLink = {
  label: string;
  href: string;
  external: boolean;
};

export type Profile = {
  name: string;
  /**
   * Single string, so wrapping is handled by CSS `text-balance`, not <br>.
   * Short enough to sit on one line at every width, which the hero spacing in
   * `components/Hero.tsx` is tuned for.
   */
  headline: string;
  intro: string;
  location: string;
  links: ProfileLink[];
  footer: { left: string; right: string };
};

export const profile: Profile = {
  name: "Anish Shirodkar",
  headline: "Hi, I’m Anish.",
  intro:
    "I study computer science at Rutgers and build things with machine learning. This is where I share my projects, research, and a few things outside work.",
  location: "Currently in New Brunswick. Previously, Mumbai.",
  links: [
    { label: "GitHub", href: "https://github.com/Anish0104", external: true },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/anish-shirodkar/",
      external: true,
    },
    {
      label: "Email",
      href: "mailto:avs181@scarletmail.rutgers.edu",
      external: true,
    },
  ],
  footer: {
    left: "A little corner of the internet, built with care.",
    right: "New Brunswick ↔ Mumbai",
  },
};

export const email = "avs181@scarletmail.rutgers.edu";

/**
 * The PDF lives at `public/resume/anish-shirodkar-resume.pdf`. If it is ever
 * removed, flip `available` back to false and /resume returns to an honest
 * "coming soon" state instead of a link that 404s.
 */
export const resume = {
  available: true,
  path: "/resume/anish-shirodkar-resume.pdf",
  downloadAs: "anish-shirodkar-resume.pdf",
} as const;

/** Factual bio used at the top of /about. */
export const aboutIntro =
  "I’m Anish, an MS Computer Science student at Rutgers focused on ML and AI engineering. My work spans clinical transformers, information retrieval, and full-stack AI applications.";

/**
 * The memoji shown beside the introduction on /about.
 *
 * The supplied original is kept untouched at `anish-memoji-original.png`.
 * `anish-memoji.png` is a transparent derivative: the dark navy background was
 * flood-filled from the border using a navy-specific key (dark and
 * blue-dominant), so the dark brown hair and beard were untouched. Zero
 * red-dominant pixels were removed. Only the empty margin was trimmed, so the
 * subject keeps its original proportions and the full thumbs-up hand.
 */
export const avatar = {
  available: true,
  path: "/avatar/anish-memoji.png",
  alt: "Anish's memoji: a smiling illustrated avatar with a beard, giving a thumbs-up.",
  /** The derivative is transparent, so no background tile is needed. */
  hasNavyBackground: false,
  /** Intrinsic pixel size of the trimmed derivative. */
  width: 270,
  height: 285,
} as const;
