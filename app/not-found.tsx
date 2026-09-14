import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mt-12 max-w-[52ch] sm:mt-14">
      <p className="font-mono text-[11px] uppercase tracking-label text-faint">404</p>
      <h1 className="mt-3 text-[32px] font-semibold tracking-[-0.03em] sm:text-[40px]">
        Nothing here.
      </h1>
      <p className="mt-5 text-[16.5px] leading-[1.65] text-text-soft sm:text-[18px]">
        This page doesn’t exist, or hasn’t been written yet.
      </p>
      <p className="mt-7">
        <Link href="/" className="link-underline font-mono text-[12.5px] text-accent">
          ← Back home
        </Link>
      </p>
    </section>
  );
}
