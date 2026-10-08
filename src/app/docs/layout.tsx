import { DocsNav, MobileDocsNav } from "@/components/docs-nav";
import { docGroups } from "@/lib/docs";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-10 px-4 pb-10 pt-0 sm:px-6 lg:pt-14 lg:grid-cols-[240px_1fr] lg:px-8 lg:py-14">
      <aside className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto lg:pb-10 [scrollbar-width:thin]">
        <DocsNav groups={docGroups} />
      </aside>
      <div className="min-w-0">
        <MobileDocsNav groups={docGroups} />
        <div className="pt-6 lg:pt-0">{children}</div>
      </div>
    </div>
  );
}
