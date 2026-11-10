import { marked, type Token, type Tokens } from "marked";

export type SourceHeading = { text: string; id: string; depth: number };
export type SourceToken = Token & { id?: string };

export function headingAnchor(text: string) {
  return text.toLowerCase().replace(/<[^>]*>/g, "").replace(/[^\p{L}\p{N}\p{M}_\s-]/gu, "").replace(/\s/g, "-");
}

function plain(tokens: Token[]): string {
  return tokens.map(token => {
    if ("tokens" in token && token.tokens) return plain(token.tokens);
    return "text" in token ? String(token.text) : "";
  }).join("");
}

export function prepareDocument(markdown: string) {
  const tokens = marked.lexer(markdown);
  const headings: SourceHeading[] = [];
  const ids = new Set<string>();
  const anchors: string[] = [];
  marked.walkTokens(tokens, token => {
    if (token.type === "html") {
      for (const id of htmlAnchors((token as Tokens.HTML).text)) {
        if (!ids.has(id)) { ids.add(id); anchors.push(id); }
      }
    }
    if (token.type !== "heading") return;
    const heading = token as Tokens.Heading & { id: string };
    const text = plain(heading.tokens);
    const base = headingAnchor(text) || "section";
    let id = base, serial = 0;
    while (ids.has(id)) id = `${base}-${++serial}`;
    ids.add(id);
    heading.id = id;
    headings.push({ text, id, depth: heading.depth });
  });
  return { tokens: tokens as SourceToken[], headings, anchors };
}

export function htmlAnchors(html: string) {
  return [...html.replace(/<!--[\s\S]*?-->/g, "").matchAll(/<a\s+(?:id|name)=["']([a-zA-Z0-9_-]+)["']\s*>/g)].map(match => match[1]);
}

export function safeHref(href: string) {
  if (/[\\\u0000-\u0020]/.test(href)) return undefined;
  return /^(?:https?:\/\/|mailto:|#|\/(?!\/))/i.test(href) ? href : undefined;
}
