export default function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="16"
      viewBox="0 0 22 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M1 8h19M14 2l6 6-6 6" />
    </svg>
  );
}
