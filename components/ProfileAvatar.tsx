import Image from "next/image";
import { avatar } from "@/data/profile";

/**
 * The illustrated avatar beside the bio on /about.
 *
 * Fixed sizing (120px mobile / 168px desktop) with the image's natural aspect
 * ratio preserved. There is no circular crop, because the thumbs-up hand sits near the
 * edge of the frame and a circle would clip it.
 *
 * While the source still has its dark navy background it is framed on a
 * matching navy tile, so the background reads as a deliberate choice. No blend
 * modes or filters are used to fake a cut-out: on a near-white page those grey
 * out the artwork and eat dark hair.
 */
export default function ProfileAvatar() {
  if (!avatar.available) return <AvatarPlaceholder />;

  const image = (
    <Image
      src={avatar.path}
      alt={avatar.alt}
      width={avatar.width}
      height={avatar.height}
      priority
      sizes="160px"
      className="h-auto w-[110px] transition-transform duration-300 ease-out motion-safe:hover:-rotate-2 sm:w-[160px]"
    />
  );

  return (
    <div className="shrink-0">
      {avatar.hasNavyBackground ? (
        <div className="inline-block overflow-hidden rounded-2xl bg-[#1b2340] p-1.5 shadow-card">
          {image}
        </div>
      ) : (
        image
      )}
    </div>
  );
}

/**
 * Shown only while the real asset is missing. Visibly a placeholder, which is better
 * than a broken image, and it cannot be mistaken for the artwork.
 */
function AvatarPlaceholder() {
  return (
    <div className="shrink-0">
      <div
        className="flex w-[120px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface-2 p-3 text-center sm:w-[168px]"
        style={{ aspectRatio: "1 / 1" }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-accent"
          aria-hidden="true"
        >
          <circle cx="12" cy="8.5" r="3.6" />
          <path d="M4.8 20.2a7.4 7.4 0 0 1 14.4 0" />
        </svg>
        <p className="font-mono text-[9.5px] leading-snug text-muted sm:text-[10px]">
          Memoji not
          <br />
          added yet
        </p>
      </div>
    </div>
  );
}
