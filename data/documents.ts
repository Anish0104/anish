/**
 * Supporting proof documents attached to certifications and leadership roles.
 *
 * `href` is either a local file committed under /public/documents/... or an
 * external issuer verification URL. Local files are existence-checked on the
 * server (see lib/documents.ts) so a missing file makes the button disappear
 * rather than producing a broken link.
 */
export type DocumentKind = "pdf" | "image" | "link";

export type SupportingDocument = {
  /** Describes what the document actually is, e.g. "View appointment letter". */
  label: string;
  href: string;
  kind: DocumentKind;
};

export const isLocalDocument = (doc: SupportingDocument) =>
  doc.href.startsWith("/documents/");
