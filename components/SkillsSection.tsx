"use client";

import React from "react";
import TechLogo from "./icons/TechLogo";

export interface SkillCategory {
  name: string;
  skills: string[];
}

export const skillCategories: SkillCategory[] = [
  {
    name: "Languages",
    skills: ["JavaScript", "TypeScript", "Python", "Go", "C", "C++", "SQL"],
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
      "Qdrant",
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
      "Linux",
      "AWS",
      "GCP",
      "Vercel",
    ],
  },
  {
    name: "Hardware",
    skills: ["ESP32", "Raspberry Pi", "Arduino", "Sensors", "MQTT"],
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
        <h2 className="text-[28px] sm:text-[34px] font-black tracking-tight text-neutral-900 dark:text-neutral-100">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-[15px] sm:text-[16px] text-neutral-600 dark:text-neutral-400">
            {subtitle}
          </p>
        ) : null}
      </div>

      {/* Main Neo-brutalist Card Container matching bugblazer.dev */}
      <div className="mt-6 rounded-[14px] border-[2.5px] border-black dark:border-white/80 bg-white dark:bg-[#1a1b1e] px-5 sm:px-8 py-3 shadow-[6px_6px_0_#000] dark:shadow-[6px_6px_0_rgba(255,255,255,0.85)]">
        <dl className="divide-y-2 divide-neutral-200 dark:divide-neutral-800">
          {skillCategories.map((category) => (
            <div
              key={category.name}
              className="grid grid-cols-1 gap-2.5 py-4 sm:grid-cols-[140px_1fr] sm:items-center sm:gap-6 sm:py-5"
            >
              <dt className="font-extrabold text-[15.5px] sm:text-[16.5px] text-neutral-900 dark:text-neutral-100 tracking-tight shrink-0">
                {category.name}
              </dt>
              <dd>
                <ul className="flex flex-wrap gap-2 sm:gap-2.5">
                  {category.skills.map((skill) => (
                    <li
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-[6px] border-[2px] border-black dark:border-white/80 bg-white dark:bg-[#121316] px-2.5 sm:px-3 py-1 font-mono text-[12.5px] sm:text-[13px] font-bold text-neutral-900 dark:text-neutral-100 shadow-[1.5px_1.5px_0_#000] dark:shadow-[1.5px_1.5px_0_#fff] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] dark:hover:shadow-[3px_3px_0_#fff] cursor-default"
                    >
                      <TechLogo name={skill} size={14} className="shrink-0 text-neutral-700 dark:text-neutral-300" />
                      <span>{skill}</span>
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

