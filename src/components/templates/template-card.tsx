import Link from "next/link";
import { BadgeCheck, Layers } from "lucide-react";
import type { TemplateSummary } from "@/lib/content";
import { TemplateIcon } from "./template-icon";

export function TemplateCard({ t }: { t: TemplateSummary }) {
  return (
    <Link
      href={`/templates/${t.id}`}
      className="group flex h-full flex-col rounded-3xl border border-rail bg-panel p-5 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-rail-strong"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-12 place-items-center rounded-2xl border border-rail bg-bg-2 text-ink transition-colors duration-300 group-hover:border-green/40 group-hover:text-green">
          <TemplateIcon t={t} className="size-6" />
        </span>
        <div className="flex gap-1.5">
          {t.compose && (
            <span title="Compose stack" className="grid size-7 place-items-center rounded-full border border-rail text-muted">
              <Layers className="size-3.5" />
              <span className="sr-only">Compose stack</span>
            </span>
          )}
          {t.verified && (
            <span title="Runtime-certified" className="grid size-7 place-items-center rounded-full bg-green/12 text-green">
              <BadgeCheck className="size-4" />
              <span className="sr-only">Runtime-certified</span>
            </span>
          )}
        </div>
      </div>
      <h3 className="mt-4 font-semibold">{t.name}</h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">{t.tagline}</p>
      <p className="mt-4 text-xs text-muted">{t.category}</p>
    </Link>
  );
}
