"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

export function DocsNav({ groups }: { groups: { name: string; docs: { slug: string; title: string }[] }[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Documentation" className="space-y-7">
      {groups.map((g) => (
        <div key={g.name}>
          <p className="px-3 text-sm font-semibold text-ink">{g.name}</p>
          <ul className="mt-2 space-y-0.5">
            {g.docs.map((d) => {
              const href = `/docs/${d.slug}`;
              const on = pathname === href;
              return (
                <li key={d.slug} className="relative">
                  {on && (
                    <motion.span
                      layoutId="docs-active"
                      className="absolute inset-0 rounded-lg bg-panel ring-1 ring-rail"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                  {on && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-green" />}
                  <Link
                    href={href}
                    aria-current={on ? "page" : undefined}
                    className={`relative block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      on ? "font-medium text-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    {d.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
