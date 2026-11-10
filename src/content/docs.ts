import data from './upstream-docs.json';
import { prepareDocument } from '@/lib/source-markdown';

export type Doc = {
  slug: string; title: string; description: string; group: string;
  source: string; record: boolean; markdown: string; aliasOf?: string;
  blocks: { kind: 'h2'; text: string; id: string }[];
  document: ReturnType<typeof prepareDocument>;
};

const canonical = data.docs.map(entry => {
  const document = prepareDocument(entry.markdown);
  return { ...entry, document, blocks: document.headings.filter(h => h.depth === 2).map(h => ({ kind: 'h2' as const, text: h.text, id: h.id })) };
});
const aliases: Record<string, string> = data.aliases;
export const docs: Doc[] = [...canonical, ...Object.entries(aliases).map(([slug, target]) => {
  const doc = canonical.find(entry => entry.slug === target);
  if (!doc) throw new Error('Unknown documentation alias: ' + target);
  return { ...doc, slug, aliasOf: target };
})];
