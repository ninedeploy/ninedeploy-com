import { canonicalInstall } from './document-sources.mjs';

export function parseChangelog(md) {
const clean = (s) =>
  s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
const releases = [];
const sections = md.split(/(?=^## \[)/m);
const bodies = new Map(sections.map(section => [/^## \[([^\]]+)\]/.exec(section)?.[1], canonicalInstall(section.replace(/^## [^\n]*\n/, ''))]));
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
const complete = releases.map((r) => ({
  ...r,
  markdown: bodies.get(r.version) ?? '',
  groups: r.groups
    .filter((g) => g.items.length)
    .map((g) => ({
      title: g.title,
      total: g.items.length,
      items: g.items,
    })),
}));
return { total: releases.length, unreleased: bodies.get('Unreleased') ?? '', releases: complete };
}
