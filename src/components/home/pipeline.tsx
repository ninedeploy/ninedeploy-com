"use client";

import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

const steps = [
  {
    title: "Queued",
    text: "A worker slot claims the deployment atomically and snapshots the build config plus a fingerprint of your env keys — never the values.",
    line: "deployment #48 queued · slot-1 claimed",
  },
  {
    title: "Recovered, if it has to be",
    text: "Builds still marked building after 45 minutes are requeued on boot, so a panel restart mid-build recovers instead of leaving a ghost.",
    line: "requeued 1 stale build on boot",
  },
  {
    title: "Prepare",
    text: "Image deploys pull, and a rollback pins the exact digest. Repo deploys check out the commit with the token scrubbed from every log line.",
    line: "checkout 9f3c1ab · creds scrubbed",
  },
  {
    title: "Environment",
    text: "Project vars, then service vars, then attached database URLs. Infisical and Doppler references resolve at deploy time and are never stored.",
    line: "env: 14 keys · DATABASE_URL injected",
  },
  {
    title: "Build",
    text: "Your Dockerfile through buildx, Nixpacks when there isn't one, PM2 on the host, or docker compose up --build. The manifest fills any gaps.",
    line: "buildx · 11/14 layers cached",
  },
  {
    title: "Boot beside the old one",
    text: "The new container starts with secrets from a 0600 env-file that's deleted right after start. The old container keeps serving.",
    line: "api-green up · api-blue serving",
  },
  {
    title: "Healthcheck",
    text: "Container liveness and an HTTP probe against the new container's network IP, retried with a fresh timeout per attempt for up to five minutes.",
    line: "GET /healthz → 200 (3/3)",
  },
  {
    title: "Cut over",
    text: "Only after the probe passes: pin the digest, assign the domain, flip Traefik, wait two seconds, then retire the previous container.",
    line: "route flipped → api-green",
  },
  {
    title: "Or fail safely",
    text: "If anything fails, the new runtime is torn down and the old one keeps serving. Only the deployment is marked failed — not your site.",
    line: "deploy #49 failed · api-green still live",
  },
  {
    title: "Cancel any time",
    text: "The pipeline re-reads its own status at every checkpoint and tears down partial work when you cancel.",
    line: "deploy #50 cancelled at build",
  },
];

const query = "(min-width: 1024px)";
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(query);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const useWide = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );

function StepCard({ i, step, active }: { i: number; step: (typeof steps)[number]; active?: boolean }) {
  const lane = i < 7 ? "var(--blue)" : "var(--green)";
  return (
    <article
      className={`flex h-full w-[min(78vw,340px)] shrink-0 snap-start flex-col rounded-3xl border bg-panel p-6 transition-colors duration-500 lg:w-[380px] ${
        active ? "border-rail-strong" : "border-rail"
      }`}
    >
      <div className="flex items-baseline justify-between">
        <span className="display text-6xl tabular-nums" style={{ color: active ? lane : "var(--rail-strong)" }}>
          {String(i + 1).padStart(2, "0")}
        </span>
        <span className="font-mono text-xs text-muted">of 10</span>
      </div>
      <h3 className="heading mt-6 text-2xl">{step.title}</h3>
      <p className="mt-3 flex-1 leading-relaxed text-muted">{step.text}</p>
      <p className="mt-6 truncate rounded-xl bg-code px-3 py-2 font-mono text-[12px] text-code-ink">
        <span className="text-[#4ecdc4]">→ </span>
        {step.line}
      </p>
    </article>
  );
}

export function Pipeline() {
  const wide = useWide();
  return (
    <section aria-labelledby="pipeline-heading" className="relative">
      {wide ? <Pinned /> : <Swipe />}
    </section>
  );
}

function Intro() {
  return (
    <div className="max-w-xl">
      <h2 id="pipeline-heading" className="heading text-4xl sm:text-5xl">
        What a deploy actually does.
      </h2>
      <p className="mt-4 text-lg text-muted">
        Triggered by the panel, a webhook, the CLI, a cron job or a template install. Ten stages, and your site stays up
        through all of them.
      </p>
    </div>
  );
}

function Pinned() {
  const ref = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const x = useTransform(smooth, [0, 1], [0, -distance]);
  const bar = useTransform(smooth, [0, 1], ["0%", "100%"]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(steps.length - 1, Math.floor(v * steps.length)));
  });

  useLayoutEffect(() => {
    const measure = () => {
      if (track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth + 64));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div ref={ref} style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden py-20">
        <div className="mx-auto w-full max-w-7xl px-8">
          <Intro />
        </div>
        <motion.div ref={track} style={{ x }} className="mt-12 flex gap-5 pl-[max(2rem,calc((100vw-80rem)/2+2rem))] pr-8">
          {steps.map((s, i) => (
            <StepCard key={s.title} i={i} step={s} active={i === active} />
          ))}
        </motion.div>
        <div className="mx-auto mt-10 w-full max-w-7xl px-8">
          <div className="h-[3px] overflow-hidden rounded-full bg-rail">
            <motion.div className="lane-rule h-full" style={{ width: bar }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Swipe() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Intro />
      </div>
      <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-4 px-4 pb-4 sm:scroll-pl-6 sm:px-6">
        {steps.map((s, i) => (
          <StepCard key={s.title} i={i} step={s} active />
        ))}
      </div>
      <p className="mx-auto mt-2 max-w-7xl px-4 text-sm text-muted sm:px-6">Swipe through the ten stages.</p>
    </div>
  );
}
