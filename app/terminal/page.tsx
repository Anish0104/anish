import type { Metadata } from "next";
import TerminalEmulator from "@/components/terminal/TerminalEmulator";

export const metadata: Metadata = {
  title: "Terminal",
  description:
    "Interactive terminal CLI emulator for Anish Shirodkar's portfolio. Explore ML projects, systems work, skills, and experience via an authentic command-line interface.",
  alternates: { canonical: "/terminal" },
  openGraph: {
    title: "Terminal · Anish Shirodkar",
    description: "Interactive CLI portfolio terminal with vintage and dark CRT modes.",
    type: "website",
    url: "/terminal",
  },
};

export default function TerminalPage() {
  return <TerminalEmulator />;
}
