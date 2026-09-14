import type { SupportingDocument } from "./documents";

export type SkillGroup = {
  id: string;
  label: string;
  /** Icon key resolved by components/icons/ToolIcon. */
  icon: string;
  items: string[];
  /**
   * Projects that actually use this group, each verified against the `stack`
   * field in data/projects.ts. Slugs must exist there.
   */
  usedIn?: { slug: string; title: string }[];
};

/**
 * The full skill collection, grouped. Nothing is ranked or scored: these are
 * the areas Anish works in, with the projects that evidence them.
 */
export const skillGroups: SkillGroup[] = [
  {
    id: "languages",
    label: "Languages",
    icon: "languages",
    items: ["Python", "JavaScript", "TypeScript", "C", "SQL"],
  },
  {
    id: "machine-learning",
    label: "Machine learning",
    icon: "machine-learning",
    items: [
      "PyTorch",
      "TensorFlow",
      "scikit-learn",
      "Pandas and NumPy",
      "Transformers and attention",
      "LSTM",
      "Fine-tuning",
      "PPO and DQN",
    ],
    // Sunspot Transformer is PyTorch; QuantVision is Stable-Baselines3 and
    // Gymnasium, which is the PPO and DQN work.
    usedIn: [
      { slug: "sunspot-transformer", title: "Sunspot Transformer" },
      { slug: "quantvision", title: "QuantVision" },
    ],
  },
  {
    id: "retrieval",
    label: "Retrieval & language models",
    icon: "retrieval",
    items: [
      "LLMs and RAG",
      "LangChain",
      "Sentence Transformers",
      "Hugging Face",
      "Qdrant and ChromaDB",
      "BM25",
      "Cross-encoder reranking",
      "NDCG and MRR",
      "Gemini API",
      "Groq and LLaMA",
      "Prompt engineering",
    ],
    // Semantic Search uses Qdrant, sentence-transformers and a cross-encoder;
    // DocPilot uses ChromaDB and sentence-transformers.
    usedIn: [
      { slug: "semantic-search", title: "Semantic Search" },
      { slug: "docpilot", title: "DocPilot" },
    ],
  },
  {
    id: "vision",
    label: "Computer vision",
    icon: "vision",
    items: [
      "YOLOv8",
      "ByteTrack",
      "OpenCV",
      "Ultralytics",
      "Object detection",
      "Multi-object tracking",
    ],
    // VTrack is YOLOv8, ByteTrack, OpenCV and Ultralytics.
    usedIn: [{ slug: "vtrack", title: "VTrack" }],
  },
  {
    id: "web",
    label: "Web & backend",
    icon: "web",
    items: [
      "Next.js and React",
      "FastAPI",
      "Flask",
      "REST APIs",
      "Streamlit",
      "Supabase (PostgreSQL + RLS)",
      "Firebase",
      "Tailwind CSS",
      "shadcn/ui",
    ],
    // SkillGap is Next.js, React, Supabase and shadcn/ui; Vouch is React and
    // an Express service layer.
    usedIn: [
      { slug: "skillgap", title: "SkillGap" },
      { slug: "vouch", title: "Vouch" },
    ],
  },
  {
    id: "infrastructure",
    label: "Deployment & infrastructure",
    icon: "infrastructure",
    items: [
      "Docker",
      "AWS and GCP",
      "Vercel",
      "Git and CI/CD",
      "Model deployment",
      "Inference optimization",
      "Weights & Biases",
      "Hugging Face Spaces",
      "Anaconda",
    ],
  },
];

/** A project that demonstrably uses a tool. `slug` must exist in data/projects. */
export type ToolProject = { slug: string; title: string };

export type FeaturedTool = {
  name: string;
  /** Icon key resolved by components/icons/ToolIcon. */
  icon: string;
  /** One sentence on how it is actually used. Never a rating. */
  use: string;
  /**
   * Projects verified to use this tool. Each one was checked against that
   * project's own `stack` in data/projects.ts or against its README snapshot
   * in data/readme-snapshots, and the evidence is recorded in the comment
   * above the entry.
   *
   * A tool is not attached to a project just because both appear somewhere on
   * this site. Two cases worth keeping in mind, because both were nearly got
   * wrong: DocPilot's README names PyTorch as one of the documentation sets it
   * indexes, not as a dependency, and Vouch's README states outright that its
   * state is persisted to JSON files rather than to Postgres.
   */
  projects: ToolProject[];
  /** Why a tool has no project links, where it has none. */
  noProjectsNote?: string;
};

/**
 * The eight tools on the shelf. Not a ranking, not a proficiency score, and
 * not the whole toolkit: the rest is in `skillGroups` above and is shown under
 * the "Full toolkit" disclosure. Every one of these also appears there.
 */
export const featuredTools: FeaturedTool[] = [
  {
    name: "Python",
    icon: "Python",
    use: "The language nearly all of this is written in, from retrieval and vision services through to the training code.",
    // semantic-search: README installs requirements.txt and runs eval/run_eval.py.
    // vtrack: README tech stack names Python 3.11 for the backend.
    // veritasai: project stack lists Python 3.10+.
    projects: [
      { slug: "semantic-search", title: "Semantic Search" },
      { slug: "vtrack", title: "VTrack" },
      { slug: "veritasai", title: "VeritasAI" },
    ],
  },
  {
    name: "PyTorch",
    icon: "PyTorch",
    use: "Used to write model code by hand rather than assemble it: the Sunspot Transformer is a decoder built in it from scratch, with no transformer libraries.",
    // sunspot-transformer: project stack lists PyTorch, and the details say the
    // decoder is written from scratch with no pre-trained models.
    projects: [{ slug: "sunspot-transformer", title: "Sunspot Transformer" }],
  },
  {
    name: "React",
    icon: "React",
    use: "The interface layer on the projects that have a dashboard rather than a notebook.",
    // skillgap: README tech stack names React 19.
    // vouch: README tech stack names React 18, and the repo has apps/dashboard.
    // vtrack: README tech stack names React 18 with Vite and React Three Fiber.
    projects: [
      { slug: "skillgap", title: "SkillGap" },
      { slug: "vouch", title: "Vouch" },
      { slug: "vtrack", title: "VTrack" },
    ],
  },
  {
    name: "Next.js",
    icon: "NextJs",
    use: "The application framework for the full-stack projects, App Router on both.",
    // skillgap: README names Next.js 15 (App Router).
    // quantvision: README names Next.js 14+ (App Router) for the dashboard.
    projects: [
      { slug: "skillgap", title: "SkillGap" },
      { slug: "quantvision", title: "QuantVision" },
    ],
  },
  {
    name: "FastAPI",
    icon: "FastApi",
    use: "The service layer that puts a model behind an HTTP API, with a separate front end calling it.",
    // semantic-search: project stack lists FastAPI; api/main.py is the service.
    // vtrack: README architecture names FastAPI with OpenCV and YOLOv8.
    // quantvision: project stack and README both name FastAPI for the backend.
    projects: [
      { slug: "semantic-search", title: "Semantic Search" },
      { slug: "vtrack", title: "VTrack" },
      { slug: "quantvision", title: "QuantVision" },
    ],
  },
  {
    name: "Docker",
    icon: "Docker",
    use: "Containerises the Python services so a model, its weights and its dependencies ship as one image.",
    // semantic-search: project stack lists Docker and the repo has a Dockerfile.
    // vtrack: README infrastructure line says the backend is dockerised.
    projects: [
      { slug: "semantic-search", title: "Semantic Search" },
      { slug: "vtrack", title: "VTrack" },
    ],
  },
  {
    name: "PostgreSQL",
    icon: "PostgreSql",
    use: "Reached through Supabase, which supplies the Postgres database, its row level security policies and file storage.",
    // skillgap: README names Supabase (PostgreSQL, Row Level Security).
    // vtrack: README architecture stores job metadata in Supabase PostgreSQL.
    // Deliberately not Vouch: its README says state is persisted to JSON files,
    // not Postgres.
    projects: [
      { slug: "skillgap", title: "SkillGap" },
      { slug: "vtrack", title: "VTrack" },
    ],
  },
  {
    name: "Git",
    icon: "Git",
    use: "Version control and the history behind every repository linked from this site.",
    // No project claims Git as part of its own stack, and a `git clone` line in
    // an install guide is evidence that a repository exists, not that Git is a
    // technology of that project. So no links are offered rather than eight
    // weak ones.
    projects: [],
    noProjectsNote:
      "Every project here is a Git repository, but none names it as part of its own stack, so there is nothing specific to link to.",
  },
];

/** A named set of courses within one institution. */
export type CourseworkGroup = { label: string; courses: string[] };

export type EducationEntry = {
  institution: string;
  credential: string;
  dates: string;
  detail?: string;
  note?: string;
  /**
   * Course names only. No course numbers, sections, credits, instructors,
   * meeting times, rooms, or exam schedules are published. Courses that meet
   * on several days appear once.
   */
  coursework?: CourseworkGroup[];
};

/** From the latest resume PDF in public/resume. */
export const education: EducationEntry[] = [
  {
    institution: "Rutgers University, New Brunswick",
    credential: "MS Computer Science, AI & ML Track",
    dates: "September 2025 to Present",
    detail: "GPA 3.75 / 4",
    coursework: [
      {
        label: "Currently taking",
        courses: [
          "Machine Learning",
          "Brain Inspired Computing",
          "Software Engineering I",
        ],
      },
      {
        label: "Previously taken",
        courses: [
          "Introduction to Artificial Intelligence",
          "Massive Data Mining",
          "Operating System Design",
          "Database Systems for Data Science",
          "Internet Services",
          "Topics in Computers in Biomedicine",
        ],
      },
    ],
  },
  {
    institution:
      "Thakur College of Engineering & Technology, University of Mumbai",
    credential: "B.Tech, Internet of Things",
    dates: "December 2021 to May 2025",
    detail: "CGPA 9.50 / 10",
    note: "Ranked 2nd in the batch",
    coursework: [
      {
        label: "Coursework",
        courses: [
          "Artificial Intelligence",
          "Machine Learning",
          "Deep Learning",
          "Reinforcement Learning",
          "Foundation for Data Science",
          "Social Network Analysis",
          "Data Structures",
          "Database Management Systems",
          "Operating Systems",
          "Data Communication and Computer Networks",
          "Cryptography and Network Security",
          "Cloud Computing",
          "Microprocessor and Computer Organization",
          "Introduction to IoT and Sensor Technology",
          "IoT Networking and Protocols",
        ],
      },
    ],
  },
];

export type Certification = {
  name: string;
  issuer: string;
  /** Omitted where no source could confirm it. */
  date?: string;
  description: string;
  skills: string[];
  credentialId?: string;
  /**
   * How the entry was established:
   *  "credential"      the linked certificate page itself was read
   *  "website"         only anishshirodkar.me listed it
   *  "linkedin-export" from the LinkedIn export text supplied by Anish
   *  "resume"          from the latest resume PDF
   */
  source: "credential" | "website" | "linkedin-export" | "resume";
  documents: SupportingDocument[];
};

export const certifications: Certification[] = [
  {
    name: "Model Context Protocol: Advanced Topics",
    issuer: "Anthropic Education, via Skilljar",
    date: "11 March 2026",
    source: "credential",
    description:
      "Advanced Model Context Protocol concepts including multi-server orchestration, resource management, and building production-grade AI tool integrations.",
    skills: ["MCP", "Multi-server orchestration", "AI tool integration"],
    documents: [
      {
        label: "Verify credential",
        href: "https://verify.skilljar.com/c/e2fnw8e3rqzj",
        kind: "link",
      },
    ],
  },
  {
    name: "Introduction to Agent Skills",
    issuer: "Anthropic Education, via Skilljar",
    date: "5 March 2026",
    source: "credential",
    description:
      "Foundational training on building and deploying intelligent agent skills, covering prompt engineering, tool use, and agentic workflows.",
    skills: ["Agent design", "Tool use", "Agentic workflows"],
    documents: [
      {
        label: "Verify credential",
        href: "https://verify.skilljar.com/c/6eoywixe3fv3",
        kind: "link",
      },
    ],
  },
  {
    name: "Fundamentals of LLMs, The LLM Course",
    issuer: "Hugging Face",
    date: "12 March 2026",
    source: "website",
    description:
      "The Fundamentals of LLMs module of The LLM Course, covering transformer architectures, tokenization, and modern LLM training paradigms.",
    skills: ["Transformers", "Tokenization", "LLM training"],
    documents: [],
  },
  {
    // A separate Hugging Face credential from the LLM course above: same
    // issuer, different course. Listed on the resume only, with no date given
    // there and no credential link to check, so no date is shown.
    name: "AI Agents Fundamentals",
    issuer: "Hugging Face",
    source: "resume",
    description:
      "Hugging Face's AI Agents Fundamentals credential, listed on the latest resume.",
    skills: ["AI agents", "Tool use"],
    documents: [],
  },
  {
    name: "AWS Educate: Getting Started with Compute",
    issuer: "Amazon Web Services",
    source: "website",
    description:
      "AWS Educate training badge covering foundational cloud compute services including EC2, Lambda, and container deployments.",
    skills: ["EC2", "Lambda", "Cloud compute"],
    documents: [
      {
        label: "Verify credential",
        href: "https://www.credly.com/badges/31cbadf2-2174-4dd5-aace-7a44580e5997/linked_in_profile",
        kind: "link",
      },
    ],
  },
  {
    // Issued by Simplilearn for a Google Cloud course. Simplilearn is the
    // issuer; this is not a Google-issued professional certification.
    name: "Introduction to Generative AI Studio (Google Cloud course)",
    issuer: "Simplilearn",
    date: "April 2024",
    credentialId: "5051552",
    source: "linkedin-export",
    description:
      "A Simplilearn course-completion certificate for the Google Cloud Introduction to Generative AI Studio curriculum.",
    skills: ["Generative AI", "Google Cloud"],
    documents: [],
  },
  {
    name: "AI & Machine Learning with Azure (Codeless) workshop",
    issuer: "Thakur College of Engineering & Technology",
    date: "February 2023",
    source: "linkedin-export",
    description:
      "A departmental workshop on building AI and machine learning solutions on Azure without writing code.",
    skills: ["Azure", "No-code ML"],
    documents: [],
  },
];
