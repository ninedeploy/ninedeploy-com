import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { SourceDocument } from "@/components/source-document";
import { allReleases, unreleased } from "@/lib/content";
import { prepareDocument } from "@/lib/source-markdown";
import { site } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() {
  return [...allReleases.map(release => ({ version: release.version })), ...(unreleased ? [{ version: "unreleased" }] : [])];
}
export async function generateMetadata({ params }: PageProps<"/changelog/[version]">): Promise<Metadata> {
  const { version } = await params;
  return { title: version === "unreleased" ? "Unreleased changes" : `v${version} release notes` };
}
export default async function ReleasePage({ params }: PageProps<"/changelog/[version]">) {
  const { version } = await params;
  const release = allReleases.find(entry => entry.version === version);
  const pending = version === "unreleased" && !!unreleased;
  if (!release && !pending) notFound();
  const document = prepareDocument(pending ? unreleased : release!.markdown);
  return <div className="page-in">
    <PageHero title={pending ? "Unreleased." : `v${release!.version}.`} lede={pending ? "Changes on main awaiting a release. Availability may depend on an updated agent and explicit runtime acceptance." : `Complete release notes${release!.date ? ` · ${release!.date}` : ""}. Read upgrade instructions and runtime limits before deploying.`}>
      <Link href="/changelog" className="font-semibold underline underline-offset-4">All releases</Link>
    </PageHero>
    <article className="site-container section-compact reading-flow">
      {pending && <p className="mb-8 rounded-xl border border-amber/40 bg-amber/10 p-4 text-amber">This is not a published release. The installer uses the latest published tag by default; --channel main explicitly selects edge code.</p>}
      <div className="max-w-[90ch]"><SourceDocument tokens={document.tokens} source="CHANGELOG.md" /></div>
      <p className="mt-10 text-sm text-muted"><a href={site.changelogFull} className="underline underline-offset-4">Source CHANGELOG.md at {site.sourceCommit.slice(0, 8)}</a></p>
    </article>
  </div>;
}
