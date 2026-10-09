"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bot, Braces, FileCode2, SquareTerminal } from "lucide-react";
import { useEffect, useState } from "react";
import { highlight } from "@/components/code";
import { tabListKeys } from "@/lib/tabs";
import { site } from "@/lib/site";

const slides = [
  {
    id: "cli",
    name: "CLI",
    icon: SquareTerminal,
    title: "40+ commands, one token in ~/.ninedeploy.",
    text: "Create services with a wizard, stream a running deploy, cancel it, roll it back. The CLI speaks the same REST API as the dashboard.",
    lang: "bash",
    file: "terminal",
    code: `npm install -g ninedeploy

ninedeploy login                   # authenticate against your panel
ninedeploy services create         # interactive wizard
ninedeploy services deploy 12
ninedeploy deploys watch 12 480    # stream a running deployment
ninedeploy env set 12 NODE_ENV production
ninedeploy domains add 12 api.example.com
ninedeploy system dashboard        # live health board`,
  },
  {
    id: "sdk",
    name: "SDK",
    icon: Braces,
    title: "Typed from the same Zod schemas the server validates with.",
    text: "Namespaces for every resource over an injectable fetch, so the SDK can never ask for something the API would reject.",
    lang: "ts",
    file: "deploy.ts",
    code: `import { createClient } from '@ninedeploy/sdk';

const nd = createClient({
  baseUrl: 'https://panel.example.com',
  getToken: () => process.env.ND_TOKEN!,
});

const services = await nd.services.list();
await nd.deploys.trigger(services[0].id);`,
  },
  {
    id: "mcp",
    name: "MCP",
    icon: Bot,
    title: `${site.stats.mcpTools} tools for your AI assistant, with a read-only switch.`,
    text: "Inspect services, traffic, grants and terminal history, or search the OpenAPI document. Pair READONLY with a read-scoped token. Trusted agents can use existing deploy and rollback tools.",
    lang: "json",
    file: "mcp.json",
    code: `{
  "mcpServers": {
    "ninedeploy": {
      "command": "npx",
      "args": ["-y", "@ninedeploy/mcp"],
      "env": {
        "NINEDEPLOY_URL": "https://panel.example.com",
        "NINEDEPLOY_TOKEN": "nd_tok_xxxxxxxxxxxx",
        "NINEDEPLOY_MCP_READONLY": "1"
      }
    }
  }
}`,
  },
  {
    id: "manifest",
    name: "Manifest",
    icon: FileCode2,
    title: "Keep the deployment shape next to the code.",
    text: "A .ninedeploy file fills in whatever the panel leaves empty, and every value it contributes is announced in the deploy log.",
    lang: "yaml",
    file: ".ninedeploy",
    code: `version: "1"
runtime:
  type: node
  version: "22"
build:
  install: pnpm install --frozen-lockfile
  start: node dist/server.js
run:
  port: 3000
  healthcheck: /healthz
watch:
  paths: [apps/api/**, packages/shared/**]
previews:
  enabled: true
  pattern: pr-{n}.previews.example.com`,
  },
];

const DURATION = 8000;

export function Interfaces() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const slide = slides[index];

  useEffect(() => {
    if (paused || reduce) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % slides.length), DURATION);
    return () => clearTimeout(t);
  }, [index, paused, reduce]);

  return (
    <section
      className="relative overflow-hidden border-y border-rail bg-bg-2 py-24"
      aria-labelledby="interfaces-heading"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="interfaces-heading" className="heading max-w-3xl text-4xl sm:text-5xl">
          Click it, type it, script it, or ask an agent.
        </h2>

        <div
          className="mt-10 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Interfaces"
          onKeyDown={tabListKeys(slides.length, index, setIndex)}
        >
          {slides.map((s, i) => {
            const Icon = s.icon;
            const on = i === index;
            return (
              <button
                key={s.id}
                role="tab"
                aria-selected={on}
                aria-controls="interfaces-panel"
                id={`interfaces-tab-${s.id}`}
                tabIndex={on ? 0 : -1}
                onClick={() => setIndex(i)}
                className={`relative overflow-hidden rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  on ? "border-ink bg-ink text-bg" : "border-rail text-muted hover:text-ink"
                }`}
              >
                <span className="relative flex items-center gap-2">
                  <Icon className="size-4" />
                  {s.name}
                </span>
                {on && !paused && !reduce && (
                  <motion.span
                    key={`p-${index}`}
                    className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-green"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: DURATION / 1000, ease: "linear" }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div
          id="interfaces-panel"
          role="tabpanel"
          aria-labelledby={`interfaces-tab-${slide.id}`}
          className="mt-8 grid grid-cols-[minmax(0,1fr)] items-start gap-10 lg:grid-cols-[0.8fr_1.2fr]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.3 }}
              className="lg:pt-6"
            >
              <h3 className="heading text-3xl">{slide.title}</h3>
              <p className="mt-4 text-lg leading-relaxed text-muted">{slide.text}</p>
            </motion.div>
          </AnimatePresence>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-rail bg-code text-code-ink shadow-[0_40px_100px_-50px_var(--glow-blue)]">
              <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
                <span className="size-2.5 rounded-full bg-[#ff5c87]" />
                <span className="size-2.5 rounded-full bg-[#ffb454]" />
                <span className="size-2.5 rounded-full bg-[#4ecdc4]" />
                <span className="ml-3 font-mono text-[11px] text-white/50">{slide.file}</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.pre
                  key={slide.id}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  transition={{ duration: 0.3 }}
                  className="min-h-[380px] overflow-x-auto p-5 font-mono text-[13px] leading-6 sm:text-sm"
                >
                  <code>{highlight(slide.code, slide.lang)}</code>
                </motion.pre>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
