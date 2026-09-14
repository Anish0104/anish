"use client";

import Link from "next/link";
import { useCallback, useId, useRef, useState } from "react";
import {
  answerQuestion,
  disclosure,
  questionsByGroup,
  suggestedQuestions,
  type AskResponse,
} from "@/lib/ask-demo";

/**
 * The curated ask bar.
 *
 * Answers come from `lib/ask-demo`, which is deterministic and offline: there
 * is no request on submit and nothing is streamed. The question is echoed as
 * text through React, never as HTML, and every source link comes from a fixed
 * table rather than from anything the visitor typed.
 */
export default function AskBar() {
  const inputId = useId();
  const panelId = useId();
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const ask = useCallback((question: string) => {
    setQuery(question);
    setResponse(answerQuestion(question));
    // Move focus into the answer so a screen reader lands on it, without
    // scrolling the page or trapping anything.
    window.requestAnimationFrame(() => {
      panelRef.current?.focus({ preventScroll: true });
    });
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) return;
    ask(query);
  }

  const reset = useCallback(() => {
    setResponse(null);
    setQuery("");
    inputRef.current?.focus();
  }, []);

  return (
    <section
      className="mt-12 sm:mt-14"
      aria-labelledby={`${inputId}-label`}
      // Focus moves into the answer after a submit, so Escape is handled for
      // the whole section rather than only on the input.
      onKeyDown={(event) => {
        if (event.key === "Escape" && response) {
          event.preventDefault();
          reset();
        }
      }}
    >
      <h2 id={`${inputId}-label`} className="sr-only">
        Ask about my work
      </h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor={inputId} className="sr-only">
          Ask about my work
        </label>
        <div className="flex items-stretch rounded-xl border border-border bg-surface transition-colors focus-within:border-accent">
          <span aria-hidden="true" className="flex shrink-0 items-center pl-4 pr-3 text-accent">
            <AskIcon />
          </span>
          <input
            id={inputId}
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ask about my work…"
            autoComplete="off"
            aria-describedby={`${inputId}-help`}
            className="min-w-0 flex-1 bg-transparent py-3.5 pr-3 text-[15.5px] text-text placeholder:text-muted focus:outline-none sm:text-[17px]"
          />
          <button
            type="submit"
            className="flex w-14 shrink-0 items-center justify-center border-l border-border text-muted transition-colors hover:text-accent"
          >
            <span className="sr-only">Ask</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 12h15M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </form>

      {/* small text suggestions, not cards */}
      <div
        id={`${inputId}-help`}
        className="mt-2.5 flex flex-col gap-x-6 gap-y-1.5 text-[12.5px] sm:flex-row sm:flex-wrap sm:items-baseline"
      >
        <span className="text-faint">Try:</span>
        {suggestedQuestions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => ask(question)}
            className="link-underline text-left text-muted transition-colors hover:text-accent"
          >
            {question}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen((open) => !open)}
          aria-expanded={moreOpen}
          aria-controls={`${inputId}-more`}
          className="link-underline text-left text-muted transition-colors hover:text-accent"
        >
          {moreOpen ? "Fewer questions" : "More questions"}
        </button>
        <span className="text-faint sm:ml-auto">{disclosure}</span>
      </div>

      {/*
        Plain text links grouped by topic, not a wall of pills and not a chat
        panel. Selecting one runs it through the same answer flow as typing.
      */}
      <div id={`${inputId}-more`} hidden={!moreOpen} className="mt-3">
        <div className="grid grid-cols-1 gap-x-10 gap-y-4 border-t border-border pt-3.5 sm:grid-cols-2">
          {questionsByGroup().map((group) => (
            <div key={group.group}>
              <h3 className="text-[11.5px] font-medium text-faint">{group.group}</h3>
              <ul className="mt-1.5 space-y-1">
                {group.questions.map((question) => (
                  <li key={question}>
                    <button
                      type="button"
                      onClick={() => ask(question)}
                      className="link-underline text-left text-[12.5px] text-muted transition-colors hover:text-accent"
                    >
                      {question}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* answer panel, expanded in place */}
      <div id={panelId} role="status" aria-live="polite">
        {response ? (
          <div
            ref={panelRef}
            tabIndex={-1}
            className="mt-4 rounded-xl border border-border bg-surface p-5 focus:outline-none sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-[13px] font-medium leading-snug text-muted">
                {response.question}
              </h3>
              <button
                type="button"
                onClick={reset}
                className="-mr-1.5 -mt-1 shrink-0 rounded-md p-1.5 text-faint transition-colors hover:bg-surface-2 hover:text-text"
              >
                <span className="sr-only">Close answer</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <p className="mt-2.5 max-w-[72ch] text-[15px] leading-[1.65] text-text-soft sm:text-[15.5px]">
              {response.answer}
            </p>

            {response.sources.length > 0 ? (
              <div className="mt-4 border-t border-border pt-3.5">
                <h4 className="text-[11.5px] font-medium text-faint">Sources</h4>
                <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
                  {response.sources.map((source) => (
                    <li key={source.id}>
                      <SourceLink href={source.href} label={source.label} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {response.suggestedQuestions.length > 0 ? (
              <div className="mt-4 border-t border-border pt-3.5">
                <h4 className="text-[11.5px] font-medium text-faint">
                  {response.status === "clarify" ? "Pick one" : "Try asking"}
                </h4>
                <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
                  {response.suggestedQuestions.map((question) => (
                    <li key={question}>
                      <button
                        type="button"
                        onClick={() => ask(question)}
                        className="link-underline text-[12.5px] text-accent"
                      >
                        {question}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SourceLink({ href, label }: { href: string; label: string }) {
  const className = "link-underline inline-flex items-center gap-1 text-[12.5px] text-accent";
  if (href.startsWith("/")) {
    return (
      <Link href={href} prefetch={false} className={className}>
        {label}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {label}
    </a>
  );
}

function AskIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M16.2 16.2 21 21" />
    </svg>
  );
}
