"use client";

import Link from "next/link";
import { useInView } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { oxog, site } from "@/lib/site";
import { NineMark, OxogMark, OxogWordmark } from "./brand";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/templates", label: "Template hub" },
      { href: "/changelog", label: "Changelog" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Docs",
    links: [
      { href: "/docs/installation", label: "Installation" },
      { href: "/docs/deploy-pipeline", label: "Deploy pipeline" },
      { href: "/docs/ninedeploy-manifest", label: "The .ninedeploy manifest" },
      { href: "/docs/mcp", label: "MCP server" },
    ],
  },
  {
    title: "Source",
    links: [
      { href: site.github, label: "GitHub" },
      { href: `${site.github}/releases`, label: "Releases" },
      { href: `${site.github}/blob/main/ARCHITECTURE.md`, label: "Architecture" },
      { href: `${site.github}/blob/main/LICENSE`, label: "MIT license" },
    ],
  },
];

export function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });

  return (
    <footer className="relative mt-24 border-t border-rail bg-bg-2">
      <div className="lane-rule absolute inset-x-0 top-0 h-[2px] opacity-70" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3">
              <NineMark className="size-11" />
              <span className="heading text-2xl">NineDeploy</span>
            </Link>
            <p className="mt-4 text-muted">
              A self-hosted PaaS for servers you actually own. One Node process, one SQLite file, and the Docker socket.
            </p>
            <p className="mt-4 font-mono text-xs text-muted">
              v{site.version} · MIT · {site.stats.templates} templates
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-semibold text-ink">{col.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => {
                    const external = l.href.startsWith("http");
                    return (
                      <li key={l.href}>
                        {external ? (
                          <a href={l.href} target="_blank" rel="noreferrer" className="text-sm text-muted hover:text-ink">
                            {l.label}
                          </a>
                        ) : (
                          <Link href={l.href} className="text-sm text-muted hover:text-ink">
                            {l.label}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* The studio behind it */}
        <div
          ref={ref}
          className="relative mt-16 overflow-hidden rounded-[28px] border border-rail bg-panel p-6 sm:p-10"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full opacity-25 blur-3xl"
            style={{ background: "radial-gradient(circle, #ed0878, transparent 65%)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 right-40 size-80 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, #692d91, transparent 65%)" }}
          />
          <div className="relative grid items-center gap-8 md:grid-cols-[auto_1fr_auto]">
            <a href={oxog.url} target="_blank" rel="noreferrer" aria-label="OXOGNET" className="block w-32 sm:w-40">
              {seen ? <OxogMark draw className="w-full" /> : <OxogMark className="w-full opacity-0" />}
            </a>
            <div className="max-w-xl">
              <p className="text-sm text-muted">
                NineDeploy is built and maintained by
              </p>
              <a href={oxog.url} target="_blank" rel="noreferrer" className="group mt-1 inline-flex items-baseline gap-2">
                <OxogWordmark className="text-3xl sm:text-4xl" />
                <ArrowUpRight className="size-5 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <p className="mt-3 text-muted">
                A small studio in Estonia building AI agents, developer tools and the infrastructure behind them. We
                run NineDeploy on our own servers first.
              </p>
            </div>
            <ul className="grid grid-cols-2 gap-2 md:grid-cols-1">
              {oxog.siblings.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex flex-col rounded-xl border border-rail px-3 py-2 transition-colors hover:border-[#ed0878]/60"
                  >
                    <span className="text-sm font-semibold">{s.name}</span>
                    <span className="text-xs text-muted">{s.what}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 {oxog.name}. NineDeploy is open source under the MIT license.
          </p>
          <p>Made in Estonia, shipped worldwide.</p>
        </div>
      </div>
    </footer>
  );
}
