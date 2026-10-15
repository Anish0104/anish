"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { profile, aboutIntro, resume, email } from "@/data/profile";
import { projects, getProject, githubUrl } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { experience } from "@/data/experience";

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

export default function TerminalEmulator() {
  const router = useRouter();
  const [theme, setTheme] = useState<TerminalTheme>("dark");
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const themeConfig = THEMES[theme];

  const scrollToBottom = useCallback(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [history, scrollToBottom]);

  // Focus input automatically on mount and on clicks
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleContainerClick = () => {
    // Keep focus on input unless selecting text
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
      inputRef.current?.focus();
    }
  };

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

      const parts = trimmed.split(/\s+/);
      const command = parts[0].toLowerCase();
      const args = parts.slice(1);

      let output: ReactNode = null;

      switch (command) {
        case "help":
        case "?":
          output = (
            <div className="space-y-3 py-1">
              <p className="font-semibold" style={{ color: themeConfig.accent }}>
                Available Commands:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-[13px]">
                <div>
                  <span className="font-bold text-emerald-400">about</span>
                  <span className="text-muted-foreground ml-3">Who is Anish? Bio & background</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400">projects</span>
                  <span className="text-muted-foreground ml-3">List all featured ML & systems projects</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400">project &lt;slug&gt;</span>
                  <span className="text-muted-foreground ml-3">Deep dive into a specific project</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400">skills</span>
                  <span className="text-muted-foreground ml-3">ML frameworks, systems & languages</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400">experience</span>
                  <span className="text-muted-foreground ml-3">Research & industry work history</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400">resume</span>
                  <span className="text-muted-foreground ml-3">View or download PDF resume</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400">contact</span>
                  <span className="text-muted-foreground ml-3">Email, GitHub, LinkedIn links</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400">theme [name]</span>
                  <span className="text-muted-foreground ml-3">dark, matrix, amber, dracula</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400">clear</span>
                  <span className="text-muted-foreground ml-3">Clear terminal screen (Ctrl+L)</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400">gui / exit</span>
                  <span className="text-muted-foreground ml-3">Return to graphical portfolio</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400">companion</span>
                  <span className="text-muted-foreground ml-3">Summon Mini Anish companion</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400">weather</span>
                  <span className="text-muted-foreground ml-3">Attention-LSTM weather forecast</span>
                </div>
              </div>
              <p className="text-[12px] opacity-75 pt-1">
                Tip: Press <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono">Tab</kbd> for auto-completion, or use <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono">↑</kbd><kbd className="px-1 py-0.5 rounded bg-white/10 font-mono">↓</kbd> for command history.
              </p>
            </div>
          );
          break;

        case "about":
        case "bio":
        case "whoami":
          output = (
            <div className="space-y-3 py-1 leading-relaxed">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold" style={{ color: themeConfig.accent }}>
                  {profile.name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full border border-white/20 bg-white/5">
                  MS CS @ Rutgers University
                </span>
              </div>
              <p className="text-sm opacity-90">{aboutIntro}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px] pt-1 border-t border-white/10">
                <div>
                  <span className="opacity-60">Location:</span> {profile.location}
                </div>
                <div>
                  <span className="opacity-60">Research:</span> MIARC Lab (Clinical Transformers)
                </div>
                <div>
                  <span className="opacity-60">Specialization:</span> ML Engineering, Retrieval & RAG, Systems
                </div>
                <div>
                  <span className="opacity-60">Email:</span>{" "}
                  <a href={`mailto:${email}`} className="underline hover:text-sky-400">
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
            <div className="space-y-3 py-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold" style={{ color: themeConfig.accent }}>
                  Projects ({projects.length} total):
                </span>
                <span className="text-xs opacity-60">Click any slug or type &apos;project &lt;slug&gt;&apos;</span>
              </div>
              <div className="space-y-2">
                {projects.map((p) => (
                  <div
                    key={p.slug}
                    className="p-2.5 rounded border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => executeCommand(`project ${p.slug}`)}
                          className="font-bold hover:underline font-mono text-left cursor-pointer"
                          style={{ color: themeConfig.accent }}
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
                        <a
                          href={githubUrl(p)}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="underline hover:text-sky-300"
                        >
                          repo ↗
                        </a>
                        {p.demo && (
                          <a
                            href={p.demo}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="underline hover:text-emerald-300"
                          >
                            demo ↗
                          </a>
                        )}
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
              <p className="text-amber-400">
                Usage: project &lt;slug&gt;. Type &apos;projects&apos; to view all project slugs.
              </p>
            );
          } else {
            const slug = args[0].toLowerCase();
            const proj = getProject(slug);
            if (!proj) {
              output = (
                <div className="text-red-400 space-y-1">
                  <p>Error: Project &apos;{slug}&apos; not found.</p>
                  <p className="text-xs text-white/60">
                    Type &apos;projects&apos; to list valid project slugs (e.g., &apos;project cerevia&apos;, &apos;project vouch&apos;).
                  </p>
                </div>
              );
            } else {
              output = (
                <div className="space-y-3 py-1.5 p-3 rounded border border-white/10 bg-white/[0.03]">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {proj.title}
                        {proj.award && (
                          <span className="text-xs font-normal px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {proj.award}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs opacity-75 mt-0.5">{proj.category}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <a
                        href={githubUrl(proj)}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        GitHub ↗
                      </a>
                      {proj.demo && (
                        <a
                          href={proj.demo}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                        >
                          Live Demo ↗
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-sm font-medium" style={{ color: themeConfig.accent }}>
                    {proj.blurb}
                  </p>

                  <p className="text-xs leading-relaxed opacity-90">{proj.summary}</p>

                  {proj.details && proj.details.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-xs font-semibold opacity-75">Key Architectural Highlights:</span>
                      <ul className="list-disc list-inside text-xs space-y-1 opacity-85">
                        {proj.details.map((detail, idx) => (
                          <li key={idx}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/10">
                    <span className="text-xs opacity-60 block mb-1.5">Tech Stack:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.stack.map((st) => (
                        <span
                          key={st}
                          className="text-[11px] px-2 py-0.5 rounded bg-white/10 border border-white/15"
                        >
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
          }
          break;

        case "skills":
          output = (
            <div className="space-y-3 py-1">
              <p className="font-semibold" style={{ color: themeConfig.accent }}>
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
                            className="underline hover:text-white mr-1.5 cursor-pointer"
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
            <div className="space-y-3 py-1">
              <p className="font-semibold" style={{ color: themeConfig.accent }}>
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
                      <span style={{ color: themeConfig.accent }}>{exp.organization}</span>
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
            <div className="space-y-2 py-1.5">
              <p className="font-semibold" style={{ color: themeConfig.accent }}>
                Resume: Anish Shirodkar
              </p>
              <p className="text-xs opacity-85">
                Current PDF version containing full academic, research, and technical background.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href={resume.path}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="px-3 py-1.5 rounded text-xs font-medium bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 transition-colors"
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
            <div className="space-y-2.5 py-1 text-xs">
              <p className="font-semibold text-sm" style={{ color: themeConfig.accent }}>
                Get In Touch:
              </p>
              <div className="space-y-1.5">
                <div>
                  <span className="opacity-60 inline-block w-20">Email:</span>
                  <a href={`mailto:${email}`} className="underline hover:text-white">
                    {email}
                  </a>
                </div>
                <div>
                  <span className="opacity-60 inline-block w-20">GitHub:</span>
                  <a
                    href="https://github.com/Anish0104"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline hover:text-white"
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
                    className="underline hover:text-white"
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
              output = <p className="text-emerald-400">Switched theme to &apos;{nextTheme}&apos;.</p>;
            } else {
              output = (
                <p className="text-amber-400">
                  Invalid theme &apos;{args[0]}&apos;. Valid themes: dark, matrix, amber, dracula.
                </p>
              );
            }
          } else {
            output = (
              <div className="space-y-1">
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
                      className="underline mr-2 hover:text-white cursor-pointer font-bold"
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
          return;

        case "gui":
        case "exit":
          output = <p className="text-emerald-400">Redirecting to standard portfolio view...</p>;
          setTimeout(() => router.push("/"), 500);
          break;

        case "companion":
        case "anish":
          output = (
            <div className="space-y-2 py-1 font-mono text-xs">
              <pre className="text-amber-300 leading-tight">
{`   ╭───────────────────────────────────────────────╮
   │  (•‿•)   Mini Anish                           │
   │  <)  )╯  "Beep boop! I live in the CLI too!   │
   │   /  \\    Try typing 'projects' or 'skills'!"  │
   ╰───────────────────────────────────────────────╯`}
              </pre>
              <p className="opacity-75">
                Mini Anish is actively monitoring system processes and cheering you on.
              </p>
            </div>
          );
          break;

        case "weather":
          output = (
            <div className="space-y-1.5 py-1 text-xs">
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
            <div className="text-red-400 py-1 text-xs">
              <p>visitor is not in the sudoers file.</p>
              <p className="opacity-80">This incident will be reported to Mini Anish.</p>
            </div>
          );
          break;

        case "date":
        case "time":
          output = <p>{new Date().toString()}</p>;
          break;

        case "history":
          output = (
            <div className="space-y-1 text-xs">
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
            <div className="text-red-400 text-xs">
              <p>zsh: command not found: {command}</p>
              <p className="text-white/60 mt-0.5">
                Type <button type="button" onClick={() => executeCommand("help")} className="underline font-bold text-white hover:text-sky-300">help</button> to view all available commands.
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
    [themeConfig, cmdHistory, theme, router]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      executeCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextPointer =
        historyPointer === -1 ? cmdHistory.length - 1 : Math.max(0, historyPointer - 1);
      setHistoryPointer(nextPointer);
      setInput(cmdHistory[nextPointer] || "");
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
    } else if (e.key === "Tab") {
      e.preventDefault();
      const currentInput = input.trim().toLowerCase();
      if (!currentInput) return;

      const projectSlugs = projects.map((p) => p.slug);
      const allCandidates = [...COMMANDS, ...projectSlugs];

      const matches = allCandidates.filter((c) => c.startsWith(currentInput));
      if (matches.length === 1) {
        setInput(matches[0]);
      } else if (matches.length > 1) {
        // Suggest matches
        setHistory((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            command: input,
            output: (
              <div className="text-xs opacity-75 flex flex-wrap gap-2">
                {matches.map((m) => (
                  <span key={m} className="font-semibold">
                    {m}
                  </span>
                ))}
              </div>
            ),
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setHistory([]);
    } else if (e.ctrlKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      setInput("");
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
      className="fixed inset-0 z-40 flex flex-col transition-colors duration-200 select-text"
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
            onClick={() => setHistory([])}
            title="Clear Terminal (clear / Ctrl+L)"
            className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:opacity-80 transition-opacity flex items-center justify-center text-[8px] text-black font-bold"
          >
            —
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="w-3 h-3 rounded-full bg-[#27c93f] hover:opacity-80 transition-opacity flex items-center justify-center text-[7px] text-black font-bold"
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
                className={`px-2 py-0.5 rounded text-[11px] capitalize transition-colors ${
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
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-medium border transition-all hover:scale-105"
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
      <main className="flex-1 overflow-y-auto p-3 sm:p-5 font-mono text-[13px] sm:text-[13.5px] leading-relaxed">
        {/* Banner */}
        <div className="select-none opacity-90 mb-4">
          <pre className="hidden sm:block font-mono text-[10px] sm:text-[11.5px] leading-none" style={{ color: themeConfig.accent }}>
            {BANNER_DESKTOP}
          </pre>
          <pre className="sm:hidden font-mono text-[8px] leading-none" style={{ color: themeConfig.accent }}>
            {BANNER_MOBILE}
          </pre>
          <div className="mt-2 text-xs opacity-75 space-y-0.5">
            <p>AnishOS v2.4 (x86_64-apple-darwin23.4.0) — Interactive Portfolio CLI</p>
            <p>
              Type <button type="button" onClick={() => executeCommand("help")} className="font-bold underline hover:text-white cursor-pointer">&apos;help&apos;</button> to view all available commands, or tap the quick chips below.
            </p>
          </div>
        </div>

        {/* History Stream */}
        <div className="space-y-3">
          {history.map((entry) => (
            <div key={entry.id} className="space-y-1">
              <div className="flex items-center gap-2 text-xs opacity-90">
                <span className="font-semibold" style={{ color: themeConfig.promptUser }}>
                  visitor@anish
                </span>
                <span className="opacity-50">:</span>
                <span className="font-medium" style={{ color: themeConfig.promptPath }}>
                  ~
                </span>
                <span className="opacity-50">$</span>
                <span className="font-semibold">{entry.command}</span>
                <span className="text-[10px] opacity-40 ml-auto hidden sm:inline">
                  {entry.timestamp}
                </span>
              </div>
              {entry.output && <div className="pl-1 sm:pl-3">{entry.output}</div>}
            </div>
          ))}
        </div>

        {/* Active Command Input Line */}
        <div className="flex items-center gap-2 mt-3 text-xs sm:text-[13px]">
          <span className="font-semibold" style={{ color: themeConfig.promptUser }}>
            visitor@anish
          </span>
          <span className="opacity-50">:</span>
          <span className="font-medium" style={{ color: themeConfig.promptPath }}>
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

        <div ref={terminalEndRef} className="h-10" />
      </main>

      {/* Bottom Mobile & Tactile Quick Action Chips Bar */}
      <footer
        className="px-3 sm:px-4 py-2 border-t flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 backdrop-blur-md"
        style={{
          backgroundColor: themeConfig.windowBg,
          borderColor: themeConfig.border,
        }}
      >
        <span className="text-[11px] font-mono opacity-50 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
          Quick:
        </span>
        {quickChips.map((chip) => (
          <button
            key={chip.cmd}
            type="button"
            onClick={() => executeCommand(chip.cmd)}
            className="px-2.5 py-1 rounded text-xs font-mono border border-white/10 bg-white/5 hover:bg-white/15 transition-all active:scale-95 shrink-0"
          >
            {chip.label}
          </button>
        ))}
        <div className="ml-auto shrink-0 flex items-center gap-1.5 md:hidden">
          {(["dark", "matrix", "amber", "dracula"] as TerminalTheme[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono transition-colors ${
                theme === t
                  ? "bg-white/25 text-white font-bold"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              {t[0]}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
