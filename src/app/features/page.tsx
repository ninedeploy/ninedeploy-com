import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { ScrollSpy } from "@/components/scroll-spy";
import { rooms } from "@/lib/features";

export const metadata: Metadata = {
  title: "Features",
  description: "Everything NineDeploy does, grouped the way the dashboard groups it: deploy, data, network and system.",
};

export default function FeaturesPage() {
  const total = rooms.reduce((n, r) => n + r.items.length, 0);
  return (
    <div className="page-in">
      <PageHero
        title="Everything, inventoried."
        lede="No paid tiers gating features: if it's on this page, it's in the box. Grouped the way the dashboard's icon rail groups them."
      >
        <p className="font-mono text-sm text-muted">{total} capabilities across four areas</p>
      </PageHero>

      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ScrollSpy items={rooms.map((r) => ({ id: r.id, label: r.name, count: r.items.length }))} />
        </aside>

        <div className="space-y-24">
          {rooms.map((room) => {
            const Icon = room.icon;
            return (
              <section key={room.id} id={room.id} aria-labelledby={`${room.id}-h`} className="scroll-mt-24">
                <div className="flex items-center gap-4">
                  <span className="grid size-12 place-items-center rounded-2xl border border-rail bg-panel">
                    <Icon className="size-5 text-green" />
                  </span>
                  <h2 id={`${room.id}-h`} className="heading text-4xl sm:text-5xl">
                    {room.name}
                  </h2>
                </div>
                <p className="mt-4 max-w-2xl text-lg text-muted">{room.summary}</p>
                <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-px overflow-hidden rounded-3xl border border-rail bg-rail sm:grid-cols-2 xl:grid-cols-3">
                  {room.items.map((f) => (
                    <article key={f.title} className="group bg-panel p-6 transition-colors hover:bg-bg-2">
                      <h3 className="font-semibold">{f.title}</h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-muted">{f.text}</p>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}

          <div className="flex flex-col items-start gap-4 rounded-3xl border border-rail bg-panel p-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="heading text-3xl">Convinced? It installs in one command.</p>
            <Link href="/docs/installation" className="rounded-full bg-green px-6 py-3 font-semibold text-bg">
              Install NineDeploy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
