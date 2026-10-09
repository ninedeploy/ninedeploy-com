import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { root, validateInstaller } from "./upstream.mjs";

const product = JSON.parse(await readFile(join(root, "src/content/product.json"), "utf8"));
const changelog = JSON.parse(await readFile(join(root, "src/content/changelog.json"), "utf8"));
assert.equal(changelog.releases[0].version, product.version, "Changelog must lead with the product version");
const installer = await readFile(join(root, "out/install.sh"));
assert.equal(validateInstaller(installer), product.installerSha256, "Exported installer differs from the upstream snapshot");
assert.deepEqual(installer, await readFile(join(root, "public/install.sh")), "Static export changed installer bytes");

const pages = ["index.html", "features/index.html", "faq/index.html", "changelog/index.html", "templates/index.html",
  ...["installation", "mcp", "github-apps", "terminals", "traffic-analytics", "database-access-import", "secret-managers", "upgrade-guide"]
    .map((slug) => `docs/${slug}/index.html`)];
for (const page of pages) {
  const html = await readFile(join(root, "out", page), "utf8");
  const text = html.replace(/<[^>]+>/g, ""); // Syntax highlighting splits URLs across spans.
  assert.ok(html.includes("NineDeploy"), `${page}: missing site content`);
  assert.ok(!html.includes("raw.githubusercontent.com/NineDeploy/NineDeploy/main/install.sh"), `${page}: obsolete install URL`);
  if (["index.html", "docs/installation/index.html", "docs/upgrade-guide/index.html"].includes(page)) {
    assert.ok(text.includes("https://ninedeploy.com/install.sh"), `${page}: missing canonical install URL`);
  }
}
const releaseHtml = await readFile(join(root, "out/changelog/index.html"), "utf8");
assert.ok(releaseHtml.includes(`v${product.version}`), "Latest version not rendered");
assert.ok(releaseHtml.includes("Upgrade notes"), "Upgrade guidance not rendered");
console.log(`Export verified: ${pages.length} pages, v${product.version}, install.sh sha256 ${product.installerSha256}`);
