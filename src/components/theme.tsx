"use client";

import { MotionConfig } from "motion/react";
import { ThemeProvider, useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore, type MouseEvent, type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="nd-theme" disableTransitionOnChange>
      <ThemeColor />
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  );
}

/** Keeps the browser UI colour on the site's theme rather than the OS one. */
function ThemeColor() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = resolvedTheme === "light" ? "#f2f4f7" : "#0a101b";
  }, [resolvedTheme]);
  return null;
}

const noop = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

/**
 * Switches theme with a circular wipe that grows out of the button, using the
 * View Transitions API where the browser has it.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = !mounted || resolvedTheme === "dark";

  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    const next = isDark ? "light" : "dark";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduce) {
      setTheme(next);
      return;
    }
    const x = e.clientX || window.innerWidth - 40;
    const y = e.clientY || 40;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const t = document.startViewTransition(() => setTheme(next));
    t.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          { duration: 650, easing: "cubic-bezier(.6,.1,.2,1)", pseudoElement: "::view-transition-new(root)" },
        );
      })
      // a second click before the first transition is ready aborts it; that's fine
      .catch(() => {});
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`relative grid size-10 place-items-center rounded-full border border-rail text-ink transition-colors hover:border-rail-strong hover:bg-panel ${className}`}
    >
      <Sun className={`absolute size-[18px] transition-all duration-500 ${isDark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0"}`} />
      <Moon className={`absolute size-[18px] transition-all duration-500 ${isDark ? "scale-100 rotate-0" : "scale-0 rotate-90 opacity-0"}`} />
    </button>
  );
}
