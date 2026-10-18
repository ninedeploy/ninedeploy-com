import Link from "next/link";
import { CopyCommand } from "@/components/copy-command";
import { site } from "@/lib/site";
import { CutoverStage } from "./cutover-stage";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[1100px] -translate-x-1/2 opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side at 35% 50%, var(--glow-blue), transparent), radial-gradient(closest-side at 70% 50%, var(--glow-green), transparent)",
        }}
      />
      <div className="site-container hero-shell relative">
        <Link
          href="/changelog"
          className="rise group inline-flex max-w-full items-center gap-2 rounded-full border border-rail bg-panel/70 py-1 pl-1 pr-3 text-sm text-muted transition-colors hover:text-ink"
        >
          <span className="shrink-0 rounded-full bg-green/15 px-2 py-0.5 font-mono text-xs font-semibold text-green">
            v{site.version}
          </span>
          <span className="truncate">{site.releaseHeadline}</span>
        </Link>

        <div className="hero-intro mt-7 grid grid-cols-[minmax(0,1fr)] items-center lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <h1 className="display text-[clamp(2.75rem,5vw,5.5rem)] !leading-[1.02]" aria-label="Ship like you mean it.">
            <span className="block overflow-hidden pb-[0.14em] -mb-[0.08em]">
              <span className="rise-line block" style={{ animationDelay: "60ms" }}>
                Ship like
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.14em] -mb-[0.08em]">
              <span className="rise-line block" style={{ animationDelay: "180ms" }}>
                you mean it.
              </span>
            </span>
          </h1>
          <div
            className="rise min-w-0 space-y-5"
            style={{ animationDelay: "260ms" }}
          >
            <p className="max-w-xl text-lg leading-relaxed text-muted">
              Push a branch. NineDeploy builds and deploys it on your server, with automatic TLS and healthchecked
              rollouts. Your databases, backups and certificates live alongside it.
            </p>
            <div data-field-quiet>
              <CopyCommand command={site.install} />
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <Link href="/docs/introduction" className="font-semibold underline decoration-rail-strong underline-offset-4 hover:decoration-green">
                  Read the docs
                </Link>
                <span className="text-muted">MIT licensed. No external database. No vendor.</span>
              </div>
            </div>
          </div>
        </div>

        <div data-field-ignore className="rise mt-8 sm:mt-10" style={{ animationDelay: "350ms" }}>
          <CutoverStage />
        </div>
      </div>
    </section>
  );
}
