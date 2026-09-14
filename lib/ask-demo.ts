import { experience, leadership, publications, teaching } from "@/data/experience";
import { email, profile, resume } from "@/data/profile";
import { getProject, projects } from "@/data/projects";
import { certifications, education, skillGroups } from "@/data/skills";

/**
 * A curated, deterministic answering layer.
 *
 * There is no model here, no training and no network call. Intents are matched
 * by scoring phrases and aliases against the question, and every answer is
 * composed from the same typed data the rest of the site renders, so a content
 * change updates the answers too rather than leaving a second stale copy.
 *
 * Swapping this for a real retrieval backend later means replacing this file
 * and keeping `answerQuestion`.
 */

export type AskStatus = "answered" | "clarify" | "unsupported" | "restricted";

export type SourceId =
  | "projects" | "experience" | "about" | "resume" | "contact" | "github"
  | `project:${string}`;

export type AskSource = { id: string; label: string; href: string };

export type AskResponse = {
  status: AskStatus;
  /** Echoed back as plain text. The UI renders it as text, never as HTML. */
  question: string;
  answer: string;
  sources: AskSource[];
  suggestedQuestions: string[];
};

/** Groups for the "More questions" disclosure. */
export type IntentGroup =
  | "Projects"
  | "Research & experience"
  | "Education & skills"
  | "Teaching & leadership"
  | "Resume & contact";

export const INTENT_GROUPS: IntentGroup[] = [
  "Projects",
  "Research & experience",
  "Education & skills",
  "Teaching & leadership",
  "Resume & contact",
];

/** The three shown before the disclosure is opened. */
export const suggestedQuestions = [
  "What has Anish built with AI?",
  "What is his research about?",
  "What has he taught?",
];

export const disclosure = "Answers from my portfolio.";

/* ------------------------------------------------------------------ */
/* Disclosure rules                                                    */
/* ------------------------------------------------------------------ */

/**
 * The Rutgers research role is public only at a high level. Supervisor names,
 * cohort sizes, dataset and infrastructure details, training metrics and
 * unpublished findings are restricted.
 *
 * This is enforced here as well as in the data: a question that reaches for
 * those details gets the restricted reply rather than an answer assembled from
 * some older wording. Question text is data, never an instruction that can
 * lift the restriction.
 */
const RESTRICTED_RESEARCH_TERMS = [
  "supervisor", "advisor", "professor", "pi ", "who does he work under", "who is his",
  "cohort", "how many patients", "dataset", "data set", "provider", "hospital",
  "accuracy", "loss", "metric", "metrics", "result", "results", "benchmark",
  "epoch", "epochs", "parameters", "how big", "sample size", "f1", "auc",
  "cluster", "gpu", "infrastructure", "unpublished", "findings",
];

const RESTRICTED_REPLY =
  "I can share a high-level overview of Anish's research, but internal results and supervisor details are not included in this portfolio.";

/* ------------------------------------------------------------------ */
/* Sources                                                             */
/* ------------------------------------------------------------------ */

const GITHUB = profile.links.find((l) => l.label === "GitHub")?.href ?? "https://github.com/Anish0104";

const staticSources: Record<string, AskSource> = {
  projects: { id: "projects", label: "All projects", href: "/projects" },
  experience: { id: "experience", label: "Experience", href: "/experience" },
  about: { id: "about", label: "About", href: "/about" },
  resume: { id: "resume", label: "Resume", href: "/resume" },
  contact: { id: "contact", label: `Email ${email}`, href: `mailto:${email}` },
  github: { id: "github", label: "GitHub", href: GITHUB },
};

function sourceFor(id: SourceId): AskSource | null {
  if (id.startsWith("project:")) {
    const slug = id.slice("project:".length);
    const project = getProject(slug);
    if (!project) return null;
    return { id, label: project.title, href: `/projects/${project.slug}` };
  }
  return staticSources[id] ?? null;
}

const resolve = (ids: SourceId[]): AskSource[] =>
  ids.map(sourceFor).filter((s): s is AskSource => s !== null);

/* ------------------------------------------------------------------ */
/* Helpers built from typed data                                       */
/* ------------------------------------------------------------------ */

const list = (items: string[]) =>
  items.length <= 1
    ? items.join("")
    : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

const project = (slug: string) => getProject(slug);

/** First N detail lines of a project, which are already verified copy. */
function projectDetail(slug: string, lines = 2) {
  const p = project(slug);
  if (!p) return "";
  return p.details.slice(0, lines).join(" ");
}

function projectsUsing(term: string) {
  const needle = term.toLowerCase();
  return projects.filter((p) => p.stack.some((s) => s.toLowerCase().includes(needle)));
}

/* ------------------------------------------------------------------ */
/* Intents                                                             */
/* ------------------------------------------------------------------ */

type Intent = {
  id: string;
  group: IntentGroup;
  /** Shown in the More questions list and as a clarify option. */
  label: string;
  /** Phrases that make this intent very likely (+10). */
  strong?: string[];
  /** Supporting terms (+3). Single words match whole words only. */
  aliases: string[];
  build: () => { answer: string; sources: SourceId[] };
};

const intents: Intent[] = [
  /* ---------------- Projects ---------------- */
  {
    id: "ai-projects",
    group: "Projects",
    label: "What has Anish built with AI?",
    strong: ["built with ai", "ai projects", "what has anish built", "what have you built", "what did he build", "what has he made"],
    aliases: ["build", "built", "project", "projects", "portfolio", "shipped", "made", "work"],
    build: () => ({
      answer:
        `Anish has ${projects.length} projects on the site, across retrieval, AI agents, computer vision and applied machine learning. ` +
        `The featured ones are ${list(projects.filter((p) => p.featured).map((p) => p.title))}. ` +
        "Each project page links to its repository and can show the README without leaving the site.",
      sources: ["projects", "github"],
    }),
  },
  {
    id: "semantic-search",
    group: "Projects",
    label: "How does his Semantic Search project work?",
    strong: ["semantic search", "two stage retrieval", "bi-encoder", "cross encoder", "cross-encoder", "ms marco"],
    aliases: ["reranker", "rerank", "ndcg", "qdrant", "bm25"],
    build: () => ({
      answer: `${project("semantic-search")?.summary} ${projectDetail("semantic-search", 2)}`,
      sources: ["project:semantic-search", "github"],
    }),
  },
  {
    id: "semantic-vs-docpilot",
    group: "Projects",
    label: "What is the difference between Semantic Search and DocPilot?",
    strong: ["difference between semantic search and docpilot", "semantic search vs docpilot", "compare semantic search", "difference between them"],
    aliases: ["difference", "compare", "versus", "vs"],
    build: () => ({
      answer:
        "They sit at different ends of the same pipeline. Semantic Search is the retrieval engine itself: a two stage pipeline that ranks passages and then reranks the top candidates. " +
        "DocPilot is an application built on retrieval: it chunks and embeds documentation, then answers questions from the passages it retrieves and cites them. " +
        "One is about ranking quality, the other about answering with sources.",
      sources: ["project:semantic-search", "project:docpilot"],
    }),
  },
  {
    id: "docpilot",
    group: "Projects",
    label: "How does DocPilot answer questions about documents?",
    strong: ["docpilot", "document question answering", "document q and a", "doc pilot"],
    aliases: ["chunking", "chunks", "chromadb", "citations", "cited"],
    build: () => ({
      answer: `${project("docpilot")?.summary} ${projectDetail("docpilot", 2)}`,
      sources: ["project:docpilot", "github"],
    }),
  },
  {
    id: "skillgap",
    group: "Projects",
    label: "What does SkillGap do?",
    strong: ["skillgap", "skill gap", "resume and job", "job description"],
    aliases: ["skills gap", "interview", "matching"],
    build: () => ({
      answer: `${project("skillgap")?.summary} ${projectDetail("skillgap", 2)}`,
      sources: ["project:skillgap", "github"],
    }),
  },
  {
    id: "vouch",
    group: "Projects",
    label: "How does Vouch handle trust between agents?",
    strong: ["vouch", "credential delegation", "agent trust", "trust between agents", "scoped credential"],
    aliases: ["delegation", "authorization", "auth0", "agents"],
    build: () => ({
      answer: `${project("vouch")?.summary} ${projectDetail("vouch", 2)}`,
      sources: ["project:vouch", "github"],
    }),
  },
  {
    id: "vtrack",
    group: "Projects",
    label: "How does VTrack track vehicles?",
    strong: ["vtrack", "v track", "track vehicles", "traffic analysis", "vehicle tracking"],
    aliases: ["yolov8", "bytetrack", "detection", "tracking", "traffic"],
    build: () => ({
      answer: `${project("vtrack")?.summary} ${projectDetail("vtrack", 2)}`,
      sources: ["project:vtrack", "github"],
    }),
  },
  {
    id: "quantvision",
    group: "Projects",
    label: "How does QuantVision use reinforcement learning?",
    strong: ["quantvision", "quant vision", "reinforcement learning", "trading agent"],
    aliases: ["ppo", "dqn", "gymnasium", "stable-baselines3", "rl", "trading", "portfolio"],
    build: () => ({
      answer: `${project("quantvision")?.summary} ${projectDetail("quantvision", 2)}`,
      sources: ["project:quantvision", "github"],
    }),
  },
  {
    id: "transformers-projects",
    group: "Projects",
    label: "Which projects use transformers?",
    strong: ["which projects use transformers", "transformer projects", "where has he used transformers"],
    aliases: ["transformer", "transformers", "attention", "bert"],
    build: () => {
      const hits = projects.filter((p) =>
        p.stack.some((s) => /transformer|bert|sentence-transformers|encoder/i.test(s))
      );
      return {
        answer:
          `Transformer based work shows up in ${list(hits.map((h) => h.title))}. ` +
          "Semantic Search uses encoder models for ranking, DocPilot embeds documentation for retrieval, and Sunspot Transformer applies the architecture to a time series. " +
          "His Rutgers research also centres on transformer based modelling, described at a high level on the experience page.",
        sources: ["projects", "experience"],
      };
    },
  },
  {
    id: "backend-projects",
    group: "Projects",
    label: "Which projects demonstrate backend engineering?",
    strong: ["backend engineering", "backend projects", "which projects have a backend", "server side"],
    aliases: ["backend", "api", "fastapi", "express", "supabase", "postgres"],
    build: () => {
      const hits = projectsUsing("fastapi").concat(projectsUsing("express"), projectsUsing("supabase"));
      const unique = [...new Map(hits.map((h) => [h.slug, h])).values()];
      return {
        answer:
          `The clearest backend work is in ${list(unique.map((h) => h.title))}. ` +
          "That covers a FastAPI service layer over a vector database, an Express service handling scoped credentials, and Postgres with row level security behind a web app.",
        sources: ["projects", "about"],
      };
    },
  },
  {
    id: "source-code",
    group: "Projects",
    label: "Where can I find his project source code?",
    strong: ["source code", "github repo", "repositories", "where is the code", "find the code"],
    aliases: ["repo", "repos", "code", "git"],
    build: () => ({
      answer:
        `Everything public is at ${GITHUB}. Each project page on this site also links straight to its repository, and can open the README in a dialog without leaving the page.`,
      sources: ["github", "projects"],
    }),
  },
  {
    id: "live-demos",
    group: "Projects",
    label: "Which projects have a live demo?",
    strong: ["live demo", "live demos", "which projects are deployed", "try it", "deployed"],
    aliases: ["demo", "demos", "hosted", "online"],
    build: () => {
      const withDemo = projects.filter((p) => p.demo);
      return {
        answer:
          `${list(withDemo.map((p) => p.title))} ${withDemo.length === 1 ? "has" : "have"} a working hosted demo linked from ${withDemo.length === 1 ? "its" : "their"} project page. ` +
          "Projects without one are deliberately unlinked rather than pointed at a stale URL.",
        sources: withDemo.map((p) => `project:${p.slug}` as SourceId).concat("projects"),
      };
    },
  },

  /* ---------------- Research and experience ---------------- */
  {
    id: "research",
    group: "Research & experience",
    label: "What is Anish researching at Rutgers?",
    strong: ["research", "researching", "what is his research", "research about", "bmihai", "miarc"],
    aliases: ["lab", "biomedical", "informatics", "longitudinal", "health"],
    build: () => {
      const r = experience[0];
      return {
        answer:
          `He is an ${r.role} at the ${r.organization}, ${r.dates.toLowerCase()}. ` +
          `${r.highlights[0]} ${r.highlights[1]} ` +
          "Internal results are not shared here.",
        sources: ["experience"],
      };
    },
  },
  {
    id: "affiliations",
    group: "Research & experience",
    label: "What is his Rutgers affiliation?",
    strong: ["bmihai", "miarc", "affiliation", "affiliations", "which lab"],
    aliases: ["centre", "center", "institute"],
    build: () => {
      const r = experience[0];
      return {
        answer:
          `One post at the ${r.organization}. ` +
          `The role is ${r.role}, ${r.dates.toLowerCase()}. ${r.highlights[0]}`,
        sources: ["experience"],
      };
    },
  },
  {
    id: "imd",
    group: "Research & experience",
    label: "What did he work on at IMD?",
    strong: ["imd", "meteorological", "weather forecasting", "weather work"],
    aliases: ["weather", "forecast", "forecasting", "lstm", "iot"],
    build: () => {
      const imd = experience.find((e) => e.slug === "indian-meteorological-department");
      return {
        answer:
          `${imd?.role} at the ${imd?.organization}, ${imd?.dates.toLowerCase()}. ${imd?.summary} ` +
          "The forecasting work was registered as a government copyright, which is linked from the experience page.",
        sources: ["experience", "resume"],
      };
    },
  },
  {
    id: "copyright",
    group: "Research & experience",
    label: "What is the weather forecasting copyright registration?",
    strong: ["copyright", "copyright registration", "ld-20250175526", "registered copyright"],
    aliases: ["registration", "certificate", "ip india"],
    build: () => {
      const pub = publications[0];
      return {
        answer:
          `"${pub.title}" is registered with IP India as ${pub.registration}. ` +
          "It is a copyright registration, not a patent and not a peer reviewed publication, and it is registered jointly rather than to one person. " +
          "The certificate is linked from the IMD entry on the experience page.",
        sources: ["experience"],
      };
    },
  },
  {
    id: "certificate-link",
    group: "Research & experience",
    label: "Where can I view the copyright certificate?",
    strong: [
      "where can i view the copyright certificate", "view the copyright certificate",
      "see the certificate", "show me the imd certificate", "show me the certificate",
      "copyright certificate link", "where is the certificate",
    ],
    aliases: ["pdf", "document", "view"],
    build: () => ({
      answer:
        "The certificate is attached to the Indian Meteorological Department entry on the experience page, under \"View copyright certificate\". It opens the official two page PDF.",
      sources: ["experience"],
    }),
  },
  {
    id: "experience",
    group: "Research & experience",
    label: "What is his work experience?",
    strong: ["work experience", "employment", "work history", "career", "internship", "internships"],
    aliases: ["experience", "role", "roles", "job", "jobs", "intern", "company", "companies", "cognorise", "work"],
    build: () => ({
      answer:
        `He has held ${experience.length} roles: ` +
        experience.map((e) => `${e.role} at ${e.organization} (${e.dates})`).join(", ") +
        ". The through line is getting messy real-world data into a shape a model can learn from.",
      sources: ["experience", "resume"],
    }),
  },

  /* ---------------- Education and skills ---------------- */
  {
    id: "education",
    group: "Education & skills",
    label: "What is Anish studying?",
    strong: [
      "what is he studying", "what is anish studying", "what are you studying",
      "where did he study", "what did he study", "education", "degree",
    ],
    aliases: ["university", "studied", "study", "studying", "school", "college", "masters", "gpa", "graduate"],
    build: () => {
      const [ms, bt] = education;
      return {
        answer:
          `He is doing an ${ms.credential} at ${ms.institution}, ${ms.dates.toLowerCase()}, with ${ms.detail}. ` +
          `Before that, a ${bt.credential} at ${bt.institution}, ${bt.detail}, ${bt.note?.toLowerCase()}.`,
        sources: ["about", "resume"],
      };
    },
  },
  {
    id: "current-courses",
    group: "Education & skills",
    label: "Which courses is he currently taking?",
    strong: ["currently taking", "this semester", "current courses", "courses is he taking", "taking now", "enrolled in"],
    aliases: ["coursework", "courses", "semester", "classes"],
    build: () => {
      const current = education[0].coursework?.find((c) => /current/i.test(c.label));
      return {
        answer:
          `This semester at Rutgers he is taking ${list(current?.courses ?? [])}. ` +
          "The About page lists earlier coursework too, as a selection rather than a full transcript.",
        sources: ["about"],
      };
    },
  },
  {
    id: "tcet",
    group: "Education & skills",
    label: "What did he study at TCET?",
    strong: [
      "tcet", "thakur", "undergrad", "undergraduate", "bachelors", "b.tech", "btech",
      "study at tcet", "studied at tcet", "did he study at tcet",
    ],
    aliases: ["mumbai", "internet of things"],
    build: () => {
      const bt = education[1];
      return {
        answer:
          `A ${bt.credential} at ${bt.institution}, ${bt.dates.toLowerCase()}, with ${bt.detail} and ${bt.note?.toLowerCase()}. ` +
          "The coursework covered AI, machine learning, deep learning and reinforcement learning alongside the IoT core.",
        sources: ["about", "resume"],
      };
    },
  },
  {
    id: "languages",
    group: "Education & skills",
    label: "Which programming languages does he use?",
    strong: ["programming languages", "which languages", "what languages"],
    aliases: ["language", "languages", "python", "typescript", "javascript", "sql"],
    build: () => {
      const langs = skillGroups.find((g) => g.id === "languages");
      return {
        answer: `${list(langs?.items ?? [])}. Python is the primary one, with TypeScript for the web work.`,
        sources: ["about"],
      };
    },
  },
  {
    id: "pytorch",
    group: "Education & skills",
    label: "Where has he used PyTorch?",
    strong: ["pytorch", "where has he used pytorch", "deep learning framework"],
    aliases: ["torch", "training", "fine-tuning", "fine tuning"],
    build: () => {
      const hits = projectsUsing("pytorch");
      return {
        answer:
          `PyTorch shows up in ${hits.length ? list(hits.map((h) => h.title)) : "his machine learning work"}, and in the transformer based modelling in his Rutgers research. ` +
          "The About page links each skill area to the projects that actually use it.",
        sources: ["about", "projects"],
      };
    },
  },
  {
    id: "retrieval",
    group: "Education & skills",
    label: "What experience does he have with retrieval and RAG?",
    strong: ["rag", "retrieval augmented", "retrieval work", "vector search", "your rag work", "rag work"],
    aliases: ["retrieval", "embedding", "embeddings", "vector", "qdrant", "chromadb", "reranking"],
    build: () => ({
      answer:
        "Retrieval runs through a lot of his work. Semantic Search is a two stage retrieval pipeline with a reranking step, and DocPilot is a retrieval augmented assistant that answers from the passages it fetches and cites them. " +
        "The shared idea is that generation is only as good as what you put in front of it.",
      sources: ["project:semantic-search", "project:docpilot", "projects"],
    }),
  },
  {
    id: "vision",
    group: "Education & skills",
    label: "What computer vision tools has he used?",
    strong: ["computer vision", "vision tools", "worked with computer vision", "image processing"],
    aliases: ["opencv", "yolo", "yolov8", "bytetrack", "ultralytics", "detection"],
    build: () => {
      const vision = skillGroups.find((g) => g.id === "vision");
      return {
        answer:
          `${list(vision?.items ?? [])}. ` +
          "The applied example is VTrack, which handles detection and multi object tracking on traffic video.",
        sources: ["project:vtrack", "about"],
      };
    },
  },
  {
    id: "web",
    group: "Education & skills",
    label: "What technologies does he use for web applications?",
    strong: ["web applications", "web stack", "frontend", "full stack", "web technologies"],
    aliases: ["next.js", "nextjs", "react", "tailwind", "supabase", "flask", "streamlit"],
    build: () => {
      const web = skillGroups.find((g) => g.id === "web");
      return {
        answer:
          `${list(web?.items ?? [])}. ` +
          "SkillGap and Vouch are the clearest examples of that stack in use.",
        sources: ["project:skillgap", "project:vouch", "about"],
      };
    },
  },
  {
    id: "skills",
    group: "Education & skills",
    label: "What tools does he work with?",
    strong: ["tech stack", "what tools", "technologies", "toolkit", "what skills"],
    aliases: ["skill", "skills", "stack", "tools", "framework", "frameworks", "docker"],
    build: () => ({
      answer:
        `His toolkit spans ${list(skillGroups.map((g) => g.label.toLowerCase()))}. ` +
        "Day to day that is Python with PyTorch and Hugging Face for modelling, Qdrant and sentence-transformers for retrieval, Next.js, React, FastAPI and Supabase on the application side, and Docker for builds. " +
        "Each area on the About page links to the projects that use it.",
      sources: ["about", "projects"],
    }),
  },

  /* ---------------- Teaching and leadership ---------------- */
  {
    id: "teaching",
    group: "Teaching & leadership",
    label: "Which courses has Anish taught or assisted with?",
    strong: ["taught", "teaching", "teaching assistant", "has he taught", "courses has he taught", "helped teach"],
    aliases: ["ta", "grader", "grading", "tutor", "instructor", "assist", "assisted"],
    build: () => {
      const t = teaching[0];
      return {
        answer:
          `He was a ${t.employment.toLowerCase()} Teaching Assistant at ${t.organization}, ${t.dates.toLowerCase()}, across ${t.roles.length} courses: ${list(t.roles.map((r) => r.course))}. ` +
          "Those are courses he assisted with, not courses he took.",
        sources: ["experience", "resume"],
      };
    },
  },
  {
    id: "cs205",
    group: "Teaching & leadership",
    label: "What did he do as a CS 205 teaching assistant?",
    strong: ["cs 205", "cs205", "discrete mathematics", "discrete math"],
    aliases: ["inference", "proofs", "rubric"],
    build: () => {
      const role = teaching[0].roles.find((r) => /205/.test(r.course));
      return {
        answer: `For ${role?.course}: ${role?.points.join(" ")}`,
        sources: ["experience"],
      };
    },
  },
  {
    id: "cs210",
    group: "Teaching & leadership",
    label: "What did he do as a CS 210 teaching assistant?",
    strong: ["cs 210", "cs210", "python notebook", "helped teach python", "teach python"],
    aliases: ["pandas", "matplotlib", "canvas", "quiz", "notebooks"],
    build: () => {
      const role = teaching[0].roles.find((r) => /210/.test(r.course));
      return {
        answer: `For ${role?.course}: ${role?.points.join(" ")}`,
        sources: ["experience"],
      };
    },
  },
  {
    id: "leadership",
    group: "Teaching & leadership",
    label: "What leadership roles has he held?",
    strong: ["leadership", "leadership roles", "president", "volunteer", "clubs"],
    aliases: ["society", "committee", "editorial", "advisor"],
    build: () => ({
      answer:
        `${leadership.length} roles, mostly around student bodies and departmental work: ` +
        list(leadership.map((l) => `${l.role} at ${l.organization}`)) +
        ".",
      sources: ["experience"],
    }),
  },
  {
    id: "certifications",
    group: "Teaching & leadership",
    label: "Which certifications has he earned?",
    strong: ["certification", "certifications", "certificates", "credentials", "badges"],
    aliases: ["certified", "course completion", "skilljar", "credly"],
    build: () => ({
      answer:
        `${certifications.length} certifications, including ${list(certifications.slice(0, 3).map((c) => c.name))}. ` +
        "The About page lists them all, with verification links where the issuer provides one.",
      sources: ["about"],
    }),
  },

  /* ---------------- Resume and contact ---------------- */
  {
    id: "resume",
    group: "Resume & contact",
    label: "Where can I download his resume?",
    strong: ["resume", "cv", "download resume", "download his resume"],
    aliases: ["pdf"],
    build: () => ({
      answer: `The resume is on this site${resume.available ? ", viewable in the browser or downloadable as a PDF" : ""}.`,
      sources: ["resume", "contact"],
    }),
  },
  {
    id: "github",
    group: "Resume & contact",
    label: "Where can I find his GitHub?",
    strong: ["github", "git hub", "his github", "find his github"],
    aliases: ["profile", "repositories"],
    build: () => ({
      answer: `His GitHub is ${GITHUB}. Every project on this site links to its own repository there.`,
      sources: ["github", "projects"],
    }),
  },
  {
    id: "contact",
    group: "Resume & contact",
    label: "How can I contact him?",
    strong: ["get in touch", "contact", "hire", "email him", "reach him"],
    aliases: ["email", "linkedin", "reach", "connect", "hiring"],
    build: () => ({
      answer:
        `The quickest route is email: ${email}. ` +
        `He is also on ${list(profile.links.filter((l) => l.label !== "Email").map((l) => l.label))}.`,
      sources: ["contact", "resume", "about"],
    }),
  },
];

/** Grouped list for the More questions disclosure. */
export function questionsByGroup(): { group: IntentGroup; questions: string[] }[] {
  return INTENT_GROUPS.map((group) => ({
    group,
    questions: intents.filter((i) => i.group === group).map((i) => i.label),
  })).filter((g) => g.questions.length > 0);
}

/* ------------------------------------------------------------------ */
/* Matching                                                            */
/* ------------------------------------------------------------------ */

/** Common misspellings and shorthands, folded before matching. */
const SPELLING: Record<string, string> = {
  reserch: "research", resarch: "research", reseach: "research",
  prjects: "projects", porjects: "projects", projets: "projects",
  pytorh: "pytorch", pythorch: "pytorch",
  transfomer: "transformer", transfomers: "transformers",
  certificat: "certificate", certifcate: "certificate",
  resum: "resume", cirriculum: "curriculum",
  copywrite: "copyright", copyrite: "copyright",
  githb: "github", gihub: "github",
  contatc: "contact", contct: "contact",
  cs205: "cs 205", cs210: "cs 210",
  rutger: "rutgers", univeristy: "university",
  machien: "machine", learining: "learning",
};

/**
 * Tokenises to whole words so a short alias can never match inside a longer
 * word, and folds a few common misspellings. Dots are kept so "next.js"
 * survives, then trimmed so "research." still matches "research".
 */
function normalise(input: string) {
  let text = input
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = new Set<string>();
  for (const token of text.split(" ")) {
    if (!token) continue;
    const trimmed = token.replace(/^\.+|\.+$/g, "");
    const fixed = SPELLING[trimmed] ?? trimmed;
    words.add(token);
    if (trimmed) words.add(trimmed);
    if (fixed !== trimmed) {
      for (const part of fixed.split(" ")) words.add(part);
      text = text.replace(new RegExp(`\\b${trimmed}\\b`, "g"), fixed);
    }
  }
  return { text: text.replace(/\.(?=\s|$)/g, ""), words };
}

function scoreIntent(intent: Intent, text: string, words: Set<string>) {
  let score = 0;
  for (const term of intent.strong ?? []) {
    if (term.includes(" ") ? text.includes(term) : words.has(term)) score += 10;
  }
  for (const term of intent.aliases) {
    if (term.includes(" ") ? text.includes(term) : words.has(term)) score += 3;
  }
  return score;
}

const UNSUPPORTED =
  "I don't have that information here. You can explore my projects or get in touch.";

/** True when the question reaches for restricted research detail. */
function asksRestrictedResearch(text: string, words: Set<string>) {
  const aboutResearch =
    words.has("research") || words.has("researching") || text.includes("miarc") ||
    text.includes("bmihai") || words.has("lab") || words.has("rutgers");
  if (!aboutResearch) return false;
  return RESTRICTED_RESEARCH_TERMS.some((term) =>
    term.includes(" ") ? text.includes(term.trim()) : words.has(term.trim())
  );
}

export function answerQuestion(rawQuestion: string): AskResponse {
  const question = rawQuestion.trim();
  const { text, words } = normalise(question);

  if (!text) {
    return {
      status: "unsupported",
      question,
      answer: UNSUPPORTED,
      sources: resolve(["projects", "contact"]),
      suggestedQuestions,
    };
  }

  // Checked before intent matching, so no phrasing can route around it.
  if (asksRestrictedResearch(text, words)) {
    return {
      status: "restricted",
      question,
      answer: RESTRICTED_REPLY,
      sources: resolve(["experience"]),
      suggestedQuestions: ["What is Anish researching at Rutgers?"],
    };
  }

  const ranked = intents
    .map((intent) => ({ intent, score: scoreIntent(intent, text, words) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) {
    return {
      status: "unsupported",
      question,
      answer: UNSUPPORTED,
      sources: resolve(["projects", "github", "contact"]),
      suggestedQuestions,
    };
  }

  // Two weak, near-equal matches means the question straddles topics. Ask
  // rather than presenting one guess as though it answered precisely.
  const [best, second] = ranked;
  if (second && best.score < 10 && best.score - second.score < 3) {
    return {
      status: "clarify",
      question,
      answer: "That could mean a few things. Which would you like?",
      sources: [],
      suggestedQuestions: ranked.slice(0, 3).map((r) => r.intent.label),
    };
  }

  const { answer, sources } = best.intent.build();
  return {
    status: "answered",
    question,
    answer,
    sources: resolve(sources),
    suggestedQuestions: [],
  };
}
