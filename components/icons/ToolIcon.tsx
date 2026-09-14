import { brandColors, brandPaths, brandScales } from "./brand-paths";

/**
 * Renders a bundled brand mark, or a neutral capability glyph when no brand
 * icon is appropriate. Everything is inline path data on a 24x24 grid, so
 * there is no icon network request and no layout shift.
 *
 * `brand` paints the mark in its own published colour. Marks whose brand
 * colour is black are mapped to `null` in `brandColors` and fall back to
 * `currentColor`, so they stay visible on a dark page. Nothing is filtered,
 * inverted or blended.
 */
export default function ToolIcon({
  name,
  className = "",
  size = 20,
  brand = false,
}: {
  name: string;
  className?: string;
  size?: number;
  /** Paint the mark in its own colour rather than inheriting the text colour. */
  brand?: boolean;
}) {
  const paths = brandPaths[name];
  const colour = brand ? brandColors[name] : undefined;
  // Optical correction, so a solid disc and an open ring read the same size.
  const scale = brandScales[name] ?? 1;
  const inset = (24 - 24 * scale) / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={colour ?? "currentColor"}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {paths ? (
        <g transform={scale === 1 ? undefined : `translate(${inset} ${inset}) scale(${scale})`}>
          {paths.map((d) => (
            <path key={d.slice(0, 24)} d={d} />
          ))}
        </g>
      ) : (
        <FallbackGlyph name={name} />
      )}
    </svg>
  );
}

/** Neutral category glyphs, used where a brand mark would be wrong. */
function FallbackGlyph({ name }: { name: string }) {
  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "languages":
      return <path {...stroke} d="M8 6 3 12l5 6M16 6l5 6-5 6M14 4l-4 16" />;
    case "machine-learning":
      return (
        <g {...stroke}>
          <circle cx="6" cy="7" r="2.2" />
          <circle cx="6" cy="17" r="2.2" />
          <circle cx="18" cy="12" r="2.2" />
          <path d="M8.2 8.1 15.9 11M8.2 15.9 15.9 13" />
        </g>
      );
    case "retrieval":
      return (
        <g {...stroke}>
          <circle cx="10.5" cy="10.5" r="6" />
          <path d="m15 15 5 5" />
        </g>
      );
    case "vision":
      return (
        <g {...stroke}>
          <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
          <circle cx="12" cy="12" r="2.6" />
        </g>
      );
    case "web":
      return (
        <g {...stroke}>
          <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
          <path d="M2.5 9h19M6 6.7h.01M8.6 6.7h.01" />
        </g>
      );
    case "infrastructure":
      return (
        <g {...stroke}>
          <rect x="3" y="4" width="18" height="6" rx="1.6" />
          <rect x="3" y="14" width="18" height="6" rx="1.6" />
          <path d="M6.8 7h.01M6.8 17h.01" />
        </g>
      );
    default:
      return (
        <g {...stroke}>
          <circle cx="12" cy="12" r="8.5" />
        </g>
      );
  }
}
