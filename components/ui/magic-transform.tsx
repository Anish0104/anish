"use client";

import React from "react";
import type { Project } from "@/data/projects";
import type { ProjectTransformConfig, TransformItem } from "@/data/projectTransforms";
import styles from "./magic-transform.module.css";

// 10x5 circular dot matrix pattern
const COMPACT_MATRIX = [
  1, 0, 1, 1, 0, 1, 0, 1, 1, 0,
  0, 1, 1, 0, 1, 0, 1, 1, 0, 1,
  1, 1, 0, 1, 1, 1, 0, 1, 1, 0,
  0, 1, 0, 1, 0, 1, 1, 0, 1, 1,
  1, 0, 1, 1, 1, 0, 1, 1, 0, 1,
];

const BADGE_STYLES = [
  styles.badgeSage,
  styles.badgeTerracotta,
  styles.badgeSlate,
  styles.badgeMustard,
];

export interface MagicTransformProps {
  project?: Project;
  config?: ProjectTransformConfig;
  className?: string;
  // Backward compatibility props
  stack?: string[];
  projectTitle?: string;
  category?: string;
}

export default function MagicTransform({
  project,
  config,
  className = "",
}: MagicTransformProps) {
  // Input labels for sliding cards
  const card1Tag =
    config?.inputs?.[0]?.badge ||
    config?.inputs?.[0]?.title ||
    "Raw Input Ingestion";
  const card2Tag =
    config?.inputs?.[1]?.badge ||
    config?.inputs?.[1]?.title ||
    project?.category ||
    "Unstructured Corpus";

  // Meaningful project outcomes and architectural resolutions
  const outputItems: { badge: string; title: string; detail: string }[] =
    config?.outputs && config.outputs.length > 0
      ? config.outputs.slice(0, 2).map((item: TransformItem) => ({
          badge: item.badge,
          title: item.title,
          detail: item.detail,
        }))
      : [
          {
            badge: "Resolution",
            title: project?.title || "Production Solution",
            detail: project?.details?.[0] || project?.blurb || "Deterministic output pipeline",
          },
          {
            badge: "Grounded Metric",
            title: project?.category || "Verified Output",
            detail: project?.details?.[1] || "High-precision automated processing",
          },
        ];

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.stage}>
        {/* LEFT STREAM: Sliding rounded document cards */}
        <div className={styles.documentStream}>
          {/* Card 1 */}
          <div className={styles.docCard}>
            <span className={styles.cardTag}>{card1Tag}</span>
            <div className={styles.matrixGrid}>
              {COMPACT_MATRIX.map((active, i) => (
                <div
                  key={`c1-dot-${i}`}
                  className={`${styles.matrixDot} ${active ? styles.matrixDotActive : ""}`}
                />
              ))}
            </div>
            <div className={styles.skeletonGroup}>
              <div className={styles.docLine} style={{ width: "95%" }} />
              <div className={styles.docLine} style={{ width: "75%" }} />
              <div className={styles.docLine} style={{ width: "88%" }} />
            </div>
          </div>

          {/* Card 2 (Staggered loop) */}
          <div className={`${styles.docCard} ${styles.docCardStagger}`}>
            <span className={styles.cardTag}>{card2Tag}</span>
            <div className={styles.matrixGrid}>
              {COMPACT_MATRIX.map((active, i) => (
                <div
                  key={`c2-dot-${i}`}
                  className={`${styles.matrixDot} ${active ? styles.matrixDotActive : ""}`}
                />
              ))}
            </div>
            <div className={styles.skeletonGroup}>
              <div className={styles.docLine} style={{ width: "88%" }} />
              <div className={styles.docLine} style={{ width: "70%" }} />
              <div className={styles.docLine} style={{ width: "82%" }} />
            </div>
          </div>
        </div>

        {/* CENTER AXIS: Quiet hairline divider (NO NEON) */}
        <div className={styles.axisLine} />

        {/* CENTER BADGE: Subtle rounded atom icon */}
        <div className={styles.axisBadge} title="Core Processing Pipeline">
          <svg
            className={styles.atomIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <ellipse cx="12" cy="12" rx="8.5" ry="3.5" />
            <ellipse
              cx="12"
              cy="12"
              rx="8.5"
              ry="3.5"
              transform="rotate(60 12 12)"
            />
            <ellipse
              cx="12"
              cy="12"
              rx="8.5"
              ry="3.5"
              transform="rotate(120 12 12)"
            />
          </svg>
        </div>

        {/* RIGHT STREAM: Meaningful project output resolutions */}
        <div className={styles.outputArea}>
          <div className={styles.outputList}>
            {outputItems.map((item, idx) => {
              const badgeClass = BADGE_STYLES[idx % BADGE_STYLES.length];

              return (
                <div
                  key={`${item.title}-${idx}`}
                  className={styles.outputCard}
                  style={
                    {
                      "--delay": `${idx * 0.4}s`,
                    } as React.CSSProperties
                  }
                >
                  <div className={styles.outputHeader}>
                    <span className={`${styles.outputBadge} ${badgeClass}`}>
                      {item.badge}
                    </span>
                    <h4 className={styles.outputTitle}>{item.title}</h4>
                  </div>
                  <p className={styles.outputDetail}>{item.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
