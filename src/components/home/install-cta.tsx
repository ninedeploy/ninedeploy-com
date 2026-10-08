"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";
import { CopyButton } from "@/components/copy-command";
import { site } from "@/lib/site";

const modes = [
  {
    id: "metal",
    label: "Bare metal",
    command: site.install,
    note: "Recommended for production. Installs Node and Docker if missing, verifies the release checksum, and starts a hardened systemd unit.",
  },
  {
    id: "docker",
    label: "Docker",
    command: site.installDocker,
    note: "Same installer, container mode. No host Node.js and no systemd unit for the panel; PM2 services need bare metal.",
  },
] as const;

export function InstallCta() {
  const [mode, setMode] = useState<(typeof modes)[number]["id"]>("metal");
  const m = modes.find((x) => x.id === mode)!;

  return (
    <section className="px-4 sm:px-6 lg:px-8" aria-labelledby="install-heading">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-code px-6 py-16 text-code-ink sm:px-12 sm:py-20">
        <div className="lane-rule absolute inset-x-0 top-0 h-1" aria-hidden />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #4ecdc4, transparent 60%)" }}
        />
        <div className="relative grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-end">
          <div>
            <h2 id="install-heading" className="display text-[clamp(3rem,7vw,6rem)] text-white">
              Your server.
              <br />
              Your rules.
            </h2>
            <p className="mt-6 max-w-md text-lg text-white/65">
              One command, one admin account, one dashboard. The first account you create becomes the instance
              operator.
            </p>
          </div>
          <div>
            <div className="inline-flex rounded-full bg-white/10 p-1" role="tablist" aria-label="Install mode">
              {modes.map((x) => (
                <button
                  key={x.id}
                  role="tab"
                  aria-selected={x.id === mode}
                  onClick={() => setMode(x.id)}
                  className={`relative rounded-full px-4 py-1.5 text-sm font-semibold ${x.id === mode ? "text-[#0d1522]" : "text-white/70 hover:text-white"}`}
                >
                  {x.id === mode && (
                    <motion.span layoutId="install-pill" className="absolute inset-0 rounded-full bg-[#4ecdc4]" />
                  )}
                  <span className="relative">{x.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-start gap-3 font-mono text-[13px] leading-6">
                <span className="select-none text-[#4ecdc4]">$</span>
                <code className="min-w-0 flex-1 break-all">{m.command}</code>
                <CopyButton text={m.command} className="bg-white/10 text-white hover:bg-white/20" />
              </div>
            </div>
            <p className="mt-4 text-sm text-white/55">{m.note}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/docs/installation"
                className="rounded-full bg-[#4ecdc4] px-6 py-3 font-semibold text-[#0d1522] transition-transform hover:-translate-y-0.5"
              >
                Read the install guide
              </Link>
              <a
                href={site.github}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                Star it on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
