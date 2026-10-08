"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { GitCommitHorizontal, Globe, Route, Bug } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/*
 * A live, interactive model of NineDeploy's blue-green deploy.
 *
 * Requests (dots) flow from users through Traefik into whichever lane is live.
 * A deploy builds the idle lane, healthchecks it, and only then flips the
 * router; dots already past the router finish in the old lane while it drains.
 * A broken commit fails its healthcheck and the live lane never moves.
 */

type Lane = "blue" | "green";
type SlotState = "live" | "idle" | "building" | "checking" | "failed" | "retiring";
type Check = "pending" | "pass" | "fail";

interface Slot {
  state: SlotState;
  commit: string;
  checks: Check[];
}

interface LogLine {
  id: number;
  at: string;
  text: string;
  tone?: "ok" | "err" | "dim" | "cmd";
}

interface Dot {
  t: number;
  speed: number;
  lane: Lane | null;
  wobble: number;
}

const other = (l: Lane): Lane => (l === "blue" ? "green" : "blue");
const sha = () =>
  Array.from({ length: 7 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

const emptyChecks = (): Check[] => ["pending", "pending", "pending"];

const STATUS: Record<SlotState, string> = {
  live: "live",
  idle: "standby",
  building: "building",
  checking: "healthcheck",
  failed: "failed",
  retiring: "draining",
};

export function CutoverStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const srcRef = useRef<HTMLDivElement>(null);
  const routerRef = useRef<HTMLDivElement>(null);
  const blueRef = useRef<HTMLDivElement>(null);
  const greenRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLOListElement>(null);

  const inView = useInView(stageRef, { margin: "-10% 0px" });
  const [live, setLive] = useState<Lane>("blue");
  const liveRef = useRef<Lane>("blue");
  const [slots, setSlots] = useState<Record<Lane, Slot>>({
    blue: { state: "live", commit: "4b1e07c", checks: ["pass", "pass", "pass"] },
    green: { state: "idle", commit: "—", checks: emptyChecks() },
  });
  const [busy, setBusy] = useState(false);
  const [served, setServed] = useState({ blue: 0, green: 0 });
  const servedRef = useRef({ blue: 0, green: 0 });
  const [logs, setLogs] = useState<LogLine[]>([
    { id: 0, at: "12:00:58", text: "api-blue serving 4b1e07c · healthy", tone: "dim" },
  ]);
  const deployNo = useRef(47);
  const logId = useRef(1);
  const clock = useRef(12 * 3600 + 58);
  const alive = useRef(true);
  const autoplayed = useRef(false);

  const wait = (ms: number) =>
    new Promise<void>((resolve, reject) =>
      setTimeout(() => (alive.current ? resolve() : reject(new Error("unmounted"))), ms),
    );

  const log = useCallback((text: string, tone?: LogLine["tone"]) => {
    clock.current += 1 + Math.floor(Math.random() * 3);
    const c = clock.current;
    const at = [Math.floor(c / 3600), Math.floor((c % 3600) / 60), c % 60]
      .map((n) => String(n).padStart(2, "0"))
      .join(":");
    setLogs((prev) => [...prev.slice(-30), { id: logId.current++, at, text, tone }]);
  }, []);

  const patch = (lane: Lane, next: Partial<Slot>) =>
    setSlots((s) => ({ ...s, [lane]: { ...s[lane], ...next } }));

  const deploy = useCallback(
    async (broken: boolean) => {
      if (busy) return;
      setBusy(true);
      const from = liveRef.current;
      const to = other(from);
      const commit = sha();
      const n = ++deployNo.current;
      try {
        log(`git push origin main${broken ? "  # oops" : ""}`, "cmd");
        await wait(500);
        log("webhook verified (hmac-sha256) · branch=main");
        log(`deployment #${n} queued → worker slot-1`);
        patch(to, { state: "building", commit, checks: emptyChecks() });
        await wait(900);
        log(`clone ok · checkout ${commit} · creds scrubbed`);
        await wait(1100);
        log("docker buildx · 11/14 layers cached · image sha256:" + sha());
        await wait(700);
        patch(to, { state: "checking" });
        log(`api-${to} started · api-${from} keeps serving`, "dim");
        const results: Check[] = broken ? ["fail", "fail", "fail"] : ["pass", "pass", "pass"];
        for (let i = 0; i < 3; i++) {
          await wait(650);
          setSlots((s) => {
            const checks = [...s[to].checks];
            checks[i] = results[i];
            return { ...s, [to]: { ...s[to], checks } };
          });
          log(
            broken
              ? `GET /healthz → ${i === 2 ? "timeout" : "503"} (${i + 1}/3)`
              : `GET /healthz → 200 in ${18 + Math.floor(Math.random() * 30)}ms (${i + 1}/3)`,
            broken ? "err" : undefined,
          );
        }
        await wait(500);
        if (broken) {
          patch(to, { state: "failed" });
          log(`healthcheck failed · tearing down api-${to}`, "err");
          log(`api-${from} kept serving · deploy #${n} marked failed · 0 requests dropped`, "ok");
          await wait(1800);
          patch(to, { state: "idle", commit: "—", checks: emptyChecks() });
        } else {
          liveRef.current = to;
          setLive(to);
          patch(to, { state: "live" });
          patch(from, { state: "retiring" });
          log(`traefik route flipped → api-${to}`, "ok");
          await wait(2000);
          patch(from, { state: "idle", checks: emptyChecks() });
          log(`api-${from} retired after 2s grace · deploy #${n} live · 0 dropped`, "ok");
        }
      } catch {
        return;
      }
      setBusy(false);
    },
    [busy, log],
  );

  // One orchestrated moment: the first time the stage is seen, it deploys itself.
  useEffect(() => {
    if (!inView || autoplayed.current) return;
    const t = setTimeout(() => {
      autoplayed.current = true;
      deploy(false);
    }, 1100);
    return () => clearTimeout(t);
  }, [inView, deploy]);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [logs]);

  // Canvas: wires and request dots, anchored to the real card positions.
  const anchors = useRef<{
    vertical: boolean;
    src: [number, number];
    rIn: [number, number];
    rOut: [number, number];
    blue: [number, number];
    green: [number, number];
  } | null>(null);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas || !srcRef.current || !routerRef.current || !blueRef.current || !greenRef.current) return;
    const box = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = box.width * dpr;
    canvas.height = box.height * dpr;
    canvas.style.width = `${box.width}px`;
    canvas.style.height = `${box.height}px`;
    const ctx = canvas.getContext("2d");
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    const r = (el: HTMLElement) => {
      const b = el.getBoundingClientRect();
      return { x: b.left - box.left, y: b.top - box.top, w: b.width, h: b.height };
    };
    const s = r(srcRef.current);
    const ro = r(routerRef.current);
    const bl = r(blueRef.current);
    const gr = r(greenRef.current);
    const vertical = box.width < 720;
    anchors.current = vertical
      ? {
          vertical,
          src: [s.x + s.w / 2, s.y + s.h],
          rIn: [ro.x + ro.w / 2, ro.y],
          rOut: [ro.x + ro.w / 2, ro.y + ro.h],
          blue: [bl.x + bl.w / 2, bl.y],
          green: [gr.x + gr.w / 2, gr.y],
        }
      : {
          vertical,
          src: [s.x + s.w, s.y + s.h / 2],
          rIn: [ro.x, ro.y + ro.h / 2],
          rOut: [ro.x + ro.w, ro.y + ro.h / 2],
          blue: [bl.x, bl.y + bl.h / 2],
          green: [gr.x, gr.y + gr.h / 2],
        };
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !inView) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dots: Dot[] = [];
    let raf = 0;
    let last = performance.now();
    let spawn = 0;
    let colors = { blue: "#7d96ff", green: "#4ecdc4", rail: "#24344b", ink: "#e8eef6" };
    let colorAge = 1e9;
    let flush = 0;

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      colors = {
        blue: cs.getPropertyValue("--blue").trim(),
        green: cs.getPropertyValue("--green").trim(),
        rail: cs.getPropertyValue("--rail-strong").trim(),
        ink: cs.getPropertyValue("--muted").trim(),
      };
    };

    const bez = (p0: readonly number[], p1: readonly number[], p2: readonly number[], p3: readonly number[], u: number) => {
      const v = 1 - u;
      return [
        v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0],
        v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1],
      ];
    };

    const curve = (lane: Lane) => {
      const a = anchors.current!;
      const end = a[lane];
      const p0 = a.rOut;
      if (a.vertical) {
        const my = (p0[1] + end[1]) / 2;
        return [p0, [p0[0], my], [end[0], my], end] as const;
      }
      const mx = (p0[0] + end[0]) / 2;
      return [p0, [mx, p0[1]], [mx, end[1]], end] as const;
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      colorAge += dt;
      if (colorAge > 0.5) {
        readColors();
        colorAge = 0;
      }
      const a = anchors.current;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      if (!a) {
        raf = requestAnimationFrame(frame);
        return;
      }
      const active = liveRef.current;

      // wires
      ctx.lineCap = "round";
      ctx.setLineDash([]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = colors.rail;
      ctx.beginPath();
      ctx.moveTo(a.src[0], a.src[1]);
      ctx.lineTo(a.rIn[0], a.rIn[1]);
      ctx.stroke();
      for (const lane of ["blue", "green"] as Lane[]) {
        const [p0, p1, p2, p3] = curve(lane);
        const on = lane === active;
        ctx.setLineDash(on ? [] : [4, 7]);
        ctx.lineWidth = on ? 2.5 : 1.5;
        ctx.strokeStyle = on ? colors[lane] : colors.rail;
        ctx.globalAlpha = on ? 0.9 : 0.8;
        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.bezierCurveTo(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.setLineDash([]);

      // dots
      if (!reduce) {
        spawn -= dt;
        if (spawn <= 0) {
          dots.push({ t: 0, speed: 0.42 + Math.random() * 0.12, lane: null, wobble: (Math.random() - 0.5) * 6 });
          spawn = 0.13 + Math.random() * 0.12;
        }
      }
      for (let i = dots.length - 1; i >= 0; i--) {
        const d = dots[i];
        d.t += dt * d.speed;
        if (d.t >= 0.5 && !d.lane) d.lane = liveRef.current;
        if (d.t >= 1) {
          if (d.lane) servedRef.current[d.lane]++;
          dots.splice(i, 1);
          continue;
        }
        let x: number;
        let y: number;
        if (d.t < 0.5) {
          const u = d.t / 0.5;
          x = a.src[0] + (a.rIn[0] - a.src[0]) * u;
          y = a.src[1] + (a.rIn[1] - a.src[1]) * u;
          if (a.vertical) x += d.wobble * Math.sin(u * Math.PI);
          else y += d.wobble * Math.sin(u * Math.PI);
        } else {
          const [p0, p1, p2, p3] = curve(d.lane!);
          [x, y] = bez(p0, p1, p2, p3, (d.t - 0.5) / 0.5);
        }
        const c = d.lane ? colors[d.lane] : colors.ink;
        ctx.fillStyle = c;
        ctx.shadowColor = c;
        ctx.shadowBlur = d.lane ? 12 : 0;
        ctx.beginPath();
        ctx.arc(x, y, d.lane ? 3.4 : 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      flush += dt;
      if (flush > 0.4) {
        flush = 0;
        setServed({ ...servedRef.current });
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  return (
    <div className="relative">
      <div
        ref={stageRef}
        className="blueprint relative overflow-hidden rounded-[28px] border border-rail bg-panel/70 p-4 shadow-[0_40px_120px_-60px_var(--glow-green)] sm:p-8"
      >
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative z-10 grid grid-cols-2 gap-x-3 gap-y-14 min-[720px]:grid-cols-[minmax(150px,0.8fr)_minmax(170px,0.9fr)_minmax(220px,1.2fr)] min-[720px]:items-center min-[720px]:gap-x-[clamp(48px,7vw,120px)]">
          {/* users */}
          <div className="col-span-2 flex justify-center min-[720px]:col-span-1 min-[720px]:justify-start">
            <div ref={srcRef} className="w-full max-w-[220px] rounded-2xl border border-rail bg-panel px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Globe className="size-4 text-muted" /> Your users
              </div>
              <p className="mt-1 font-mono text-[11px] text-muted">api.example.com</p>
            </div>
          </div>

          {/* router */}
          <div className="col-span-2 flex justify-center min-[720px]:col-span-1">
            <div ref={routerRef} className="w-full max-w-[240px] rounded-2xl border border-rail-strong bg-panel px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Route className="size-4 text-muted" /> Traefik
                </span>
                <span className="font-mono text-[11px] text-muted">:443</span>
              </div>
              <div className="mt-2 flex items-center gap-2 font-mono text-xs">
                <span className="text-muted">route →</span>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={live}
                    initial={{ y: 14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -14, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={live === "blue" ? "font-bold text-blue" : "font-bold text-green"}
                  >
                    api-{live}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* lanes */}
          <div className="col-span-2 grid grid-cols-2 gap-3 min-[720px]:col-span-1 min-[720px]:grid-cols-1 min-[720px]:gap-16">
            {(["blue", "green"] as Lane[]).map((lane) => (
              <Container
                key={lane}
                lane={lane}
                slot={slots[lane]}
                served={served[lane]}
                ref={lane === "blue" ? blueRef : greenRef}
              />
            ))}
          </div>
        </div>
      </div>

      {/* controls + log */}
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[auto_minmax(0,1fr)]">
        <div className="flex flex-wrap items-start gap-2 lg:flex-col">
          <button
            type="button"
            disabled={busy}
            onClick={() => deploy(false)}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bg transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40"
          >
            <GitCommitHorizontal className="size-4" /> Push a commit
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => deploy(true)}
            className="inline-flex items-center gap-2 rounded-full border border-pink/60 px-5 py-3 text-sm font-semibold text-pink transition-all hover:-translate-y-0.5 hover:bg-pink/10 disabled:translate-y-0 disabled:opacity-40"
          >
            <Bug className="size-4" /> Push a broken one
          </button>
          <p className="px-1 pt-1 text-xs text-muted lg:max-w-[200px]" aria-live="polite">
            {busy ? "Deploy in progress. Watch the requests." : "Try breaking it. Traffic stays where it is."}
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-rail bg-code text-code-ink">
          <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-[#ff5c87]" />
            <span className="size-2.5 rounded-full bg-[#ffb454]" />
            <span className="size-2.5 rounded-full bg-[#4ecdc4]" />
            <span className="ml-3 font-mono text-[11px] text-white/50">ninedeploy deploys watch api</span>
          </div>
          <ol
            ref={logRef}
            className="no-scrollbar h-44 overflow-y-auto px-4 py-3 font-mono text-[12px] leading-6"
            aria-label="Deploy log"
          >
            {logs.map((l) => (
              <motion.li
                key={l.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-3 whitespace-pre-wrap"
              >
                <span className="shrink-0 text-white/30">{l.at}</span>
                <span
                  className={
                    l.tone === "ok"
                      ? "text-[#4ecdc4]"
                      : l.tone === "err"
                        ? "text-[#ff5c87]"
                        : l.tone === "cmd"
                          ? "text-white"
                          : l.tone === "dim"
                            ? "text-white/50"
                            : "text-white/75"
                  }
                >
                  {l.tone === "cmd" ? "$ " : l.tone === "ok" ? "✓ " : l.tone === "err" ? "✗ " : "→ "}
                  {l.text}
                </span>
              </motion.li>
            ))}
            <li className="flex gap-3">
              <span className="shrink-0 text-white/30">{"        "}</span>
              <span className="caret inline-block h-4 w-2 translate-y-1 bg-[#4ecdc4]" />
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function Container({
  lane,
  slot,
  served,
  ref,
}: {
  lane: Lane;
  slot: Slot;
  served: number;
  ref: React.Ref<HTMLDivElement>;
}) {
  const color = lane === "blue" ? "var(--blue)" : "var(--green)";
  const glow = lane === "blue" ? "var(--glow-blue)" : "var(--glow-green)";
  const isLive = slot.state === "live" || slot.state === "retiring";
  const tone =
    slot.state === "failed"
      ? "var(--pink)"
      : slot.state === "building" || slot.state === "checking"
        ? "var(--amber)"
        : slot.state === "live"
          ? color
          : "var(--muted)";

  return (
    <motion.div
      ref={ref}
      animate={{
        boxShadow: slot.state === "live" ? `0 0 0 1px ${color}, 0 18px 60px -20px ${glow}` : "0 0 0 1px var(--rail)",
        x: slot.state === "failed" ? [0, -6, 6, -4, 4, 0] : 0,
      }}
      transition={{ duration: 0.45 }}
      className={`relative rounded-2xl bg-panel px-3 py-3 sm:px-4 ${slot.state === "idle" ? "opacity-70" : ""}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <span className="font-mono text-[13px] font-bold whitespace-nowrap" style={{ color }}>
          api-{lane}
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px]"
          style={{ color: tone, background: `color-mix(in oklab, ${tone} 14%, transparent)` }}
        >
          <span
            className={`size-1.5 rounded-full ${slot.state === "building" || slot.state === "checking" || slot.state === "retiring" ? "animate-pulse" : ""}`}
            style={{ background: tone }}
          />
          {STATUS[slot.state]}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 font-mono text-[11px] text-muted">
        <span className="truncate">commit {slot.commit}</span>
        <span className="hidden tabular-nums sm:inline">{isLive || served ? `${served.toLocaleString("en")} req` : ""}</span>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-bg-2">
        <motion.div
          className="h-full rounded-full"
          style={{ background: slot.state === "failed" ? "var(--pink)" : color }}
          initial={false}
          animate={{
            width:
              slot.state === "building"
                ? "78%"
                : slot.state === "idle"
                  ? "0%"
                  : "100%",
            opacity: slot.state === "retiring" ? 0.35 : 1,
          }}
          transition={{ duration: slot.state === "building" ? 2.6 : 0.5, ease: [0.2, 0.9, 0.1, 1] }}
        />
      </div>
      <div className="mt-2 flex gap-1.5" aria-label="Healthchecks">
        {slot.checks.map((c, i) => (
          <motion.span
            key={i}
            initial={false}
            animate={{ scale: c === "pending" ? 1 : [1.6, 1] }}
            className="h-1 flex-1 rounded-full"
            style={{
              background: c === "pass" ? color : c === "fail" ? "var(--pink)" : "var(--rail)",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
