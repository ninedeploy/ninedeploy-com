import { DocsNav, MobileDocsNav } from "@/components/docs-nav";
import { docGroups } from "@/lib/docs";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-container sidebar-layout docs-shell">
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
