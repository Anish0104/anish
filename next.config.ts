import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the workspace root, otherwise Turbopack walks up and finds the
  // stray package-lock.json in the home directory.
  turbopack: { root: projectRoot },
  images: {
    // Album artwork is served from Apple's own artwork CDN, which is the
    // provider-approved source that ships with the iTunes Search API.
    remotePatterns: [
      { protocol: "https", hostname: "**.mzstatic.com", pathname: "/image/**" },
    ],
  },
  async redirects() {
    return [
      // Deep links that existed on anishshirodkar.me. Each lands on the page
      // that now holds that content. /writing has no anchor any more: the
      // essay list was removed, so it points at /misc itself.
      { source: "/writing", destination: "/misc", permanent: true },
      { source: "/publications", destination: "/experience#publications", permanent: true },
      { source: "/leadership", destination: "/experience#leadership", permanent: true },
      { source: "/certifications", destination: "/about#certifications", permanent: true },
    ];
  },
};

export default nextConfig;
