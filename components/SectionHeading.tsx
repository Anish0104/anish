import Link from "next/link";

export default function SectionHeading({
  title,
  action,
}: {
  title: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
      <h2 className="text-[24px] font-semibold tracking-[-0.026em] sm:text-[30px]">
        {title}
      </h2>
      {action ? (
        <Link
          href={action.href}
          className="link-underline ml-auto inline-flex items-center gap-1.5 font-mono text-[12.5px] text-accent"
        >
          {action.label}
          <span aria-hidden="true" className="text-[10px]">↗</span>
        </Link>
      ) : null}
    </div>
  );
}
