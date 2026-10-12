"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { type Project, coverAlt, githubUrl } from "@/data/projects";
import ReadmeDialog from "@/components/ReadmeDialog";
import styles from "./concave-carousel.module.css";

export interface ConcaveCarouselProps {
  projects: Project[];
  curvature?: number; // 0 (flat) to 1 (tight concave drum), default 0.75
  radius?: number; // radius in px, default responsive ~620
  autoplay?: "drift" | "step" | "off";
  className?: string;
}

export default function ConcaveCarousel({
  projects,
  curvature = 0.75,
  radius: customRadius,
  autoplay = "drift",
  className = "",
}: ConcaveCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Angular step per card
  const count = projects.length;
  const stepAngle = count > 0 ? 360 / count : 36; // 36 deg for 10 projects

  // Current continuous rotation in degrees
  const rotationRef = useRef(0);
  const [displayRotation, setDisplayRotation] = useState(0);

  // Velocity and animation frame
  const velocityRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const targetRotationRef = useRef<number | null>(null);

  // Drag tracking state
  const dragStartRef = useRef<{
    x: number;
    rotation: number;
    time: number;
    lastX: number;
    lastTime: number;
    moved: boolean;
  }>({
    x: 0,
    rotation: 0,
    time: 0,
    lastX: 0,
    lastTime: 0,
    moved: false,
  });

  // Calculate responsive radius
  const [stageWidth, setStageWidth] = useState(1000);
  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        setStageWidth(containerRef.current.clientWidth);
      }
    }
    updateWidth();
    window.addEventListener("resize", updateWidth, { passive: true });
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const radius = useMemo(() => {
    if (customRadius) return customRadius;
    if (stageWidth < 640) return 460;
    if (stageWidth < 1024) return 600;
    return 720;
  }, [customRadius, stageWidth]);

  // Sync active index based on rotation
  const updateActiveIndex = useCallback(
    (rot: number) => {
      // Find which index corresponds to rot = -index * stepAngle
      const norm = ((-rot % 360) + 360) % 360;
      const rawIdx = Math.round(norm / stepAngle) % count;
      setActiveIndex((prev) => (prev !== rawIdx ? rawIdx : prev));
    },
    [stepAngle, count]
  );

  // Smooth snap to target angle
  const snapTo = useCallback(
    (targetDeg: number) => {
      targetRotationRef.current = targetDeg;
      velocityRef.current = 0;
    },
    []
  );

  const snapToIndex = useCallback(
    (index: number) => {
      // Find shortest angular path to index
      const current = rotationRef.current;
      const targetBase = -index * stepAngle;
      // Bring target within [-180, 180] of current
      const diff = ((targetBase - current) % 360 + 540) % 360 - 180;
      snapTo(current + diff);
    },
    [stepAngle, snapTo]
  );

  const prevCard = useCallback(() => {
    const nextIdx = (activeIndex - 1 + count) % count;
    snapToIndex(nextIdx);
  }, [activeIndex, count, snapToIndex]);

  const nextCard = useCallback(() => {
    const nextIdx = (activeIndex + 1) % count;
    snapToIndex(nextIdx);
  }, [activeIndex, count, snapToIndex]);

  // Main physics & animation loop
  useEffect(() => {
    let lastTimestamp = performance.now();

    function loop(now: number) {
      const dt = Math.min((now - lastTimestamp) / 1000, 0.1);
      lastTimestamp = now;

      if (!isDragging) {
        if (targetRotationRef.current !== null) {
          // Spring toward target
          const diff = targetRotationRef.current - rotationRef.current;
          if (Math.abs(diff) < 0.05) {
            rotationRef.current = targetRotationRef.current;
            targetRotationRef.current = null;
          } else {
            rotationRef.current += diff * Math.min(10 * dt, 0.3);
          }
          setDisplayRotation(rotationRef.current);
          updateActiveIndex(rotationRef.current);
        } else if (Math.abs(velocityRef.current) > 0.05) {
          // Inertia decay
          rotationRef.current += velocityRef.current * dt;
          velocityRef.current *= Math.pow(0.92, dt * 60);
          setDisplayRotation(rotationRef.current);
          updateActiveIndex(rotationRef.current);
        } else if (autoplay === "drift" && !isHovered) {
          // Very subtle continuous drift
          rotationRef.current -= 1.2 * dt; // ~1.2 deg/sec
          setDisplayRotation(rotationRef.current);
          updateActiveIndex(rotationRef.current);
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    }

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isDragging, autoplay, isHovered, updateActiveIndex]);

  // Pointer drag handlers
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag with primary pointer button
    if (e.button !== 0) return;
    targetRotationRef.current = null;
    velocityRef.current = 0;
    setIsDragging(true);

    dragStartRef.current = {
      x: e.clientX,
      rotation: rotationRef.current,
      time: performance.now(),
      lastX: e.clientX,
      lastTime: performance.now(),
      moved: false,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const now = performance.now();
    const deltaX = e.clientX - dragStartRef.current.x;

    if (Math.abs(deltaX) > 4) {
      dragStartRef.current.moved = true;
    }

    // Convert pixel delta to rotation degrees (sensitivity)
    const degPerPixel = 0.22;
    const newRot = dragStartRef.current.rotation + deltaX * degPerPixel;

    // Track instant velocity
    const dt = (now - dragStartRef.current.lastTime) / 1000;
    if (dt > 0.008) {
      const dx = e.clientX - dragStartRef.current.lastX;
      velocityRef.current = (dx * degPerPixel) / dt;
      dragStartRef.current.lastX = e.clientX;
      dragStartRef.current.lastTime = now;
    }

    rotationRef.current = newRot;
    setDisplayRotation(newRot);
    updateActiveIndex(newRot);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture was already released
    }

    // If velocity is modest, snap to closest card
    if (Math.abs(velocityRef.current) < 40) {
      const snapAngle = Math.round(rotationRef.current / stepAngle) * stepAngle;
      snapTo(snapAngle);
    }
  };

  // Wheel horizontal/vertical rotation
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      targetRotationRef.current = null;
      rotationRef.current -= e.deltaX * 0.12;
      setDisplayRotation(rotationRef.current);
      updateActiveIndex(rotationRef.current);
    }
  };

  // Keyboard navigation
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevCard();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextCard();
    } else if (e.key === "Home") {
      e.preventDefault();
      snapToIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      snapToIndex(count - 1);
    }
  };

  const activeProject = projects[activeIndex] || projects[0];

  return (
    <div
      ref={containerRef}
      className={`${styles.carouselContainer} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Concave 3D Projects Carousel"
    >
      {/* 3D Stage */}
      <div
        className={styles.stage}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        {projects.map((project, i) => {
          // Angular position on the circle
          const baseAngle = i * stepAngle;
          const currentTotalAngle = baseAngle + displayRotation;

          // Normalize relative angle to [-180, 180]
          const normAngle =
            (((currentTotalAngle % 360) + 540) % 360) - 180;

          // In a concave cylinder, cards curve inward facing the center viewer!
          // Distance from center:
          const rad = (normAngle * Math.PI) / 180;
          const x = Math.sin(rad) * radius;
          // Z displacement: center card is closest (or baseline), sides curve in/out
          // For concave wall: sides angle inward toward the center
          const z = (1 - Math.cos(rad)) * radius * curvature * -0.7;

          // Angle rotation around Y:
          // Inward concave tilt means positive X rotates negative Y, negative X rotates positive Y
          const rotateY = -normAngle * curvature;

          // Visual falloff
          const absAngle = Math.abs(normAngle);
          const isVisible = absAngle < 115;
          const isCenter = absAngle < 18;

          // Scale and opacity falloff: keep side cards crisp and vibrant without dull fading
          const scale = Math.max(0.82, 1 - (absAngle / 180) * 0.24);
          const opacity = isVisible
            ? Math.max(0.82, Math.cos((absAngle * Math.PI) / 340))
            : 0;

          // z-index: center cards must layer over side cards
          const zIndex = Math.round(100 - absAngle);

          return (
            <div
              key={project.slug}
              className={styles.cardWrapper}
              style={{
                transform: `translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity: isVisible ? opacity : 0,
                zIndex,
                pointerEvents: isVisible ? "auto" : "none",
                visibility: isVisible ? "visible" : "hidden",
                filter: isCenter
                  ? "drop-shadow(0 12px 28px rgba(0,0,0,0.14))"
                  : "none",
              }}
              onClick={(e) => {
                // If clicked while not in center, rotate it to center!
                if (!isCenter && !dragStartRef.current.moved) {
                  e.stopPropagation();
                  snapToIndex(i);
                }
              }}
            >
              <article
                className={`group flex flex-col overflow-hidden rounded-2xl border bg-surface transition-all duration-300 ${
                  isCenter
                    ? "border-accent shadow-xl ring-1 ring-accent/30"
                    : "border-border shadow-sm hover:border-border-strong"
                }`}
              >
                {/* 16:10 Vector Cover Thumbnail */}
                <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border bg-surface-2">
                  <Image
                    src={project.cover.src}
                    alt={coverAlt(project.cover)}
                    width={800}
                    height={500}
                    priority={i < 3}
                    loading={i < 3 ? undefined : "lazy"}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                  {/* Category Pill Over Image */}
                  <div className="absolute left-3.5 top-3.5 flex items-center gap-1.5 rounded-lg border border-border bg-surface/90 px-2.5 py-1 shadow-sm backdrop-blur-md">
                    <span className="font-mono text-[10px] font-semibold text-accent">
                      {project.number}
                    </span>
                    <span className="text-[10px] text-muted">·</span>
                    <span className="font-mono text-[9.5px] uppercase tracking-wider text-text">
                      {project.category}
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <h3 className="text-[17px] font-semibold leading-snug tracking-tight text-text sm:text-[18px]">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="link-underline transition-colors hover:text-accent"
                      onClick={(e) => {
                        if (dragStartRef.current.moved) e.preventDefault();
                      }}
                    >
                      {project.title}
                    </Link>
                  </h3>

                  <p className="mt-1.5 line-clamp-2 text-pretty text-[13px] leading-[1.55] text-muted sm:text-[13.5px]">
                    {project.blurb}
                  </p>

                  {/* Stack Tags */}
                  <ul className="mt-3 flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map((tag) => (
                      <li
                        key={tag}
                        className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted"
                      >
                        {tag}
                      </li>
                    ))}
                    {project.tags.length > 3 && (
                      <li className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted/70">
                        +{project.tags.length - 3}
                      </li>
                    )}
                  </ul>

                  {/* Footer Action Links */}
                  <div className="mt-4 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 border-t border-border pt-3 font-mono text-[11.5px]">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="font-medium text-accent transition-colors hover:text-accent-hover hover:underline"
                      onClick={(e) => {
                        if (dragStartRef.current.moved) e.preventDefault();
                      }}
                    >
                      Details →
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenProject(project);
                      }}
                      className="text-muted transition-colors hover:text-text hover:underline"
                    >
                      README
                    </button>
                    <a
                      href={githubUrl(project)}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-muted transition-colors hover:text-text hover:underline"
                    >
                      GitHub ↗
                    </a>
                    {project.demo ? (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-muted transition-colors hover:text-text hover:underline"
                      >
                        Demo ↗
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            </div>
          );
        })}
      </div>

      {/* Interactive Controls & Indicator Track */}
      <div className="mt-6 flex flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        {/* Active Title + Count */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[12px] font-semibold text-accent">
            {activeProject.number} / {String(count).padStart(2, "0")}
          </span>
          <span className="h-3 w-px bg-border" />
          <span className="text-[13px] font-medium text-text">
            {activeProject.title}
          </span>
          <span className="hidden font-mono text-[11px] text-muted md:inline">
            ({activeProject.category})
          </span>
        </div>

        {/* Indicator dots */}
        <div className="flex items-center gap-1.5" role="tablist">
          {projects.map((p, idx) => {
            const isDotActive = idx === activeIndex;
            return (
              <button
                key={p.slug}
                type="button"
                role="tab"
                aria-selected={isDotActive}
                aria-label={`Jump to project ${idx + 1}: ${p.title}`}
                onClick={() => snapToIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isDotActive
                    ? "w-6 bg-accent"
                    : "w-2 bg-border-strong hover:bg-muted"
                }`}
              />
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevCard}
            aria-label="Previous project"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:border-border-strong hover:bg-surface-2 hover:text-text"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={nextCard}
            aria-label="Next project"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:border-border-strong hover:bg-surface-2 hover:text-text"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Drag hint */}
      <div className="mt-2 text-center">
        <p className="font-mono text-[11px] text-muted/60">
          Drag horizontally or use arrow buttons to explore all {count} projects
        </p>
      </div>

      {/* Readme Dialog */}
      {openProject ? (
        <ReadmeDialog
          slug={openProject.slug}
          title={openProject.title}
          githubUrl={githubUrl(openProject)}
          onClose={() => setOpenProject(null)}
        />
      ) : null}
    </div>
  );
}
