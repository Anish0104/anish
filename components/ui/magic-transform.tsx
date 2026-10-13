"use client";

import React, { useState } from "react";
import type { ProjectTransformConfig } from "@/data/projectTransforms";
import styles from "./magic-transform.module.css";

// Deterministic matrix dot pattern to prevent SSR hydration mismatch
const MATRIX_PATTERN = [
  1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1,
  1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0,
  0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1,
  1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0,
  1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0,
];

// Color palette matching React Bits Pro reference
const PILL_COLORS = [
  "#5b7538", // Olive
  "#a8326a", // Magenta / Berry
  "#2563eb", // Cobalt / Blue
  "#d97706", // Amber / Bronze
  "#7c3aed", // Violet / Purple
  "#0d9488", // Teal
  "#be185d", // Rose
  "#0284c7", // Sky
];

// Confetti burst particles
const PARTICLES = [
  { tx: 45, ty: -65, rot: 35, color: "#a8326a", size: 6, delay: 0.1 },
  { tx: 85, ty: -45, rot: 80, color: "#5b7538", size: 5, delay: 0.4 },
  { tx: 60, ty: -20, rot: -45, color: "#2563eb", size: 7, delay: 0.8 },
  { tx: 95, ty: -5, rot: 110, color: "#d97706", size: 6, delay: 0.2 },
  { tx: 50, ty: 25, rot: 60, color: "#7c3aed", size: 8, delay: 0.6 },
  { tx: 110, ty: 40, rot: -75, color: "#0d9488", size: 5, delay: 1.1 },
  { tx: 75, ty: 65, rot: 90, color: "#be185d", size: 6, delay: 0.5 },
  { tx: 40, ty: 85, rot: -30, color: "#0284c7", size: 7, delay: 0.9 },
  { tx: 120, ty: -55, rot: 140, color: "#d8b4fe", size: 5, delay: 1.3 },
  { tx: 90, ty: 15, rot: -90, color: "#facc15", size: 6, delay: 0.7 },
  { tx: 65, ty: -75, rot: 45, color: "#38bdf8", size: 5, delay: 1.5 },
  { tx: 130, ty: 5, rot: 120, color: "#a8326a", size: 7, delay: 1.0 },
  { tx: 80, ty: 75, rot: -60, color: "#5b7538", size: 6, delay: 1.4 },
  { tx: 105, ty: -30, rot: 75, color: "#2563eb", size: 5, delay: 0.3 },
];

export interface MagicTransformProps {
  stack?: string[];
  projectTitle?: string;
  category?: string;
  config?: ProjectTransformConfig;
  className?: string;
}

export default function MagicTransform({
  stack,
  projectTitle,
  category,
  config,
  className = "",
}: MagicTransformProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [activeTech, setActiveTech] = useState<string | null>(null);

  // Resolve tech items from either passed stack, config outputs, or fallback
  const techItems: string[] =
    stack && stack.length > 0
      ? stack
      : config?.outputs
      ? config.outputs.map((o) => o.badge || o.title)
      : ["Core Engine", "TypeScript", "Next.js", "Tailwind CSS"];

  const displayTitle =
    config?.pipelineTitle ||
    (projectTitle ? `${projectTitle} · Architecture Transformation` : "System Pipeline Transformation");

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Top Header Bar */}
      <div className={styles.headerBar}>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-accent">
            Interactive Architecture Transform
          </span>
          {category && (
            <span className="hidden sm:inline-block font-mono text-[10.5px] text-muted">
              · {category}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsPaused((prev) => !prev)}
          className="flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-muted transition-colors hover:border-border-strong hover:text-text"
        >
          {isPaused ? (
            <>
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Resume</span>
            </>
          ) : (
            <>
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
              <span>Pause</span>
            </>
          )}
        </button>
      </div>

      {/* Main Animated Stage */}
      <div
        className={styles.stage}
        style={{
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {/* LEFT STREAM: Sliding Document Cards */}
        <div className={styles.documentStream}>
          {/* Card 1 */}
          <div
            className={styles.docCard}
            style={{ animationPlayState: isPaused ? "paused" : "running" }}
          >
            <div className={styles.cardHeaderLine} />
            <div className={styles.matrixGrid}>
              {MATRIX_PATTERN.map((active, i) => (
                <div
                  key={`c1-dot-${i}`}
                  className={`${styles.matrixDot} ${active ? styles.matrixDotActive : ""}`}
                />
              ))}
            </div>
            <div className={styles.skeletonGroup}>
              <div className={styles.docLine} style={{ width: "95%" }} />
              <div className={styles.docLine} style={{ width: "80%" }} />
              <div className={styles.docLine} style={{ width: "88%" }} />
              <div className={styles.docLine} style={{ width: "68%" }} />
              <div className={styles.docLine} style={{ width: "82%" }} />
            </div>
          </div>

          {/* Card 2 (Staggered continuous loop) */}
          <div
            className={`${styles.docCard} ${styles.docCardStagger}`}
            style={{ animationPlayState: isPaused ? "paused" : "running" }}
          >
            <div className={styles.cardHeaderLine} style={{ width: "55%" }} />
            <div className={styles.matrixGrid}>
              {MATRIX_PATTERN.map((active, i) => (
                <div
                  key={`c2-dot-${i}`}
                  className={`${styles.matrixDot} ${active ? styles.matrixDotActive : ""}`}
                />
              ))}
            </div>
            <div className={styles.skeletonGroup}>
              <div className={styles.docLine} style={{ width: "88%" }} />
              <div className={styles.docLine} style={{ width: "72%" }} />
              <div className={styles.docLine} style={{ width: "92%" }} />
              <div className={styles.docLine} style={{ width: "60%" }} />
              <div className={styles.docLine} style={{ width: "78%" }} />
            </div>
          </div>
        </div>

        {/* CENTER AXIS: Neon Vertical Laser Line */}
        <div className={styles.laserLine} />

        {/* CENTER BADGE: Atom / Reactor Badge */}
        <div
          className={styles.reactorBadge}
          title="Reactor Core: Slices & transforms document inputs into production stack"
        >
          <svg
            className={styles.atomIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Nucleus */}
            <circle cx="12" cy="12" r="2.2" fill="currentColor" />
            {/* Horizontal Orbit */}
            <ellipse cx="12" cy="12" rx="9" ry="3.8" />
            {/* Tilted Orbit 1 */}
            <ellipse
              cx="12"
              cy="12"
              rx="9"
              ry="3.8"
              transform="rotate(60 12 12)"
            />
            {/* Tilted Orbit 2 */}
            <ellipse
              cx="12"
              cy="12"
              rx="9"
              ry="3.8"
              transform="rotate(120 12 12)"
            />
          </svg>
        </div>

        {/* PARTICLE BURST: Floating Confetti Elements */}
        <div className={styles.particleCloud}>
          {PARTICLES.map((p, idx) => (
            <span
              key={`particle-${idx}`}
              className={styles.particle}
              style={
                {
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: p.color,
                  "--tx": `${p.tx}px`,
                  "--ty": `${p.ty}px`,
                  "--rot": `${p.rot}deg`,
                  animationDelay: `${p.delay}s`,
                  animationPlayState: isPaused ? "paused" : "running",
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        {/* RIGHT AREA: Popped-up Tech Stack Stream */}
        <div className={styles.stackOutputArea}>
          <div className={styles.stackList}>
            {techItems.slice(0, 7).map((tech, idx) => {
              const color = PILL_COLORS[idx % PILL_COLORS.length];
              const isSelected = activeTech === tech;

              return (
                <div
                  key={`${tech}-${idx}`}
                  className={styles.stackItem}
                  onMouseEnter={() => setActiveTech(tech)}
                  onMouseLeave={() => setActiveTech(null)}
                  style={
                    {
                      "--delay": `${idx * 0.35}s`,
                      animationPlayState: isPaused ? "paused" : "running",
                    } as React.CSSProperties
                  }
                >
                  {/* Colored Tech Stack Pill */}
                  <div
                    className={styles.techPill}
                    style={
                      {
                        "--pill-bg": color,
                        transform: isSelected ? "scale(1.05)" : "none",
                        boxShadow: isSelected
                          ? `0 0 16px ${color}99, 0 4px 12px rgba(0,0,0,0.5)`
                          : undefined,
                      } as React.CSSProperties
                    }
                  >
                    <span>{tech}</span>
                  </div>

                  {/* Dark Card Skeleton with Code Lines */}
                  <div className={styles.cardSkeleton}>
                    <div
                      className={styles.skeletonLine}
                      style={{ width: `${Math.max(55, 90 - (idx % 3) * 15)}%` }}
                    />
                    <div
                      className={styles.skeletonLine}
                      style={{ width: `${Math.max(40, 70 - (idx % 2) * 15)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info / Pipeline context */}
      <div className={styles.footerNote}>
        <span>{displayTitle}</span>
        <span>Passed through deterministic reactor → Tech stack emitted</span>
      </div>
    </div>
  );
}
