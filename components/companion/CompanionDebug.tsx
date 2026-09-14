"use client";

import type { SurfaceGraph } from "@/lib/companion-surfaces";

/**
 * Development-only view of the surface system.
 *
 * Draws usable surfaces, the regions that blocked space, and the current
 * route. Enabled only in a development build and only when the page is loaded
 * with `?companionDebug=1`, so it is never part of the public interface.
 */
export default function CompanionDebug({
  graph,
  current,
  target,
  charWidth,
}: {
  graph: SurfaceGraph;
  current: number;
  target: number | null;
  charWidth: number;
}) {
  return (
    <div className="pointer-events-none absolute left-0 top-0 z-40" aria-hidden="true">
      {graph.blocked.map((b, i) => (
        <div
          key={`b${i}`}
          className="absolute border border-red-500/40 bg-red-500/5"
          style={{ left: b.left, top: b.top, width: b.right - b.left, height: b.bottom - b.top }}
        />
      ))}
      {graph.surfaces.map((s, i) => (
        <div key={s.id} className="absolute" style={{ left: s.start, top: s.baseline - 2, width: s.end - s.start }}>
          <div className={i === current ? "h-[3px] bg-emerald-500" : "h-[3px] bg-sky-500/70"} />
          <span className="absolute left-0 top-1 whitespace-nowrap font-mono text-[9px] text-emerald-700">
            {s.id} {Math.round(s.end - s.start)}px
          </span>
        </div>
      ))}
      {graph.climbs.map((c) => (
        <div
          key={c.id}
          className="absolute border-x-2 border-dashed border-amber-500/70"
          style={{ left: c.x - 12, top: c.top, width: 24, height: c.bottom - c.top }}
        >
          <span className="absolute -left-1 top-0 font-mono text-[9px] text-amber-700">{c.id}</span>
        </div>
      ))}
      {graph.rejectedClimbs.map((r, i) => (
        <div
          key={`rc${i}`}
          className="absolute border border-dashed border-zinc-400/60"
          style={{
            left: r.corridor.left,
            top: r.corridor.top,
            width: r.corridor.right - r.corridor.left,
            height: r.corridor.bottom - r.corridor.top,
          }}
        >
          <span className="absolute left-0 top-0 font-mono text-[8px] text-zinc-500">{r.reason}</span>
        </div>
      ))}
      {target !== null && graph.surfaces[current] ? (
        <div
          className="absolute h-4 w-[2px] bg-fuchsia-500"
          style={{ left: target - 1, top: graph.surfaces[current].baseline - 16 }}
        />
      ) : null}
      <div
        className="absolute font-mono text-[9px] text-fuchsia-700"
        style={{ left: 4, top: 4 }}
      >
        companion debug: {graph.surfaces.length} surfaces, {graph.climbs.length} climbs
        validated, {graph.rejectedClimbs.length} rejected, char {charWidth}px
      </div>
    </div>
  );
}
