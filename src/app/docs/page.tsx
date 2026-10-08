import type { Metadata } from "next";
import Link from "next/link";
import { CopyCommand } from "@/components/copy-command";
import { docGroups } from "@/lib/docs";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Docs",
  description: "Install NineDeploy, understand the deploy pipeline, and drive it from the CLI, SDK or an AI agent.",
};

export default function DocsIndex() {
  return (
    <div className="page-in">
      <h1 className="display text-[clamp(3rem,8vw,6rem)]">Documentation.</h1>
      <p className="mt-5 max-w-2xl text-lg text-muted">
        Start with the installer, then read how a deploy actually runs. Everything else is reference for when you need it.
      </p>
      <CopyCommand command={site.install} className="mt-8 max-w-2xl" />

      <div className="mt-14 space-y-12">
        {docGroups.map((g) => (
          <section key={g.name} aria-labelledby={`g-${g.name}`}>
            <h2 id={`g-${g.name}`} className="heading text-2xl">
              {g.name}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {g.docs.map((d) => (
                <li key={d.slug}>
                  <Link
                    href={`/docs/${d.slug}`}
                    className="block h-full rounded-2xl border border-rail bg-panel p-5 transition-colors hover:border-rail-strong hover:bg-bg-2"
                  >
                    <span className="font-semibold">{d.title}</span>
                    <span className="mt-1 block text-sm text-muted">{d.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
