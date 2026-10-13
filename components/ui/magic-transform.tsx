"use client";

import React from "react";
import Image from "next/image";
import type { Project } from "@/data/projects";
import type { ProjectTransformConfig } from "@/data/projectTransforms";
import styles from "./magic-transform.module.css";

const PILL_STYLES = [
  styles.pillSage,
  styles.pillTerracotta,
  styles.pillSlate,
  styles.pillMustard,
  styles.pillCharcoal,
];

const TECH_ROLES: Record<string, string> = {
  "FastAPI": "Asynchronous REST endpoints & inference server",
  "Ollama": "Local zero-leakage LLM execution engine",
  "sentence-transformers": "Bi-encoder dense semantic vector embeddings",
  "cross-encoder": "Token-level joint attention reranking",
  "pytest": "Automated regression & deterministic validation",
  "Docker": "Isolated reproducible container environment",
  "Next.js": "Command center UI & coordinator dashboard",
  "Flutter": "Cross-platform mobile physician response app",
  "ElevenLabs": "Automated voice read-out dispatch loop",
  "Python": "Core scientific modeling & processing pipeline",
  "FAISS": "High-speed vector similarity index",
  "Qdrant": "Vector search engine with metadata filtering",
  "PyTorch": "Longitudinal transformer sequence modeling",
  "Tailwind CSS": "Responsive utility design system",
  "TypeScript": "End-to-end typed data contracts",
  "Supabase": "Postgres storage with row-level policies",
  "Auth0": "Scoped zero-trust token authorization",
  "Synapse API": "Real-time teleneurology call status feeds",
  "OpenAI API": "Strict JSON schema policy extraction",
  "NumPy": "Numerical feature matrices & vectorized operations",
  "Pandas": "Longitudinal patient EHR timeline structuring",
  "Hugging Face": "Pre-trained transformer tokenizers & weights",
  "Streamlit": "Interactive exploratory research dashboard",
  "Scikit-learn": "Baseline regression & benchmark models",
};

export interface MagicTransformProps {
  project: Project;
  config?: ProjectTransformConfig;
  className?: string;
}

export default function MagicTransform({
  project,
  className = "",
}: MagicTransformProps) {
  // Take up to 4 items from the project's actual tech stack
  const stackItems = (project.stack && project.stack.length > 0)
    ? project.stack.slice(0, 4)
    : ["Python", "FastAPI", "TypeScript", "Next.js"];

  const thumbnailSrc = project.cover?.src || "/images/projects/cerevia.svg";
  const thumbnailAlt = project.title || "Project thumbnail";

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.stage}>
        {/* LEFT STREAM: Sliding rounded document cards containing the project's thumbnail */}
        <div className={styles.documentStream}>
          {/* Card 1 */}
          <div className={styles.docCard}>
            <span className={styles.cardTag}>
              {project.number ? `${project.number} · ` : ""}{project.category}
            </span>
            <div className={styles.thumbnailWrap}>
              <Image
                src={thumbnailSrc}
                alt={thumbnailAlt}
                fill
                sizes="160px"
                className="object-cover"
              />
            </div>
            <div className={styles.skeletonGroup}>
              <div className={styles.docLine} style={{ width: "90%" }} />
              <div className={styles.docLine} style={{ width: "70%" }} />
            </div>
          </div>

          {/* Card 2 (Staggered continuous loop) */}
          <div className={`${styles.docCard} ${styles.docCardStagger}`}>
            <span className={styles.cardTag}>{project.title}</span>
            <div className={styles.thumbnailWrap}>
              <Image
                src={thumbnailSrc}
                alt={thumbnailAlt}
                fill
                sizes="160px"
                className="object-cover"
              />
            </div>
            <div className={styles.skeletonGroup}>
              <div className={styles.docLine} style={{ width: "85%" }} />
              <div className={styles.docLine} style={{ width: "65%" }} />
            </div>
          </div>
        </div>

        {/* CENTER AXIS: Quiet hairline divider (NO NEON) */}
        <div className={styles.axisLine} />

        {/* CENTER BADGE: Subtle rounded atom badge */}
        <div className={styles.axisBadge} title="Stack Transformation Engine">
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

        {/* RIGHT STREAM: Popped-up tech stack with project architectural roles */}
        <div className={styles.outputArea}>
          <div className={styles.outputList}>
            {stackItems.map((tech, idx) => {
              const pillClass = PILL_STYLES[idx % PILL_STYLES.length];
              const roleDesc =
                TECH_ROLES[tech] ||
                (idx === 0
                  ? project.details?.[0] || "Core architectural technology"
                  : idx === 1
                  ? project.details?.[1] || "Grounded inference & validation layer"
                  : "Production workflow component");

              return (
                <div
                  key={`${tech}-${idx}`}
                  className={styles.stackRow}
                  style={
                    {
                      "--delay": `${idx * 0.35}s`,
                    } as React.CSSProperties
                  }
                >
                  <span className={`${styles.techPill} ${pillClass}`}>
                    {tech}
                  </span>
                  <span className={styles.techDetail}>
                    {roleDesc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
