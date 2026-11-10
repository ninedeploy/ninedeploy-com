import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SourceDocument } from "@/components/source-document";
import { docs, getDoc, orderedDocs } from "@/lib/docs";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return docs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/docs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  return doc ? { title: doc.title, description: doc.description, alternates: { canonical: `/docs/${doc.aliasOf ?? doc.slug}/` } } : { title: "Not found" };
}

export default async function DocPage({ params }: PageProps<"/docs/[slug]">) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();

  const index = orderedDocs.findIndex((d) => d.slug === (doc.aliasOf ?? slug));
  const prev = orderedDocs[index - 1];
  const next = orderedDocs[index + 1];
  const toc = doc.document.headings.filter(heading => heading.depth === 2);

  return (
    <div className="page-in docs-detail">
      <article className="min-w-0 reading-flow [overflow-wrap:anywhere]">
        <p className="text-sm text-green">{doc.group}</p>
        <h1 className="display mt-2 text-[clamp(2.25rem,5vw,4rem)]">{doc.title}</h1>
        <p className="mt-4 text-xl text-muted">{doc.description}</p>

        <p className="mt-4 text-sm text-muted">Product v{site.version} · Complete source guide</p>
        {doc.record && <aside className="mt-6 rounded-xl border border-amber/40 bg-amber/10 p-4 text-sm">Project record: this dated document may describe work in progress. Check the runtime support matrix before enabling a feature.</aside>}
        <div className="doc-blocks mt-10">
          <SourceDocument tokens={doc.document.tokens} source={doc.source} />
        </div>

        <nav aria-label="Pagination" className="mt-16 grid grid-cols-[minmax(0,1fr)] gap-3 border-t border-rail pt-8 sm:grid-cols-2">
          {prev ? (
            <Link href={`/docs/${prev.slug}`} className="group rounded-2xl border border-rail p-5 hover:border-rail-strong">
              <span className="flex items-center gap-1.5 text-sm text-muted">
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" /> Previous
              </span>
              <span className="mt-1 block font-semibold">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/docs/${next.slug}`} className="group rounded-2xl border border-rail p-5 text-right hover:border-rail-strong">
              <span className="flex items-center justify-end gap-1.5 text-sm text-muted">
                Next <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
              <span className="mt-1 block font-semibold">{next.title}</span>
            </Link>
          )}
        </nav>
        <p className="mt-8 text-sm text-muted">
          Source guide (installer links and live inventory counts are normalized for this site):{" "}
          <a href={doc.source ? `${site.github}/blob/${site.sourceCommit}/${doc.source}` : `${site.github}/tree/${site.sourceCommit}/docs`} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-ink">
            {doc.source ?? "docs folder"}
          </a>
          .
        </p>
      </article>

      {toc.length > 0 && (
        <aside className="hidden xl:sticky xl:top-24 xl:block xl:self-start">
          <p className="text-sm font-semibold">On this page</p>
          <ul className="mt-3 space-y-2 border-l border-rail">
            {toc.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className="-ml-px block border-l border-transparent pl-3 text-sm text-muted hover:border-green hover:text-ink">
                  {t.text}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
