export default function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block whitespace-nowrap rounded-md bg-surface-2 px-2.5 py-1 font-mono text-[11px] leading-none text-muted">
      {children}
    </span>
  );
}
