"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ReadmePayload =
  | { status: "ok"; html: string; origin: "github" | "snapshot"; sourceUrl: string; githubUrl: string; title: string }
  | { status: "missing"; githubUrl: string; title: string }
  | { status: "error"; githubUrl: string; title: string; message: string };

type State =
  | { phase: "loading" }
  | { phase: "loaded"; data: ReadmePayload }
  | { phase: "failed"; message: string };

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function ReadmeDialog({
  slug,
  title,
  githubUrl,
  onClose,
}: {
  slug: string;
  title: string;
  githubUrl: string;
  onClose: () => void;
}) {
  const [state, setState] = useState<State>({ phase: "loading" });
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Where focus was before the dialog opened, so it can be handed back.
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => restoreRef.current?.focus?.();
  }, []);

  // Background scroll lock, compensating for the scrollbar so the page
  // underneath doesn't shift sideways as it locks.
  useEffect(() => {
    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const gap = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/readme/${slug}`, { signal: controller.signal })
      .then(async (res) => {
        const data = (await res.json()) as ReadmePayload;
        setState({ phase: "loaded", data });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          phase: "failed",
          message:
            error instanceof Error ? error.message : "Could not reach the server.",
        });
      });
    return () => controller.abort();
  }, [slug]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      // Focus trap: cycle within the panel.
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;
      const list = Array.from(nodes).filter((n) => n.offsetParent !== null);
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panelRef.current?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      onKeyDown={onKeyDown}
    >
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="readme-title"
        className="relative flex h-[92vh] w-full flex-col rounded-t-2xl border border-border bg-surface shadow-lift sm:h-[min(84vh,860px)] sm:max-w-3xl sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id="readme-title" className="text-[17px] font-semibold sm:text-[18px]">
              {title}
              <span className="ml-2 font-mono text-[11px] font-normal uppercase tracking-label text-faint">
                Readme
              </span>
            </h2>
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-1 inline-block truncate font-mono text-[12px] text-accent hover:underline"
            >
              {githubUrl.replace("https://", "")} ↗
            </a>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="-mr-1.5 -mt-1 shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            <span className="sr-only">Close README</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
          <Body state={state} githubUrl={githubUrl} />
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border px-5 py-3 font-mono text-[11px] text-faint sm:px-6">
          <span>
            {state.phase === "loaded" && state.data.status === "ok"
              ? state.data.origin === "github"
                ? "Source: GitHub"
                : "Source: cached snapshot"
              : "Source: GitHub"}
          </span>
          <a href={githubUrl} target="_blank" rel="noreferrer noopener" className="text-accent hover:underline">
            Read on GitHub ↗
          </a>
        </footer>
      </div>
    </div>
  );
}

function Body({ state, githubUrl }: { state: State; githubUrl: string }) {
  if (state.phase === "loading") {
    return (
      <div className="space-y-3" role="status" aria-live="polite">
        <span className="sr-only">Loading README…</span>
        {[70, 96, 88, 54, 92, 78, 64].map((w, i) => (
          <div
            key={i}
            className="h-3.5 animate-pulse rounded bg-surface-2"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    );
  }

  if (state.phase === "failed") {
    return <Notice title="Couldn’t load the README" body={state.message} githubUrl={githubUrl} />;
  }

  const { data } = state;

  if (data.status === "missing") {
    return (
      <Notice
        title="No README found"
        body="This repository doesn’t have a README at any of the usual paths."
        githubUrl={githubUrl}
      />
    );
  }

  if (data.status === "error") {
    return <Notice title="Couldn’t render the README" body={data.message} githubUrl={githubUrl} />;
  }

  return (
    <article
      className="markdown-body"
      // Sanitized server-side by rehype-sanitize against a strict allow-list.
      dangerouslySetInnerHTML={{ __html: data.html }}
    />
  );
}

function Notice({ title, body, githubUrl }: { title: string; body: string; githubUrl: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-6">
      <h3 className="text-[15px] font-semibold">{title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">{body}</p>
      <p className="mt-4">
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="font-mono text-[12.5px] text-accent hover:underline"
        >
          Read on GitHub ↗
        </a>
      </p>
    </div>
  );
}
