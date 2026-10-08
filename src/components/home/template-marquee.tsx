import Link from "next/link";
import { templates, type Template } from "@/lib/content";
import { site } from "@/lib/site";
import { TemplateIcon } from "@/components/templates/template-icon";

function Row({ items, reverse, duration }: { items: Template[]; reverse?: boolean; duration: string }) {
  return (
    <div
      className="marquee relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
      style={{ "--marquee-duration": duration } as React.CSSProperties}
    >
      <ul
        className="marquee-track flex shrink-0 gap-3 pr-3"
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        {[...items, ...items].map((t, i) => (
          <li key={`${t.id}-${i}`} aria-hidden={i >= items.length || undefined}>
            <Link
              href={`/templates/${t.id}`}
              tabIndex={i >= items.length ? -1 : undefined}
              className="flex items-center gap-2.5 whitespace-nowrap rounded-full border border-rail bg-panel px-4 py-2 text-sm transition-colors hover:border-green hover:text-green"
            >
              <TemplateIcon t={t} className="size-4 shrink-0 opacity-80" />
              {t.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TemplateMarquee() {
  const a = templates.filter((_, i) => i % 2 === 0).slice(0, 34);
  const b = templates.filter((_, i) => i % 2 === 1).slice(0, 34);
  return (
    <section className="border-y border-rail bg-bg-2 py-12" aria-labelledby="hub-heading">
      <div className="mx-auto mb-8 flex max-w-7xl flex-wrap items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <h2 id="hub-heading" className="heading max-w-3xl text-3xl sm:text-4xl">
          {site.stats.templates} apps you can run before your coffee cools.
        </h2>
        <Link href="/templates" className="text-sm font-semibold underline decoration-rail-strong underline-offset-4 hover:decoration-green">
          Browse the template hub
        </Link>
      </div>
      <div className="space-y-3">
        <Row items={a} duration="90s" />
        <Row items={b} duration="110s" reverse />
      </div>
    </section>
  );
}
