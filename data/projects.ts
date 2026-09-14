export type ProjectLink = { label: string; href: string };

export type Project = {
  slug: string;
  number: string;
  title: string;
  /** One line for cards. */
  blurb: string;
  /** Filter/category label. */
  category: ProjectCategory;
  /** A few stack tags for the card. Full stack lives in `stack`. */
  tags: string[];
  featured: boolean;
  /** GitHub repo name under github.com/Anish0104 */
  repo: string;
  /** Default branch. README links resolve against this. */
  branch: string;
  /**
   * Only set when the URL was checked and actually serves the app. Repos with
   * a stale `homepage` field (SkillGap) or an app behind a login wall
   * (DocPilot on Streamlit Cloud) deliberately have none.
   */
  demo?: string;
  summary: string;
  details: string[];
  stack: string[];
  links: ProjectLink[];
  cover: ProjectCover;
};

/**
 * Where a cover image came from.
 *
 *   screenshot    a capture of the project actually running
 *   frame         a frame lifted from output the project itself produced
 *   illustration  artwork, including images that merely look photographic
 *
 * Seven of the eight covers are generated conceptual images in a photographic
 * style. Looking like a photograph is not the same as being one, so they are
 * classified as illustrations and the card says so before describing them. The
 * eighth, VTrack, is real output from the project itself.
 *
 * `provenance` records what each image actually is. Nothing written inside
 * these images, on a staged page or a staged chart, is treated as a fact about
 * the project: it is never quoted in a description, a metric, a research claim
 * or an Ask bar answer. Where a staged detail would have read as a measured
 * result, it was cropped out in `scripts/build-project-covers.mjs`.
 *
 * Earlier covers are kept at `assets/projects/archive/`: real screenshots of
 * four of these projects running, and the drawn vector scenes these replaced.
 *
 * Kept in the data rather than only in the build script because the card puts
 * it in front of the reader, in the image's accessible name. A drawing and a
 * screenshot of a working system are different claims, and the difference
 * should not depend on the reader guessing from the picture.
 *
 * Covers are built by `scripts/build-project-covers.mjs` from the untouched
 * sources in `assets/projects/`. Both theme variants are generated from the
 * same source, so `src` names the light one and the dark one is the same path
 * with `-dark` before the extension.
 */
export type CoverKind = "screenshot" | "frame" | "illustration";

export type ProjectCover = {
  src: string;
  alt: string;
  kind: CoverKind;
  /** What is on screen and where it came from. Shown nowhere; for maintainers. */
  provenance: string;
};

export type ProjectCategory =
  | "Retrieval & RAG"
  | "AI agents"
  | "Applied AI"
  | "Computer vision"
  | "Machine learning";

export const projectCategories: ProjectCategory[] = [
  "Retrieval & RAG",
  "AI agents",
  "Applied AI",
  "Computer vision",
  "Machine learning",
];

const OWNER = "Anish0104";

export const projects: Project[] = [
  {
    slug: "semantic-search",
    number: "01",
    title: "Semantic Search",
    blurb: "Two-stage information retrieval and reranking.",
    category: "Retrieval & RAG",
    tags: ["Qdrant", "FastAPI", "sentence-transformers"],
    featured: true,
    repo: "semantic-search",
    branch: "main",
    summary:
      "A two-stage retrieval pipeline: a bi-encoder pulls candidates out of a vector index, then a cross-encoder reranker reorders them before they reach the user.",
    details: [
      "Two-stage retrieval (bi-encoder MiniLM-L6 for recall, cross-encoder reranker for precision) over 100K MS MARCO passages.",
      "Reported NDCG@10 of 0.692 on that benchmark: 143% above BM25 and 12% above the bi-encoder alone.",
      "Evaluation harness measuring NDCG@10, MRR@10, and Recall@100 across three retrieval systems end to end.",
      "Production API served with FastAPI and Qdrant, with Apple Silicon MPS acceleration, containerised with Docker.",
    ],
    stack: [
      "sentence-transformers",
      "Qdrant",
      "cross-encoder",
      "FastAPI",
      "MS MARCO",
      "Docker",
    ],
    links: [],
    cover: {
      src: "/images/projects/semantic-search.webp",
      kind: "illustration",
      alt: "A printed page of prose on a desk with one passage picked out in yellow highlighter, and a small search control resting beside it.",
      provenance:
        "A generated conceptual image in a photographic style, not a photograph of real work and not a screenshot. The page carries no title, author line or venue, so it suggests a paper without implying a publication, and none of its text is quoted anywhere on this site.",
    },
  },
  {
    slug: "skillgap",
    number: "02",
    title: "SkillGap",
    blurb: "Résumé and job skill analysis with grounded interview practice.",
    category: "Applied AI",
    tags: ["Next.js", "Supabase", "Gemini 2.5 Flash"],
    featured: true,
    repo: "SkillGap",
    branch: "main",
    summary:
      "Extracts skills from a résumé and a job description, analyses the gap between them, and turns that gap into interview practice grounded in the candidate’s own experience.",
    details: [
      "Two-stage NLP pipeline using Gemini 2.5 Flash to extract and rank skill entities from PDF résumés and job descriptions.",
      "Gap report accuracy and ranking quality validated across 15+ real-world résumés.",
      "Stateful multi-turn interview simulator using prompt grounding, so questions are anchored to the candidate’s résumé, with structured performance scoring.",
    ],
    stack: [
      "Next.js 15",
      "React 19",
      "Supabase",
      "Gemini 2.5 Flash",
      "pdf.js",
      "shadcn/ui",
    ],
    links: [],
    cover: {
      src: "/images/projects/skillgap.webp",
      kind: "illustration",
      alt: "A resume and a job description lying side by side, with thin lines drawn from three skills on one sheet to the same skills listed on the other.",
      provenance:
        "A generated conceptual image in a photographic style, not a photograph of real work and not a screenshot. The two sheets are staged sample documents belonging to nobody, and neither carries a real name, employer or result.",
    },
  },
  {
    slug: "vouch",
    number: "03",
    title: "Vouch",
    blurb: "Scoped authorization and credential delegation for AI agents.",
    category: "AI agents",
    tags: ["Auth0 Token Vault", "LLaMA 3.3 70B", "Express"],
    featured: true,
    repo: "vouch",
    branch: "main",
    demo: "https://vouch-q017.onrender.com/",
    summary:
      "A cross-party trust layer for AI agents: an agent gets exactly the access a task needs, as a scoped, auditable token, and nothing beyond it.",
    details: [
      "Credential delegation built on Auth0 Token Vault, issuing scoped, auditable access tokens for multi-agent workflows.",
      "Removes raw credential exposure across trust boundaries between parties.",
      "Groq / LLaMA 3.3 70B reasoning engine, a Vouch SDK CLI, and a React/Vite dashboard with role-based access control.",
      "Deployed full-stack to Render with an Express API backend serving live agent requests.",
    ],
    stack: [
      "Auth0 Token Vault",
      "Groq / LLaMA 3.3 70B",
      "React",
      "Vite",
      "Express",
      "Render",
    ],
    links: [],
    cover: {
      src: "/images/projects/vouch.webp",
      kind: "illustration",
      alt: "A blank white card held up to a wall-mounted access reader showing a green light, with a small padlocked label reading scoped access beside it.",
      provenance:
        "A generated conceptual image in a photographic style, not a photograph of real work and not a screenshot. The reader and the card are a stand-in for delegated access rather than a picture of the running product.",
    },
  },
  {
    slug: "docpilot",
    number: "04",
    title: "DocPilot",
    blurb: "Retrieval-augmented document question answering with cited sources.",
    category: "Retrieval & RAG",
    tags: ["ChromaDB", "Groq / LLaMA 3.1", "Streamlit"],
    featured: false,
    repo: "DocPilot",
    branch: "main",
    summary:
      "An AI documentation assistant that answers plain-English questions about Hugging Face, PyTorch, and scikit-learn, with every answer traced back to the official docs.",
    details: [
      "Documentation pages are scraped, chunked, embedded with all-MiniLM-L6-v2, and stored in a local ChromaDB vector store.",
      "A question is embedded the same way, and the top-3 most semantically similar chunks are retrieved.",
      "Those chunks are passed as context to LLaMA 3.1 8B via Groq, which produces a grounded answer returned with its source links.",
      "Streamlit front end over a committed, pre-built vector store.",
    ],
    stack: [
      "Streamlit",
      "ChromaDB",
      "sentence-transformers",
      "Groq / LLaMA 3.1 8B",
      "BeautifulSoup",
    ],
    links: [],
    cover: {
      src: "/images/projects/docpilot.webp",
      kind: "illustration",
      alt: "An open printed document with a paragraph picked out in highlighter, and a small answer card beside it linked back to that paragraph and citing a page number.",
      provenance:
        "A generated conceptual image in a photographic style, not a photograph of real work and not a screenshot. It is cropped from the right of the source: the left page carried a small chart captioned as validation loss with a series beating a baseline, which is invented sample artwork and would have read as a measured result, so it was cropped out rather than made small. The body text that remains is sample prose and is quoted nowhere.",
    },
  },
  {
    slug: "vtrack",
    number: "05",
    title: "VTrack",
    blurb: "Computer vision for traffic detection and tracking.",
    category: "Computer vision",
    tags: ["YOLOv8", "ByteTrack", "OpenCV"],
    featured: false,
    repo: "Vtrack-Traffic_Analysis_System",
    branch: "main",
    demo: "https://vtrack-traffic-analysis-system.vercel.app",
    summary:
      "Real-time traffic analytics: detecting vehicles, tracking them across frames, and estimating speed from the resulting tracks.",
    details: [
      "Multi-object detection with YOLOv8, with identities maintained across frames by ByteTrack.",
      "Speed estimation derived from tracked vehicle trajectories.",
      "Built for real-time analysis of traffic video.",
    ],
    stack: ["YOLOv8", "ByteTrack", "OpenCV", "Ultralytics", "JavaScript"],
    links: [],
    cover: {
      src: "/images/projects/vtrack.webp",
      kind: "frame",
      alt: "A frame of real traffic footage annotated by VTrack: detection boxes around cars, trucks and motorcycles, each labelled with a track id and an estimated speed, with running vehicle counts in the corner.",
      provenance:
        "The one cover here that is real output. A frame from one of the pipeline's own processed output videos: every box, id, speed and count in the image was produced by the project. The artwork and crop are unchanged; only the surround it used to sit in was removed, so that it matches the other seven.",
    },
  },
  {
    slug: "quantvision",
    number: "06",
    title: "QuantVision",
    blurb:
      "Reinforcement-learning trading experiments and portfolio analysis.",
    category: "Machine learning",
    tags: ["Stable-Baselines3", "Gymnasium", "FastAPI"],
    featured: false,
    repo: "QuantVision",
    branch: "main",
    demo: "https://quant-vision.vercel.app",
    summary:
      "A studio for experimenting with reinforcement-learning trading strategies on historical market data, evaluated against traditional benchmarks. It is a research sandbox, not investment advice.",
    details: [
      "Proximal Policy Optimization agents (Stable-Baselines3) trained in a custom Gymnasium trading environment.",
      "Strategies evaluated on Sharpe ratio, Sortino ratio, max drawdown, and equity-curve comparison against buy-and-hold.",
      "Portfolio allocation explored with Modern Portfolio Theory; risk views include Value at Risk, benchmark beta, and correlation heatmaps.",
      "Historical stress testing across the 2008, 2020, and 2022 market regimes, with market data pulled via yFinance.",
    ],
    stack: [
      "Stable-Baselines3",
      "Gymnasium",
      "FastAPI",
      "Next.js",
      "yFinance",
      "Pandas",
    ],
    links: [],
    cover: {
      src: "/images/projects/quantvision.webp",
      kind: "illustration",
      alt: "A close crop of a candlestick market chart against a dark grid, with one stretch of it marked out by a faint rectangle labelled as a strategy.",
      provenance:
        "A generated conceptual image in a photographic style, not a photograph of real work and not a screenshot. The candles are invented and carry no ticker, date, axis value or return, so the cover shows the shape of the work without reporting a result.",
    },
  },
  {
    slug: "sunspot-transformer",
    number: "07",
    title: "Sunspot Transformer",
    blurb: "A GPT-style decoder in PyTorch for monthly sunspot forecasting.",
    category: "Machine learning",
    tags: ["PyTorch", "Transformers", "Time series"],
    featured: false,
    repo: "sunspot-transformer",
    branch: "main",
    summary:
      "A transformer decoder written from scratch in PyTorch, with no pre-trained models and no transformer libraries, trained autoregressively on 275 years of solar observations.",
    details: [
      "Given the last 128 months of sunspot activity, the model predicts the next month’s count, trained the way a GPT model is trained on text.",
      "100,161 parameters: 64-dim embeddings, 4 attention heads, 2 layers, 256-dim feedforward, causal masking with residuals and LayerNorm.",
      "Mean Absolute Error of 16.4 sunspots on a held-out validation set spanning 1973–2026, on a 0–398 scale.",
      "Ablations over attention-head count and over dropout / weight-decay combinations, with the small baseline holding up against a 3.5× larger variant.",
      "Data: 3,329 monthly observations from SILSO, Royal Observatory of Belgium (1749 onwards).",
    ],
    stack: ["PyTorch", "NumPy", "Google Colab", "SILSO dataset"],
    links: [
      {
        label: "Data source: SILSO",
        href: "https://www.sidc.be/SILSO/monthlyssnplot",
      },
    ],
    cover: {
      src: "/images/projects/sunspot-transformer.webp",
      kind: "illustration",
      alt: "A close view of the sun's granulated surface with two sunspots ringed by thin circular markers, one large with a visible penumbra and one small.",
      provenance:
        "A generated conceptual image in a photographic style. It is not a solar observation, not an image from SILSO or any observatory, and not model output: the spots are drawn, and the markers on them stand for the idea of tracking rather than for a measurement.",
    },
  },
  {
    slug: "veritasai",
    number: "08",
    title: "VeritasAI",
    blurb: "News aggregation, enrichment, ranking, and editorial presentation.",
    category: "Applied AI",
    tags: ["Python", "Plotly", "Colab"],
    featured: false,
    repo: "VeritasAi-News-Aggregator-Agent",
    branch: "main",
    summary:
      "Turns a noisy headline stream into a composed front page (a lead story, supporting coverage, and an insight layer) rather than a plain list of links.",
    details: [
      "Editorial layout with a lead article, secondary rail, ticker, briefing card, and a deeper coverage grid.",
      "Insights section combining a word cloud with Plotly sentiment and keyword visuals.",
      "The generated Colab notebook covers the fuller pipeline: live Google News RSS retrieval, headline cleaning and enrichment, sentiment analysis and ranking, topic reasoning, translation support, and FastAPI wiring.",
      "The repository is intentionally lean: it holds the frontend template and the Colab notebook artifact rather than the full working tree.",
    ],
    stack: ["Python 3.10+", "Plotly", "FastAPI", "Google Colab", "HTML/CSS/JS"],
    links: [
      {
        label: "Open in Colab",
        href: "https://colab.research.google.com/github/Anish0104/VeritasAi-News-Aggregator-Agent/blob/main/VeritasAI_Colab_Submission.ipynb",
      },
    ],
    cover: {
      src: "/images/projects/veritasai.webp",
      kind: "illustration",
      alt: "Overlapping newspaper clippings on a desk, with a passage on one sheet and a passage on another each tagged as a separate source and joined by a thin line.",
      provenance:
        "A generated conceptual image in a photographic style, not a photograph of real work and not a screenshot. The clippings are invented and no headline, outlet or quotation in them is real. The two source tags stand for gathering coverage of one story from more than one outlet, which is what the aggregator does; they do not imply fact-checking or verification, which the project does not claim.",
    },
  },
];

/**
 * How a cover is introduced in its accessible name.
 *
 * A drawing and a capture of a running system are different claims, so the
 * alternative text says which one this is before describing it. Readers who
 * see the image get the distinction from the picture; readers who do not
 * should not have to infer it.
 */
const COVER_PREFIX: Record<CoverKind, string> = {
  screenshot: "Screenshot.",
  frame: "Frame from the project's own output.",
  illustration: "Illustration.",
};

export function coverAlt(cover: ProjectCover) {
  const prefix = COVER_PREFIX[cover.kind];
  // Some alt strings already open with the word, so it is not said twice.
  return cover.alt.startsWith(prefix) ? cover.alt : `${prefix} ${cover.alt}`;
}

export function githubUrl(project: Project) {
  return `https://github.com/${OWNER}/${project.repo}`;
}

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export const featuredProjects = projects.filter((p) => p.featured);
