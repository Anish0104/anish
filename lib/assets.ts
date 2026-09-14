import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";

/**
 * True when a path under /public actually exists on disk.
 *
 * Used so optional artwork can be referenced in a component before the file
 * arrives: the component falls back rather than rendering a broken image.
 */
export function hasPublicAsset(publicPath: string): boolean {
  if (!publicPath.startsWith("/")) return false;
  return existsSync(path.join(process.cwd(), "public", publicPath));
}
