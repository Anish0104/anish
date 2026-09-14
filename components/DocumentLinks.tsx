"use client";

import { useState } from "react";
import type { SupportingDocument } from "@/data/documents";
import Dialog from "./Dialog";

/**
 * Renders one button per supporting document.
 *
 * External verification URLs open directly at the issuer, because that is the
 * point of a verification link. Local PDFs and images open in an accessible
 * in-page viewer with open-in-new-tab and download controls, plus a plain link
 * fallback for browsers that cannot render the file inline.
 */
export default function DocumentLinks({
  documents,
  label,
}: {
  documents: SupportingDocument[];
  label: string;
}) {
  const [open, setOpen] = useState<SupportingDocument | null>(null);

  if (documents.length === 0) return null;

  return (
    <>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2" aria-label={`Documents for ${label}`}>
        {documents.map((doc) => (
          <li key={doc.href}>
            {doc.kind === "link" ? (
              <a
                href={doc.href}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline inline-flex items-center gap-1.5 font-mono text-[12px] text-accent"
              >
                {doc.label}
                <span aria-hidden="true" className="text-[10px]">↗</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setOpen(doc)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 font-mono text-[11.5px] text-text-soft transition-colors hover:border-border-strong hover:bg-surface-2"
              >
                <DocIcon kind={doc.kind} />
                {doc.label}
              </button>
            )}
          </li>
        ))}
      </ul>

      {open ? (
        <Dialog
          title={open.label}
          subtitle={label}
          onClose={() => setOpen(null)}
          wide
          footer={
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[12px]">
              <a
                href={open.href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-accent hover:underline"
              >
                Open in new tab ↗
              </a>
              <a
                href={open.href}
                download
                className="text-accent hover:underline"
              >
                Download ↓
              </a>
            </div>
          }
        >
          <DocumentPreview doc={open} label={label} />
        </Dialog>
      ) : null}
    </>
  );
}

function DocumentPreview({
  doc,
  label,
}: {
  doc: SupportingDocument;
  label: string;
}) {
  if (doc.kind === "image") {
    return (
      // Intrinsic size is unknown for arbitrary scans, so this stays a plain
      // <img> with explicit constraints rather than next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={doc.href}
        alt={`${doc.label} for ${label}`}
        loading="lazy"
        className="mx-auto h-auto max-h-[68vh] w-auto max-w-full rounded-lg border border-border"
      />
    );
  }

  return (
    <>
      {/*
        Desktop preview. <object> falls back to its children when the browser
        cannot render a PDF inline, which is most mobile browsers, so the link
        below is a real fallback rather than decoration.
      */}
      <div className="hidden lg:block">
        <object
          data={doc.href}
          type="application/pdf"
          aria-label={`${doc.label} preview`}
          className="h-[62vh] w-full rounded-lg border border-border bg-surface-2"
        >
          <Fallback href={doc.href} />
        </object>
      </div>
      <div className="lg:hidden">
        <Fallback href={doc.href} />
      </div>
    </>
  );
}

function Fallback({ href }: { href: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-6">
      <p className="text-[14.5px] leading-relaxed text-muted">
        This document can&rsquo;t be shown inline here.
      </p>
      <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[12px]">
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="text-accent hover:underline"
        >
          Open in new tab ↗
        </a>
        <a href={href} download className="text-accent hover:underline">
          Download ↓
        </a>
      </p>
    </div>
  );
}

function DocIcon({ kind }: { kind: "pdf" | "image" }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-muted"
    >
      {kind === "image" ? (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8.5" cy="9.5" r="1.5" />
          <path d="m4 17 5-5 4 4 3-2 4 4" />
        </>
      ) : (
        <>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
          <path d="M14 3v5h5" />
        </>
      )}
    </svg>
  );
}
