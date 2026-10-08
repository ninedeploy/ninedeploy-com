import type { ReactNode } from "react";

/*
 * A deliberately tiny highlighter for the snippets on this site: comments,
 * strings, keys and a handful of keywords. Not a parser, and doesn't try to be.
 */
const KEYWORDS = /^(import|from|const|await|export|async|function|return|true|false|null|npm|npx|pnpm|ninedeploy|curl|docker|git)$/;

export function highlight(code: string, lang: string): ReactNode[] {
  const out: ReactNode[] = [];
  const lines = code.split("\n");
  lines.forEach((line, li) => {
    const re =
      lang === "yaml"
        ? /(#.*$)|("[^"]*"|'[^']*')|(^\s*-?\s*[\w.-]+(?=:))|(\b\d+\b)/g
        : lang === "json"
          ? /("(?:[^"\\]|\\.)*"(?=\s*:))|("(?:[^"\\]|\\.)*")|(\b\d+\b|true|false)/g
          : lang === "ts"
            ? /((?:^|(?<=\s))\/\/.*$)|("[^"]*"|'[^']*'|`[^`]*`)|(\b[a-zA-Z_][\w-]*\b)/g
            : // shell: `#` starts a comment only at line start or after a space, so URLs survive
              /((?:^|(?<=\s))#.*$)|("[^"]*"|'[^']*')|(\b[a-zA-Z_][\w-]*\b)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line))) {
      if (m.index > last) out.push(line.slice(last, m.index));
      const [tok] = m;
      let cls = "";
      if (lang === "yaml") cls = m[1] ? "c-com" : m[2] ? "c-str" : m[3] ? "c-key" : "c-num";
      else if (lang === "json") cls = m[1] ? "c-key" : m[2] ? "c-str" : "c-num";
      else if (m[1]) cls = "c-com";
      else if (m[2]) cls = "c-str";
      else if (KEYWORDS.test(tok)) cls = "c-kw";
      out.push(cls ? (
        <span key={`${li}-${m.index}`} className={cls}>
          {tok}
        </span>
      ) : (
        tok
      ));
      last = m.index + tok.length;
      if (tok.length === 0) re.lastIndex++;
    }
    if (last < line.length) out.push(line.slice(last));
    if (li < lines.length - 1) out.push("\n");
  });
  return out;
}

export function CodeBlock({ code, lang = "bash", file }: { code: string; lang?: string; file?: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-rail bg-code text-code-ink">
      {file && <div className="border-b border-white/10 px-4 py-2 font-mono text-[11px] text-white/50">{file}</div>}
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-6">
        <code>{highlight(code, lang)}</code>
      </pre>
    </div>
  );
}
