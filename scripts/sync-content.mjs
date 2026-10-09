// Refresh from GitHub by default; an optional local clone is useful offline.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import * as simpleIcons from "simple-icons";
import { openUpstream, publishInstaller, root, validateInstaller } from "./upstream.mjs";

const source = await openUpstream(process.argv[2]);
const files = ["package.json", "apps/server/src/templates/registry.json", "CHANGELOG.md", "install.sh",
  "packages/mcp/src/tools.ts", "packages/mcp/src/generated/specTools.ts", "packages/db/src/schema.ts"];
const downloaded = await Promise.all(files.map((file) => source.read(file)));
const [pkgBytes, registryBytes, changelogBytes, installerBytes, toolsBytes, specToolsBytes, schemaBytes] = downloaded;
const pkg = JSON.parse(pkgBytes.toString("utf8"));
const registry = JSON.parse(registryBytes.toString("utf8"));
const installerSha256 = validateInstaller(installerBytes);
if (!/^\d+\.\d+\.\d+$/.test(pkg.version) || !registry.templates?.length) throw new Error("Invalid upstream product metadata");
const outputs = new Map();
const out = (name, data) =>
  outputs.set(join(root, "src/content", name), `${JSON.stringify(data, null, 1)}\n`);

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
outputs.set(
  join(root, "public/template-icons.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg"><!-- Logos from Simple Icons (CC0); trademarks belong to their owners. -->${symbols}</svg>
`,
);

// Changelog: the newest releases, groups and items trimmed for the web.
const md = changelogBytes.toString("utf8");
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
  const q = /^> ?(.*)/.exec(line);
  if (q && rel.groups.length === 0) { rel.tagline = clean(`${rel.tagline} ${q[1]}`); continue; }
  const b = /^- (.+)/.exec(line);
  if (b && group) { flush(); item = b[1]; continue; }
  if (item && /^\s{2,}\S/.test(line)) { item += ` ${line.trim().replace(/^- /, "")}`; continue; }
  if (/^\s*$/.test(line)) flush();
}
flush();
const trimmed = releases.slice(0, 24).map((r) => ({
  ...r,
  groups: r.groups
    .filter((g) => g.items.length)
    .map((g) => ({
      title: g.title,
      total: g.items.length,
      items: g.items.slice(0, 5).map((i) => (i.length > 240 ? `${i.slice(0, 237).replace(/\s+\S*$/, "")}…` : i)),
    })),
}));
out("changelog.json", { total: releases.length, releases: trimmed });
if (!releases.some((release) => release.version === pkg.version)) throw new Error("Product version is missing from CHANGELOG.md");
const countTools = (bytes) => [...bytes.toString("utf8").matchAll(/^    name: '([^']+)',/gm)].map((match) => match[1]);
const mcpTools = new Set([...countTools(toolsBytes), ...countTools(specToolsBytes)]).size;
const tables = [...schemaBytes.toString("utf8").matchAll(/= sqliteTable\(/g)].length;
if (!mcpTools || !tables) throw new Error("Upstream MCP tools or schema could not be counted");
out("product.json", { version: pkg.version, commit: source.ref, installerSha256, tables, mcpTools });
// Validate the whole snapshot before replacing any committed content.
for (const [target, body] of outputs) writeFileSync(target, body);
await publishInstaller(installerBytes);
console.log(`templates: ${templates.length} (${templates.filter((t) => t.icon).length} with logos), releases: ${releases.length} (kept ${trimmed.length})`);
console.log(`NineDeploy ${pkg.version}: ${mcpTools} MCP tools, ${tables} tables, source ${source.ref ?? "local clone"}`);
