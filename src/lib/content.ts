import changelogData from "@/content/changelog.json";
import templatesData from "@/content/templates.json";

export interface Template {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  /** Simple Icons slug in /template-icons.svg, or null for the fixed package mark. */
  icon: string | null;
  image: string;
  port: number;
  website: string | null;
  featured: boolean;
  verified: boolean;
  compose: boolean;
  volume: string | null;
  env: { key: string; secret: boolean }[];
}

/** The fields a template card renders; what the client-side hub receives. */
export type TemplateSummary = Pick<Template, "id" | "name" | "tagline" | "category" | "icon" | "image" | "verified" | "compose" | "featured">;

export const toSummary = ({ id, name, tagline, category, icon, image, verified, compose, featured }: Template): TemplateSummary => ({
  id,
  name,
  tagline,
  category,
  icon,
  image,
  verified,
  compose,
  featured,
});

export interface Release {
  version: string;
  date: string;
  tagline: string;
  groups: { title: string; total: number; items: string[] }[];
}

/** Featured first, then alphabetical — the order the panel's hub uses. */
export const templates: Template[] = [...(templatesData.templates as Template[])].sort((a, b) => {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  return a.name.localeCompare(b.name);
});

export const featuredTemplates = templates.filter((t) => t.featured);

export const templateCategories = Object.entries(
  templates.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + 1;
    return acc;
  }, {}),
)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

export const getTemplate = (id: string) => templates.find((t) => t.id === id);

export const releases = changelogData.releases as Release[];
export const releaseTotal = changelogData.total;
