"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [result, setResult] = useState<{ text: string; status: "copied" | "error" } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const request = useRef(0);
  const status = result?.text === text ? result.status : "idle";
  const copied = status === "copied";
  const failed = status === "error";

  useEffect(() => () => {
    request.current++;
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  return (
    <button
      type="button"
      onClick={async () => {
        const current = ++request.current;
        if (timer.current !== null) clearTimeout(timer.current);
        timer.current = null;
        setResult(null);
        try {
          await navigator.clipboard.writeText(text);
          if (current !== request.current) return;
          setResult({ text, status: "copied" });
          timer.current = setTimeout(() => {
            setResult(null);
            timer.current = null;
          }, 1600);
        } catch {
          if (current === request.current) setResult({ text, status: "error" });
        }
      }}
      aria-label={copied ? "Copied" : failed ? "Copy failed. Retry copying command" : "Copy command"}
      title={failed ? "Clipboard unavailable. Retry or select and copy the command manually." : undefined}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${className}`}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      <span>{copied ? "Copied" : failed ? "Retry" : "Copy"}</span>
      <span role="status" className="sr-only">{copied ? "Command copied to clipboard." : failed ? "Copy failed. Retry or select and copy the command manually." : ""}</span>
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
