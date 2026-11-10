import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { root, validateInstaller } from "./upstream.mjs";
import { guideAliases } from './document-sources.mjs';

const product = JSON.parse(await readFile(join(root, "src/content/product.json"), "utf8"));
const changelog = JSON.parse(await readFile(join(root, "src/content/changelog.json"), "utf8"));
const templates = JSON.parse(await readFile(join(root, "src/content/templates.json"), "utf8")).templates;
const guides = JSON.parse(await readFile(join(root, 'src/content/upstream-docs.json'), 'utf8'));
assert.equal(guides.commit, product.commit, 'Guides must use the product snapshot');
assert.equal(product.templates, templates.length);
assert.equal(product.certified, templates.filter(template => template.verified).length);
assert.equal(changelog.total, changelog.releases.length, 'Release history must not be truncated');
assert.ok(changelog.releases.every(release => release.markdown.trim()), 'Every release needs complete source notes');
assert.equal(new Set(templates.map((template) => template.id)).size, templates.length, "Duplicate template routes");
assert.equal(changelog.releases[0].version, product.version, "Changelog must lead with the product version");
const installer = await readFile(join(root, "out/install.sh"));
assert.equal(validateInstaller(installer), product.installerSha256, "Exported installer differs from the upstream snapshot");
assert.deepEqual(installer, await readFile(join(root, "public/install.sh")), "Static export changed installer bytes");

const pages = ["index.html", "features/index.html", "faq/index.html", "changelog/index.html", "templates/index.html",
  ...[...guides.docs.map(doc => doc.slug), ...Object.keys(guideAliases)]
    .map((slug) => `docs/${slug}/index.html`),
  ...changelog.releases.map(release => `changelog/${release.version}/index.html`),
  ...(changelog.unreleased ? ['changelog/unreleased/index.html'] : []),
  ...templates.map((template) => `templates/${template.id}/index.html`)];
for (const page of pages) {
  const html = await readFile(join(root, "out", page), "utf8");
  const text = html.replace(/<[^>]+>/g, ""); // Syntax highlighting splits URLs across spans.
  assert.ok(html.includes("NineDeploy"), `${page}: missing site content`);
  assert.ok(!html.includes("raw.githubusercontent.com/NineDeploy/NineDeploy/main/install.sh"), `${page}: obsolete install URL`);
  if (["index.html", "docs/installation/index.html", "docs/upgrade-guide/index.html"].includes(page)) {
    assert.ok(text.includes("https://ninedeploy.com/install.sh"), `${page}: missing canonical install URL`);
  }
  const template = templates.find((template) => page === `templates/${template.id}/index.html`);
  if (template?.compose) {
    assert.ok(text.includes("Defined by Compose stack"), `${page}: Compose persistence must describe the stack's volumes`);
  }
}
const releaseHtml = await readFile(join(root, "out/changelog/index.html"), "utf8");
assert.ok(releaseHtml.replace(/<[^>]+>/g, "").includes(`v${product.version}`), "Latest version not rendered");
assert.ok(releaseHtml.includes("Complete release archive"), "Release archive not rendered");
console.log(`Export verified: ${pages.length} pages (${templates.length} template routes), v${product.version}, install.sh sha256 ${product.installerSha256}`);
