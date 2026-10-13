"use client";

import React, { useState, useEffect } from "react";
import type { ProjectTransformConfig, TransformItem } from "@/data/projectTransforms";
import styles from "./magic-transform.module.css";

interface MagicTransformProps {
  config: ProjectTransformConfig;
  className?: string;
}

export default function MagicTransform({ config, className = "" }: MagicTransformProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedItem, setSelectedItem] = useState<TransformItem | null>(null);

  // Auto-cycle through the items to create an active processing stream effect
  useEffect(() => {
    if (isPaused) return;
    const totalSteps = Math.max(config.inputs.length, config.outputs.length);
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % totalSteps);
    }, 2800);
    return () => clearInterval(interval);
  }, [isPaused, config.inputs.length, config.outputs.length]);

  return (
    <div className={`${styles.transformContainer} ${className}`}>
      {/* Top Controls Bar */}
      <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-accent animate-ping" />
            <h3 className="font-mono text-[12px] font-semibold uppercase tracking-wider text-accent">
              Live Architecture Pipeline
            </h3>
          </div>
          <p className="mt-0.5 text-[14.5px] font-medium text-text sm:text-[15.5px]">
            {config.pipelineTitle}
          </p>
        </div>

        {/* Play/Pause Control & Step Pill */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-muted">
            Cycle {activeStep + 1} of {Math.max(config.inputs.length, config.outputs.length)}
          </span>
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-muted transition-colors hover:border-border-strong hover:text-text"
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
      </div>

      {/* Main 3-Stage Pipeline Display */}
      <div className="relative mt-6 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-4">
        {/* STAGE 1: INPUT STREAM (Left) */}
        <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-surface-2/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
              {config.inputHeader}
            </span>
            <span className="rounded bg-surface-2 px-2 py-0.5 font-mono text-[10px] text-faint">
              Input Ingestion
            </span>
          </div>

          <div className="space-y-3">
            {config.inputs.map((item, idx) => {
              const isCurrent = idx === activeStep % config.inputs.length;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`group cursor-pointer rounded-lg border p-3 transition-all duration-300 ${
                    isCurrent
                      ? "border-accent/60 bg-surface shadow-sm ring-1 ring-accent/20"
                      : "border-border/70 bg-surface/70 hover:border-border-strong hover:bg-surface"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-mono text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                        item.tone === "critical"
                          ? "bg-red-500/10 text-red-500 border border-red-500/20"
                          : "bg-surface-2 text-accent"
                      }`}
                    >
                      {item.badge}
                    </span>
                    {isCurrent && (
                      <span className="flex items-center gap-1 font-mono text-[10px] text-accent">
                        <span>Streaming</span>
                        <span className="animate-pulse">→</span>
                      </span>
                    )}
                  </div>
                  <h4 className="mt-1.5 text-[13.5px] font-semibold text-text group-hover:text-accent transition-colors">
                    {item.title}
                  </h4>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
                    {item.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* STAGE 2: THE TRANSFORMATION PORTAL / CORE (Center) */}
        <div className="relative flex flex-col items-center justify-center rounded-xl border border-accent/30 bg-surface-2/80 p-6 text-center shadow-inner lg:w-[280px]">
          {/* Glowing particle aura */}
          <div className={styles.coreGlowRing} />
          <div className={styles.pulseParticle} style={{ top: "30%", left: "40%" }} />
          <div className={styles.pulseParticle} style={{ top: "60%", left: "65%", animationDelay: "1.2s" }} />

          {/* Central Reactor / Processor Icon */}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/40 bg-surface shadow-lg ring-4 ring-accent/10">
            <svg
              className="h-7 w-7 text-accent animate-spin"
              style={{ animationDuration: isPaused ? "0s" : "12s" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          {/* Engine Header & Subtitle */}
          <h4 className="mt-3.5 text-[14px] font-bold tracking-tight text-text">
            {config.coreTitle}
          </h4>
          <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
            {config.coreSubtitle}
          </p>

          {/* Core Metric Pill */}
          <div className="mt-3 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[10.5px] font-semibold text-accent">
            {config.coreMetrics}
          </div>

          <div className="mt-4 flex items-center gap-1.5 font-mono text-[10.5px] text-faint">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Deterministic Core Active</span>
          </div>
        </div>

        {/* STAGE 3: OUTPUT STREAM (Right) */}
        <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-surface-2/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
              {config.outputHeader}
            </span>
            <span className="rounded bg-surface-2 px-2 py-0.5 font-mono text-[10px] text-emerald-500 font-semibold">
              ✓ Verified Resolution
            </span>
          </div>

          <div className="space-y-3">
            {config.outputs.map((item, idx) => {
              const isCurrent = idx === activeStep % config.outputs.length;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`group cursor-pointer rounded-lg border p-3 transition-all duration-300 ${
                    isCurrent
                      ? "border-emerald-500/60 bg-surface shadow-sm ring-1 ring-emerald-500/20"
                      : "border-border/70 bg-surface/70 hover:border-border-strong hover:bg-surface"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-mono text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                        item.tone === "highlight"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-surface-2 text-text"
                      }`}
                    >
                      {item.badge}
                    </span>
                    {isCurrent && (
                      <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-500 font-medium">
                        <span>Emitted</span>
                        <span>✓</span>
                      </span>
                    )}
                  </div>
                  <h4 className="mt-1.5 text-[13.5px] font-semibold text-text group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
                    {item.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Item Inspection Card / Modal */}
      {selectedItem && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-accent/40 bg-accent/5 p-3 font-mono text-[12px]">
          <div>
            <span className="font-semibold text-accent">[{selectedItem.badge}]</span>{" "}
            <span className="text-text font-medium">{selectedItem.title}:</span>{" "}
            <span className="text-muted">{selectedItem.detail}</span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedItem(null)}
            className="ml-3 shrink-0 text-faint hover:text-text transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Footer hint */}
      <div className="mt-4 text-center">
        <p className="font-mono text-[11px] text-muted/60">
          Click any card to inspect · Visualizes transformation from unstructured input to verified outcome
        </p>
      </div>
    </div>
  );
}
