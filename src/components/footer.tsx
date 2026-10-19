"use client";

import Link from "next/link";
import { oxog, site } from "@/lib/site";
import { Wordmark } from "./brand";
import { OxogStudio } from "./oxog-studio";

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

  return (
    <footer className="footer-space relative border-t border-rail bg-bg-2">
      <div className="lane-rule absolute inset-x-0 top-0 h-[2px] opacity-70" aria-hidden />
      <div className="site-container footer-content">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex">
              <Wordmark size="lg" />
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

        <OxogStudio />

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
