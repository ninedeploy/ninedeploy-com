// Regenerates src/content/{templates,changelog}.json from a local clone of
// github.com/NineDeploy/NineDeploy. Usage: node scripts/sync-content.mjs <path-to-clone>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const repo = process.argv[2];
if (!repo) {
  console.error("usage: node scripts/sync-content.mjs <path-to-ninedeploy-clone>");
  process.exit(1);
}
const out = (name, data) =>
  writeFileSync(join("src/content", name), `${JSON.stringify(data, null, 1)}\n`);

// Templates: keep only what the site renders.
const registry = JSON.parse(readFileSync(join(repo, "apps/server/src/templates/registry.json"), "utf8"));
const templates = registry.templates.map((t) => ({
  id: t.id,
  name: t.name,
  tagline: t.tagline,
  description: t.description,
  category: t.category,
  emoji: t.emoji,
  image: t.image,
  port: t.port,
  website: t.website ?? null,
  featured: !!t.featured,
  verified: t.runtimeVerified === true,
  compose: !!t.composeContent,
}));
out("templates.json", { updated: registry.updated ?? null, templates });

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
console.log(`templates: ${templates.length}, releases: ${releases.length} (kept ${trimmed.length})`);
