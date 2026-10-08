"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

type Groups = { name: string; docs: { slug: string; title: string }[] }[];

export function DocsNav({ groups, onNavigate, layoutId = "docs-active" }: { groups: Groups; onNavigate?: () => void; layoutId?: string }) {
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
                      layoutId={layoutId}
                      className="absolute inset-0 rounded-lg bg-panel ring-1 ring-rail"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                  {on && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-green" />}
                  <Link
                    href={href}
                    aria-current={on ? "page" : undefined}
                    onClick={onNavigate}
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

/** Below lg the sidebar collapses into a sticky bar that names the current page. */
export function MobileDocsNav({ groups }: { groups: Groups }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = groups.flatMap((g) => g.docs).find((d) => pathname === `/docs/${d.slug}`);
  return (
    <div className="sticky top-16 z-30 -mx-4 border-b border-rail bg-bg/90 px-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-docs"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm"
      >
        <span className="min-w-0 truncate">
          <span className="text-muted">Docs</span>
          {current && <span className="font-medium"> / {current.title}</span>}
        </span>
        <ChevronDown className={`size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="mobile-docs"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.9, 0.1, 1] }}
            className="overflow-hidden"
          >
            <div className="max-h-[65dvh] overflow-y-auto pb-5 [scrollbar-width:thin]">
              <DocsNav groups={groups} onNavigate={() => setOpen(false)} layoutId="docs-active-mobile" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
