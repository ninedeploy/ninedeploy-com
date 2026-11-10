import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parseChangelog } from './changelog.mjs';
import { canonicalInstall, describeGuide, guideAliases } from './document-sources.mjs';
import { prepareDocument, safeHref } from '../src/lib/source-markdown.ts';

test('all releases, ungrouped prose, long entries and upgrade commands survive synchronization', () => {
  const long = 'A detailed recovery instruction. '.repeat(20);
  const source = `# Changelog\n## [Unreleased]\n### Added\n- Pending capability\n\n` +
    Array.from({ length: 26 }, (_, i) => `## [1.0.${25 - i}] - 2026-11-01\n\nUpgrade with --force only after backing up.\n\n### Fixed\n${Array.from({ length: 7 }, (_, j) => `- Entry ${j}: ${long}`).join('\n')}\n\n\x60\x60\x60bash\ninstaller --version v1.0.${25 - i}\n\x60\x60\x60\n`).join('\n');
  const result = parseChangelog(source);
  assert.equal(result.total, 26); assert.equal(result.releases.length, 26);
  assert.match(result.unreleased, /Pending capability/);
  assert.ok(result.releases.every(release => release.version !== 'Unreleased'));
  assert.equal(result.releases[0].groups[0].items.length, 7);
  assert.ok(result.releases[0].groups[0].items[6].includes(long.trim()));
  assert.match(result.releases[25].markdown, /Upgrade with --force/);
  assert.match(result.releases[25].markdown, /installer --version v1\.0\.0/);
});

test('installer commands use the canonical endpoint without rewriting pinned source links', () => {
  assert.equal(canonicalInstall('curl https://raw.githubusercontent.com/NineDeploy/NineDeploy/main/install.sh | bash -s -- --docker'), 'curl https://ninedeploy.com/install.sh | bash -s -- --docker');
  const pinned = 'https://raw.githubusercontent.com/ninedeploy/ninedeploy/v0.18.26/install.sh';
  assert.equal(canonicalInstall(pinned), pinned);
});

test('operating guides and dated/in-progress records remain distinguishable', () => {
  assert.equal(describeGuide('docs/SUPPORT_MATRIX.md', '# Support').record, false);
  assert.equal(describeGuide('docs/NODE_SLEEP_WAKE.md', '# Sleep').record, true);
  assert.equal(describeGuide('docs/plans/future.md', '# Future').group, 'Project records');
  assert.equal(describeGuide('docs/NEW_GUIDE.md', '# New').group, 'Reference');
});

test('document headings have unique stable targets and Markdown structure survives', () => {
  const doc = prepareDocument('# Guide\n\n## Install `Docker`\n\n## Install Docker\n\n```bash\necho hello\n```\n\n| Setting | Value |\n|---|---|\n| A | B |\n\n1. First\n   - Nested\n');
  assert.deepEqual(doc.headings.map(h => h.id), ['guide', 'install-docker', 'install-docker-1']);
  assert.ok(doc.tokens.some(t => t.type === 'table'));
  assert.ok(doc.tokens.some(t => t.type === 'code' && t.text === 'echo hello'));
  assert.ok(doc.tokens.some(t => t.type === 'list' && t.ordered));
});

test('legacy source anchors remain addressable without executing source HTML', () => {
  const doc = prepareDocument('<a id="legacy-section"></a>\n\n## Current section\n\n<!-- <a id="comment-only"></a> -->\n');
  assert.deepEqual(doc.anchors, ['legacy-section']);
  assert.equal(doc.headings[0].id, 'current-section');
});

test('document links cannot introduce active or protocol-relative URLs', () => {
  for (const href of ['javascript:alert(1)', 'data:text/html,test', '//example.com', '/\\example.com']) {
    assert.equal(safeHref(href), undefined, href);
  }
  for (const href of ['https://example.com', '/docs/installation/', '#heading', 'mailto:hello@example.com']) assert.equal(safeHref(href), href);
});

test('generated content covers every release and preserves existing guide URLs', async () => {
  const load = async name => JSON.parse(await readFile(new URL(`../src/content/${name}.json`, import.meta.url), 'utf8'));
  const [product, guides, changelog, registry] = await Promise.all(['product', 'upstream-docs', 'changelog', 'templates'].map(load));
  assert.equal(product.commit, guides.commit);
  assert.equal(product.templates, registry.templates.length);
  assert.equal(product.certified, registry.templates.filter(t => t.verified).length);
  assert.equal(changelog.total, changelog.releases.length);
  assert.equal(changelog.releases[0].version, product.version);
  assert.equal(new Set(guides.docs.map(doc => doc.slug)).size, guides.docs.length);
  for (const target of Object.values(guideAliases)) assert.ok(guides.docs.some(doc => doc.slug === target), target);
  for (const doc of guides.docs) assert.ok(doc.markdown.trim(), doc.source);
});
