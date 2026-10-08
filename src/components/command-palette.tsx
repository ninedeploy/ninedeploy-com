"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { BookOpen, CornerDownLeft, FileText, Search } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { SearchItem, SearchKind } from "@/lib/search-index";
import { TemplateIcon } from "./templates/template-icon";

const PaletteContext = createContext<() => void>(() => {});
export const useOpenPalette = () => useContext(PaletteContext);

const LIMIT: Record<SearchKind, number> = { Page: 4, Docs: 6, Template: 6 };
const ORDER: SearchKind[] = ["Page", "Docs", "Template"];

function score(item: SearchItem, q: string) {
  const title = item.title.toLowerCase();
  if (title === q) return 100;
  if (title.startsWith(q)) return 80;
  if (title.split(/[\s\-.&]+/).some((w) => w.startsWith(q))) return 60;
  if (title.includes(q)) return 45;
  const rest = `${item.hint} ${item.keywords ?? ""}`.toLowerCase();
  if (rest.includes(q)) return 20;
  // every word of a multi-word query somewhere in the item
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.every((w) => `${title} ${rest}`.includes(w))) return 10;
  return 0;
}

const SUGGESTED = ["/docs/installation", "/docs/deploy-pipeline", "/templates/n8n", "/docs/mcp", "/features"];

export function CommandPalette({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  // The index (docs + templates) is a separate chunk, fetched on first open
  // instead of being serialized into every page.
  const [index, setIndex] = useState<SearchItem[]>([]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const q = useDeferredValue(query.trim().toLowerCase());
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const id = useId();

  const show = useCallback(() => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setOpen(true);
    import("@/lib/search-index").then((m) => setIndex((prev) => (prev.length ? prev : m.buildSearchIndex())));
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
    requestAnimationFrame(() => returnFocus.current?.focus?.());
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) close();
        else show();
      } else if (e.key === "/" && !open && !(e.target as HTMLElement)?.closest("input, textarea, [contenteditable]")) {
        e.preventDefault();
        show();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, show, close]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  const results = useMemo(() => {
    if (!q) {
      return SUGGESTED.map((href) => index.find((i) => i.href === href)).filter(Boolean) as SearchItem[];
    }
    const scored = index
      .map((item) => ({ item, s: score(item, q) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s);
    return ORDER.flatMap((kind) => scored.filter((r) => r.item.kind === kind).slice(0, LIMIT[kind]).map((r) => r.item));
  }, [index, q]);

  const groups = useMemo(() => {
    if (!q) return [{ kind: "Suggested", items: results }];
    return ORDER.map((kind) => ({ kind: kind === "Page" ? "Pages" : kind === "Template" ? "Templates" : kind, items: results.filter((r) => r.kind === kind) })).filter(
      (g) => g.items.length,
    );
  }, [results, q]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (item: SearchItem | undefined) => {
    if (!item) return;
    close();
    router.push(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      // the input is the only focusable control; keep focus inside the dialog
      e.preventDefault();
    }
  };

  let flat = -1;

  return (
    <PaletteContext.Provider value={show}>
      {/* inert while the modal is open, so Tab and screen readers stay in the dialog */}
      <div className="contents" inert={open}>
        {children}
      </div>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]">
            <motion.div
              className="absolute inset-0 bg-[#0a101b]/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              aria-hidden
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Search the site"
              initial={{ opacity: 0, y: -12, scale: 0.97, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, scale: 0.98, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              onAnimationStart={() => inputRef.current?.focus()}
              onKeyDown={onKeyDown}
              // clicks on labels or padding must not pull focus off the input
              onMouseDown={(e) => {
                if (e.target !== inputRef.current) e.preventDefault();
              }}
              className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-rail-strong bg-panel shadow-[0_40px_120px_-30px_rgb(0_0_0/0.55)]"
            >
              <div className="lane-rule h-[2px]" aria-hidden />
              <div className="flex items-center gap-3 border-b border-rail px-5">
                <Search className="size-5 shrink-0 text-muted" />
                <input
                  ref={inputRef}
                  autoFocus
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  placeholder="Search docs, templates and pages"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls={`${id}-list`}
                  aria-activedescendant={results.length ? `${id}-o${active}` : undefined}
                  aria-autocomplete="list"
                  className="h-16 min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-muted focus-visible:outline-none"
                />
                <kbd className="hidden rounded-md border border-rail px-1.5 py-0.5 font-mono text-[11px] text-muted sm:block">esc</kbd>
              </div>

              <div ref={listRef} id={`${id}-list`} role="listbox" aria-label="Results" className="max-h-[min(60vh,440px)] overflow-y-auto p-2">
                {groups.map((g) => (
                  <div key={g.kind} role="group" aria-labelledby={`${id}-g-${g.kind}`}>
                    <p id={`${id}-g-${g.kind}`} className="px-3 pb-1 pt-3 text-xs font-medium text-muted">
                      {g.kind}
                    </p>
                      {g.items.map((item) => {
                        flat++;
                        const i = flat;
                        const on = i === active;
                        return (
                          <div
                            key={item.href}
                            id={`${id}-o${i}`}
                            role="option"
                            aria-selected={on}
                            data-index={i}
                            onMouseMove={() => setActive(i)}
                            onClick={() => go(item)}
                            className={`relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ${on ? "text-ink" : "text-ink/85"}`}
                          >
                            {on && (
                              <motion.span
                                layoutId="palette-active"
                                className="absolute inset-0 rounded-xl bg-bg-2 ring-1 ring-rail"
                                transition={{ type: "spring", stiffness: 600, damping: 40 }}
                              />
                            )}
                            <span className="relative grid size-8 shrink-0 place-items-center rounded-lg border border-rail bg-panel text-ink">
                              {item.kind === "Template" ? (
                                <TemplateIcon t={{ icon: item.icon ?? null, name: item.title }} className="size-4" />
                              ) : item.kind === "Docs" ? (
                                <BookOpen className="size-4 text-blue" />
                              ) : (
                                <FileText className="size-4 text-green" />
                              )}
                            </span>
                            <span className="relative min-w-0 flex-1">
                              <span className="block truncate text-[15px] font-medium">{item.title}</span>
                              <span className="block truncate text-xs text-muted">{item.hint}</span>
                            </span>
                            {on && <CornerDownLeft className="relative size-4 shrink-0 text-muted" />}
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
              {results.length === 0 && index.length > 0 && (
                <div className="px-4 pb-10 pt-6 text-center" role="status">
                  <p className="font-medium">Nothing matches &ldquo;{query}&rdquo;.</p>
                  <p className="mt-1 text-sm text-muted">Try a template name like postgres, or a topic like backups.</p>
                </div>
              )}

              <div className="flex items-center gap-4 border-t border-rail px-5 py-2.5 text-xs text-muted">
                <span>
                  <kbd className="font-mono">↑↓</kbd> to move
                </span>
                <span>
                  <kbd className="font-mono">enter</kbd> to open
                </span>
                <span className="ml-auto">{index.length} entries</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PaletteContext.Provider>
  );
}

/** The header's search trigger. */
export function SearchButton() {
  const open = useOpenPalette();
  return (
    <button
      type="button"
      onClick={open}
      aria-keyshortcuts="Control+K Meta+K /"
      className="group flex h-10 items-center gap-2 rounded-full border border-rail px-3 text-sm text-muted transition-colors hover:border-rail-strong hover:bg-panel hover:text-ink"
    >
      <Search className="size-[18px]" aria-hidden />
      <span className="sr-only xl:not-sr-only">Search</span>
      <kbd aria-hidden className="hidden rounded-md border border-rail px-1.5 font-mono text-[11px] xl:inline">⌘K</kbd>
    </button>
  );
}
