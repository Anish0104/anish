export type TransformItem = {
  id: string;
  badge: string;
  title: string;
  detail: string;
  tone?: "default" | "critical" | "highlight";
};

export type ProjectTransformConfig = {
  pipelineTitle: string;
  inputHeader: string;
  inputs: TransformItem[];
  coreTitle: string;
  coreSubtitle: string;
  coreMetrics: string;
  outputHeader: string;
  outputs: TransformItem[];
};

export const projectTransforms: Record<string, ProjectTransformConfig> = {
  cerevia: {
    pipelineTitle: "Telemetry to Stroke Coverage Pipeline",
    inputHeader: "Raw Operational Telemetry",
    inputs: [
      {
        id: "c-in-1",
        badge: "1,160 Events",
        title: "Raw Event Telemetry",
        detail: "Unordered hospital calls, delayed arrivals & duplicates",
        tone: "critical",
      },
      {
        id: "c-in-2",
        badge: "Live Streams",
        title: "Synapse & Camera Signals",
        detail: "Video state, call duration & desktop helper heartbeats",
      },
      {
        id: "c-in-3",
        badge: "6 Off-Duty MDs",
        title: "Candidate Pool",
        detail: "Physicians on rest with various shifts & credentials",
      },
    ],
    coreTitle: "Deterministic Replay & 8-Rule Engine",
    coreSubtitle: "Chronological Replay · p90 Surge Forecaster · 8 Eligibility Checks",
    coreMetrics: "90-Min Gap Forecast · 0 Hallucinations",
    outputHeader: "Human-Approved Resolution",
    outputs: [
      {
        id: "c-out-1",
        badge: "Ranked Priority",
        title: "Suncrest Surge Collapse Alert",
        detail: "Coverage gap flagged 40m before 2 MDs end shift",
        tone: "highlight",
      },
      {
        id: "c-out-2",
        badge: "8-Rule Filter",
        title: "Dr. Sarah Miller Isolated",
        detail: "Only candidate meeting rest, hours cap & no clash",
        tone: "highlight",
      },
      {
        id: "c-out-3",
        badge: "Voice Loop",
        title: "ElevenLabs 1-Tap Offer",
        detail: "Auto-voice dispatched to mobile app with 10m timeout",
        tone: "highlight",
      },
    ],
  },

  "semantic-search": {
    pipelineTitle: "Two-Stage Retrieval & Reranking Pipeline",
    inputHeader: "Raw Query & Corpus",
    inputs: [
      {
        id: "ss-in-1",
        badge: "100k Passages",
        title: "MS MARCO Corpus",
        detail: "Unstructured heterogeneous document passages",
      },
      {
        id: "ss-in-2",
        badge: "User Query",
        title: "Natural Language Prompt",
        detail: "High-level conversational search query",
      },
    ],
    coreTitle: "Bi-Encoder Recall + Cross-Encoder Reranker",
    coreSubtitle: "all-MiniLM-L6 Vector Recall → Cross-Encoder Token-Level Joint Attention",
    coreMetrics: "NDCG@10: 0.692 · +143% vs BM25",
    outputHeader: "Precision Ranked Passages",
    outputs: [
      {
        id: "ss-out-1",
        badge: "Top Recall",
        title: "Candidate Sub-Space (k=100)",
        detail: "Cosine-filtered vector neighborhood in Qdrant",
        tone: "default",
      },
      {
        id: "ss-out-2",
        badge: "Top Precision",
        title: "NDCG@10 Ranked Candidates",
        detail: "Cross-encoder scoring for semantically exact answer",
        tone: "highlight",
      },
    ],
  },

  margin: {
    pipelineTitle: "Strict Policy Citation Verification",
    inputHeader: "University Documents & Inquiries",
    inputs: [
      {
        id: "m-in-1",
        badge: "Corpus Hash",
        title: "Academic Policy Handbooks",
        detail: "Official university regulations & degree requirements",
      },
      {
        id: "m-in-2",
        badge: "Student Ask",
        title: "Graduation Policy Inquiries",
        detail: "Questions prone to LLM hallucination",
      },
    ],
    coreTitle: "Zero-Hallucination Citation Guard",
    coreSubtitle: "SHA-256 Chunk Verification + Verbatim Sentence-Level Validator",
    coreMetrics: "Hit@1: 0.900 · 100% Verbatim Quotes",
    outputHeader: "Grounded Verbatim Answers",
    outputs: [
      {
        id: "m-out-1",
        badge: "100% Verbatim",
        title: "Exact Policy Extracts",
        detail: "Directly referenced passages with zero rewritten hallucination",
        tone: "highlight",
      },
      {
        id: "m-out-2",
        badge: "JSON Schema",
        title: "Structured Audit Schema",
        detail: "Source-anchored validation certificate with quote hashes",
        tone: "highlight",
      },
    ],
  },

  vouch: {
    pipelineTitle: "Agent Credential Delegation & Scoping",
    inputHeader: "Multi-Agent Task Request",
    inputs: [
      {
        id: "v-in-1",
        badge: "Cross-Party",
        title: "Autonomous Agent Task",
        detail: "Agent requests access to database or external API",
      },
      {
        id: "v-in-2",
        badge: "Private Keys",
        title: "Raw Secret Credentials",
        detail: "Sensitive user tokens needing strict protection",
        tone: "critical",
      },
    ],
    coreTitle: "Auth0 Token Vault & LLaMA 3.3 Reasoning",
    coreSubtitle: "Least-Privilege Scoping + Dynamic Time-To-Live Delegation Guard",
    coreMetrics: "0 Secret Leaks · Scoped OAuth Tokens",
    outputHeader: "Secure Ephemeral Execution",
    outputs: [
      {
        id: "v-out-1",
        badge: "Scoped Access",
        title: "Ephemeral Scoped Token",
        detail: "Restricted token granting task-only permissions",
        tone: "highlight",
      },
      {
        id: "v-out-2",
        badge: "Audit Ledger",
        title: "Tamper-Proof Audit Trail",
        detail: "Complete visibility of who requested what and when",
        tone: "highlight",
      },
    ],
  },

  skillgap: {
    pipelineTitle: "Résumé Gap Extraction & Interview Simulator",
    inputHeader: "Candidate & Job Profiles",
    inputs: [
      {
        id: "sg-in-1",
        badge: "PDF Parse",
        title: "Candidate Résumé",
        detail: "Unstructured work history, skills & education",
      },
      {
        id: "sg-in-2",
        badge: "Requisition",
        title: "Job Requirements Post",
        detail: "Must-have & nice-to-have qualification text",
      },
    ],
    coreTitle: "Gemini 2.5 Flash Entity Matcher",
    coreSubtitle: "Two-Stage Entity Extraction + Stateful Multi-Turn Interview Simulator",
    coreMetrics: "15+ Validated Résumés · Grounded Scoring",
    outputHeader: "Grounded Action Plan",
    outputs: [
      {
        id: "sg-out-1",
        badge: "Gap Report",
        title: "Prioritized Skill Shortfalls",
        detail: "Identifies precise missing skills ranked by employer importance",
        tone: "highlight",
      },
      {
        id: "sg-out-2",
        badge: "Simulator",
        title: "Tailored Mock Interview",
        detail: "Contextually grounded behavioral questions with feedback rubrics",
        tone: "highlight",
      },
    ],
  },

  redirectiq: {
    pipelineTitle: "High-Concurrency Backend Optimization",
    inputHeader: "Simulated Web Traffic",
    inputs: [
      {
        id: "r-in-1",
        badge: "Concurrency",
        title: "1–500 Client Virtual Users",
        detail: "Locust load testing simulating high surge traffic",
      },
      {
        id: "r-in-2",
        badge: "Microservices",
        title: "Raw App Ingestion",
        detail: "Express & Flask endpoints under burst conditions",
      },
    ],
    coreTitle: "Reverse Proxy Caching & Telemetry Matrix",
    coreSubtitle: "Nginx / Apache Reverse Proxy Caching + Containerized Telemetry Profiler",
    coreMetrics: "3.1x Peak Throughput · 73% Lower p99",
    outputHeader: "Stabilized High-Performance Serving",
    outputs: [
      {
        id: "r-out-1",
        badge: "Throughput",
        title: "3.1x Express Execution",
        detail: "Massive speedup in peak requests/sec over Flask baseline",
        tone: "highlight",
      },
      {
        id: "r-out-2",
        badge: "Load Shed",
        title: "82% Backend Traffic Relief",
        detail: "Edge proxy cache absorbs traffic, reducing backend stress",
        tone: "highlight",
      },
    ],
  },

  docpilot: {
    pipelineTitle: "Developer Documentation RAG Engine",
    inputHeader: "Technical Queries & Docs",
    inputs: [
      {
        id: "dp-in-1",
        badge: "Web Scrape",
        title: "PyTorch & HuggingFace Docs",
        detail: "Scraped reference guides, APIs, and code samples",
      },
      {
        id: "dp-in-2",
        badge: "Dev Query",
        title: "Natural Language Code Query",
        detail: "Questions on tensors, optimizers, and pipeline parameters",
      },
    ],
    coreTitle: "ChromaDB Retrieval + LLaMA 3.1 8B",
    coreSubtitle: "all-MiniLM-L6-v2 Embeddings + Groq Ultra-Low Latency Inference",
    coreMetrics: "Sub-Second Ingestion · Cited Verification",
    outputHeader: "Verified Coding Answers",
    outputs: [
      {
        id: "dp-out-1",
        badge: "Top-3 Chunks",
        title: "Exact Semantic Passages",
        detail: "Retrieved chunks with direct links to official documentation",
        tone: "default",
      },
      {
        id: "dp-out-2",
        badge: "LLM Synthesized",
        title: "Grounded Code Examples",
        detail: "Accurate, tested Python code snippets with zero hallucinations",
        tone: "highlight",
      },
    ],
  },

  vtrack: {
    pipelineTitle: "Real-Time Computer Vision Tracking",
    inputHeader: "High-Resolution Video Stream",
    inputs: [
      {
        id: "vt-in-1",
        badge: "30 FPS",
        title: "Highway Camera Video Feed",
        detail: "Raw frames with occlusions, shadows & high vehicle speeds",
      },
    ],
    coreTitle: "YOLOv8 Detection + ByteTrack Associator",
    coreSubtitle: "TensorRT Optimized Spatial Feature Extractor + Kalman Filter Trajectories",
    coreMetrics: "Real-Time 30+ FPS · Zero ID Switches",
    outputHeader: "Continuous Traffic Intelligence",
    outputs: [
      {
        id: "vt-out-1",
        badge: "Object BBox",
        title: "Multi-Class Vehicle Detections",
        detail: "Accurate spatial coordinates for cars, trucks, and buses",
        tone: "default",
      },
      {
        id: "vt-out-2",
        badge: "Trajectory",
        title: "Speed & Flow Estimation",
        detail: "Persistent identity tracking with accurate vehicle velocity telemetry",
        tone: "highlight",
      },
    ],
  },

  quantvision: {
    pipelineTitle: "RL Market Adaptation & Portfolio Tuning",
    inputHeader: "Historical Market Feeds",
    inputs: [
      {
        id: "qv-in-1",
        badge: "20+ Years Data",
        title: "yFinance Multi-Asset Prices",
        detail: "OHLCV data spanning 2008 crash, 2020 pandemic & bull markets",
      },
    ],
    coreTitle: "Gymnasium RL Environment & PPO Agent",
    coreSubtitle: "Stable-Baselines3 Proximal Policy Optimization + Modern Portfolio Theory",
    coreMetrics: "Superior Sharpe Ratio vs Buy & Hold",
    outputHeader: "Risk-Adjusted Rebalanced Weights",
    outputs: [
      {
        id: "qv-out-1",
        badge: "Risk Metric",
        title: "Dynamic Value-at-Risk (VaR)",
        detail: "Downside volatility hedging during market crisis regimes",
        tone: "highlight",
      },
      {
        id: "qv-out-2",
        badge: "Alpha Policy",
        title: "Trained RL Execution Policy",
        detail: "Max drawdown reduction with automated asset allocation",
        tone: "highlight",
      },
    ],
  },

  "sunspot-transformer": {
    pipelineTitle: "Autoregressive Solar Cycle Prediction",
    inputHeader: "Historical Solar Chronology",
    inputs: [
      {
        id: "st-in-1",
        badge: "1749–2026",
        title: "3,329 Monthly Observations",
        detail: "Royal Observatory of Belgium SILSO solar records",
      },
    ],
    coreTitle: "From-Scratch GPT Decoder in PyTorch",
    coreSubtitle: "100k Parameter Causal Multi-Head Attention + Residual LayerNorm",
    coreMetrics: "MAE: 16.4 Sunspots (0–398 Scale)",
    outputHeader: "Forecasted Solar Cycles",
    outputs: [
      {
        id: "st-out-1",
        badge: "Autoregressive",
        title: "Next-Month Sunspot Prediction",
        detail: "128-month context window predicting 11-year solar wave trajectories",
        tone: "highlight",
      },
    ],
  },

  veritasai: {
    pipelineTitle: "News Stream Synthesis & Editorial Frontpage",
    inputHeader: "Raw Headline Stream",
    inputs: [
      {
        id: "va-in-1",
        badge: "Live RSS",
        title: "Google News Multi-Topic Feeds",
        detail: "Noisy, duplicate headlines across breaking news categories",
      },
    ],
    coreTitle: "Enrichment & Sentiment Reasoning Pipeline",
    coreSubtitle: "Topic Clustering + Plotly Analytics + Editorial Headline Composer",
    coreMetrics: "Automated Lead Story Ranking & Briefing",
    outputHeader: "Composed Editorial Frontpage",
    outputs: [
      {
        id: "va-out-1",
        badge: "Frontpage",
        title: "Composed Lead & Insights",
        detail: "Synthesized front page with lead story, ticker, and sentiment word cloud",
        tone: "highlight",
      },
    ],
  },
};

