// Refresh from GitHub by default; an optional local clone is useful offline.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import * as simpleIcons from "simple-icons";
import { openUpstream, publishInstaller, root, validateInstaller } from "./upstream.mjs";
import { parseChangelog } from "./changelog.mjs";
import { canonicalInstall, describeGuide, guideAliases } from './document-sources.mjs';

const source = await openUpstream(process.argv[2]);
const files = ["package.json", "apps/server/src/templates/registry.json", "CHANGELOG.md", "install.sh",
  "packages/mcp/src/tools.ts", "packages/mcp/src/generated/specTools.ts", "packages/db/src/schema.ts"];
const downloaded = await Promise.all(files.map((file) => source.read(file)));
const [pkgBytes, registryBytes, changelogBytes, installerBytes, toolsBytes, specToolsBytes, schemaBytes] = downloaded;
const pkg = JSON.parse(pkgBytes.toString("utf8"));
const registry = JSON.parse(registryBytes.toString("utf8"));
const installerSha256 = validateInstaller(installerBytes);
if (!/^\d+\.\d+\.\d+$/.test(pkg.version) || !registry.templates?.length) throw new Error("Invalid upstream product metadata");
const countTools = (bytes) => [...bytes.toString("utf8").matchAll(/^    name: '([^']+)',/gm)].map((match) => match[1]);
const mcpTools = new Set([...countTools(toolsBytes), ...countTools(specToolsBytes)]).size;
const tables = [...schemaBytes.toString("utf8").matchAll(/= sqliteTable\(/g)].length;
if (!mcpTools || !tables || !pkg.engines?.node) throw new Error("Upstream tools, schema or runtime metadata is missing");
const facts = { templates: registry.templates.length, certified: registry.templates.filter(t => t.runtimeVerified === true).length, categories: new Set(registry.templates.map(t => t.category)).size, mcpTools, tables };
const outputs = new Map();
const out = (name, data) =>
  outputs.set(join(root, "src/content", name), `${JSON.stringify(data, null, 1)}\n`);

const paths = await source.documents();
const guides = [];
for (let i = 0; i < paths.length; i += 8) {
  guides.push(...await Promise.all(paths.slice(i, i + 8).map(async path => {
    let markdown = canonicalInstall((await source.read(path)).toString('utf8'));
    if (['README.md', 'ARCHITECTURE.md'].includes(path)) {
      // These overview documents retain old inventory counts. Use the actual
      // registry/schema/tool definitions; never rewrite dated release records.
      markdown = markdown.replace(/\b\d+(?= tables\b)/g, String(tables))
        .replace(/\b\d+(?= tools\b)/g, String(mcpTools))
        .replace(/\b\d+(?= (?:one-click )?templates\b| entries; bundled JSON)/g, String(facts.templates))
        .replace(/\b\d+(?=-entry (?:template )?registry)/g, String(facts.templates))
        .replace(/\b\d+(?= categories\b)/g, String(facts.categories))
        .replace(/\b\d+(?= are marked verified in the Hub)/g, String(facts.certified))
        .replace(/\b\d+(?= hand-written ones)/g, String(countTools(toolsBytes).length));
    }
    return describeGuide(path, markdown);
  })));
}
out('upstream-docs.json', { commit: source.ref, aliases: guideAliases, docs: guides });

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
  requires: t.requires ?? null,
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

// Keep the complete history. The overview is compact; each release has full notes.
const md = changelogBytes.toString("utf8");
const changelog = parseChangelog(md);
const releases = changelog.releases;
out("changelog.json", changelog);
if (!releases.some((release) => release.version === pkg.version)) throw new Error("Product version is missing from CHANGELOG.md");
out("product.json", { version: pkg.version, commit: source.ref, installerSha256, ...facts, node: pkg.engines.node,
  releaseHeadline: releases[0]?.tagline.split(':')[0].slice(0, 90) || 'Features, fixes and upgrade notes' });
// Validate the whole snapshot before replacing any committed content.
for (const [target, body] of outputs) writeFileSync(target, body);
await publishInstaller(installerBytes);
console.log(`templates: ${templates.length} (${templates.filter((t) => t.icon).length} with logos), releases: ${releases.length}, complete source guides: ${guides.length}`);
console.log(`NineDeploy ${pkg.version}: ${mcpTools} MCP tools, ${tables} tables, source ${source.ref ?? "local clone"}`);
