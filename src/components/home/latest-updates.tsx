import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";

const updates = [
  { title: "HTTPS from the first boot", text: "Set your panel domain and ACME email in the installer. A one-time setup token protects the first admin, and the stable channel lets you choose a slower release cadence.", href: "/docs/installation", link: "Install on your own domain" },
  { title: "Backups proven to restore", text: `Restore verification covers all ${site.stats.dbEngines} managed engines in isolated copies. PostgreSQL adds point-in-time recovery into a new database. Structural drills remain a separate check.`, href: "/docs/restore-verification", link: "Explore recovery" },
  { title: "Know what works where", text: `${site.stats.templates} templates, protected production lanes, CI runners and remote MCP. The runtime support matrix states exactly where canaries, autoscaling and scale to zero apply.`, href: "/docs/support-matrix", link: "Check runtime support" },
];

export function LatestUpdates() {
  return (
    <section className="site-container section-compact" aria-labelledby="updates-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-green">Current release · v{site.version}</p>
          <h2 id="updates-heading" className="heading mt-3 text-4xl sm:text-5xl">More control. Clearer limits.</h2>
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
