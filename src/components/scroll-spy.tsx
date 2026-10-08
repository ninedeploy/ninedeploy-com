"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

/** A sticky section index that follows the reader. */
export function ScrollSpy({ items }: { items: { id: string; label: string; count?: number }[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page" className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col">
      {items.map((i) => {
        const on = i.id === active;
        return (
          <a
            key={i.id}
            href={`#${i.id}`}
            className={`relative flex shrink-0 items-center justify-between gap-6 rounded-xl px-3 py-2 text-sm transition-colors ${
              on ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {on && (
              <motion.span
                layoutId="spy"
                className="absolute inset-0 rounded-xl border border-rail bg-panel"
                transition={{ type: "spring", stiffness: 400, damping: 34 }}
              />
            )}
            <span className="relative font-medium">{i.label}</span>
            {i.count !== undefined && <span className="relative font-mono text-xs text-muted">{i.count}</span>}
          </a>
        );
      })}
    </nav>
  );
}
