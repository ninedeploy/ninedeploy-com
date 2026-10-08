"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Template } from "@/lib/content";

/** A swipeable, snap-scrolling rail of large featured cards with arrow controls. */
export function FeaturedSlider({ items }: { items: Template[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const [progress, setProgress] = useState(0);

  const update = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft > max - 8 });
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  }, []);

  useEffect(() => {
    update();
    const el = rail.current;
    el?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const page = (dir: 1 | -1) => {
    const el = rail.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div>
      <div className="mx-auto flex max-w-7xl items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <h2 className="heading text-3xl sm:text-4xl">Featured</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => page(-1)}
            disabled={edge.start}
            aria-label="Previous templates"
            className="grid size-11 place-items-center rounded-full border border-rail transition-colors hover:bg-panel disabled:opacity-30"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => page(1)}
            disabled={edge.end}
            aria-label="Next templates"
            className="grid size-11 place-items-center rounded-full border border-rail transition-colors hover:bg-panel disabled:opacity-30"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
      <div
        ref={rail}
        className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:scroll-px-6 sm:px-6 lg:scroll-px-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
      >
        {items.map((t, i) => (
          <Link
            key={t.id}
            href={`/templates/${t.id}`}
            className="group relative flex h-72 w-[78vw] max-w-[340px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[28px] border border-rail bg-panel p-6"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full opacity-50 blur-2xl transition-opacity duration-500 group-hover:opacity-90"
              style={{ background: `radial-gradient(circle, ${i % 2 ? "var(--glow-green)" : "var(--glow-blue)"}, transparent 70%)` }}
            />
            <span
              aria-hidden
              className="absolute right-5 top-4 text-[6.5rem] leading-none opacity-90 transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-6"
            >
              {t.emoji}
            </span>
            <span className="relative font-mono text-xs text-muted">{t.category}</span>
            <span className="relative">
              <span className="heading flex items-center gap-2 text-3xl">
                {t.name}
                {t.verified && <BadgeCheck className="size-5 shrink-0 text-green" aria-label="Runtime-certified" />}
              </span>
              <span className="mt-2 line-clamp-2 block text-sm text-muted">{t.tagline}</span>
            </span>
          </Link>
        ))}
      </div>
      <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-[3px] overflow-hidden rounded-full bg-rail">
          <div className="lane-rule h-full transition-[width] duration-150" style={{ width: `${Math.max(8, progress * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}
