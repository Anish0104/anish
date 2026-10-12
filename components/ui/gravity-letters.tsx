"use client";

import { useEffect, useRef, useCallback, useSyncExternalStore } from "react";

export interface GravityLettersProps {
  /** The text string to render (defaults to "Hi, I’m Anish.") */
  text?: string;
  className?: string;
  /** Gravity acceleration (default: 0.38) */
  gravity?: number;
  /** Delay in milliseconds before broken pieces rebuild (default: 1800) */
  rebuildDelay?: number;
  /** Font family stack (defaults to system sans) */
  fontFamily?: string;
}

const subscribeReducedMotion = (callback: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
};

const getReducedMotionSnapshot = () =>
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

const getReducedMotionServerSnapshot = () => false;

interface Piece {
  id: number;
  char: string;
  /** Origin resting position in canvas coordinates */
  originX: number;
  originY: number;
  width: number;
  height: number;
  /** Current physics state */
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  vAngle: number;
  /** Clipped polygon for sliced pieces, relative to (originX, originY) */
  clipPolygon?: [number, number][];
  isBroken: boolean;
  settled: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  originX: number;
  originY: number;
  size: number;
  alpha: number;
  returning: boolean;
}

interface SlicePoint {
  x: number;
  y: number;
  time: number;
}

/**
 * GravityLetters: An interactive headline component inspired by React Bits Pro.
 * Users can slice through the letters with mouse/touch to sever them, click to collapse,
 * and watch pieces & sand tumble under gravity before magnetically pouring back together.
 */
export default function GravityLetters({
  text = "Hi, I’m Anish.",
  className = "",
  gravity = 0.38,
  rebuildDelay = 1800,
  fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}: GravityLettersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Accessible fallback for reduced motion
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  // Physics state refs to avoid re-renders during 60fps loop
  const piecesRef = useRef<Piece[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const slicePointsRef = useRef<SlicePoint[]>([]);
  const isPointerDownRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const rebuildTimerRef = useRef<number | null>(null);
  const isRebuildingRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const colorRef = useRef("rgb(17, 24, 39)");
  const floorYRef = useRef(120);

  // Update theme color based on computed style of container
  const updateTextColor = useCallback(() => {
    if (!containerRef.current) return;
    const computed = window.getComputedStyle(containerRef.current);
    colorRef.current = computed.color || "currentColor";
  }, []);

  // Initialize and measure text layout
  const initLayout = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    updateTextColor();

    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 2, 2.5);
    const width = rect.width;
    // Provide vertical clearance for gravity tumble and floor bounce
    const height = Math.max(rect.height, 120);
    floorYRef.current = height - 12;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    // Responsive font sizing matching display headline from container style
    const computed = window.getComputedStyle(container);
    colorRef.current = computed.color || "currentColor";

    const computedFontSize = parseFloat(computed.fontSize);
    let fontSize = computedFontSize || 50;
    if (isNaN(fontSize) || fontSize <= 0) {
      fontSize = width < 420 ? 34 : width < 640 ? 42 : 50;
    }

    const computedFontFamily = computed.fontFamily || fontFamily;
    ctx.font = `600 ${fontSize}px ${computedFontFamily}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";

    // Set letter spacing if supported by browser canvas context
    const tracking =
      computed.letterSpacing && computed.letterSpacing !== "normal"
        ? computed.letterSpacing
        : "-0.02em";
    if ("letterSpacing" in ctx) {
      (ctx as unknown as { letterSpacing: string }).letterSpacing = tracking;
    }

    const baselineY = Math.min(fontSize * 1.05, height * 0.45);
    const newPieces: Piece[] = [];
    let pieceId = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === " ") continue;

      const charLeft = ctx.measureText(text.slice(0, i)).width;
      const charRight = ctx.measureText(text.slice(0, i + 1)).width;
      const charWidth = Math.max(charRight - charLeft, 4);
      const centerX = charLeft + charWidth / 2;

      newPieces.push({
        id: pieceId++,
        char,
        originX: centerX,
        originY: baselineY,
        width: charWidth,
        height: fontSize,
        x: centerX,
        y: baselineY,
        vx: 0,
        vy: 0,
        angle: 0,
        vAngle: 0,
        isBroken: false,
        settled: true,
      });
    }

    piecesRef.current = newPieces;
    particlesRef.current = [];
    isRebuildingRef.current = false;
  }, [fontFamily, text, updateTextColor]);

  // Trigger rebuild after idle period
  const scheduleRebuild = useCallback(() => {
    if (rebuildTimerRef.current) {
      window.clearTimeout(rebuildTimerRef.current);
    }
    rebuildTimerRef.current = window.setTimeout(() => {
      isRebuildingRef.current = true;
    }, rebuildDelay);
  }, [rebuildDelay]);

  // Click or tap to collapse all letters
  const handleCollapse = useCallback(() => {
    if (isRebuildingRef.current) isRebuildingRef.current = false;

    piecesRef.current.forEach((piece) => {
      piece.isBroken = true;
      piece.settled = false;
      piece.vx = (Math.random() - 0.5) * 6;
      piece.vy = -(Math.random() * 3 + 1);
      piece.vAngle = (Math.random() - 0.5) * 0.12;

      // Spawn sand grains from collapsed letters
      for (let k = 0; k < 4; k++) {
        particlesRef.current.push({
          x: piece.x + (Math.random() - 0.5) * piece.width,
          y: piece.y + (Math.random() - 0.5) * piece.height,
          vx: (Math.random() - 0.5) * 8,
          vy: -(Math.random() * 5 + 2),
          originX: piece.originX + (Math.random() - 0.5) * piece.width,
          originY: piece.originY + (Math.random() - 0.5) * piece.height,
          size: Math.random() * 2.2 + 1,
          alpha: 1,
          returning: false,
        });
      }
    });

    scheduleRebuild();
  }, [scheduleRebuild]);

  // Slicing logic: check segment intersection
  const checkSlice = useCallback(
    (x1: number, y1: number, x2: number, y2: number) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.hypot(dx, dy);
      if (dist < 4) return;

      const normX = -dy / dist;
      const normY = dx / dist;

      const newPieces: Piece[] = [];
      let slicedAny = false;

      piecesRef.current.forEach((piece) => {
        // Simple bounding box intersection with line segment
        const halfW = piece.width / 2 + 6;
        const halfH = piece.height / 2 + 6;
        const minX = piece.x - halfW;
        const maxX = piece.x + halfW;
        const minY = piece.y - halfH;
        const maxY = piece.y + halfH;

        // Check if segment intersects or passes through bounding box
        const segMinX = Math.min(x1, x2);
        const segMaxX = Math.max(x1, x2);
        const segMinY = Math.min(y1, y2);
        const segMaxY = Math.max(y1, y2);

        const overlaps =
          !(segMaxX < minX || segMinX > maxX || segMaxY < minY || segMinY > maxY);

        if (overlaps) {
          slicedAny = true;
          isRebuildingRef.current = false;

          // If intact or already whole, split into upper and lower physical halves
          if (!piece.clipPolygon) {
            const impulse = Math.min(dist * 0.08, 5);

            // Upper half
            const topHalf: Piece = {
              ...piece,
              id: piece.id * 1000 + 1,
              isBroken: true,
              settled: false,
              vx: normX * impulse + (Math.random() - 0.5) * 2,
              vy: normY * impulse - Math.random() * 3 - 1,
              vAngle: (Math.random() - 0.5) * 0.15,
              clipPolygon: [
                [-piece.width, -piece.height],
                [piece.width, -piece.height],
                [piece.width, 0],
                [-piece.width, 0],
              ],
            };

            // Lower half
            const bottomHalf: Piece = {
              ...piece,
              id: piece.id * 1000 + 2,
              isBroken: true,
              settled: false,
              vx: -normX * impulse + (Math.random() - 0.5) * 2,
              vy: -normY * impulse + Math.random() * 2,
              vAngle: (Math.random() - 0.5) * 0.15,
              clipPolygon: [
                [-piece.width, 0],
                [piece.width, 0],
                [piece.width, piece.height],
                [-piece.width, piece.height],
              ],
            };

            newPieces.push(topHalf, bottomHalf);

            // Spray sand particles at the cut intersection
            for (let s = 0; s < 6; s++) {
              particlesRef.current.push({
                x: piece.x + (Math.random() - 0.5) * piece.width,
                y: piece.y + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 9,
                vy: (Math.random() - 0.5) * 7 - 2,
                originX: piece.originX,
                originY: piece.originY,
                size: Math.random() * 2.4 + 1,
                alpha: 1,
                returning: false,
              });
            }
          } else {
            // Further impulse to already sliced piece
            piece.vx += normX * 3;
            piece.vy += normY * 3 - 2;
            piece.vAngle += (Math.random() - 0.5) * 0.1;
            piece.settled = false;
            newPieces.push(piece);
          }
        } else {
          newPieces.push(piece);
        }
      });

      if (slicedAny) {
        piecesRef.current = newPieces;
        scheduleRebuild();
      }
    },
    [scheduleRebuild],
  );

  // Main 60fps physics & rendering animation loop
  useEffect(() => {
    if (reducedMotion) return;

    initLayout();

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        initLayout();
      });
    }

    const handleResize = () => {
      initLayout();
    };

    window.addEventListener("resize", handleResize);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 2, 2.5);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const floorY = floorYRef.current;

      ctx.clearRect(0, 0, width, height);

      // Clean up old slice points (fade out blade trail)
      const now = performance.now();
      slicePointsRef.current = slicePointsRef.current.filter(
        (p) => now - p.time < 140,
      );

      // 1. Draw dynamic slice blade trail
      const slicePts = slicePointsRef.current;
      if (slicePts.length > 1) {
        ctx.save();
        for (let i = 1; i < slicePts.length; i++) {
          const p1 = slicePts[i - 1];
          const p2 = slicePts[i];
          const progress = 1 - (now - p2.time) / 140;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = colorRef.current;
          ctx.lineWidth = Math.max(1, progress * 3.5);
          ctx.lineCap = "round";
          ctx.globalAlpha = progress * 0.7;
          ctx.stroke();
        }
        ctx.restore();
      }

      const isRebuilding = isRebuildingRef.current;
      let allRebuilt = true;

      // 2. Physics & Draw Letters/Pieces
      const pieces = piecesRef.current;
      ctx.fillStyle = colorRef.current;

      for (let i = 0; i < pieces.length; i++) {
        const p = pieces[i];

        if (isRebuilding) {
          // Magnetic smooth return
          const dx = p.originX - p.x;
          const dy = p.originY - p.y;
          const dAngle = -p.angle;

          p.x += dx * 0.11;
          p.y += dy * 0.11;
          p.angle += dAngle * 0.12;

          if (Math.hypot(dx, dy) < 0.6 && Math.abs(p.angle) < 0.02) {
            p.x = p.originX;
            p.y = p.originY;
            p.angle = 0;
            p.vx = 0;
            p.vy = 0;
            p.vAngle = 0;
            p.isBroken = false;
            p.settled = true;
          } else {
            allRebuilt = false;
          }
        } else if (p.isBroken && !p.settled) {
          allRebuilt = false;

          // Apply gravity and air resistance
          p.vy += gravity;
          p.vx *= 0.985;
          p.x += p.vx;
          p.y += p.vy;
          p.angle += p.vAngle;

          // Floor bounce
          if (p.y > floorY) {
            p.y = floorY;
            p.vy = -p.vy * 0.35; // Restitution
            p.vx *= 0.75; // Ground friction
            p.vAngle *= 0.8;

            if (Math.abs(p.vy) < 0.8 && Math.abs(p.vx) < 0.2) {
              p.vy = 0;
              p.vx = 0;
              p.vAngle = 0;
              p.settled = true;
            }
          }

          // Wall boundaries
          if (p.x < 10) {
            p.x = 10;
            p.vx = -p.vx * 0.5;
          } else if (p.x > width - 10) {
            p.x = width - 10;
            p.vx = -p.vx * 0.5;
          }
        }

        // Draw Piece
        ctx.save();
        ctx.translate(p.x, p.y);
        if (p.angle !== 0) ctx.rotate(p.angle);

        if (p.clipPolygon) {
          // Clipped polygon for sliced halves
          ctx.beginPath();
          ctx.moveTo(p.clipPolygon[0][0], p.clipPolygon[0][1]);
          for (let c = 1; c < p.clipPolygon.length; c++) {
            ctx.lineTo(p.clipPolygon[c][0], p.clipPolygon[c][1]);
          }
          ctx.closePath();
          ctx.clip();
        }

        ctx.fillText(p.char, -p.width / 2, 0);
        ctx.restore();
      }

      // 3. Physics & Draw Sand Particles
      const particles = particlesRef.current;
      for (let j = particles.length - 1; j >= 0; j--) {
        const pt = particles[j];

        if (isRebuilding) {
          const dx = pt.originX - pt.x;
          const dy = pt.originY - pt.y;
          pt.x += dx * 0.14;
          pt.y += dy * 0.14;

          if (Math.hypot(dx, dy) < 1.2) {
            particles.splice(j, 1);
            continue;
          }
        } else {
          pt.vy += gravity * 0.75;
          pt.vx *= 0.98;
          pt.x += pt.vx;
          pt.y += pt.vy;

          if (pt.y > floorY + 2) {
            pt.y = floorY + 2;
            pt.vy = -pt.vy * 0.25;
            pt.vx *= 0.6;
          }
        }

        ctx.save();
        ctx.fillStyle = colorRef.current;
        ctx.globalAlpha = pt.alpha * 0.85;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // If rebuilding finished, reset intact pieces cleanly
      if (isRebuilding && allRebuilt && particles.length === 0) {
        initLayout();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (rebuildTimerRef.current) clearTimeout(rebuildTimerRef.current);
    };
  }, [gravity, initLayout, reducedMotion]);

  // Pointer event handlers for swipe / drag slicing
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isPointerDownRef.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    lastPointerRef.current = { x, y };
    slicePointsRef.current.push({ x, y, time: performance.now() });
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    slicePointsRef.current.push({ x, y, time: performance.now() });

    // Allow slicing either while dragging OR with a fast cursor swipe across the letters
    if (lastPointerRef.current) {
      checkSlice(lastPointerRef.current.x, lastPointerRef.current.y, x, y);
    }
    lastPointerRef.current = { x, y };
  };

  const onPointerUp = () => {
    isPointerDownRef.current = false;
    lastPointerRef.current = null;
  };

  const onPointerLeave = () => {
    isPointerDownRef.current = false;
    lastPointerRef.current = null;
  };

  if (reducedMotion) {
    return (
      <h1 className={className}>
        {text}
      </h1>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className}`}
      style={{ touchAction: "none" }}
    >
      {/* Accessible text for screen readers & web indexers */}
      <h1 className="sr-only">{text}</h1>

      {/* Interactive canvas for physics, slicing, and sand rebuilding */}
      <canvas
        ref={canvasRef}
        className="block cursor-crosshair"
        onClick={handleCollapse}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        aria-hidden="true"
      />
    </div>
  );
}
