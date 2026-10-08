// Regenerates src/content/{templates,changelog}.json from a local clone of
// github.com/ninedeploy/ninedeploy. Usage: node scripts/sync-content.mjs <path-to-clone>
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as simpleIcons from "simple-icons";

const repo = process.argv[2];
if (!repo) {
  console.error("usage: node scripts/sync-content.mjs <path-to-ninedeploy-clone>");
  process.exit(1);
}
// Paths resolve from this file, so the script works from any directory.
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = (name, data) =>
  writeFileSync(join(root, "src/content", name), `${JSON.stringify(data, null, 1)}\n`);

// Template logos come from Simple Icons, and only when the mark is the
// project's own. Anything without one renders the site's fixed container
// shape instead — never a stand-in picked to look plausible.
const icons = new Map(
  Object.values(simpleIcons)
    .filter((i) => i && typeof i === "object" && i.slug)
    .map((i) => [i.slug, i]),
);
const norm = (s) =>
  s.toLowerCase().replace(/\+/g, "plus").replace(/\./g, "dot").replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
const byTitle = new Map([...icons.values()].map((i) => [norm(i.title), i]));
// Checked by hand against each icon's source; null blocks a wrong auto-match.
const ICON_OVERRIDES = {
  "portainer-ce": "portainer",
  "adguard-home": "adguard", // AdGuard Home ships the AdGuard mark
  "changedetection-io": "changedetection",
  drawio: "diagramsdotnet",
  "code-server": "coder", // code-server is Coder's and carries its logo
  "speedtest-tracker": null, // third-party app, not Ookla's Speedtest
  loki: null, // has its own mark; the Grafana logo would mislead
  "redis-insight": null,
  nexus: null,
};
const iconFor = (t) => {
  if (t.id in ICON_OVERRIDES) return ICON_OVERRIDES[t.id] ? icons.get(ICON_OVERRIDES[t.id]) : null;
  const name = t.name.replace(/\s*\(.*?\)\s*/g, " ").replace(/Community Edition|Media Server|Server$/g, "").trim();
  for (const c of [t.id, name, t.name]) {
    const k = norm(c);
    if (icons.get(k)) return icons.get(k);
    if (byTitle.get(k)) return byTitle.get(k);
  }
  return null;
};

// Templates: keep only what the site renders.
const registry = JSON.parse(readFileSync(join(repo, "apps/server/src/templates/registry.json"), "utf8"));
const used = new Map();
const templates = registry.templates.map((t) => {
  const icon = iconFor(t);
  if (icon) used.set(icon.slug, icon);
  return {
  id: t.id,
  name: t.name,
  tagline: t.tagline,
  description: t.description,
  category: t.category,
  icon: icon ? icon.slug : null,
  image: t.image,
  port: t.port,
  website: t.website ?? null,
  featured: !!t.featured,
  verified: t.runtimeVerified === true,
  compose: !!t.composeContent,
  volume: t.volumeMount ?? null,
  // Keys only: defaults can be generated secrets, and the site never needs values.
  env: (t.env ?? []).map((e) => ({ key: e.key, secret: !!e.secret })),
  };
});
out("templates.json", { updated: registry.updated ?? null, templates });

// One cached sprite instead of inlining a path per card.
const symbols = [...used.values()]
  .sort((a, b) => a.slug.localeCompare(b.slug))
  .map((i) => `<symbol id="${i.slug}" viewBox="0 0 24 24"><title>${i.title.replace(/&/g, "&amp;")}</title><path d="${i.path}"/></symbol>`)
  .join("");
writeFileSync(
  join(root, "public/template-icons.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg"><!-- Logos from Simple Icons (CC0); trademarks belong to their owners. -->${symbols}</svg>
`,
);

// Changelog: the newest releases, groups and items trimmed for the web.
const md = readFileSync(join(repo, "CHANGELOG.md"), "utf8");
const clean = (s) =>
  s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
const releases = [];
let rel = null;
let group = null;
let item = null;
const flush = () => {
  if (item && rel && group) group.items.push(clean(item));
  item = null;
};
for (const line of md.split(/\r?\n/)) {
  const h = /^## \[([^\]]+)\](?:\s*-\s*(\S+))?/.exec(line);
  if (h) {
    flush();
    if (h[1] === "Unreleased") { rel = null; continue; }
    rel = { version: h[1], date: h[2] ?? "", tagline: "", groups: [] };
    group = null;
    releases.push(rel);
    continue;
  }
  if (!rel) continue;
  const g = /^### (.+)/.exec(line);
  if (g) { flush(); group = { title: g[1].trim(), items: [] }; rel.groups.push(group); continue; }
  const q = /^> (.+)/.exec(line);
  if (q && !rel.tagline && rel.groups.length === 0) { rel.tagline = clean(q[1]); continue; }
  const b = /^- (.+)/.exec(line);
  if (b && group) { flush(); item = b[1]; continue; }
  if (item && /^\s{2,}\S/.test(line) && !/^\s+- /.test(line)) { item += ` ${line.trim()}`; continue; }
  if (/^\s*$/.test(line)) flush();
}
flush();
const trimmed = releases.slice(0, 24).map((r) => ({
  ...r,
  groups: r.groups
    .filter((g) => g.items.length && !/upgrade notes/i.test(g.title))
    .map((g) => ({
      title: g.title,
      total: g.items.length,
      items: g.items.slice(0, 5).map((i) => (i.length > 240 ? `${i.slice(0, 237).replace(/\s+\S*$/, "")}…` : i)),
    })),
}));
out("changelog.json", { total: releases.length, releases: trimmed });
console.log(`templates: ${templates.length} (${templates.filter((t) => t.icon).length} with logos), releases: ${releases.length} (kept ${trimmed.length})`);
