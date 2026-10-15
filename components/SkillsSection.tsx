"use client";

import React from "react";

export interface SkillCategory {
  name: string;
  skills: string[];
}

export const skillCategories: SkillCategory[] = [
  {
    name: "Languages",
    skills: ["Python", "TypeScript", "JavaScript", "Go", "C", "C++", "SQL"],
  },
  {
    name: "AI & ML",
    skills: [
      "PyTorch",
      "TensorFlow",
      "Hugging Face",
      "Transformers",
      "LLMs & RAG",
      "Qdrant",
      "ChromaDB",
      "YOLOv8",
      "OpenCV",
      "scikit-learn",
    ],
  },
  {
    name: "Backend",
    skills: [
      "FastAPI",
      "Node.js",
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
    skills: ["Next.js", "React", "Tailwind CSS", "Streamlit", "HTML5", "CSS3"],
  },
  {
    name: "Databases",
    skills: [
      "PostgreSQL",
      "Supabase (PostgreSQL + RLS)",
      "MySQL",
      "SQLite",
      "MongoDB",
      "Qdrant",
    ],
  },
  {
    name: "Tools & Cloud",
    skills: [
      "Docker",
      "Git",
      "Claude Code",
      "Cursor",
      "Linux",
      "AWS",
      "GCP",
      "Vercel",
    ],
  },
  {
    name: "Hardware & IoT",
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
        <h2 className="text-[24px] font-semibold tracking-[-0.026em] text-text sm:text-[30px]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1.5 text-[15px] text-muted sm:text-[16px]">
            {subtitle}
          </p>
        ) : null}
      </div>

      {/* Structured, editorial card container matching the site theme */}
      <div className="mt-6 rounded-2xl border border-border bg-surface px-6 py-2 shadow-card sm:px-8 sm:py-3">
        <dl className="divide-y divide-border">
          {skillCategories.map((category) => (
            <div
              key={category.name}
              className="grid grid-cols-1 gap-2.5 py-4 sm:grid-cols-[140px_1fr] sm:items-center sm:gap-6 sm:py-4.5"
            >
              <dt className="font-semibold text-[14.5px] text-text tracking-tight shrink-0 sm:text-[15.5px]">
                {category.name}
              </dt>
              <dd>
                <ul className="flex flex-wrap gap-2 sm:gap-2.5">
                  {category.skills.map((skill) => (
                    <li
                      key={skill}
                      className="inline-flex items-center rounded-lg border border-border/80 bg-surface-2 px-3 py-1 font-mono text-[12px] sm:text-[12.5px] font-medium text-text-soft transition-all duration-150 hover:border-border-strong hover:bg-surface hover:text-text cursor-default"
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
