"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { rooms } from "@/lib/features";
import { tabListKeys } from "@/lib/tabs";

export function FeatureRooms() {
  const [active, setActive] = useState(rooms[0].id);
  const room = rooms.find((r) => r.id === active)!;

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="rooms-heading">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 id="rooms-heading" className="heading max-w-2xl text-4xl sm:text-5xl">
          A platform, not a pile of scripts.
        </h2>
        <Link href="/features" className="text-sm font-semibold underline decoration-rail-strong underline-offset-4 hover:decoration-green">
          See the full inventory
        </Link>
      </div>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        It replaces the docker run invocations, nginx vhosts, certbot cron jobs and pg_dump scripts — and the wiki page
        nobody updated since the last migration.
      </p>

      <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[280px_1fr]">
        <div
          role="tablist"
          aria-label="Feature areas"
          onKeyDown={tabListKeys(rooms.length, rooms.findIndex((r) => r.id === active), (i) => setActive(rooms[i].id))}
          className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col">
          {rooms.map((r) => {
            const on = r.id === active;
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                role="tab"
                id={`tab-${r.id}`}
                aria-selected={on}
                tabIndex={on ? 0 : -1}
                aria-controls={`panel-${r.id}`}
                onClick={() => setActive(r.id)}
                className={`relative flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors lg:py-4 ${
                  on ? "text-bg" : "text-muted hover:text-ink"
                }`}
              >
                {on && (
                  <motion.span
                    layoutId="room-pill"
                    className="absolute inset-0 rounded-2xl bg-ink"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className="relative size-5" />
                <span className="relative">
                  <span className="heading block text-xl">{r.name}</span>
                  <span className={`hidden text-xs lg:block ${on ? "text-bg/70" : ""}`}>{r.items.length} capabilities</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="min-h-[520px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={room.id}
              id={`panel-${room.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${room.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.2, 0.9, 0.1, 1] }}
            >
              <p className="heading max-w-2xl text-2xl text-ink/90">{room.summary}</p>
              <dl className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-7 sm:grid-cols-2">
                {room.items.map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * i }}
                    className="border-t border-rail pt-4"
                  >
                    <dt className="font-semibold">{f.title}</dt>
                    <dd className="mt-1.5 text-[15px] leading-relaxed text-muted">{f.text}</dd>
                  </motion.div>
                ))}
              </dl>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
