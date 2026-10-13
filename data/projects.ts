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
  award?: string;
  tagline?: string;
  role?: string;
  team?: string[];
  problem?: string;
  challenge?: string;
  decisions?: string[];
  results?: string[];
  screenshots?: { src: string; caption: string }[];
};

/**
 * Where a cover image came from.
 *
 *   screenshot    a capture of the project actually running
 *   frame         a frame lifted from output the project itself produced
 *   illustration  technical vector architecture and pipeline diagrams
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
  | "Machine learning"
  | "Systems & Performance"
  | "Healthcare Operations";

export const projectCategories: ProjectCategory[] = [
  "Healthcare Operations",
  "Retrieval & RAG",
  "AI agents",
  "Applied AI",
  "Computer vision",
  "Machine learning",
  "Systems & Performance",
];

const OWNER = "Anish0104";

export const projects: Project[] = [
  {
    slug: "cerevia",
    number: "01",
    title: "Cerevia 🏆",
    blurb: "Teleneurology command center that forecasts physician coverage gaps 90+ minutes ahead. 1st place, Sevaro track, Rutgers Health Hack 2026.",
    category: "Healthcare Operations",
    tags: ["Next.js", "Flutter", "FastAPI", "ElevenLabs"],
    featured: true,
    repo: "cerevia",
    branch: "main",
    demo: "https://lnkd.in/gr_FXcbg",
    award: "🏆 1st Place, Sevaro Track · Rutgers Health Hack 2026",
    tagline: "Catch physician coverage gaps before they reach a stroke patient.",
    role: "Web UI & UX Design. Built coordinator triage and clinical lead approval screens, role-based workflows, and design system.",
    team: [
      "Anish Shirodkar (Web UI & Flows)",
      "Rishabh Shah",
      "Joy Shah",
      "Chandan Bhopi",
      "Hitanshu Oza",
      "Krish Gopani",
    ],
    summary:
      "Teleneurology coverage command center that rebuilds physician and consult state from 1,160+ raw telemetry events, forecasts coverage gaps 90+ minutes ahead, and runs an explainable 8-rule off-shift offer loop with human approval and ElevenLabs voice notification. 🏆 1st Place, Sevaro Track, Rutgers Health Hack 2026.",
    problem:
      "Sevaro's neurologists cover 200+ hospitals remotely by phone and video. Stroke consults are the most urgent, and minutes matter. Today, calls are routed automatically and a live screen shows each doctor's status. When a rush hits, it's up to a person to notice, work out by hand who could help, and phone them. That breaks down on busy shifts, especially when a hospital surges just as doctors are ending their shifts.",
    challenge:
      "Build a tool that detects problems now and in the next 90 minutes, decides on the right fix and who approves it, and acts on it, with a person approving every offer to an off-duty doctor. The final test was a new events file the judges dropped in live, which the tool had to absorb without a restart.",
    details: [
      "Rebuilds the real picture from raw event data: replays ~1,160 events in true chronological order, handling late records, deduplicating calls, and preserving patient wait times.",
      "Works out who is actually free: combines Synapse call and video state, camera signals, and desktop helper heartbeat rather than trusting self-reported statuses.",
      "Tracks every consult against critical time limits: unassigned stroke consults, scans back with no video started, and unfinished notes near shift end.",
      "Ranks what needs attention: answers what's wrong, where, why it matters, and what to do, including who approves and why that fix beats alternatives.",
      "Forecasts 90+ minutes ahead: compares hospital volume against its normal busy baseline (p90) to detect surges and project coverage through upcoming shift ends.",
      "Finds eligible off-duty doctors via 8 strict rules: willing, credentialed, 10h rest, 60h weekly cap, no shift clash, ≥2h duration, 1 open offer cap, and <3 weekly offers.",
      "Prevents doctor swamping: limits incoming doctors to the short hospital and equalizes starting consult counts with peers.",
      "Runs the full human-in-the-loop offer loop: coordinator proposes, clinical lead approves, and ElevenLabs voice-notifies the doctor's phone for 1-tap accept/decline.",
      "Keeps an auditable deterministic log: traces every recommendation to raw data and rules with zero AI hallucinations in staffing decisions.",
      "Absorbs new data live: takes live judge event drops with zero restart.",
    ],
    decisions: [
      "No AI makes staffing decisions: all logic is deterministic, explainable, and fully auditable. Every recommendation traces back to data and rules.",
      "A person stays in charge: automated alerts only; moving consults, escalating, or contacting doctors requires explicit human approval.",
      "Privacy by design: offers contain only hospital, hours, and reason—never patient details.",
      "One role, one job: coordinators triage, clinical leads approve in 1 click, and doctors simply accept or decline.",
      "Calm interface: warm neutral palette, single accent color, and type hierarchy rather than stressful flashing alarms.",
    ],
    results: [
      "Rebuilt the 6:20pm picture to match the reference snapshot: 8 doctors and 18 open consults.",
      "Caught 4 stroke consults past their critical limits.",
      "Found the Suncrest surge (5 consults in an hour vs. 1 normal baseline) with 2 doctors leaving at 19:00.",
      "Of 6 off-duty doctors, accurately identified the only 1 who passed all 8 rules.",
    ],
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "FastAPI",
      "Python",
      "Flutter",
      "ElevenLabs",
      "Vercel",
    ],
    links: [
      {
        label: "GitHub",
        href: "https://lnkd.in/gXmgzVaK",
      },
      {
        label: "Demo",
        href: "https://lnkd.in/gr_FXcbg",
      },
    ],
    screenshots: [
      {
        src: "/images/projects/cerevia-command-screen.svg",
        caption: "Command Center: Real-time telemetry replay, 90-min stroke surge collapse prediction, and ranked attention queue.",
      },
      {
        src: "/images/projects/cerevia-approvals-table.svg",
        caption: "Clinical Lead Approvals: Deterministic 8-rule doctor eligibility matrix isolating Dr. Miller for Suncrest Hospital.",
      },
      {
        src: "/images/projects/cerevia-phone-offer.svg",
        caption: "Physician Mobile App: ElevenLabs neural voice read-out, shift specifications, and 1-tap accept/decline response loop.",
      },
    ],
    cover: {
      src: "/images/projects/cerevia.svg",
      kind: "illustration",
      alt: "Hospital command center screen with telemetry timeline, medical cross, and a doctor receiving an off-shift voice offer alert.",
      provenance: "Hand-drawn editorial doodle illustration with deep clinical sapphire accent.",
    },
  },
  {
    slug: "semantic-search",
    number: "02",
    title: "Semantic Search",
    blurb: "Two-stage information retrieval and cross-encoder reranking.",
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
      src: "/images/projects/semantic-search.svg",
      kind: "illustration",
      alt: "Magnifying glass hovering over scattered document cards, picking out one matching card with sorting arrows into a neat stack.",
      provenance: "Hand-drawn editorial doodle illustration with dusty blue accent.",
    },
  },
  {
    slug: "margin",
    number: "03",
    title: "Margin",
    blurb: "Strict citation-only campus knowledge assistant with zero hallucinations.",
    category: "Retrieval & RAG",
    tags: ["FastAPI", "Ollama", "sentence-transformers"],
    featured: true,
    repo: "margin",
    branch: "main",
    summary:
      "A citation-only campus knowledge assistant that validates every answer against official university policies, returning 100% verbatim quotes with structured JSON schemas.",
    details: [
      "Strict citation-only RAG assistant returning 100% verbatim quotes from university policies, eliminating hallucinated answers.",
      "Structured output schema with automated sentence-level quote validation against indexed document chunks.",
      "Two-stage retrieval (MiniLM embeddings + cross-encoder reranker) delivering 0.900 Hit@1 on 30 evaluation queries.",
      "Integrated SHA-256 corpus hash checking and pytest suites to guarantee retrieval stability across policy revisions.",
      "Containerized FastAPI backend with local Ollama LLM inference, reducing response latency by 35%.",
    ],
    stack: [
      "FastAPI",
      "Ollama",
      "sentence-transformers",
      "cross-encoder",
      "pytest",
      "Docker",
    ],
    links: [],
    cover: {
      src: "/images/projects/margin.svg",
      kind: "illustration",
      alt: "Open university handbook with a tiny campus building and a speech bubble connected directly to an underlined source passage.",
      provenance: "Hand-drawn editorial doodle illustration with sage green accent.",
    },
  },
  {
    slug: "vouch",
    number: "04",
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
      src: "/images/projects/vouch.svg",
      kind: "illustration",
      alt: "Friendly little robot receiving an old-fashioned key with a permission checkmark tag from a human hand through a small doorway.",
      provenance: "Hand-drawn editorial doodle illustration with muted lavender accent.",
    },
  },
  {
    slug: "skillgap",
    number: "05",
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
      src: "/images/projects/skillgap.svg",
      kind: "illustration",
      alt: "Résumé sheet folding into a staircase with a person carrying a missing step toward a gap, beneath a summit goal flag.",
      provenance: "Hand-drawn editorial doodle illustration with terracotta accent.",
    },
  },
  {
    slug: "redirectiq",
    number: "06",
    title: "RedirectIQ",
    blurb: "Standardized backend framework and reverse proxy benchmark.",
    category: "Systems & Performance",
    tags: ["Express", "Flask", "Locust", "Docker"],
    featured: false,
    repo: "RedirectIQ",
    branch: "main",
    summary:
      "A standardized benchmarking harness comparing Express.js, Flask, Nginx, and Apache under simulated loads of 1 to 500 concurrent users using Locust and Docker Compose.",
    details: [
      "Engineered standardized benchmarking harness comparing Express.js, Flask, Nginx, and Apache under simulated loads of 1–500 concurrent users using Locust and Docker Compose.",
      "Demonstrated Express outperformed Flask by up to 3.1x in peak throughput with 73% lower p99 latency under high concurrency.",
      "Identified that reverse proxy caching reduced backend request load by 82% and stabilized latency variance across all tested services.",
      "Automated telemetry collection and reproducible latency profiling across containerized environments.",
    ],
    stack: [
      "Locust",
      "Docker Compose",
      "Express.js",
      "Flask",
      "Nginx",
      "Apache",
      "Gunicorn",
    ],
    links: [],
    cover: {
      src: "/images/projects/redirectiq.svg",
      kind: "illustration",
      alt: "Three winding pipes carrying envelope requests toward a shared finish line beside a large hand-drawn stopwatch.",
      provenance: "Hand-drawn editorial doodle illustration with muted mustard accent.",
    },
  },
  {
    slug: "docpilot",
    number: "07",
    title: "DocPilot",
    blurb: "Retrieval-augmented document question answering with cited sources.",
    category: "Retrieval & RAG",
    tags: ["ChromaDB", "Groq / LLaMA 3.1", "Streamlit"],
    featured: false,
    repo: "DocPilot",
    branch: "main",
    summary:
      "An AI documentation assistant that answers plain-English questions about Hugging Face, PyTorch, and scikit-learn, with every answer traced back to official documentation.",
    details: [
      "Documentation pages are scraped, chunked, embedded with all-MiniLM-L6-v2, and stored in a local ChromaDB vector store.",
      "A question is embedded the same way, and the top-3 most semantically similar chunks are retrieved.",
      "Chunks are passed as context to LLaMA 3.1 8B via Groq, producing a grounded answer with verifiable source links.",
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
      src: "/images/projects/docpilot.svg",
      kind: "illustration",
      alt: "Paper airplane lifting off from a document folder with a dotted flight path curving back to a highlighted source passage.",
      provenance: "Hand-drawn editorial doodle illustration with slate blue accent.",
    },
  },
  {
    slug: "vtrack",
    number: "08",
    title: "VTrack",
    blurb: "Computer vision for real-time traffic detection and tracking.",
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
      "Built for real-time analysis of traffic video streams.",
    ],
    stack: ["YOLOv8", "ByteTrack", "OpenCV", "Ultralytics", "JavaScript"],
    links: [],
    cover: {
      src: "/images/projects/vtrack.svg",
      kind: "illustration",
      alt: "Curved road viewed from above with three small cars inside rectangular tracking boxes and a roadside camera on a pole.",
      provenance: "Hand-drawn editorial doodle illustration with olive green accent.",
    },
  },
  {
    slug: "quantvision",
    number: "09",
    title: "QuantVision",
    blurb: "Reinforcement-learning trading experiments and portfolio analysis.",
    category: "Machine learning",
    tags: ["Stable-Baselines3", "Gymnasium", "FastAPI"],
    featured: false,
    repo: "QuantVision",
    branch: "main",
    demo: "https://quant-vision.vercel.app",
    summary:
      "A studio for experimenting with reinforcement-learning trading strategies on historical market data, evaluated against traditional benchmarks. Research sandbox, not financial advice.",
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
      src: "/images/projects/quantvision.svg",
      kind: "illustration",
      alt: "Small thoughtful robot adjusting a seesaw with different stacks of coins before an undulating hand-drawn market chart.",
      provenance: "Hand-drawn editorial doodle illustration with dusty teal accent.",
    },
  },
  {
    slug: "sunspot-transformer",
    number: "10",
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
      src: "/images/projects/sunspot-transformer.svg",
      kind: "illustration",
      alt: "Large sun with irregular ink spots above a curling strip of calendar pages where a pencil extends a solid wave into a dotted forecast.",
      provenance: "Hand-drawn editorial doodle illustration with muted ochre accent.",
    },
  },
  {
    slug: "veritasai",
    number: "11",
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
      src: "/images/projects/veritasai.svg",
      kind: "illustration",
      alt: "Folded newspapers flowing into a broad hand-drawn funnel with one neatly organized newspaper emerging below beside a magnifying glass.",
      provenance: "Hand-drawn editorial doodle illustration with faded coral accent.",
    },
  },
];

/**
 * How a cover is introduced in its accessible name.
 */
const COVER_PREFIX: Record<CoverKind, string> = {
  screenshot: "Screenshot.",
  frame: "Frame from the project's own output.",
  illustration: "Hand-drawn illustration.",
};

export function coverAlt(cover: ProjectCover) {
  const prefix = COVER_PREFIX[cover.kind];
  return cover.alt.startsWith(prefix) ? cover.alt : `${prefix} ${cover.alt}`;
}

export function githubUrl(project: Project) {
  return `https://github.com/${OWNER}/${project.repo}`;
}

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export const featuredProjects = projects.filter((p) => p.featured);
