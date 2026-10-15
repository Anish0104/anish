"use client";

import React from "react";

export interface SkillCategory {
  name: string;
  skills: string[];
}

export const skillCategories: SkillCategory[] = [
  {
    name: "Languages",
    skills: ["JavaScript", "TypeScript", "Go", "Python", "C", "C++", "SQL"],
  },
  {
    name: "AI & ML",
    skills: [
      "PyTorch",
      "TensorFlow",
      "Hugging Face",
      "Transformers",
      "Qdrant",
      "ChromaDB",
      "LLMs & RAG",
      "YOLOv8",
      "OpenCV",
    ],
  },
  {
    name: "Backend",
    skills: [
      "Node.js",
      "FastAPI",
      "Express",
      "Flask",
      "REST APIs",
      "Socket.io",
      "Supabase",
      "Firebase",
    ],
  },
  {
    name: "Frontend",
    skills: ["React", "Next.js", "Tailwind CSS", "Streamlit", "HTML5", "CSS3"],
  },
  {
    name: "Databases",
    skills: [
      "PostgreSQL",
      "MySQL",
      "SQLite",
      "MongoDB",
      "Supabase",
      "Firebase",
    ],
  },
  {
    name: "Tools",
    skills: [
      "Git",
      "Docker",
      "Claude Code",
      "Cursor",
      "Codex",
      "Linux",
      "AWS",
      "GCP",
    ],
  },
  {
    name: "Hardware",
    skills: ["ESP32", "Raspberry Pi", "Arduino"],
  },
];

export default function SkillsSection({
  title = "Skills",
  subtitle = "What I use to build and fix things.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="w-full">
      <div>
        <h2 className="text-[32px] sm:text-[38px] font-black tracking-tight text-neutral-900 dark:text-neutral-100">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-[15px] sm:text-[16px] text-neutral-600 dark:text-neutral-400">
            {subtitle}
          </p>
        ) : null}
      </div>

      {/* Main Neo-brutalist Card Container matching bugblazer.dev */}
      <div className="mt-6 rounded-[12px] border-[2.5px] border-black dark:border-white/80 bg-white dark:bg-[#1a1b1e] px-6 sm:px-8 py-2 shadow-[6px_6px_0_#000] dark:shadow-[6px_6px_0_rgba(255,255,255,0.85)]">
        <dl className="divide-y-2 divide-neutral-200/80 dark:divide-neutral-800">
          {skillCategories.map((category) => (
            <div
              key={category.name}
              className="grid grid-cols-1 gap-2.5 py-4 sm:grid-cols-[140px_1fr] sm:items-center sm:gap-6 sm:py-4"
            >
              <dt className="font-extrabold text-[15.5px] sm:text-[16px] text-neutral-900 dark:text-neutral-100 tracking-tight shrink-0">
                {category.name}
              </dt>
              <dd>
                <ul className="flex flex-wrap gap-2 sm:gap-2.5">
                  {category.skills.map((skill) => (
                    <li
                      key={skill}
                      className="inline-flex items-center rounded-[6px] border-[2px] border-black dark:border-white/80 bg-white dark:bg-[#121316] px-3 py-1 font-mono text-[13px] sm:text-[13.5px] font-bold text-neutral-900 dark:text-neutral-100 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-default"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
