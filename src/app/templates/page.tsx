import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { FeaturedSlider } from "@/components/templates/featured-slider";
import { TemplateBrowser } from "@/components/templates/template-browser";
import { featuredTemplates, templateCategories, templates } from "@/lib/content";

export const metadata: Metadata = {
  title: "Template hub",
  description: `${templates.length} one-click templates for NineDeploy — n8n, Directus, PocketBase, Ollama, Grafana and more.`,
};

export default function TemplatesPage() {
  const certified = templates.filter((t) => t.verified).length;
  return (
    <div className="page-in">
      <PageHero
        title="The template hub."
        lede={`${templates.length} apps that install in one click, ${certified} of them certified by actually booting them. Each one becomes an ordinary service: its own domain, env, backups and rollbacks.`}
      />
      <div className="py-14">
        <FeaturedSlider items={featuredTemplates.slice(0, 16)} />
      </div>
      <div className="pb-10">
        <TemplateBrowser items={templates} categories={templateCategories} />
      </div>
    </div>
  );
}
