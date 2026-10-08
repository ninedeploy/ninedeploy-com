"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

export function Accordion({ items }: { items: { q: string; a: ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <ul className="divide-y divide-rail border-y border-rail">
      {items.map((item, i) => {
        const on = open === i;
        return (
          <li key={item.q}>
            <h3>
              <button
                type="button"
                id={`${base}-b${i}`}
                aria-expanded={on}
                aria-controls={`${base}-p${i}`}
                onClick={() => setOpen(on ? null : i)}
                className="group flex w-full items-center justify-between gap-6 py-6 text-left"
              >
                <span className={`heading text-xl transition-colors sm:text-2xl ${on ? "text-ink" : "text-ink/80 group-hover:text-ink"}`}>
                  {item.q}
                </span>
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                    on ? "rotate-45 border-green bg-green text-bg" : "border-rail group-hover:border-rail-strong"
                  }`}
                >
                  <Plus className="size-4" />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div
                  id={`${base}-p${i}`}
                  role="region"
                  aria-labelledby={`${base}-b${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.2, 0.9, 0.1, 1] }}
                  className="overflow-hidden"
                >
                  <div className="max-w-3xl pb-7 text-[17px] leading-relaxed text-muted">{item.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
