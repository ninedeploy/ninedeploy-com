import { docs, type Doc } from "@/content/docs";

export type { Doc };
export { docs };

const ORDER = ["Start", "Core", "Security", "Interfaces", "Extend", "Reference"];

export const docGroups = ORDER.map((name) => ({
  name,
  docs: docs.filter((d) => d.group === name).map((d) => ({ slug: d.slug, title: d.title, description: d.description })),
})).filter((g) => g.docs.length);

/** Docs in sidebar order, for prev/next links. */
export const orderedDocs = docGroups.flatMap((g) => g.docs);

export const getDoc = (slug: string) => docs.find((d) => d.slug === slug);

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const guessLang = (body: string, file?: string) => {
  const f = (file ?? "").toLowerCase();
  if (f.endsWith(".json") || /^\s*[{[]/.test(body)) return "json";
  if (f.includes("ninedeploy") || f.endsWith(".yml") || f.endsWith(".yaml") || /^version:/m.test(body)) return "yaml";
  if (f.endsWith(".ts") || /\bimport\b.*\bfrom\b/.test(body)) return "ts";
  return "bash";
};
