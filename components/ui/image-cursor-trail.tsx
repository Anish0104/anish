"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import styles from "./image-cursor-trail.module.css";

const DEFAULT_STICKERS = Array.from(
  { length: 12 },
  (_, index) => `/images/cursor-trail/mouse${index + 1}.svg`,
);

export interface ImageCursorTrailProps {
  children: ReactNode;
  className?: string;
  /** Sticker display size in pixels. Default is 42. */
  size?: number;
  /** Distance in pixels mouse must move before dropping the next sticker. Default is 32. */
  distance?: number;
  /** Maximum number of simultaneous active stickers. Default is 8. */
  maxVisible?: number;
  /** Lifetime of each sticker in milliseconds. Default is 950. */
  lifetime?: number;
  /** Custom list of image URLs. Defaults to the 12 SVG stickers. */
  images?: string[];
}

/**
 * Ultra-smooth, full-screen sticker cursor trail inspired by Skiper UI & BeFreaky.
 * Features organic random rotation, non-intrusive interactive-element avoidance,
 * and high-performance Web Animations API keyframes.
 */
export default function ImageCursorTrail({
  children,
  className,
  size = 42,
  distance = 32,
  maxVisible = 8,
  lifetime = 950,
  images = DEFAULT_STICKERS,
}: ImageCursorTrailProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || typeof Element.prototype.animate !== "function") return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Pool of reusable image elements (2 sets of stickers to avoid re-allocation)
    const sprites: HTMLImageElement[] = [];
    const active: HTMLImageElement[] = [];
    const animations = new Map<HTMLImageElement, Animation>();
    let last: { x: number; y: number } | null = null;
    let nextIndex = 0;
    let order = 0;
    let lastTime = 0;

    const hide = (image: HTMLImageElement) => {
      const animation = animations.get(image);
      if (animation) {
        animation.onfinish = null;
        animation.cancel();
        animations.delete(image);
      }
      image.style.opacity = "0";
      delete image.dataset.active;
      const idx = active.indexOf(image);
      if (idx !== -1) active.splice(idx, 1);
    };

    const clearAll = () => {
      [...active].forEach(hide);
      last = null;
      lastTime = 0;
    };

    const prepareSprites = () => {
      if (!finePointer.matches || reducedMotion.matches || sprites.length) return;

      // Create a pool of 24 sprites (2 of each sticker)
      const pool = [...images, ...images];
      pool.forEach((src) => {
        const image = new Image();
        image.src = src;
        image.alt = "";
        image.width = size;
        image.height = size;
        image.style.setProperty("--sticker-size", `${size}px`);
        image.decoding = "async";
        image.draggable = false;
        image.className = styles.sticker;
        layer.appendChild(image);
        sprites.push(image);
      });
    };

    const move = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches || event.pointerType !== "mouse" || event.buttons) return;

      // When hovering over interactive controls, don't drop new stickers,
      // but let existing stickers finish gracefully rather than vanishing abruptly.
      const target = event.target as Element | null;
      if (target?.closest("a, button, input, textarea, select, [role='button'], summary")) {
        last = null;
        return;
      }

      prepareSprites();
      if (!sprites.length) return;

      const position = { x: event.clientX, y: event.clientY };
      if (!last) {
        last = position;
        return;
      }

      // Smooth distance threshold
      const dx = position.x - last.x;
      const dy = position.y - last.y;
      if (Math.hypot(dx, dy) < distance) return;

      // 20ms throttle keeps 50-60fps smooth arcs during fast motions
      const now = performance.now();
      if (now - lastTime < 20) return;

      const image = sprites[nextIndex % sprites.length];
      if (!image) return;

      last = position;
      lastTime = now;
      nextIndex++;

      // Cancel any ongoing animation on this reused sprite
      hide(image);

      // Retire oldest sticker smoothly if we exceed capacity
      if (active.length >= maxVisible) {
        const oldest = active.shift();
        if (oldest) {
          const oldAnim = animations.get(oldest);
          if (oldAnim) {
            oldAnim.onfinish = null;
            oldAnim.cancel();
          }
          const fade = oldest.animate(
            [
              { opacity: 0.9, transform: oldest.style.transform || "translate(-50%, -50%) scale(1)" },
              { opacity: 0, transform: "translate(-50%, -50%) scale(0.4)" },
            ],
            { duration: 140, easing: "ease-out", fill: "forwards" },
          );
          fade.onfinish = () => {
            oldest.style.opacity = "0";
            delete oldest.dataset.active;
            animations.delete(oldest);
          };
        }
      }

      // Position fixed to viewport
      image.style.left = `${event.clientX}px`;
      image.style.top = `${event.clientY}px`;
      image.style.zIndex = `${++order}`;
      image.dataset.active = "true";
      active.push(image);

      // Organic subtle tilt: between -13deg and +13deg
      const rotation = (Math.random() - 0.5) * 26;

      const animation = image.animate(
        [
          {
            opacity: 0,
            transform: `translate(-50%, -50%) scale(0.25) rotate(${rotation * 0.4}deg)`,
            offset: 0,
          },
          {
            opacity: 1,
            transform: `translate(-50%, -50%) scale(1.08) rotate(${rotation}deg)`,
            offset: 0.16,
          },
          {
            opacity: 1,
            transform: `translate(-50%, -50%) scale(1) rotate(${rotation}deg)`,
            offset: 0.28,
          },
          {
            opacity: 0.95,
            transform: `translate(-50%, -50%) scale(1) rotate(${rotation}deg)`,
            offset: 0.65,
          },
          {
            opacity: 0,
            transform: `translate(-50%, -50%) scale(0.6) rotate(${rotation * 1.15}deg)`,
            offset: 1,
          },
        ],
        {
          duration: lifetime,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "forwards",
        },
      );

      animations.set(image, animation);
      animation.onfinish = () => hide(image);
    };

    const onMouseLeaveDoc = (e: MouseEvent) => {
      if (!e.relatedTarget && !(e as unknown as { toElement?: Element }).toElement) {
        last = null;
      }
    };

    const onVisibility = () => {
      if (document.hidden) clearAll();
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("mouseleave", onMouseLeaveDoc);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", clearAll);
    finePointer.addEventListener("change", clearAll);
    reducedMotion.addEventListener("change", clearAll);

    return () => {
      clearAll();
      sprites.forEach((img) => img.remove());
      window.removeEventListener("pointermove", move);
      document.removeEventListener("mouseleave", onMouseLeaveDoc);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", clearAll);
      finePointer.removeEventListener("change", clearAll);
      reducedMotion.removeEventListener("change", clearAll);
    };
  }, [distance, images, lifetime, maxVisible, size]);

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} data-cursor-trail="home">
      {children}
      <div ref={layerRef} className={styles.layer} aria-hidden="true" />
    </div>
  );
}
