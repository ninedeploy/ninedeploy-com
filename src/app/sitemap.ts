import type { MetadataRoute } from "next";
import { allReleases, templates, unreleased } from "@/lib/content";
import { docs } from "@/lib/docs";
import { site } from "@/lib/site";

// Rendered once at build time for the static export.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // Trailing slashes match the exported URLs (trailingSlash: true), so crawlers skip a redirect.
  const pages = ["", "/features", "/templates", "/docs", "/changelog", "/faq"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}/`, changeFrequency: "weekly" as const, priority: p ? 0.8 : 1 })),
    ...docs.filter(d => !d.aliasOf).map((d) => ({ url: `${site.url}/docs/${d.slug}/`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...allReleases.map(release => ({ url: `${site.url}/changelog/${release.version}/`, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...(unreleased ? [{ url: `${site.url}/changelog/unreleased/`, changeFrequency: "daily" as const, priority: 0.4 }] : []),
    ...templates.map((t) => ({ url: `${site.url}/templates/${t.id}/`, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
