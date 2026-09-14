# DocPilot

DocPilot is an AI documentation assistant that gives precise, source-cited answers about HuggingFace, PyTorch, and Scikit-learn. Ask a question in plain English and get a direct answer backed by the official docs.

Built with a RAG (Retrieval-Augmented Generation) pipeline — no hallucinations, every answer traces back to a real source.

**Live demo**: [docpilot.streamlit.app](https://docpilot.streamlit.app)

---

## How it works

1. **Ingest** — documentation pages are scraped, chunked, embedded with `all-MiniLM-L6-v2`, and stored in a local ChromaDB vector store.
2. **Retrieve** — your question is embedded the same way and the top-3 most semantically similar chunks are fetched.
3. **Generate** — the chunks are passed as context to LLaMA 3.1 (via Groq) which produces a focused, grounded answer.

```
User question
    │
    ▼
Sentence-Transformers (embed)
    │
    ▼
ChromaDB (semantic search → top 3 chunks)
    │
    ▼
Groq / LLaMA 3.1 (generate answer from chunks)
    │
    ▼
Answer + source links
```

---

## Stack

| Layer | Tool |
|---|---|
| Frontend | Streamlit |
| Vector DB | ChromaDB (local, pre-built) |
| Embeddings | `all-MiniLM-L6-v2` (sentence-transformers) |
| LLM | LLaMA 3.1 8B via Groq API |
| Scraping | requests + BeautifulSoup |

---

## Local setup

```bash
git clone https://github.com/Anish0104/DocPilot.git
cd DocPilot
```

```bash
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows
```

```bash
pip install -r requirements.txt
```

Create a `.env` file in the project root:

```
GROQ_API_KEY=your_groq_api_key_here
```

Get a free key at [console.groq.com](https://console.groq.com).

```bash
streamlit run app.py
```

---

## Project structure

```
DocPilot/
├── app.py              # Streamlit UI
├── src/
│   ├── ingest.py       # Scrapes and indexes documentation
│   ├── retriever.py    # Semantic search against ChromaDB
│   ├── generator.py    # RAG pipeline + Groq LLM call
│   └── utils.py        # Env loading, text chunking helpers
├── data/
│   └── chromadb/       # Pre-built vector store (committed)
└── requirements.txt
```

---

## License

MIT
