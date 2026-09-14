<div align="center">
  <h1>VeritasAI</h1>
  <p><strong>Live news aggregation, editorial synthesis, and Colab-ready delivery.</strong></p>
  <p>
    VeritasAI transforms noisy headline streams into a front-page experience:
    a lead story, supporting coverage, interactive insight visuals, and a cleaner reading flow.
  </p>
  <p>
    <a href="https://colab.research.google.com/github/Anish0104/VeritasAi-News-Aggregator-Agent/blob/main/VeritasAI_Colab_Submission.ipynb">
      <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open in Colab">
    </a>
    <img src="https://img.shields.io/badge/Python-3.10+-1f6feb?style=flat-square" alt="Python">
    <img src="https://img.shields.io/badge/Frontend-Custom%20HTML%2FCSS%2FJS-2D8A70?style=flat-square" alt="Frontend">
    <img src="https://img.shields.io/badge/Notebook-Google%20Colab-f9ab00?style=flat-square" alt="Colab">
  </p>
</div>

## Overview

Most news tools either stop at raw retrieval or jump straight to charts. VeritasAI sits in the middle and treats presentation as part of the product.

It is designed to:

- collect live coverage across multiple topics
- turn those results into a composed editorial layout
- expose reasoning and visual analysis without cluttering the reading experience
- keep the project portable through a generated Google Colab notebook

## What Makes It Different

| Area | What VeritasAI does |
| --- | --- |
| Reading experience | Builds a hero-led front page instead of a plain list of links |
| Interaction model | Uses an editorial card deck, theme-aware UI, and a guided flow into deeper coverage |
| Insight layer | Combines article browsing with visual analysis like word clouds and sentiment charts |
| Delivery format | Keeps the experience available as a generated Colab notebook for demos and submission |

## Included In This Repo

This repository is intentionally scoped to the core assets that matter most for presentation and handoff.

| File | Purpose |
| --- | --- |
| [`templates.py`](templates.py) | Full frontend template embedded as a Python raw string |
| [`VeritasAI_Colab_Submission.ipynb`](VeritasAI_Colab_Submission.ipynb) | Ready-to-open Colab notebook artifact |

## Interface Highlights

- **Hero card deck**: interactive lead-story experience with hover/focus behavior and theme-aware styling
- **Editorial layout**: lead article, secondary rail, ticker, briefing card, and deeper coverage grid
- **Insights section**: word cloud plus Plotly-powered sentiment and keyword visuals
- **Theme system**: coordinated light and dark modes across the interface
- **Assistant layer**: chat panel and reasoning log presentation integrated into the page

## What The Notebook Covers

The generated notebook expands the project into a fuller pipeline that includes:

1. Live Google News RSS retrieval
2. Headline cleaning and enrichment
3. Sentiment analysis and ranking
4. Topic reasoning and refinement
5. Translation support
6. Insight visual generation
7. FastAPI wiring for the frontend experience

## Working With The Repo

If you update the interface or notebook-generation logic, regenerate the notebook with:

```bash
python3 generate_veritas_notebook.py
```

That refreshes `VeritasAI_Colab_Submission.ipynb` so the Colab file stays aligned with the current local source.

## Recommended Entry Point

If you are reviewing the project for the first time:

1. Open the notebook in Colab using the badge above.
2. Read `templates.py` if you want to inspect the frontend experience directly.
3. Use `generate_veritas_notebook.py` when you want to rebuild the notebook artifact after local changes.

## Scope Note

This repository stays intentionally lean. Temporary cache folders and scratch fragments are left out so the GitHub repo presents the polished project surface rather than development residue.
