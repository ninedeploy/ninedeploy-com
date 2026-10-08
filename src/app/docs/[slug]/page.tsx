import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, Info } from "lucide-react";
import { CodeBlock } from "@/components/code";
import { Prose } from "@/components/page-hero";
import { docs, getDoc, guessLang, orderedDocs, slugify } from "@/lib/docs";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return docs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/docs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  return doc ? { title: doc.title, description: doc.description } : { title: "Not found" };
}

export default async function DocPage({ params }: PageProps<"/docs/[slug]">) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();

  const index = orderedDocs.findIndex((d) => d.slug === slug);
  const prev = orderedDocs[index - 1];
  const next = orderedDocs[index + 1];
  const toc = doc.blocks.filter((b) => b.kind === "h2").map((b) => (b as { text: string }).text);

  return (
    <div className="page-in grid grid-cols-[minmax(0,1fr)] gap-12 xl:grid-cols-[1fr_200px]">
      <article className="min-w-0 max-w-3xl [overflow-wrap:anywhere]">
        <p className="text-sm text-green">{doc.group}</p>
        <h1 className="display mt-2 text-[clamp(2.25rem,5vw,4rem)]">{doc.title}</h1>
        <p className="mt-4 text-xl text-muted">{doc.description}</p>

        <div className="mt-10 space-y-6">
          {doc.blocks.map((b, i) => {
            switch (b.kind) {
              case "p":
                return (
                  <p key={i} className="text-[17px] leading-[1.75] text-ink/85">
                    <Prose text={b.text} />
                  </p>
                );
              case "h2":
                return (
                  <h2 key={i} id={slugify(b.text)} className="heading scroll-mt-24 pt-6 text-3xl">
                    {b.text}
                  </h2>
                );
              case "h3":
                return (
                  <h3 key={i} className="pt-2 text-xl font-semibold">
                    {b.text}
                  </h3>
                );
              case "code":
                return <CodeBlock key={i} code={b.body} file={b.file} lang={guessLang(b.body, b.file)} />;
              case "list":
                return (
                  <ul key={i} className="space-y-3">
                    {b.items.map((item, j) => (
                      <li key={j} className="flex gap-3 text-[17px] leading-[1.7] text-ink/85">
                        <span className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-green" />
                        <span>
                          <Prose text={item} />
                        </span>
                      </li>
                    ))}
                  </ul>
                );
              case "callout": {
                const warn = b.tone === "warn";
                const Icon = warn ? AlertTriangle : Info;
                return (
                  <aside
                    key={i}
                    className={`flex gap-4 rounded-2xl border p-5 ${warn ? "border-amber/40 bg-amber/[0.07]" : "border-blue/30 bg-blue/[0.06]"}`}
                  >
                    <Icon className={`mt-0.5 size-5 shrink-0 ${warn ? "text-amber" : "text-blue"}`} />
                    <div>
                      <p className="font-semibold">{b.title}</p>
                      <p className="mt-1 leading-relaxed text-muted">
                        <Prose text={b.text} />
                      </p>
                    </div>
                  </aside>
                );
              }
            }
          })}
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
          The canonical guides live in the repository&apos;s{" "}
          <a href={`${site.github}/tree/main/docs`} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-ink">
            docs folder
          </a>
          .
        </p>
      </article>

      {toc.length > 0 && (
        <aside className="hidden xl:sticky xl:top-24 xl:block xl:self-start">
          <p className="text-sm font-semibold">On this page</p>
          <ul className="mt-3 space-y-2 border-l border-rail">
            {toc.map((t) => (
              <li key={t}>
                <a href={`#${slugify(t)}`} className="-ml-px block border-l border-transparent pl-3 text-sm text-muted hover:border-green hover:text-ink">
                  {t}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
