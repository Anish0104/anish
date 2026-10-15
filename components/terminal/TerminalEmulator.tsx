"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { profile, aboutIntro, resume, email } from "@/data/profile";
import { projects, getProject, githubUrl, featuredProjects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { experience } from "@/data/experience";
import CompanionSprite from "@/components/companion/CompanionSprite";

export type TerminalTheme = "dark" | "matrix" | "amber" | "dracula";

interface HistoryEntry {
  id: string;
  command: string;
  output: ReactNode;
  timestamp: string;
}

const THEMES: Record<
  TerminalTheme,
  {
    name: string;
    bg: string;
    windowBg: string;
    text: string;
    dim: string;
    accent: string;
    promptUser: string;
    promptPath: string;
    border: string;
    glow?: string;
  }
> = {
  dark: {
    name: "Dark",
    bg: "#090b10",
    windowBg: "#0f131a",
    text: "#e2e8f0",
    dim: "#64748b",
    accent: "#38bdf8",
    promptUser: "#34d399",
    promptPath: "#60a5fa",
    border: "#1e2638",
  },
  matrix: {
    name: "Matrix",
    bg: "#030804",
    windowBg: "#051107",
    text: "#4ade80",
    dim: "#15803d",
    accent: "#22c55e",
    promptUser: "#86efac",
    promptPath: "#22c55e",
    border: "#14532d",
    glow: "0 0 10px rgba(34,197,94,0.35)",
  },
  amber: {
    name: "Amber",
    bg: "#090602",
    windowBg: "#120c04",
    text: "#fbbf24",
    dim: "#92400e",
    accent: "#f59e0b",
    promptUser: "#fde68a",
    promptPath: "#d97706",
    border: "#78350f",
    glow: "0 0 10px rgba(245,158,11,0.35)",
  },
  dracula: {
    name: "Dracula",
    bg: "#181920",
    windowBg: "#21222c",
    text: "#f8f8f2",
    dim: "#6272a4",
    accent: "#bd93f9",
    promptUser: "#50fa7b",
    promptPath: "#8be9fd",
    border: "#44475a",
  },
};

const COMMANDS = [
  "tour",
  "help",
  "about",
  "projects",
  "project",
  "skills",
  "experience",
  "resume",
  "contact",
  "clear",
  "theme",
  "gui",
  "exit",
  "companion",
  "weather",
  "sudo",
  "date",
  "history",
];

const BANNER_DESKTOP = `
    _         _     _       ____  _     _               _ _             
   / \\   _ __ (_)___| |__   / ___|| |__ (_)_ __ ___   __| | | ____ _ _ __
  / _ \\ | '_ \\| / __| '_ \\  \\___ \\| '_ \\| | '__/ _ \\ / _\` | |/ / _\` | '__|
 / ___ \\| | | | \\__ \\ | | |  ___) | | | | | | | (_) | (_| |   < (_| | |   
/_/   \\_\\_| |_|_|___/_| |_| |____/|_| |_|_|_|  \\___/ \\__,_|_|\\_\\__,_|_|   
`;

const BANNER_MOBILE = `
 █████╗ ███╗   ██╗██╗███████╗██╗  ██╗
██╔══██╗████╗  ██║██║██╔════╝██║  ██║
███████║██╔██╗ ██║██║███████╗███████║
██╔══██║██║╚██╗██║██║╚════██║██╔══██║
██║  ██║██║ ╚████║██║███████║██║  ██║
╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚══════╝╚═╝  ╚═╝
`;

/**
 * High-fidelity ASCII portrait of Anish Shirodkar:
 * Depicts textured wavy hair, spectacles/glasses, a clearly visible short full beard,
 * and a connected moustache, rendered in real monospace ASCII characters.
 */
const ASCII_PORTRAIT = [
  "       .─────────────.       ",
  "      /   ~ ~ ~ ~ ~   \\      ",
  "     /   (~~~~~~~~~)   \\     ",
  "    |    _.-'''''-._    |    ",
  "    |   [ ◉ ]-[ ◉ ]     |    ",
  "    |   └───┘ └───┘     |    ",
  "    |        ||         |    ",
  "    |      .====.       |    ",
  "    |    /########\\     |    ",
  "    |   |##########|    |    ",
  "     \\   \\########/    /     ",
  "      \\   '######'    /      ",
  "       \\    ####     /       ",
  "        '───────────'        ",
].join("\n");

export default function TerminalEmulator() {
  const router = useRouter();
  const [theme, setTheme] = useState<TerminalTheme>("dark");
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number>(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Guided Tour state
  const [tourStep, setTourStep] = useState<number | null>(null);

  // Mini Anish speech bubble state
  const [showCompanionBubble, setShowCompanionBubble] = useState(true);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const themeConfig = THEMES[theme];

  const scrollToBottom = useCallback(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [history, tourStep, suggestions, scrollToBottom]);

  // Focus input automatically on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Update suggestions dynamically as input changes
  useEffect(() => {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) {
      setSuggestions([]);
      setSelectedSuggestion(-1);
      setShowSuggestions(false);
      return;
    }

    const matches: string[] = [];

    // Match top commands
    for (const cmd of COMMANDS) {
      if (cmd.startsWith(trimmed)) {
        matches.push(cmd);
      }
    }

    // If typing "pro..." or "project ...", offer project slugs
    if (trimmed.startsWith("pro") || trimmed.startsWith("project")) {
      for (const p of projects) {
        const fullCmd = `project ${p.slug}`;
        if (fullCmd.startsWith(trimmed) || p.slug.startsWith(trimmed.replace(/^project\s*/, ""))) {
          if (!matches.includes(fullCmd)) {
            matches.push(fullCmd);
          }
        }
      }
    }

    // Limit suggestions to 6 for clean display
    const finalSuggestions = matches.slice(0, 6);
    setSuggestions(finalSuggestions);
    setSelectedSuggestion(finalSuggestions.length > 0 ? 0 : -1);
    setShowSuggestions(finalSuggestions.length > 0);
  }, [input]);

  const handleContainerClick = () => {
    // Preserve user text selection: do not snatch focus if user highlighted text
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
      inputRef.current?.focus();
    }
  };

  const advanceTour = useCallback((currentStep: number) => {
    if (currentStep < 3) {
      setTourStep(currentStep + 1);
    } else {
      setTourStep(null);
    }
  }, []);

  const exitTour = useCallback(() => {
    setTourStep(null);
  }, []);

  const executeCommand = useCallback(
    (rawCmd: string) => {
      const trimmed = rawCmd.trim();
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      if (!trimmed) {
        setHistory((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            command: "",
            output: null,
            timestamp,
          },
        ]);
        return;
      }

      setCmdHistory((prev) => [...prev, trimmed]);
      setHistoryPointer(-1);
      setShowSuggestions(false);

      const parts = trimmed.split(/\s+/);
      const command = parts[0].toLowerCase();
      const args = parts.slice(1);

      let output: ReactNode = null;

      switch (command) {
        case "tour":
          setTourStep(0);
          output = (
            <p className="text-cyan-300 font-semibold py-1">
              Starting guided portfolio tour... (Press Enter or click Next to advance, Esc to exit)
            </p>
          );
          break;

        case "help":
        case "?":
          output = (
            <div className="space-y-3 py-1 font-mono">
              <p className="font-semibold text-cyan-300">Available Commands:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-xs sm:text-[13px]">
                <div>
                  <span className="font-bold text-emerald-400">tour</span>
                  <span className="text-white/60 ml-3">Start guided portfolio walkthrough</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400">projects</span>
                  <span className="text-white/60 ml-3">List all featured ML & systems projects</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400">project &lt;slug&gt;</span>
                  <span className="text-white/60 ml-3">Compact panel for a specific project</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400">skills</span>
                  <span className="text-white/60 ml-3">ML frameworks, retrieval & languages</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400">experience</span>
                  <span className="text-white/60 ml-3">Research & industry work history</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400">about</span>
                  <span className="text-white/60 ml-3">Anish&apos;s background & research</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400">resume</span>
                  <span className="text-white/60 ml-3">View or download PDF resume</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400">contact</span>
                  <span className="text-white/60 ml-3">Email, GitHub, LinkedIn links</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400">theme [name]</span>
                  <span className="text-white/60 ml-3">dark, matrix, amber, dracula</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400">clear</span>
                  <span className="text-white/60 ml-3">Clear terminal screen (Ctrl+L)</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400">gui / exit</span>
                  <span className="text-white/60 ml-3">Return to graphical portfolio</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400">companion</span>
                  <span className="text-white/60 ml-3">Mini Anish interaction</span>
                </div>
              </div>
              <p className="text-[11.5px] opacity-70 pt-1">
                Tip: Type partial words to see suggestions. Press <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono">Tab</kbd> to autocomplete, or use <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono">↑</kbd><kbd className="px-1 py-0.5 rounded bg-white/10 font-mono">↓</kbd> for history.
              </p>
            </div>
          );
          break;

        case "about":
        case "bio":
        case "whoami":
          output = (
            <div className="space-y-3 py-1 font-mono leading-relaxed">
              <div className="flex items-center gap-3">
                <span className="text-base sm:text-lg font-bold text-cyan-300">
                  {profile.name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full border border-white/20 bg-white/5">
                  M.S. Computer Science · Rutgers
                </span>
              </div>
              <p className="text-xs sm:text-sm opacity-90">{aboutIntro}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-white/10">
                <div>
                  <span className="opacity-60">Location:</span> {profile.location}
                </div>
                <div>
                  <span className="opacity-60">Research:</span> MIARC Lab (Clinical Transformers)
                </div>
                <div>
                  <span className="opacity-60">Focus:</span> AI / ML · Software Engineering
                </div>
                <div>
                  <span className="opacity-60">Email:</span>{" "}
                  <a href={`mailto:${email}`} className="underline text-cyan-400 hover:text-cyan-200">
                    {email}
                  </a>
                </div>
              </div>
            </div>
          );
          break;

        case "projects":
        case "ls":
          output = (
            <div className="space-y-3 py-1 font-mono">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-cyan-300">
                  Projects ({projects.length} total):
                </span>
                <span className="text-xs opacity-60">Click any slug to view details</span>
              </div>
              <div className="space-y-2">
                {projects.map((p) => (
                  <div
                    key={p.slug}
                    className="p-2.5 rounded border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => executeCommand(`project ${p.slug}`)}
                          className="font-bold text-cyan-400 hover:underline text-left cursor-pointer"
                        >
                          {p.slug}
                        </button>
                        <span className="font-medium text-white/90">— {p.title}</span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-white/10 opacity-75">
                        {p.category}
                      </span>
                    </div>
                    <p className="text-xs opacity-80 mt-1">{p.blurb}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {p.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10.5px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 opacity-70"
                        >
                          {tag}
                        </span>
                      ))}
                      <div className="ml-auto flex items-center gap-2 text-xs">
                        <Link
                          href={`/projects/${p.slug}`}
                          className="text-cyan-400 hover:underline"
                        >
                          case study ↗
                        </Link>
                        <a
                          href={githubUrl(p)}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="underline hover:text-white"
                        >
                          repo ↗
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
          break;

        case "project":
        case "cat":
          if (!args[0]) {
            output = (
              <p className="text-amber-400 font-mono text-xs">
                Usage: project &lt;slug&gt;. Type &apos;projects&apos; to view all project slugs.
              </p>
            );
          } else {
            const slug = args[0].toLowerCase();
            const proj = getProject(slug);
            if (!proj) {
              output = (
                <div className="text-red-400 space-y-1 font-mono text-xs">
                  <p>Error: Project &apos;{slug}&apos; not found.</p>
                  <p className="text-white/60">
                    Type &apos;projects&apos; to list valid project slugs (e.g., &apos;project semantic-search&apos;, &apos;project cerevia&apos;).
                  </p>
                </div>
              );
            } else {
              // Compact, thin-bordered project panel with painted thumbnail on left, details on right
              output = (
                <div className="my-2.5 rounded-lg border border-white/15 bg-white/[0.03] p-3 sm:p-4 text-xs font-mono transition-colors hover:border-cyan-500/30">
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    {/* Left: Project Thumbnail */}
                    {proj.cover && (
                      <div className="w-full md:w-56 shrink-0 aspect-[16/10] relative rounded overflow-hidden border border-white/10 bg-black/40">
                        <Image
                          src={proj.cover.src}
                          alt={proj.cover.alt}
                          fill
                          sizes="(max-width: 768px) 100vw, 224px"
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Right: Project Details */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-white">
                            {proj.title}
                          </h3>
                          {proj.award && (
                            <span className="text-[10.5px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              {proj.award}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-white/10 text-white/70">
                          {proj.category}
                        </span>
                      </div>

                      <p className="text-cyan-300 font-medium leading-relaxed">
                        {proj.blurb}
                      </p>

                      <p className="text-white/80 text-[12px] leading-relaxed">
                        {proj.summary}
                      </p>

                      {/* Approach and verified metrics */}
                      {proj.details && proj.details.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[11px] font-semibold text-white/60 uppercase tracking-wider block">
                            Approach & Verified Metrics:
                          </span>
                          <ul className="space-y-1 text-white/85 text-[11.5px] list-disc list-inside">
                            {proj.details.map((detail, idx) => (
                              <li key={idx} className="leading-relaxed">
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Stack Tags */}
                      <div className="pt-2 border-t border-white/10">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] text-white/50 mr-1">Stack:</span>
                          {proj.stack.map((st) => (
                            <span
                              key={st}
                              className="text-[10.5px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80"
                            >
                              {st}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Links */}
                      <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                        <Link
                          href={`/projects/${proj.slug}`}
                          className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-200 underline font-semibold"
                        >
                          View case study ↗
                        </Link>
                        <a
                          href={githubUrl(proj)}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1 text-white/80 hover:text-white underline"
                        >
                          GitHub ↗
                        </a>
                        {proj.demo && (
                          <a
                            href={proj.demo}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-200 underline"
                          >
                            Live Demo ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          }
          break;

        case "skills":
          output = (
            <div className="space-y-3 py-1 font-mono">
              <p className="font-semibold text-cyan-300">
                Technical Skills & Domains:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {skillGroups.map((group) => (
                  <div
                    key={group.id}
                    className="p-2.5 rounded border border-white/10 bg-white/[0.02]"
                  >
                    <span className="font-bold text-white block mb-1.5">
                      {group.label}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 opacity-80"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                    {group.usedIn && group.usedIn.length > 0 && (
                      <div className="mt-2 text-[11px] opacity-60">
                        <span>Used in: </span>
                        {group.usedIn.map((u, i) => (
                          <button
                            key={u.slug}
                            type="button"
                            onClick={() => executeCommand(`project ${u.slug}`)}
                            className="underline hover:text-cyan-400 mr-1.5 cursor-pointer"
                          >
                            {u.title}
                            {i < (group.usedIn?.length ?? 0) - 1 ? "," : ""}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
          break;

        case "experience":
        case "exp":
        case "work":
          output = (
            <div className="space-y-3 py-1 font-mono">
              <p className="font-semibold text-cyan-300">
                Experience & Appointments:
              </p>
              <div className="space-y-3">
                {experience.map((exp) => (
                  <div
                    key={exp.slug}
                    className="p-3 rounded border border-white/10 bg-white/[0.02]"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-1">
                      <span className="font-bold text-sm text-white">{exp.role}</span>
                      <span className="text-xs opacity-60">{exp.dates}</span>
                    </div>
                    <div className="text-xs opacity-75 flex flex-wrap gap-2 mt-0.5">
                      <span className="text-cyan-400">{exp.organization}</span>
                      <span>·</span>
                      <span>{exp.location}</span>
                    </div>
                    <p className="text-xs opacity-85 mt-2 leading-relaxed">{exp.summary}</p>
                    <ul className="list-disc list-inside text-xs opacity-80 space-y-1 mt-2">
                      {exp.highlights.map((h, idx) => (
                        <li key={idx}>{h}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          );
          break;

        case "resume":
          output = (
            <div className="space-y-2 py-1.5 font-mono">
              <p className="font-semibold text-cyan-300">
                Resume: Anish Shirodkar
              </p>
              <p className="text-xs opacity-85">
                Current PDF version containing academic, research, and technical background.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href={resume.path}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="px-3 py-1.5 rounded text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors"
                >
                  View PDF in browser ↗
                </a>
                <a
                  href={resume.path}
                  download={resume.downloadAs}
                  className="px-3 py-1.5 rounded text-xs font-medium bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors"
                >
                  Download PDF ↓
                </a>
              </div>
            </div>
          );
          break;

        case "contact":
        case "socials":
          output = (
            <div className="space-y-2.5 py-1 text-xs font-mono">
              <p className="font-semibold text-sm text-cyan-300">
                Get In Touch:
              </p>
              <div className="space-y-1.5">
                <div>
                  <span className="opacity-60 inline-block w-20">Email:</span>
                  <a href={`mailto:${email}`} className="underline text-cyan-400 hover:text-cyan-200">
                    {email}
                  </a>
                </div>
                <div>
                  <span className="opacity-60 inline-block w-20">GitHub:</span>
                  <a
                    href="https://github.com/Anish0104"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline text-cyan-400 hover:text-cyan-200"
                  >
                    https://github.com/Anish0104 ↗
                  </a>
                </div>
                <div>
                  <span className="opacity-60 inline-block w-20">LinkedIn:</span>
                  <a
                    href="https://www.linkedin.com/in/anish-shirodkar/"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline text-cyan-400 hover:text-cyan-200"
                  >
                    https://www.linkedin.com/in/anish-shirodkar/ ↗
                  </a>
                </div>
              </div>
            </div>
          );
          break;

        case "theme":
          if (args[0]) {
            const nextTheme = args[0].toLowerCase() as TerminalTheme;
            if (THEMES[nextTheme]) {
              setTheme(nextTheme);
              output = <p className="text-emerald-400 font-mono text-xs">Switched theme to &apos;{nextTheme}&apos;.</p>;
            } else {
              output = (
                <p className="text-amber-400 font-mono text-xs">
                  Invalid theme &apos;{args[0]}&apos;. Valid themes: dark, matrix, amber, dracula.
                </p>
              );
            }
          } else {
            output = (
              <div className="space-y-1 font-mono text-xs">
                <p>
                  Current theme: <span className="font-bold">{theme}</span>
                </p>
                <p className="opacity-75">
                  Available themes:{" "}
                  {Object.keys(THEMES).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => executeCommand(`theme ${t}`)}
                      className="underline mr-2 hover:text-cyan-300 cursor-pointer font-bold"
                    >
                      {t}
                    </button>
                  ))}
                </p>
              </div>
            );
          }
          break;

        case "clear":
        case "cls":
          setHistory([]);
          setTourStep(null);
          return;

        case "gui":
        case "exit":
          output = <p className="text-emerald-400 font-mono text-xs">Redirecting to standard portfolio view...</p>;
          setTimeout(() => router.push("/"), 500);
          break;

        case "companion":
        case "anish":
          setShowCompanionBubble(true);
          output = (
            <div className="space-y-2 py-1 font-mono text-xs">
              <p className="text-cyan-300 font-semibold">
                Mini Anish is perched in the bottom right corner of the terminal window!
              </p>
              <p className="opacity-75">
                He observes all executed commands and can launch your guided tour anytime.
              </p>
            </div>
          );
          break;

        case "weather":
          output = (
            <div className="space-y-1.5 py-1 text-xs font-mono">
              <div className="font-semibold text-amber-300">
                [IMD Weather Station — Rutgers / New Brunswick, NJ]
              </div>
              <div className="p-2 rounded border border-white/10 bg-white/5 space-y-1">
                <p>🌤️ Conditions: Partly Cloudy · 68°F (20°C)</p>
                <p>💧 Relative Humidity: 52% | Wind: 6 mph NE</p>
                <p>🌧️ 6-Hour Precipitation Probability: 14%</p>
                <p className="text-[11px] opacity-70 border-t border-white/10 pt-1">
                  Generated via Attention-LSTM Hybrid Architecture (IP India Reg. LD-20250175526).
                </p>
              </div>
            </div>
          );
          break;

        case "sudo":
          output = (
            <div className="text-red-400 py-1 text-xs font-mono">
              <p>visitor is not in the sudoers file.</p>
              <p className="opacity-80">This incident will be reported to Mini Anish.</p>
            </div>
          );
          break;

        case "date":
        case "time":
          output = <p className="font-mono text-xs">{new Date().toString()}</p>;
          break;

        case "history":
          output = (
            <div className="space-y-1 text-xs font-mono">
              <p className="font-bold opacity-75">Command History:</p>
              {cmdHistory.map((cmd, idx) => (
                <div key={idx} className="opacity-80">
                  {idx + 1}  {cmd}
                </div>
              ))}
            </div>
          );
          break;

        default:
          output = (
            <div className="text-red-400 text-xs font-mono">
              <p>zsh: command not found: {command}</p>
              <p className="text-white/60 mt-0.5">
                Type <button type="button" onClick={() => executeCommand("help")} className="underline font-bold text-white hover:text-cyan-300 cursor-pointer">help</button> to view all available commands, or type <button type="button" onClick={() => executeCommand("tour")} className="underline font-bold text-cyan-300 hover:text-cyan-200 cursor-pointer">tour</button> for a walkthrough.
              </p>
            </div>
          );
          break;
      }

      setHistory((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          command: trimmed,
          output,
          timestamp,
        },
      ]);
    },
    [cmdHistory, theme, router]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If Guided Tour is active
    if (tourStep !== null) {
      if (e.key === "Enter") {
        e.preventDefault();
        advanceTour(tourStep);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        exitTour();
        return;
      }
    }

    // Keyboard navigation when autocomplete suggestions are open
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestion((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestion((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        const choice = suggestions[selectedSuggestion >= 0 ? selectedSuggestion : 0];
        setInput(choice);
        setShowSuggestions(false);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const choice = selectedSuggestion >= 0 ? suggestions[selectedSuggestion] : input;
        executeCommand(choice);
        setInput("");
        setShowSuggestions(false);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowSuggestions(false);
        return;
      }
    }

    // Standard command history navigation when suggestions are closed
    if (e.key === "Enter") {
      e.preventDefault();
      executeCommand(input);
      setInput("");
      setShowSuggestions(false);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextPointer =
        historyPointer === -1 ? cmdHistory.length - 1 : Math.max(0, historyPointer - 1);
      setHistoryPointer(nextPointer);
      setInput(cmdHistory[nextPointer] || "");
      setShowSuggestions(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyPointer === -1) return;
      const nextPointer = historyPointer + 1;
      if (nextPointer >= cmdHistory.length) {
        setHistoryPointer(-1);
        setInput("");
      } else {
        setHistoryPointer(nextPointer);
        setInput(cmdHistory[nextPointer] || "");
      }
      setShowSuggestions(false);
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (suggestions.length > 0) {
        setInput(suggestions[0]);
        setShowSuggestions(false);
      }
    } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setHistory([]);
      setTourStep(null);
    } else if (e.ctrlKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      setInput("");
      setShowSuggestions(false);
      if (tourStep !== null) exitTour();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const quickChips = [
    { label: "tour", cmd: "tour", highlight: true },
    { label: "help", cmd: "help" },
    { label: "projects", cmd: "projects" },
    { label: "skills", cmd: "skills" },
    { label: "about", cmd: "about" },
    { label: "experience", cmd: "experience" },
    { label: "resume", cmd: "resume" },
    { label: "contact", cmd: "contact" },
    { label: "clear", cmd: "clear" },
  ];

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="fixed inset-0 z-40 flex flex-col transition-colors duration-200 select-text overflow-hidden font-mono"
      style={{
        backgroundColor: themeConfig.bg,
        color: themeConfig.text,
        textShadow: themeConfig.glow,
      }}
    >
      {/* Top macOS Window Chrome */}
      <header
        className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b shrink-0 select-none backdrop-blur-md"
        style={{
          backgroundColor: themeConfig.windowBg,
          borderColor: themeConfig.border,
        }}
      >
        {/* Left: Window Controls */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            title="Exit to GUI Portfolio (exit / gui)"
            className="w-3 h-3 rounded-full bg-[#ff5f56] hover:opacity-80 transition-opacity flex items-center justify-center text-[8px] text-black font-bold"
          >
            ✕
          </Link>
          <button
            type="button"
            onClick={() => {
              setHistory([]);
              setTourStep(null);
            }}
            title="Clear Terminal (clear / Ctrl+L)"
            className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:opacity-80 transition-opacity flex items-center justify-center text-[8px] text-black font-bold cursor-pointer"
          >
            —
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="w-3 h-3 rounded-full bg-[#27c93f] hover:opacity-80 transition-opacity flex items-center justify-center text-[7px] text-black font-bold cursor-pointer"
          >
            +
          </button>
          <span className="hidden sm:inline-block text-xs font-mono opacity-60 ml-2">
            visitor@anish-macbook: ~ (zsh)
          </span>
        </div>

        {/* Center: Mobile Title */}
        <span className="sm:hidden text-xs font-mono font-medium opacity-80">
          anish-terminal
        </span>

        {/* Right: Theme Selector & GUI Mode button */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
          <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-md p-0.5 border border-white/10">
            {(["dark", "matrix", "amber", "dracula"] as TerminalTheme[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`px-2 py-0.5 rounded text-[11px] capitalize transition-colors cursor-pointer ${
                  theme === t
                    ? "bg-white/20 text-white font-bold"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-medium border transition-all hover:scale-105 active:scale-95"
            style={{
              borderColor: themeConfig.accent,
              color: themeConfig.accent,
              backgroundColor: `${themeConfig.accent}15`,
            }}
          >
            <span>GUI Mode</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      {/* Terminal Body */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 pb-32 sm:pb-36 font-mono text-[13px] sm:text-[13.5px] leading-relaxed">
        {/* Banner */}
        <div className="select-none opacity-90 mb-2">
          <pre
            className="hidden sm:block font-mono text-[10px] sm:text-[11.5px] leading-none text-cyan-400"
            style={{ color: themeConfig.accent }}
          >
            {BANNER_DESKTOP}
          </pre>
          <pre
            className="sm:hidden font-mono text-[8px] leading-none text-cyan-400"
            style={{ color: themeConfig.accent }}
          >
            {BANNER_MOBILE}
          </pre>
          <div className="mt-2 text-xs opacity-75 space-y-0.5">
            <p>AnishOS v2.4 (x86_64-apple-darwin23.4.0) — Interactive Portfolio CLI</p>
            <p>
              Type <button type="button" onClick={() => executeCommand("help")} className="font-bold underline text-white hover:text-cyan-300 cursor-pointer">&apos;help&apos;</button> to view all commands, or click any chip below.
            </p>
          </div>
        </div>

        {/* 1. Neofetch-style Profile Card */}
        <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 p-3.5 sm:p-4 rounded-lg border border-cyan-500/20 bg-cyan-950/10 backdrop-blur-sm my-3 max-w-4xl">
          {/* Left: Cyan Monospace ASCII Portrait */}
          <div className="shrink-0 select-none">
            <pre className="font-mono text-cyan-400 text-[10.5px] sm:text-xs leading-none">
              {ASCII_PORTRAIT}
            </pre>
          </div>

          {/* Right: Profile Details */}
          <div className="flex-1 space-y-2 text-xs sm:text-[13px] font-mono leading-relaxed">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-cyan-300">
                Anish Shirodkar
              </h2>
              <p className="text-white/80">
                M.S. Computer Science · Rutgers
              </p>
            </div>

            <div className="space-y-1 text-white/90">
              <div>
                <span className="text-cyan-400 font-semibold">Focus:</span>{" "}
                <span>AI / ML · Software Engineering</span>
              </div>
              <div>
                <span className="text-cyan-400 font-semibold">Stack:</span>{" "}
                <span>Python · PyTorch · FastAPI · Next.js</span>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-1 text-xs">
              <a
                href="https://github.com/Anish0104"
                target="_blank"
                rel="noreferrer noopener"
                className="text-cyan-400 underline hover:text-cyan-200"
              >
                GitHub ↗
              </a>
              <a
                href="https://www.linkedin.com/in/anish-shirodkar/"
                target="_blank"
                rel="noreferrer noopener"
                className="text-cyan-400 underline hover:text-cyan-200"
              >
                LinkedIn ↗
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => executeCommand("tour")}
                className="px-3 py-1.5 rounded text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 hover:bg-cyan-500/30 transition-all active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(34,211,238,0.2)]"
              >
                Start guided tour →
              </button>
              <button
                type="button"
                onClick={() => executeCommand("projects")}
                className="px-3 py-1.5 rounded text-xs font-semibold bg-white/5 text-white/90 border border-white/15 hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
              >
                Explore projects
              </button>
            </div>
          </div>
        </div>

        {/* 4. Active Guided Tour Panel (if active) */}
        {tourStep !== null && (
          <div className="my-4 rounded-lg border-2 border-cyan-400 bg-cyan-950/20 p-4 font-mono text-xs sm:text-[13px] shadow-[0_0_15px_rgba(34,211,238,0.15)] max-w-3xl">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-bold text-cyan-300">
                  Guided Tour · Step {tourStep + 1} of 4:
                </span>
                <span className="text-white/80 font-medium">
                  {tourStep === 0 && "Introduction"}
                  {tourStep === 1 && "Featured Engineering & ML Projects"}
                  {tourStep === 2 && "Research & Experience"}
                  {tourStep === 3 && "Contact & Next Steps"}
                </span>
              </div>
              <button
                type="button"
                onClick={exitTour}
                className="text-xs text-white/50 hover:text-white cursor-pointer"
                title="Exit tour (Esc)"
              >
                [ Esc ]
              </button>
            </div>

            {/* Tour Step Content */}
            {tourStep === 0 && (
              <div className="space-y-2.5">
                <p className="text-white/90 leading-relaxed">
                  Hi! I’m Anish Shirodkar, an M.S. Computer Science graduate student at Rutgers University focused on machine learning and systems engineering.
                </p>
                <p className="text-white/80 leading-relaxed">
                  My work spans clinical transformers for longitudinal EHR modeling, two-stage vector and lexical information retrieval, and production-grade full-stack systems.
                </p>
                <div className="p-2.5 rounded bg-white/5 border border-white/10 text-xs">
                  <span className="text-cyan-400 font-semibold block mb-1">Key Research:</span>
                  <span>AI/ML Research Intern at Rutgers MIARC Lab modeling masked patient timelines across clinical domains.</span>
                </div>
              </div>
            )}

            {tourStep === 1 && (
              <div className="space-y-2.5">
                <p className="text-white/90 leading-relaxed">
                  Here are three of my flagship projects:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div className="p-2 rounded bg-white/5 border border-white/10">
                    <span className="font-bold text-amber-300 block">Cerevia 🏆</span>
                    <span className="text-[11px] text-white/70 block mt-0.5">1st Place Sevaro Track, Health Hack</span>
                    <button
                      type="button"
                      onClick={() => executeCommand("project cerevia")}
                      className="text-cyan-400 underline text-[11px] mt-1.5 block cursor-pointer"
                    >
                      project cerevia →
                    </button>
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/10">
                    <span className="font-bold text-cyan-300 block">Semantic Search</span>
                    <span className="text-[11px] text-white/70 block mt-0.5">Two-stage IR over 100k passages</span>
                    <button
                      type="button"
                      onClick={() => executeCommand("project semantic-search")}
                      className="text-cyan-400 underline text-[11px] mt-1.5 block cursor-pointer"
                    >
                      project semantic-search →
                    </button>
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/10">
                    <span className="font-bold text-emerald-300 block">Vouch</span>
                    <span className="text-[11px] text-white/70 block mt-0.5">Cryptographic delegation protocol</span>
                    <button
                      type="button"
                      onClick={() => executeCommand("project vouch")}
                      className="text-cyan-400 underline text-[11px] mt-1.5 block cursor-pointer"
                    >
                      project vouch →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {tourStep === 2 && (
              <div className="space-y-2.5">
                <p className="text-white/90 leading-relaxed">
                  Research appointments & industry accomplishments:
                </p>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded bg-white/5 border border-white/10">
                    <span className="font-bold text-white">Rutgers MIARC Lab</span>
                    <span className="text-cyan-400 ml-2">· AI/ML Research Intern</span>
                    <p className="text-white/70 text-[11.5px] mt-0.5">
                      Transformer-based longitudinal electronic health record architectures for clinical sequence modeling.
                    </p>
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/10">
                    <span className="font-bold text-white">Indian Meteorological Department</span>
                    <span className="text-cyan-400 ml-2">· ML Researcher</span>
                    <p className="text-white/70 text-[11.5px] mt-0.5">
                      Attention-LSTM forecasting system, validated and registered as an IP India copyright (LD-20250175526).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {tourStep === 3 && (
              <div className="space-y-2.5">
                <p className="text-white/90 leading-relaxed">
                  Tour completed! You are ready to explore.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <a href={`mailto:${email}`} className="text-cyan-400 underline hover:text-cyan-200">
                    Email ({email})
                  </a>
                  <a href="https://github.com/Anish0104" target="_blank" rel="noreferrer noopener" className="text-cyan-400 underline hover:text-cyan-200">
                    GitHub ↗
                  </a>
                  <a href="https://www.linkedin.com/in/anish-shirodkar/" target="_blank" rel="noreferrer noopener" className="text-cyan-400 underline hover:text-cyan-200">
                    LinkedIn ↗
                  </a>
                  <a href={resume.path} target="_blank" rel="noreferrer noopener" className="text-emerald-400 underline hover:text-emerald-200">
                    Resume PDF ↗
                  </a>
                </div>
                <p className="text-[11.5px] text-white/60 pt-1">
                  Try typing &apos;skills&apos;, &apos;projects&apos;, or click any quick chip below!
                </p>
              </div>
            )}

            {/* Tour Navigation Controls */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-cyan-500/20">
              <span className="text-[11px] text-white/50">
                Press <kbd className="px-1 py-0.5 rounded bg-white/10">Enter</kbd> to continue, <kbd className="px-1 py-0.5 rounded bg-white/10">Esc</kbd> to exit
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exitTour}
                  className="px-2.5 py-1 rounded text-xs border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Exit Tour
                </button>
                <button
                  type="button"
                  onClick={() => advanceTour(tourStep)}
                  className="px-3 py-1 rounded text-xs font-semibold bg-cyan-500/30 text-cyan-200 border border-cyan-400 hover:bg-cyan-500/40 transition-colors cursor-pointer"
                >
                  {tourStep < 3 ? "Next Step →" : "Finish Tour ✓"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History Stream */}
        <div className="space-y-3">
          {history.map((entry) => (
            <div key={entry.id} className="space-y-1">
              <div className="flex items-center gap-2 text-xs opacity-90 font-mono">
                <span className="font-semibold text-emerald-400" style={{ color: themeConfig.promptUser }}>
                  visitor@anish
                </span>
                <span className="opacity-50">:</span>
                <span className="font-medium text-sky-400" style={{ color: themeConfig.promptPath }}>
                  ~
                </span>
                <span className="opacity-50">$</span>
                <span className="font-semibold text-white">{entry.command}</span>
                <span className="text-[10px] opacity-40 ml-auto hidden sm:inline">
                  {entry.timestamp}
                </span>
              </div>
              {entry.output && <div className="pl-1 sm:pl-3">{entry.output}</div>}
            </div>
          ))}
        </div>

        {/* Active Command Input Line with Real-Time Suggestions Popover */}
        <div className="relative mt-3">
          <div className="flex items-center gap-2 text-xs sm:text-[13px] font-mono">
            <span className="font-semibold text-emerald-400" style={{ color: themeConfig.promptUser }}>
              visitor@anish
            </span>
            <span className="opacity-50">:</span>
            <span className="font-medium text-sky-400" style={{ color: themeConfig.promptPath }}>
              ~
            </span>
            <span className="opacity-50">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              className="flex-1 bg-transparent outline-none border-none p-0 text-inherit font-mono"
              aria-label="Terminal input"
            />
          </div>

          {/* 3. Floating Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 top-full mt-1.5 p-1 rounded-md border border-cyan-500/30 bg-[#0c121e]/95 backdrop-blur-md max-w-md w-full shadow-2xl z-20 font-mono">
              <div className="flex items-center justify-between px-2 py-1 text-[10px] text-cyan-400/80 border-b border-white/10">
                <span>Autocomplete Suggestions</span>
                <span>Tab complete · ↑↓ choose · ↵ run</span>
              </div>
              <div className="py-0.5">
                {suggestions.map((s, idx) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      executeCommand(s);
                      setInput("");
                      setShowSuggestions(false);
                    }}
                    onMouseEnter={() => setSelectedSuggestion(idx)}
                    className={`w-full text-left px-2 py-1 rounded text-xs font-mono flex items-center justify-between cursor-pointer transition-colors ${
                      idx === selectedSuggestion
                        ? "bg-cyan-500/25 text-cyan-200 font-semibold"
                        : "text-white/80 hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={idx === selectedSuggestion ? "text-cyan-400 font-bold" : "opacity-30"}>
                        ▸
                      </span>
                      <span>{s}</span>
                    </span>
                    <span className="text-[10px] opacity-40">
                      {s.startsWith("project ") ? "project deep-dive" : "command"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div ref={terminalEndRef} className="h-6" />
      </main>

      {/* 6. Mini Anish Perched in Bottom-Right with Dismissible Bubble */}
      <div
        className="fixed right-3 sm:right-6 bottom-24 z-30 flex flex-col items-end pointer-events-auto select-none"
        aria-label="Mini Anish companion"
      >
        {showCompanionBubble && (
          <div className="mb-2 relative max-w-[210px] rounded-lg border border-cyan-500/40 bg-[#0d1522]/95 px-3 py-2 text-xs font-mono text-white shadow-xl backdrop-blur-md animate-in fade-in duration-200">
            <button
              type="button"
              onClick={() => setShowCompanionBubble(false)}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white/20 text-white hover:bg-white/40 flex items-center justify-center text-[10px] leading-none cursor-pointer"
              title="Dismiss"
              aria-label="Dismiss speech bubble"
            >
              ✕
            </button>
            <p className="leading-snug pr-2 text-[11.5px]">
              New here? Try{" "}
              <button
                type="button"
                onClick={() => {
                  executeCommand("tour");
                  setShowCompanionBubble(false);
                }}
                className="text-cyan-300 font-bold underline hover:text-cyan-100 cursor-pointer"
              >
                tour
              </button>
              .
            </p>
            {/* Speech bubble pointer */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 rotate-45 border-r border-b border-cyan-500/40 bg-[#0d1522]" />
          </div>
        )}

        <div
          className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
          onClick={() => {
            setShowCompanionBubble(true);
            executeCommand("companion");
          }}
          title="Mini Anish: Click to interact or start tour!"
        >
          <CompanionSprite
            state="idle"
            height={64}
            facing={-1}
            preloadStates={["idle", "wave"]}
          />
        </div>
      </div>

      {/* 5. Fixed Bottom Controls & Subtle Hint Row */}
      <footer
        className="fixed bottom-0 left-0 right-0 z-30 px-3 sm:px-6 py-2.5 border-t flex flex-col gap-1.5 backdrop-blur-md"
        style={{
          backgroundColor: `${themeConfig.windowBg}f5`,
          borderColor: themeConfig.border,
        }}
      >
        {/* Quick action chips row */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-mono opacity-50 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
            Quick:
          </span>
          {quickChips.map((chip) => {
            const isTour = chip.highlight;
            return (
              <button
                key={chip.cmd}
                type="button"
                onClick={() => executeCommand(chip.cmd)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-all active:scale-95 shrink-0 cursor-pointer ${
                  isTour
                    ? "border border-cyan-400 text-cyan-300 bg-cyan-950/40 shadow-[0_0_10px_rgba(34,211,238,0.25)] font-bold"
                    : "border border-white/10 bg-white/5 hover:bg-white/15 text-white/90"
                }`}
              >
                {chip.label}
              </button>
            );
          })}

          {/* Theme switcher on mobile */}
          <div className="ml-auto shrink-0 flex items-center gap-1 md:hidden">
            {(["dark", "matrix", "amber", "dracula"] as TerminalTheme[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${
                  theme === t
                    ? "bg-white/25 text-white font-bold"
                    : "opacity-40 hover:opacity-100"
                }`}
              >
                {t[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Subtle Hint Row */}
        <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pt-0.5 border-t border-white/5">
          <span>TAB autocomplete · ↑↓ history · Ctrl+L clear</span>
          <span className="hidden sm:inline">Type &apos;exit&apos; to return to GUI</span>
        </div>
      </footer>
    </div>
  );
}
