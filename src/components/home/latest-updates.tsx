import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";

const updates = [
  { title: `${site.stats.templates} one-click templates`, text: "Immich, Paperless, Authentik, Karakeep, Docmost and many more. Browse the expanded catalog and its runtime certification marks.", href: "/templates", link: "Explore the catalog" },
  { title: "Build and run across nodes", text: "Nixpacks and Railpack on nodes, dedicated build servers, sealed image transfer, node databases and opt-in Docker Swarm.", href: "/docs/multi-server", link: "Explore multi-server deploys" },
  { title: `${site.stats.dbEngines} managed database engines`, text: "KeyDB and Dragonfly join the lineup, with Redis-compatible backups, imports and drills. Teams and Resend extend notification delivery.", href: "/docs/databases", link: "Explore managed data" },
];

export function LatestUpdates() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="updates-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-green">New in the 0.15 series</p>
          <h2 id="updates-heading" className="heading mt-3 text-4xl sm:text-5xl">More apps. More ways to deploy.</h2>
        </div>
        <Link href="/changelog" className="inline-flex items-center gap-2 font-semibold underline underline-offset-4">
          Release notes <ArrowUpRight className="size-4" />
        </Link>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {updates.map((update) => (
          <article key={update.href} className="flex flex-col rounded-3xl border border-rail bg-panel p-6">
            <h3 className="heading text-2xl">{update.title}</h3>
            <p className="mt-3 flex-1 leading-relaxed text-muted">{update.text}</p>
            <Link href={update.href} className="mt-6 inline-flex items-center gap-2 font-semibold text-green">
              {update.link} <ArrowUpRight className="size-4" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
