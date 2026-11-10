import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { PageHero, Prose } from "@/components/page-hero";
import { allReleases, releaseTotal, releases, unreleased } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Recent NineDeploy releases, features, fixes and upgrade notes — straight from CHANGELOG.md.",
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
        lede={`${releaseTotal} releases and counting. Highlights and upgrade notes from the newest ${releases.length}; read the full release notes before upgrading.`}
      >
        <a
          href={site.changelogFull}
          target="_blank"
          rel="noreferrer"
          className="font-semibold underline decoration-rail-strong underline-offset-4 hover:decoration-green"
        >
          Read the source CHANGELOG.md
        </a>
      </PageHero>

      <ol className="site-container section-compact relative [overflow-wrap:anywhere]">
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
                <span className="release-summary text-[15px] leading-relaxed">
                  {r.tagline || "Release notes and upgrade guidance."}
                  {i === 0 && (
                    <span className="ml-2 rounded-full bg-green/12 px-2 py-0.5 align-middle font-mono text-[11px] text-green">
                      latest
                    </span>
                  )}
                </span>
                <ChevronDown className="mt-1 size-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
              </summary>
              <div className="space-y-5 border-t border-rail p-5">
                <a href={`/changelog/${r.version}/`} className="text-sm font-semibold underline underline-offset-4 hover:text-green">
                  Full v{r.version} release and upgrade notes
                </a>
                {r.groups.length === 0 && <p className="text-sm text-muted">See CHANGELOG.md for details.</p>}
                <div className="release-groups">
                {r.groups.map((g, groupIndex) => (
                  <div key={`${g.title}-${groupIndex}`}>
                    <h3 className={`text-sm font-semibold ${tone[g.title] ?? "text-ink"}`}>
                      {g.title}
                      <span className="ml-2 font-mono text-xs font-normal text-muted">{g.total}</span>
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {g.items.slice(0, 5).map((item, j) => (
                        <li key={j} className="flex gap-3 text-sm leading-relaxed text-muted">
                          <span className="mt-2 size-1 shrink-0 rounded-full bg-rail-strong" />
                          <span>
                            <Prose text={item.length > 240 ? `${item.slice(0, 237)}…` : item} />
                          </span>
                        </li>
                      ))}
                      {g.total > 5 && (
                        <li className="pl-4 text-xs text-muted">and {g.total - 5} more in the full release notes</li>
                      )}
                    </ul>
                  </div>
                ))}
                </div>
              </div>
            </details>
          </li>
        ))}
      </ol>
      <section className="site-container section-compact" aria-labelledby="release-archive">
        <h2 id="release-archive" className="heading text-3xl">Complete release archive</h2>
        <p className="mt-3 max-w-2xl text-muted">Every version has its complete notes, including upgrade instructions, verification records and runtime limits.</p>
        {unreleased && <Link href="/changelog/unreleased/" className="mt-5 inline-block rounded-full border border-amber/40 px-4 py-2 font-semibold text-amber">Unreleased — work on main, not a published release</Link>}
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6">
          {allReleases.map(release => <li key={release.version}><a href={`/changelog/${release.version}/`} className="block rounded-xl border border-rail bg-panel p-4 hover:border-rail-strong"><span className="font-mono font-semibold">v{release.version}</span><span className="mt-1 block text-xs text-muted">{formatDate(release.date)}</span></a></li>)}
        </ul>
      </section>
    </div>
  );
}
