"use client";

/**
 * The icon is chosen with CSS off the `dark` class rather than React state,
 * so it is already correct on first paint, with no mismatch, no icon flash.
 */
export default function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement;
    const nextIsDark = !root.classList.contains("dark");
    root.classList.toggle("dark", nextIsDark);
    try {
      localStorage.setItem("theme", nextIsDark ? "dark" : "light");
    } catch {
      // Private browsing or blocked storage: the theme still applies for this page view.
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="-m-2 inline-flex h-11 w-11 items-center justify-center rounded-lg p-2 text-muted transition-colors hover:text-accent"
    >
      <span className="dark:hidden">
        <SunIcon />
        <span className="sr-only">Switch to dark theme</span>
      </span>
      <span className="hidden dark:inline">
        <MoonIcon />
        <span className="sr-only">Switch to light theme</span>
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.4v2.4M12 19.2v2.4M2.4 12h2.4M19.2 12h2.4M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M18.8 5.2l-1.7 1.7M6.9 17.1l-1.7 1.7" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.4 14.2A8.6 8.6 0 0 1 9.8 3.6a8.6 8.6 0 1 0 10.6 10.6Z" />
    </svg>
  );
}
