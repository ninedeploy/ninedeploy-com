import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { PageHero, Prose } from "@/components/page-hero";
import { releaseTotal, releases } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Every NineDeploy release, newest first — straight from CHANGELOG.md.",
};

const tone: Record<string, string> = {
  Added: "text-green",
  Fixed: "text-blue",
  Security: "text-pink",
  Changed: "text-amber",
  Removed: "text-pink",
};

const formatDate = (d: string) =>
  d ? new Date(`${d}T12:00:00Z`).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }) : "";

export default function ChangelogPage() {
  return (
    <div className="page-in">
      <PageHero
        title="Changelog."
        lede={`${releaseTotal} releases and counting. This page shows the newest ${releases.length}; the full history lives in CHANGELOG.md, which the release process treats as a load-bearing document.`}
      >
        <a
          href={site.changelogFull}
          target="_blank"
          rel="noreferrer"
          className="font-semibold underline decoration-rail-strong underline-offset-4 hover:decoration-green"
        >
          Read the full CHANGELOG.md
        </a>
      </PageHero>

      <ol className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        {releases.map((r, i) => (
          <li key={r.version} className="relative grid gap-4 pb-10 pl-10 md:grid-cols-[160px_1fr] md:gap-10 md:pl-0">
            <span
              aria-hidden
              className={`absolute bottom-0 left-[7px] top-2 w-px md:left-[180px] ${i === 0 ? "bg-gradient-to-b from-green to-rail" : "bg-rail"}`}
            />
            <div className="md:pt-5 md:text-right">
              <p className="heading text-2xl">v{r.version}</p>
              <p className="mt-1 font-mono text-xs text-muted">{formatDate(r.date)}</p>
            </div>
            <span
              aria-hidden
              className={`absolute left-0 top-2 size-[15px] rounded-full border-[3px] border-bg md:left-[173px] md:top-6 ${
                i === 0 ? "bg-green shadow-[0_0_0_4px_var(--glow-green)]" : "bg-rail-strong"
              }`}
            />
            <details open={i < 3} className="group rounded-3xl border border-rail bg-panel">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
                <span className="text-[15px] leading-relaxed">
                  {r.tagline || "Maintenance release."}
                  {i === 0 && (
                    <span className="ml-2 rounded-full bg-green/12 px-2 py-0.5 align-middle font-mono text-[11px] text-green">
                      latest
                    </span>
                  )}
                </span>
                <ChevronDown className="mt-1 size-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
              </summary>
              <div className="space-y-5 border-t border-rail p-5">
                {r.groups.length === 0 && <p className="text-sm text-muted">See CHANGELOG.md for details.</p>}
                {r.groups.map((g) => (
                  <div key={g.title}>
                    <h3 className={`text-sm font-semibold ${tone[g.title] ?? "text-ink"}`}>
                      {g.title}
                      <span className="ml-2 font-mono text-xs font-normal text-muted">{g.total}</span>
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {g.items.map((item, j) => (
                        <li key={j} className="flex gap-3 text-sm leading-relaxed text-muted">
                          <span className="mt-2 size-1 shrink-0 rounded-full bg-rail-strong" />
                          <span>
                            <Prose text={item} />
                          </span>
                        </li>
                      ))}
                      {g.total > g.items.length && (
                        <li className="pl-4 text-xs text-muted">and {g.total - g.items.length} more</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}
