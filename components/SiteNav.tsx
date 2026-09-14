"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "home", href: "/" },
  { label: "about", href: "/about" },
  { label: "projects", href: "/projects" },
  { label: "experience", href: "/experience" },
  { label: "resume", href: "/resume" },
  { label: "misc", href: "/misc" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  // The trailing-slash test keeps nested routes (/projects/vouch) active
  // without letting /projects match a hypothetical /projects-archive.
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav aria-label="Primary" className="mt-3">
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[13px]">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex py-1.5 transition-colors ${
                  active
                    ? "text-accent underline decoration-accent decoration-1 underline-offset-[6px]"
                    : "text-muted hover:text-text"
                }`}
              >
                <span className={active ? "" : "text-faint"}>[</span>
                {item.label}
                <span className={active ? "" : "text-faint"}>]</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
