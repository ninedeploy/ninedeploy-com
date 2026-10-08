"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          /* clipboard blocked: the text is still selectable */
        }
      }}
      aria-label={copied ? "Copied" : "Copy command"}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${className}`}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

/** A one-line shell command with a copy button. */
export function CopyCommand({ command, className = "" }: { command: string; className?: string }) {
  return (
    <div
      className={`flex min-w-0 items-center gap-3 rounded-2xl border border-rail bg-code py-2 pl-4 pr-2 font-mono text-[13px] text-code-ink ${className}`}
    >
      <span className="select-none text-[#4ecdc4]">$</span>
      <code className="no-scrollbar min-w-0 flex-1 overflow-x-auto whitespace-nowrap">{command}</code>
      <CopyButton text={command} className="bg-white/10 text-white hover:bg-white/20" />
    </div>
  );
}
