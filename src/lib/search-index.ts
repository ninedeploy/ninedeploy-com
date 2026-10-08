import templatesData from "@/content/templates.json";
import { docs, slugify } from "@/lib/docs";
import { nav } from "@/lib/site";

export type SearchKind = "Page" | "Docs" | "Template";

export interface SearchItem {
  kind: SearchKind;
  title: string;
  hint: string;
  href: string;
  /** Extra words that should match but aren't shown. */
  keywords?: string;
  /** Template logo slug; null means the fixed package mark. */
  icon?: string | null;
}

/** Built on the server and handed to the palette; small enough to search in memory. */
export function buildSearchIndex(): SearchItem[] {
  const pages: SearchItem[] = [
    { kind: "Page", title: "Home", hint: "Ship like you mean it", href: "/" },
    ...nav.map((n) => ({ kind: "Page" as const, title: n.label, hint: `ninedeploy.com${n.href}`, href: n.href })),
  ];
  const docItems: SearchItem[] = docs.flatMap((d) => [
    { kind: "Docs" as const, title: d.title, hint: d.description, href: `/docs/${d.slug}`, keywords: d.group },
    ...d.blocks
      .filter((b) => b.kind === "h2")
      .map((b) => {
        const text = (b as { text: string }).text;
        return { kind: "Docs" as const, title: text, hint: d.title, href: `/docs/${d.slug}#${slugify(text)}` };
      }),
  ]);
  const templateItems: SearchItem[] = templatesData.templates.map((t) => ({
    kind: "Template",
    title: t.name,
    hint: t.tagline,
    href: `/templates/${t.id}`,
    keywords: `${t.category} ${t.image}`,
    icon: t.icon,
  }));
  return [...pages, ...docItems, ...templateItems];
}
