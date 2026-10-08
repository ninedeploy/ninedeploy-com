"use client";

import { AnimatePresence, motion } from "motion/react";
import { BadgeCheck, Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import type { Template } from "@/lib/content";
import { TemplateCard } from "./template-card";

export function TemplateBrowser({
  items,
  categories,
}: {
  items: Template[];
  categories: { name: string; count: number }[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [certifiedOnly, setCertifiedOnly] = useState(false);
  const q = useDeferredValue(query.trim().toLowerCase());

  const results = useMemo(
    () =>
      items.filter(
        (t) =>
          (!category || t.category === category) &&
          (!certifiedOnly || t.verified) &&
          (!q || `${t.name} ${t.tagline} ${t.category} ${t.image}`.toLowerCase().includes(q)),
      ),
    [items, category, certifiedOnly, q],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="heading text-3xl sm:text-4xl">All templates</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block sm:w-80">
            <span className="sr-only">Search templates</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search n8n, postgres, analytics…"
              className="w-full rounded-full border border-rail bg-panel py-3 pl-11 pr-10 text-sm outline-none placeholder:text-muted focus:border-green"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-ink"
              >
                <X className="size-4" />
              </button>
            )}
          </label>
          <button
            type="button"
            aria-pressed={certifiedOnly}
            onClick={() => setCertifiedOnly((v) => !v)}
            className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-medium transition-colors ${
              certifiedOnly ? "border-green bg-green/10 text-green" : "border-rail text-muted hover:text-ink"
            }`}
          >
            <BadgeCheck className="size-4" /> Certified only
          </button>
        </div>
      </div>

      <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Category">
        {[{ name: "All", count: items.length }, ...categories].map((c) => {
          const on = c.name === "All" ? category === null : category === c.name;
          return (
            <button
              key={c.name}
              type="button"
              aria-pressed={on}
              onClick={() => setCategory(c.name === "All" ? null : c.name)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                on ? "border-ink bg-ink text-bg" : "border-rail text-muted hover:border-rail-strong hover:text-ink"
              }`}
            >
              {c.name} <span className="ml-1 font-mono text-xs opacity-60">{c.count}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {results.length === items.length ? `Showing all ${items.length}` : `${results.length} of ${items.length} match`}
      </p>

      <motion.ul layout className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence initial={false} mode="popLayout">
          {results.map((t) => (
            <motion.li
              key={t.id}
              layout
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.22 }}
            >
              <TemplateCard t={t} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {results.length === 0 && (
        <div className="mt-8 rounded-3xl border border-dashed border-rail-strong p-10 text-center">
          <p className="font-semibold">No template matches that.</p>
          <p className="mt-1 text-muted">
            Clear the filters, or deploy any image or Compose file directly — templates are only shortcuts.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory(null);
              setCertifiedOnly(false);
            }}
            className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
