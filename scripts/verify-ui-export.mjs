import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// Dependency-free checks on the actual server-rendered export. Browser/keyboard
// verification is still required: these checks do not certify WCAG compliance.
const root = fileURLToPath(new URL("../out/", import.meta.url));
const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === "_next") continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.name.endsWith(".html")) files.push(path);
  }
}
await walk(root);
const voidTags = new Set("area base br col embed hr img input link meta param source track wbr".split(" "));
function parse(html) {
  const tree = { tag: "root", attrs: {}, children: [], parent: null }, stack = [tree], nodes = [];
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
  for (const token of html.match(/<[^>]*>|[^<]+/g) ?? []) {
    if (token.startsWith("</")) {
      const tag = token.match(/^<\/([^\s>]+)/)?.[1]?.toLowerCase();
      const index = stack.findLastIndex(node => node.tag === tag);
      if (index > 0) stack.length = index;
    } else if (/^<[a-z]/i.test(token)) {
      const tag = token.match(/^<([^\s/>]+)/)[1].toLowerCase();
      const attrs = Object.fromEntries([...token.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)].map(([, key, value]) => [key, value]));
      const node = { tag, attrs, children: [], parent: stack.at(-1) };
      stack.at(-1).children.push(node); nodes.push(node);
      if (!voidTags.has(tag) && !token.endsWith("/>")) stack.push(node);
    } else if (!token.startsWith("<")) stack.at(-1).children.push(token);
  }
  return nodes;
}
const text = node => node.children.map(child => typeof child === "string" ? child : text(child)).join("").trim();
const within = (node, predicate) => { for (let at = node; at; at = at.parent) if (predicate(at)) return true; return false; };
const documents = new Map();
for (const path of files) documents.set(relative(root, path).replaceAll("\\", "/"), parse(await readFile(path, "utf8")));
let links = 0;
for (const [path, nodes] of documents) {
  assert.equal(nodes.filter(n => n.tag === "main").length, 1, `${path}: expected one main landmark`);
  assert.equal(nodes.filter(n => n.tag === "h1").length, 1, `${path}: expected one h1`);
  const ids = nodes.filter(n => n.attrs.id).map(n => n.attrs.id);
  assert.equal(new Set(ids).size, ids.length, `${path}: duplicate ids`);
  for (const node of nodes) {
    const { tag, attrs } = node;
    if (["button", "input"].includes(tag) && attrs.type !== "hidden") {
      const name = attrs["aria-label"] || attrs["aria-labelledby"] || (tag === "button" ? text(node) : "") ||
        (tag === "input" && (within(node.parent, n => n.tag === "label") || nodes.some(n => n.tag === "label" && n.attrs.for === attrs.id)));
      assert.ok(name, `${path}: unnamed ${tag}`);
    }
    if (tag === "img") assert.ok("alt" in attrs, `${path}: image missing alt`);
    if (text(node) && !within(node, n => n.attrs["aria-hidden"] === "true" || n.tag === "svg")) {
      assert.ok(!/(?:^|;)opacity:\s*0(?:;|$)/.test(attrs.style ?? ""), `${path}: meaningful SSR text starts invisible: ${text(node).slice(0,65)}`);
    }
    if (tag === "a" && (attrs.href?.startsWith("/") || attrs.href?.startsWith("#"))) {
      const base = path.endsWith("index.html") ? path.slice(0, -10) : path;
      const url = new URL(attrs.href.replaceAll("&amp;", "&"), `https://local.test/${base}`);
      const targetPath = url.pathname.replace(/^\//, "");
      const target = targetPath.endsWith("/") ? `${targetPath}index.html` : targetPath || "index.html";
      const destination = documents.get(target);
      assert.ok(destination, `${path}: broken internal route ${attrs.href}`);
      if (url.hash) assert.ok(destination.some(n => n.attrs.id === decodeURIComponent(url.hash.slice(1))), `${path}: missing anchor ${attrs.href}`);
      links++;
    }
  }
}
console.log(`UI export verified: ${documents.size} HTML pages; ${links} internal links/anchors; landmarks, names, IDs and visible SSR content.`);
