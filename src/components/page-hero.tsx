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
        <h1 className="display text-[clamp(2.75rem,7.5vw,6.25rem)]">
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

const codeClass = "rounded-md border border-rail bg-bg-2 px-1.5 py-0.5 font-mono text-[0.85em] text-ink";

/**
 * Renders `inline code` spans inside plain prose strings. Environment
 * variables (NINEDEPLOY_AGENT=1, DOCKER_GID…) are set as code too, since the
 * imported docs mostly leave them bare.
 */
export function Prose({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+(?:=[\w:,.-]+)?\b)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("`") && p.endsWith("`") ? (
          <code key={i} className={codeClass}>
            {p.slice(1, -1)}
          </code>
        ) : i % 2 === 1 ? (
          <code key={i} className={codeClass}>
            {p}
          </code>
        ) : (
          p
        ),
      )}
    </>
  );
}

/** Lets a long shell command wrap after slashes and before pipes instead of mid-word. */
export function BreakableCommand({ command }: { command: string }) {
  const parts = command.split(/(?<=\/)|(?= \| )/);
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && <wbr />}
        </span>
      ))}
    </>
  );
}
