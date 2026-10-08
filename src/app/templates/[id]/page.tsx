import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BadgeCheck, KeyRound, Layers } from "lucide-react";
import { TemplateCard } from "@/components/templates/template-card";
import { TemplateIcon } from "@/components/templates/template-icon";
import { getTemplate, templates } from "@/lib/content";

// Only the templates in the registry exist; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return templates.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: PageProps<"/templates/[id]">): Promise<Metadata> {
  const { id } = await params;
  const t = getTemplate(id);
  if (!t) return { title: "Template not found" };
  return { title: `${t.name} template`, description: `${t.tagline} Deploy ${t.name} on your own server with NineDeploy.` };
}

export default async function TemplatePage({ params }: PageProps<"/templates/[id]">) {
  const { id } = await params;
  const t = getTemplate(id);
  if (!t) notFound();

  const related = templates.filter((x) => x.category === t.category && x.id !== t.id).slice(0, 4);
  const spec: [string, string][] = [
    ["Image", t.image],
    ["Container port", String(t.port)],
    ["Category", t.category],
    ["Runtime", t.compose ? "Compose stack" : "Docker container"],
    ["Persistence", t.volume ? `Volume at ${t.volume}` : "Ephemeral"],
  ];
  // Mirrors the panel: Hub → template detail → Deploy wizard (Source, Runtime, Environment, Resources, Review).
  const steps = [
    `Open the Hub in your panel and pick ${t.name}. Its detail view shows the image, port, volume and environment it ships with.`,
    "Click Deploy. The wizard arrives with Source and Runtime filled in; review the environment and set CPU and memory limits if you want them.",
    "Review and deploy. Traefik routes it on an automatic URL under your wildcard domain, and it becomes an ordinary service with its own logs, backups and rollbacks.",
  ];

  return (
    <div className="page-in">
      <section className="relative overflow-hidden border-b border-rail">
        <div className="blueprint absolute inset-0 [mask-image:linear-gradient(180deg,black,transparent)]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 lg:px-8">
          <Link href="/templates" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
            <ArrowLeft className="size-4" /> All templates
          </Link>
          <div className="mt-10 grid grid-cols-[minmax(0,1fr)] items-end gap-10 lg:grid-cols-[1fr_380px]">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
              <span className="rise grid size-28 shrink-0 place-items-center rounded-[32px] border border-rail bg-panel text-ink">
                <TemplateIcon t={t} className="size-14" />
              </span>
              <div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {t.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green/12 px-2.5 py-1 font-medium text-green">
                      <BadgeCheck className="size-3.5" /> Runtime-certified
                    </span>
                  )}
                  {t.compose && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-rail px-2.5 py-1 text-muted">
                      <Layers className="size-3.5" /> Compose stack
                    </span>
                  )}
                </div>
                <h1 className="display mt-3 text-[clamp(2.6rem,6.5vw,5.25rem)]">{t.name}</h1>
                <p className="mt-3 max-w-xl text-lg text-muted">{t.tagline}</p>
              </div>
            </div>
            <dl className="rounded-3xl border border-rail bg-panel p-5 font-mono text-[13px]">
              {spec.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-rail py-2.5 last:border-0">
                  <dt className="text-muted">{k}</dt>
                  <dd className="truncate text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-14 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
        <div>
          <h2 className="heading text-3xl">About {t.name}</h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{t.description}</p>
          {t.website && (
            <a
              href={t.website}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 font-semibold underline decoration-rail-strong underline-offset-4 hover:decoration-green"
            >
              {t.name.replace(/\s*\(.*\)$/, "")} website <ArrowUpRight className="size-4" />
            </a>
          )}
          {t.env.length > 0 && (
            <div className="mt-10">
              <h3 className="font-semibold">Environment it expects</h3>
              <p className="mt-1 text-sm text-muted">
                Defaults are filled in by the wizard. Secret values are generated and stored encrypted in your vault.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {t.env.map((e) => (
                  <li
                    key={e.key}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rail bg-panel px-2.5 py-1 font-mono text-xs"
                  >
                    {e.secret && <KeyRound className="size-3 text-amber" aria-label="Secret" />}
                    {e.key}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div>
          <h2 className="heading text-2xl">Deploying it</h2>
          <ol className="mt-5 space-y-4">
            {steps.map((s, i) => (
              <li key={s} className="flex gap-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-rail font-mono text-xs">
                  {i + 1}
                </span>
                <span className="pt-1 text-muted">{s}</span>
              </li>
            ))}
          </ol>
          <Link href="/docs/installation" className="mt-8 inline-block rounded-full bg-green px-6 py-3 font-semibold text-bg">
            Install NineDeploy first
          </Link>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8" aria-labelledby="related-h">
          <h2 id="related-h" className="heading text-3xl">
            More in {t.category}
          </h2>
          <ul className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <li key={r.id}>
                <TemplateCard t={r} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
