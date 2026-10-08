import { Package } from "lucide-react";
import type { Template } from "@/lib/content";

/**
 * A template's real logo from the Simple Icons sprite, drawn in the current
 * text colour. Templates without a verified logo get the same fixed package
 * mark the dashboard's Hub uses for every app.
 */
export function TemplateIcon({ t, className = "size-5" }: { t: Pick<Template, "icon" | "name">; className?: string }) {
  if (!t.icon) return <Package className={className} strokeWidth={1.6} aria-hidden />;
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <use href={`/template-icons.svg#${t.icon}`} />
    </svg>
  );
}
