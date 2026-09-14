import type { SupportingDocument } from "./documents";

export type Experience = {
  slug: string;
  role: string;
  organization: string;
  dates: string;
  location: string;
  summary: string;
  highlights: string[];
  /** Proof documents, existence-checked before a link is rendered. */
  documents?: SupportingDocument[];
  /** Where the entry came from, so future edits know what backs each claim. */
  source: "resume" | "website";
};

export const experience: Experience[] = [
  {
    /**
     * One research post. Deliberately high level.
     *
     * Supervisor names, cohort sizes, dataset and infrastructure details,
     * training metrics and unpublished findings are restricted and must not
     * appear here, in metadata, in structured data, or in assistant answers.
     * These restrictions override older resume, screenshot and repository
     * wording for this role.
     */
    slug: "miarc-rutgers",
    role: "AI/ML Research Intern",
    organization:
      "Rutgers Center for Biomedical Informatics and Health Artificial Intelligence, MIARC Lab",
    dates: "June 2026 to Present",
    location: "New Brunswick, NJ",
    summary:
      "Transformer-based approaches for hypertension prediction using longitudinal electronic health records.",
    highlights: [
      "Developing transformer-based approaches for hypertension prediction using longitudinal electronic health records.",
      "Structuring patient timelines across diagnoses, medications, laboratory results, vitals, and procedures.",
      "Building masked-language-modeling and preprocessing workflows for clinical sequence modeling.",
      "Working on clinical code grouping and consistent representation of information across health-data domains.",
    ],
    source: "resume",
  },
  {
    slug: "indian-meteorological-department",
    role: "ML Researcher",
    organization: "Indian Meteorological Department",
    dates: "April 2023 to June 2025",
    location: "Gujarat, India",
    summary:
      "Attention-LSTM weather forecasting and an IoT-to-cloud data pipeline, registered as an IP India government copyright in 2025.",
    highlights: [
      "Led end-to-end ML model development for a live government weather forecasting system, building an IoT-to-cloud data pipeline delivering real-time predictions at production scale.",
      "Engineered an attention-LSTM hybrid that improved multi-regime forecast accuracy across seasonal cycles.",
      "Validated the model and registered it as a government copyright (IP India, No. LD-20250175526, 2025). It is a copyright registration, not a patent.",
    ],
    /**
     * The official certificate, stored unchanged. Anish is listed among the
     * authors and owners; the work is jointly registered, so nothing here
     * implies sole authorship, and no other signatory is named.
     */
    documents: [
      {
        label: "View copyright certificate",
        href: "/documents/imd-weather-forecasting-copyright.pdf",
        kind: "pdf",
      },
    ],
    source: "resume",
  },
  {
    slug: "cognorise-infotech",
    role: "Artificial Intelligence Intern",
    organization: "CognoRise InfoTech",
    dates: "April to May 2024",
    location: "Mumbai, India",
    summary:
      "Developed and optimised ML models for production, with experiments on preprocessing strategies and feature engineering pipelines.",
    highlights: [
      "Developed and optimised machine learning models for production use.",
      "Ran experiments on preprocessing strategies and feature engineering pipelines using NumPy and Pandas.",
    ],
    // Not on the latest resume; carried over from anishshirodkar.me, which is
    // the only source for it. Kept verbatim rather than embellished.
    source: "website",
  },
];

export type Publication = {
  title: string;
  year: string;
  kind: string;
  registration: string;
  authors: string[];
  description: string;
  focus: string[];
  /**
   * The old site rendered "Research Paper" and "Copyright Certificate"
   * buttons, but neither carried an href, so they were placeholders. Nothing is
   * linked here until a real document URL exists.
   */
  links: { label: string; href: string }[];
};

export const publications: Publication[] = [
  {
    title:
      "Smart Weather Forecasting: IoT-Integrated Decision Support System for Real-Time Analysis",
    year: "2025",
    kind: "Registered copyright work",
    registration:
      "IP India Copyright Registration No. LD-20250175526, registered 10 October 2025",
    authors: ["Shirodkar, A. V.", "and co-authors"],
    description:
      "A jointly registered copyright covering the decision support system behind the live weather forecasting work. It is a copyright registration, not a patent, not an individual award, and not a peer-reviewed journal publication.",
    focus: ["Deep Learning", "IoT", "Meteorology", "LSTM"],
    links: [],
  },
];

/**
 * A grouped teaching post: one organisation and one date range, with the
 * per-course responsibilities kept separate underneath.
 */
export type TeachingRole = {
  course: string;
  title: string;
  points: string[];
};

export type TeachingEntry = {
  slug: string;
  organization: string;
  /** Employment basis, as recorded on the appointment. */
  employment: string;
  dates: string;
  roles: TeachingRole[];
  documents: SupportingDocument[];
};

/**
 * Past appointment, not a current role: the dates are closed and nothing here
 * claims lectures, office hours, or student numbers that were not recorded.
 */
export const teaching: TeachingEntry[] = [
  {
    slug: "rutgers-teaching-assistant",
    organization: "Rutgers University\u2013New Brunswick",
    employment: "Part-time, remote",
    dates: "May 2026 to July 2026",
    roles: [
      {
        course: "CS 205",
        title: "Teaching Assistant",
        points: [
          "Graded weekly discrete mathematics assignments covering rules of inference and rational-exponent proofs.",
          "Coordinated with the head TA on consistent rubrics and clear feedback across submissions.",
        ],
      },
      {
        course: "CS 210",
        title: "Teaching Assistant",
        points: [
          "Graded Python notebook assignments covering regular expressions, log parsing, and data analysis with pandas and matplotlib.",
          "Authored and loaded Canvas quiz content, including question groups, image-based code snippets, and numeric-answer questions, collaborating with the professor and another TA on drafting and review before publication.",
        ],
      },
    ],
    // No appointment document supplied yet. The viewer only renders a button
    // once a real file exists under public/documents/.
    documents: [],
  },
];

export type LeadershipEntry = {
  slug: string;
  role: string;
  organization: string;
  dates: string;
  /**
   * One or two plain sentences describing the role, written from the facts
   * already on record. No keyword fragments, and nothing added that the
   * source material does not support.
   */
  description: string;
  /**
   * Proof documents for the role. Local files are existence-checked on the
   * server, so an entry whose file is not committed simply renders no button.
   * See public/documents/leadership/README.md for the expected filenames.
   */
  documents: SupportingDocument[];
};

export const leadership: LeadershipEntry[] = [
  {
    slug: "late-knights-volunteer",
    role: "Volunteer",
    organization: "Late Knights, Rutgers University",
    dates: "Sep 2025 to Present",
    description:
      "Help plan and run late-night campus events, coordinate the logistics behind them, and create a welcoming, inclusive environment for students.",
    documents: [],
  },
  {
    slug: "iei-general-advisor",
    role: "General Advisor",
    organization: "Institute of Engineers India, TCET",
    dates: "Aug 2024 to Aug 2025",
    description:
      "Mentored the incoming leadership team on event planning, member engagement, and day-to-day chapter operations. Acted as the link to faculty coordinators, representing the chapter’s longer-term plans and keeping initiatives running across the handover.",
    documents: [],
  },
  {
    slug: "iei-president",
    role: "President",
    organization: "Institute of Engineers India, TCET",
    dates: "Aug 2023 to Aug 2024",
    description:
      "Led the engineering chapter for the year, running a core team of officers and organising workshops that connected coursework to practice. Managed the chapter’s tech fest, which drew over 5,000 attendees.",
    documents: [
      {
        // TCET Office Order Sr.No/Principal/302 of 2023, dated 11 August 2023,
        // appointing Anish Shirodkar President of IEI-TCET for AY 2023-24,
        // signed by Dr. B. K. Mishra, Principal. The button only renders once
        // this file is committed.
        label: "View appointment letter",
        href: "/documents/leadership/iei-tcet-president-appointment-2023.pdf",
        kind: "pdf",
      },
    ],
  },
  {
    slug: "tcet-editorial-associate",
    role: "Editorial Associate",
    organization: "IoT Department Magazine, TCET",
    dates: "Aug 2022 to Aug 2023",
    description:
      "Curated and edited technical writing from students and faculty, working alongside writers, designers, and advisors to put together a department publication on IoT research and departmental achievements.",
    documents: [],
  },
];
