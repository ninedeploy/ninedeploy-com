import type { ReactNode } from "react";

export function PageHero({
  kicker,
  title,
  lede,
  children,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-rail">
      <div className="blueprint absolute inset-0 [mask-image:linear-gradient(180deg,black,transparent)]" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 right-0 h-[420px] w-[720px] opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side at 30% 50%, var(--glow-blue), transparent), radial-gradient(closest-side at 70% 50%, var(--glow-green), transparent)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-14 sm:px-6 sm:pt-20 lg:px-8">
        {kicker && <div className="rise mb-5 text-sm text-muted">{kicker}</div>}
        <h1 className="display text-[clamp(3.2rem,9vw,7.5rem)]">
          <span className="block overflow-hidden pb-[0.14em] -mb-[0.08em]">
            <span className="rise-line block">{title}</span>
          </span>
        </h1>
        {lede && (
          <p className="rise mt-6 max-w-2xl text-lg leading-relaxed text-muted" style={{ animationDelay: "150ms" }}>
            {lede}
          </p>
        )}
        {children && (
          <div className="rise mt-8" style={{ animationDelay: "250ms" }}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

/** Renders `inline code` spans inside plain prose strings. */
export function Prose({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("`") && p.endsWith("`") ? (
          <code key={i} className="rounded-md border border-rail bg-bg-2 px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
            {p.slice(1, -1)}
          </code>
        ) : (
          p
        ),
      )}
    </>
  );
}
