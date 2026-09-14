import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        text: "var(--text)",
        "text-soft": "var(--text-soft)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-soft": "var(--accent-soft)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
        hand: "var(--font-hand)",
      },
      maxWidth: {
        shell: "1100px",
      },
      letterSpacing: {
        label: "0.08em",
      },
      boxShadow: {
        card: "var(--shadow-sm)",
        lift: "var(--shadow-md)",
      },
      aspectRatio: {
        cover: "16 / 10",
      },
    },
  },
  plugins: [],
};

export default config;
