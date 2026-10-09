import Link from "next/link";
import { CopyCommand } from "@/components/copy-command";
import { site } from "@/lib/site";
import { CutoverStage } from "./cutover-stage";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[1100px] -translate-x-1/2 opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side at 35% 50%, var(--glow-blue), transparent), radial-gradient(closest-side at 70% 50%, var(--glow-green), transparent)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:px-8">
        <Link
          href="/changelog"
          className="rise group inline-flex items-center gap-2 rounded-full border border-rail bg-panel/70 py-1 pl-1 pr-3 text-sm text-muted transition-colors hover:text-ink"
        >
          <span className="rounded-full bg-green/15 px-2 py-0.5 font-mono text-xs font-semibold text-green">
            v{site.version}
          </span>
          {site.releaseHeadline}
        </Link>

        <div className="mt-8">
          <h1 className="display text-[clamp(3.25rem,11.5vw,10rem)]" aria-label="Ship like you mean it.">
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
            className="rise mt-10 grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16"
            style={{ animationDelay: "420ms" }}
          >
            <p className="max-w-xl text-lg leading-relaxed text-muted">
              Push a branch, get a healthy container behind TLS. NineDeploy builds it on a server you own, keeps the old
              version serving until the new one passes its healthcheck, and runs the databases, certificates and backups
              around it.
            </p>
            <div>
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

        <div className="rise mt-14" style={{ animationDelay: "450ms" }}>
          <CutoverStage />
        </div>
      </div>
    </section>
  );
}
