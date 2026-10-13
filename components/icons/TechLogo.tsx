import React from "react";
import { brandPaths } from "./brand-paths";

export interface TechLogoProps {
  name: string;
  size?: number;
  className?: string;
}

export default function TechLogo({
  name,
  size = 13,
  className = "",
}: TechLogoProps) {
  const norm = name.toLowerCase().trim();

  // 1. Check existing Simple Icons paths from brand-paths.ts
  if (norm.includes("python")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d={brandPaths.Python[0]} />
      </svg>
    );
  }

  if (norm.includes("pytorch")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d={brandPaths.PyTorch[0]} />
      </svg>
    );
  }

  if (norm.includes("react")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d={brandPaths.React[0]} />
      </svg>
    );
  }

  if (norm.includes("next")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d={brandPaths.NextJs[0]} />
      </svg>
    );
  }

  if (norm.includes("fastapi")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d={brandPaths.FastApi[0]} />
      </svg>
    );
  }

  if (norm.includes("docker")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d={brandPaths.Docker[0]} />
      </svg>
    );
  }

  if (norm.includes("qdrant")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d={brandPaths.Qdrant[0]} />
      </svg>
    );
  }

  if (norm.includes("supabase")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d={brandPaths.Supabase[0]} />
      </svg>
    );
  }

  if (norm.includes("postgres")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d={brandPaths.PostgreSql[0]} />
      </svg>
    );
  }

  if (norm.includes("hugging")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d={brandPaths.HuggingFace[0]} />
      </svg>
    );
  }

  // 2. Auth0 - Shield emblem
  if (norm.includes("auth0")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d="M21.98 12c0 5.48-3.41 10.36-8.52 11.96a2.03 2.03 0 0 1-1.28 0C7.07 22.36 3.66 17.48 3.66 12V4.54a1.8 1.8 0 0 1 1.25-1.72l6.83-2.31a2.02 2.02 0 0 1 1.32 0l6.83 2.31c.75.25 1.25.95 1.25 1.72V12z" />
      </svg>
    );
  }

  // 3. Groq / LLaMA / Meta
  if (norm.includes("groq") || norm.includes("llama")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V13h-2v1.93A8 8 0 0 1 6.07 10H8V8H6.07A8 8 0 0 1 11 4.07V6h2V4.07A8 8 0 0 1 17.93 9H16v2h1.93A8 8 0 0 1 13 16.93z" />
      </svg>
    );
  }

  // 4. Vite - Lightning V bolt
  if (norm.includes("vite")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d="M23.6 3.6 12.6 22.9a1 1 0 0 1-1.7 0L.4 3.6A1 1 0 0 1 1.3 2h21.4a1 1 0 0 1 .9 1.6zM12 6.5 8.5 13h4l-2 5.5L16 11h-4.5z" />
      </svg>
    );
  }

  // 5. Flutter - Twin angular wings
  if (norm.includes("flutter")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d="M14.314 0 2.3 12 6 15.7 21.684 0zm.014 11.072-6.471 6.457 6.47 6.471H21.7L15.228 17.53l6.471-6.458z" />
      </svg>
    );
  }

  // 6. ElevenLabs - Two vertical soundwave bars
  if (norm.includes("elevenlabs")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d="M7 3.5h3.5v17H7zm6.5 0H17v17h-3.5z" />
      </svg>
    );
  }

  // 7. Ollama - Llama silhouette mark
  if (norm.includes("ollama")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d="M9 3a2 2 0 0 0-2 2v2H6a3 3 0 0 0-3 3v2a3 3 0 0 0 2.8 3H6v5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h2v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-7a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3h-1V5a2 2 0 0 0-2-2h-3zm0 2h3v2H9V5z" />
      </svg>
    );
  }

  // 8. TypeScript - TS badge
  if (norm.includes("typescript")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d="M2 3h20a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm3 4v2.5h3V18h3.5V9.5h3V7H5zm12.5 5.5c-.8 0-1.8.4-1.8 1.4 0 1.5 3.3 1.2 3.3 3.3 0 1.5-1.5 2-3 1.7v-2.3c.5.2 1.3.4 1.7.4.4 0 .8-.2.8-.5 0-1.5-3.3-1.1-3.3-3.3 0-1.7 1.4-2.3 2.8-2.3 1 0 1.8.3 2.1.6l-.9 1.9c-.3-.3-.9-.6-1.7-.6z" />
      </svg>
    );
  }

  // 9. Tailwind CSS - Twin wave curves
  if (norm.includes("tailwind")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2-1.8-.913-.228-1.565-.89-2.288-1.624C16.336 4.982 14.975 3.6 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2-1.8-.913-.228-1.565-.89-2.288-1.624C10.336 12.182 8.975 10.8 6.001 12z" />
      </svg>
    );
  }

  // 10. Neural Transformers / Sentence-Transformers / Cross-Encoder
  if (norm.includes("transformer") || norm.includes("encoder") || norm.includes("embeddings")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <circle cx="5" cy="6" r="2.5" />
        <circle cx="5" cy="18" r="2.5" />
        <circle cx="19" cy="12" r="2.5" />
        <path d="M7.5 7.2l9 3.6M7.5 16.8l9-3.6" stroke="currentColor" strokeWidth="1.6" fill="none" />
      </svg>
    );
  }

  // 11. OpenCV / Computer Vision / YOLO
  if (norm.includes("opencv") || norm.includes("yolo") || norm.includes("bytetrack") || norm.includes("ultralytics")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
        <circle cx="12" cy="7.5" r="3.2" />
        <circle cx="7.8" cy="15.5" r="3.2" />
        <circle cx="16.2" cy="15.5" r="3.2" />
      </svg>
    );
  }

  // 12. Streamlit - Crown mark
  if (norm.includes("streamlit")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d="M16.9 8.2 12.5 1 8.1 8.2H3.7L12.5 23l8.8-14.8z" />
      </svg>
    );
  }

  // 13. Pytest - Beaker with checkmark
  if (norm.includes("pytest") || norm.includes("test")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
        <path d="M9 3h6M10 3v5l-4 7.5A3 3 0 0 0 8.6 20h6.8a3 3 0 0 0 2.6-4.5L14 8V3" />
        <path d="m9 14 2 2 4-4" />
      </svg>
    );
  }

  // 14. Vector DB / FAISS / ChromaDB
  if (norm.includes("faiss") || norm.includes("chroma") || norm.includes("vector")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
      </svg>
    );
  }

  // 15. OpenAI / Gemini / AI
  if (norm.includes("openai") || norm.includes("gemini")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d="M12 2l2.2 6.8H21l-5.6 4.1 2.1 6.8-5.5-4.2-5.5 4.2 2.1-6.8L3 8.8h6.8z" />
      </svg>
    );
  }

  // 16. Vercel - Triangle
  if (norm.includes("vercel")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d="M12 2 24 22H0z" />
      </svg>
    );
  }

  // 17. Pandas / NumPy / Data
  if (norm.includes("pandas") || norm.includes("numpy")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <rect x="3" y="4" width="4" height="16" rx="1.5" />
        <rect x="10" y="8" width="4" height="12" rx="1.5" />
        <rect x="17" y="12" width="4" height="8" rx="1.5" />
      </svg>
    );
  }

  // Fallback: Clean code/module brackets
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />
    </svg>
  );
}
