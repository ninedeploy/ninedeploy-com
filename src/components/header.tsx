"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/site";
import { Wordmark } from "./brand";
import { SearchButton } from "./command-palette";
import { ThemeToggle } from "./theme";
import { GitHubIcon } from "./icons";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The sheet closes itself on navigation, on Escape, and when the viewport
  // grows past md (where it's hidden), so the scroll lock never outlives it.
  const [openedAt, setOpenedAt] = useState(pathname);
  if (open && pathname !== openedAt) {
    setOpen(false);
    setOpenedAt(pathname);
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const wide = window.matchMedia("(min-width: 768px)");
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onWide = (e: MediaQueryListEvent) => e.matches && close();
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled || open ? "border-b border-rail bg-bg/80 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-md focus:bg-panel focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-6 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="hidden flex-1 justify-center md:flex">
          <ul className="flex items-center gap-1 rounded-full border border-rail bg-panel/60 p-1">
            {nav.map((item) => (
              <li key={item.href} className="relative">
                {isActive(item.href) && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Link
                  href={item.href}
                  className={`relative block rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    isActive(item.href) ? "text-bg" : "text-muted hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <SearchButton />
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            aria-label="NineDeploy on GitHub"
            className="hidden size-10 place-items-center rounded-full border border-rail text-ink transition-colors hover:border-rail-strong hover:bg-panel sm:grid"
          >
            <GitHubIcon className="size-[18px]" />
          </a>
          <ThemeToggle />
          <Link
            href="/docs/installation"
            className="hidden rounded-full bg-green px-4 py-2 text-sm font-semibold text-bg transition-transform hover:-translate-y-0.5 sm:inline-block"
          >
            Install
          </Link>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-rail md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => {
              setOpenedAt(pathname);
              setOpen((v) => !v);
            }}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "calc(100dvh - 4rem)" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0.9, 0.1, 1] }}
            className="overflow-y-auto overscroll-contain md:hidden"
          >
            <ul className="flex flex-col gap-1 px-4 pt-6 [@media(max-height:500px)]:pt-2">
              {[{ href: "/", label: "Home" }, ...nav].map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i + 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`display block py-2 text-[2.6rem] ${
                      item.href === "/" ? (pathname === "/" ? "text-green" : "") : isActive(item.href) ? "text-green" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3 px-4 pb-8">
              <Link
                href="/docs/installation"
                onClick={() => setOpen(false)}
                className="rounded-full bg-green px-5 py-3 font-semibold text-bg"
              >
                Install NineDeploy
              </Link>
              <a href={site.github} target="_blank" rel="noreferrer" className="rounded-full border border-rail px-5 py-3 font-semibold">
                GitHub
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
