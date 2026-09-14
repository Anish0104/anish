import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";
import { isLocalDocument, type SupportingDocument } from "@/data/documents";

/**
 * Drops any document whose local file is not actually committed, so a data
 * entry written ahead of its file renders no button rather than a broken link.
 * External URLs pass through: they were checked by hand when added.
 */
export function existingDocuments(
  docs: SupportingDocument[] | undefined
): SupportingDocument[] {
  if (!docs?.length) return [];
  const publicDir = path.join(process.cwd(), "public");
  return docs.filter((doc) => {
    if (!isLocalDocument(doc)) return true;
    return existsSync(path.join(publicDir, doc.href));
  });
}
