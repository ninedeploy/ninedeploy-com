import type { ReactNode } from "react";
import type { Token, Tokens } from "marked";
import { CodeBlock } from "@/components/code";
import { docs } from "@/content/docs";
import { site } from "@/lib/site";
import { htmlAnchors, safeHref, type SourceToken } from "@/lib/source-markdown";

const guides = new Map(docs.filter(doc => !doc.aliasOf).map(doc => [doc.source, doc]));

function sourceUrl(href: string, source: string, image = false) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//")) return safeHref(href);
  const url = new URL(href, `https://source.invalid/${source}`);
  const path = decodeURIComponent(url.pathname.slice(1));
  if (image) return `https://raw.githubusercontent.com/ninedeploy/ninedeploy/${site.sourceCommit}/${path}`;
  const guide = guides.get(path);
  if (guide && (!url.hash || guide.document.headings.some(h => h.id === decodeURIComponent(url.hash.slice(1))) || guide.document.anchors.includes(decodeURIComponent(url.hash.slice(1))))) {
    return `/docs/${guide.slug}/${url.hash}`;
  }
  if (path === "CHANGELOG.md" && !url.hash) return "/changelog/";
  return `${site.github}/blob/${site.sourceCommit}/${path}${url.hash}`;
}

/** Render Markdown tokens as React nodes; upstream HTML is never executed. */
export function SourceDocument({ tokens, source }: { tokens: SourceToken[]; source: string }) {
  const inline = (children: Token[]): ReactNode => children.map((token, i) => {
    switch (token.type) {
      case "strong": return <strong key={i}>{inline((token as Tokens.Strong).tokens)}</strong>;
      case "em": return <em key={i}>{inline((token as Tokens.Em).tokens)}</em>;
      case "del": return <del key={i}>{inline((token as Tokens.Del).tokens)}</del>;
      case "codespan": return <code key={i} className="rounded border border-rail bg-bg-2 px-1 font-mono text-[0.85em]">{(token as Tokens.Codespan).text}</code>;
      case "br": return <br key={i} />;
      case "link": {
        const link = token as Tokens.Link;
        const href = sourceUrl(link.href, source);
        return href ? <a key={i} href={href} className="font-medium text-green underline underline-offset-4">{inline(link.tokens)}</a> : <span key={i}>{inline(link.tokens)}</span>;
      }
      case "image": {
        const image = token as Tokens.Image;
        const src = sourceUrl(image.href, source, true);
        // Dimensions belong to the upstream image; keep its native aspect ratio.
        // eslint-disable-next-line @next/next/no-img-element
        return src ? <img key={i} src={src} alt={image.text} loading="lazy" className="inline-block h-auto max-w-full rounded-lg" /> : <span key={i}>{image.text}</span>;
      }
      case "html": {
        const html = (token as Tokens.HTML).text;
        return <span key={i}>{htmlAnchors(html).map(id => <span key={id} id={id} className="scroll-mt-24" />)}{html.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]*>/g, "")}</span>;
      }
      default: {
        const text = token as Tokens.Text;
        return <span key={i}>{text.tokens ? inline(text.tokens) : text.text}</span>;
      }
    }
  });
  const blocks = (items: SourceToken[]): ReactNode => items.map((token, i) => {
    switch (token.type) {
      case "space": case "def": return null;
      case "heading": {
        const heading = token as Tokens.Heading & { id: string };
        const Tag = `h${Math.max(2, Math.min(6, heading.depth))}` as "h2" | "h3" | "h4" | "h5" | "h6";
        return <Tag key={i} id={heading.id} className={`heading scroll-mt-24 pt-6 ${heading.depth <= 2 ? "text-3xl" : "text-xl"}`}>{inline(heading.tokens)}</Tag>;
      }
      case "paragraph": return <p key={i} className="leading-[1.75] text-ink/85">{inline((token as Tokens.Paragraph).tokens)}</p>;
      case "text": {
        const text = token as Tokens.Text;
        return <span key={i}>{text.tokens ? inline(text.tokens) : text.text}</span>;
      }
      case "code": {
        const code = token as Tokens.Code;
        return <CodeBlock key={i} code={code.text} file={code.lang || "code"} lang={code.lang === "json" ? "json" : /ya?ml/.test(code.lang || "") ? "yaml" : /^(ts|typescript|js|javascript)$/.test(code.lang || "") ? "ts" : "bash"} />;
      }
      case "blockquote": return <blockquote key={i} className="space-y-4 rounded-r-xl border-l-2 border-green bg-panel p-5">{blocks((token as Tokens.Blockquote).tokens)}</blockquote>;
      case "list": {
        const list = token as Tokens.List;
        const Tag = list.ordered ? "ol" : "ul";
        return <Tag key={i} start={list.ordered ? Number(list.start) : undefined} className={`space-y-3 pl-6 ${list.ordered ? "list-decimal" : "list-disc"}`}>
          {list.items.map((item, j) => <li key={j} className="space-y-3 pl-1 leading-[1.75] text-ink/85">{item.task && <span className="mr-2" aria-label={item.checked ? "Complete" : "Incomplete"}>{item.checked ? "☑" : "☐"}</span>}{blocks(item.tokens)}</li>)}
        </Tag>;
      }
      case "table": {
        const table = token as Tokens.Table;
        return <div key={i} role="region" aria-label="Documentation table" tabIndex={0} className="max-w-full overflow-x-auto rounded-xl border border-rail">
          <table className="w-full border-collapse text-left text-sm">
            <thead><tr>{table.header.map((cell, j) => <th key={j} scope="col" className="min-w-32 border-b border-rail bg-panel p-3 align-top">{inline(cell.tokens)}</th>)}</tr></thead>
            <tbody>{table.rows.map((row, j) => <tr key={j}>{row.map((cell, k) => <td key={k} className="border-b border-rail p-3 align-top">{inline(cell.tokens)}</td>)}</tr>)}</tbody>
          </table>
        </div>;
      }
      case "hr": return <hr key={i} className="border-rail" />;
      case "html": {
        const text = (token as Tokens.HTML).text.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]*>/g, "").trim();
        const anchors = htmlAnchors((token as Tokens.HTML).text);
        return <div key={i}>{anchors.map(id => <span key={id} id={id} className="scroll-mt-24" />)}{text && <p className="whitespace-pre-wrap leading-relaxed">{text}</p>}</div>;
      }
      default: return <p key={i}>{token.raw}</p>;
    }
  });
  return <div className="source-document min-w-0 space-y-6 text-[17px] [overflow-wrap:anywhere]">{blocks(tokens)}</div>;
}
