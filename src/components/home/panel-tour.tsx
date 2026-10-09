"use client";

import { site } from "@/lib/site";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import {
  Activity,
  ArrowLeft,
  Copy,
  Cpu,
  Database,
  Download,
  ExternalLink,
  Eye,
  Filter,
  Gauge,
  Globe,
  HardDrive,
  LayoutGrid,
  MemoryStick,
  Network,
  Pause,
  Play,
  RefreshCw,
  Rocket,
  Search,
  Server,
  Settings,
  Shield,
  Square,
  Terminal,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { TemplateIcon } from "@/components/templates/template-icon";
import { tabListKeys } from "@/lib/tabs";

/*
 * The NineDeploy dashboard, redrawn in code rather than screenshotted, so it
 * follows the site's theme and its numbers move. Layout, labels and colours
 * follow apps/web; the workloads and hostnames are examples.
 */

type ViewId = "monitoring" | "hub" | "service" | "topology" | "database";

const views: { id: ViewId; label: string; section: string; page: string; caption: string }[] = [
  {
    id: "monitoring",
    label: "Monitoring",
    section: "System",
    page: "Monitoring",
    caption: "Host, node and per-container telemetry every few seconds, with limits you can change in place.",
  },
  {
    id: "hub",
    label: "Hub",
    section: "Deploy",
    page: "Hub",
    caption: `${site.stats.templates} one-click apps, each marked by whether it was actually booted and certified.`,
  },
  {
    id: "service",
    label: "Service",
    section: "Deploy",
    page: "Services",
    caption: "Deploy, restart, exec and read runtime logs from one service page. Rollbacks pin the image digest.",
  },
  {
    id: "topology",
    label: "Topology",
    section: "Network",
    page: "Topology",
    caption: "A live map of domains, Traefik, services, databases and the volumes behind them.",
  },
  {
    id: "database",
    label: "Database",
    section: "Data",
    page: "Databases",
    caption: "Managed Postgres with connection details, live resources, a web studio and backups on demand.",
  },
];

const DURATION = 7000;

/** A random-walk series that keeps moving while the tour is on screen. */
function useSeries(active: boolean, n = 40, base = 30, spread = 18, spiky = false) {
  const [data, setData] = useState(() =>
    Array.from({ length: n }, (_, i) => base + Math.sin(i / 3) * spread * 0.4),
  );
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      setData((d) => {
        const last = d[d.length - 1];
        const next = spiky
          ? Math.random() < 0.18
            ? base + spread * (0.8 + Math.random() * 0.6)
            : base - spread * 0.6
          : Math.max(4, Math.min(base + spread * 1.6, last + (Math.random() - 0.5) * spread * 0.9));
        return [...d.slice(1), next];
      });
    }, 900);
    return () => clearInterval(t);
  }, [active, base, spread, spiky]);
  return data;
}

function Spark({ data, className = "", color = "var(--blue)", height = 36 }: { data: number[]; className?: string; color?: string; height?: number }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const w = 100;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / (max - min || 1)) * (height - 4) - 2}`);
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className={className} aria-hidden>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

function Pill({ children = "running", tone = "green" }: { children?: ReactNode; tone?: "green" | "amber" | "muted" }) {
  const c = tone === "green" ? "var(--green)" : tone === "amber" ? "var(--amber)" : "var(--muted)";
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
      style={{ color: c, background: `color-mix(in oklab, ${c} 14%, transparent)`, boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${c} 25%, transparent)` }}
    >
      <span className="size-1.5 rounded-full" style={{ background: c }} />
      {children}
    </span>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-rail bg-panel ${className}`}>{children}</div>;
}

function Label({ children }: { children: ReactNode }) {
  return <p className="text-[10px] font-medium uppercase tracking-wide text-muted">{children}</p>;
}

/* ── views ─────────────────────────────────────────────────────────────── */

const workloads = [
  { name: "n8n", id: "n8n-75", cpu: 0.56, mem: 346, base: 30, spread: 14, spiky: false },
  { name: "Directus", id: "directus-77", cpu: 2.57, mem: 232, base: 40, spread: 20, spiky: false },
  { name: "Next.js Demo", id: "nextjs-demo-118", cpu: 0.0, mem: 42, base: 6, spread: 10, spiky: true },
  { name: "Uptime Kuma", id: "uptime-kuma-41", cpu: 0.21, mem: 88, base: 12, spread: 10, spiky: true },
  { name: "IT-Tools", id: "it-tools-38", cpu: 0.0, mem: 15, base: 5, spread: 6, spiky: true },
  { name: "pg", id: "postgres", cpu: 0.01, mem: 74, base: 8, spread: 6, spiky: true, db: true },
];

function Workload({ w, live }: { w: (typeof workloads)[number]; live: boolean }) {
  const data = useSeries(live, 40, w.base, w.spread, w.spiky);
  const cpu = (w.cpu + (data[data.length - 1] - w.base) / 60).toFixed(2);
  return (
    <Card className="p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-rail bg-bg-2">
            {w.db ? <Database className="size-3.5 text-green" /> : <Server className="size-3.5 text-muted" />}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold">{w.name}</p>
            <p className="truncate font-mono text-[9px] text-muted">{w.id}</p>
          </div>
        </div>
        <Pill />
      </div>
      <div className="mt-3 flex items-end gap-3">
        <div>
          <p className="text-[9px] uppercase text-muted">CPU</p>
          <p className="text-[17px] font-semibold tabular-nums leading-none">
            {Math.max(0, Number(cpu)).toFixed(2)}
            <span className="text-[9px] text-muted"> %</span>
          </p>
        </div>
        <div>
          <p className="text-[9px] uppercase text-muted">Memory</p>
          <p className="text-[13px] font-medium tabular-nums leading-none">
            {w.mem}
            <span className="text-[9px] text-muted"> MB</span>
          </p>
        </div>
        <Spark data={data} className="ml-auto h-7 w-24" />
      </div>
    </Card>
  );
}

function MonitoringView({ live }: { live: boolean }) {
  const stats = [
    { icon: Cpu, label: "Host CPU", value: "8 cores", sub: "load avg 1.07 · total 5.5%", bar: null, tone: "var(--green)" },
    { icon: MemoryStick, label: "Host memory", value: "16%", sub: "2.7 GB / 16.8 GB", bar: 16, tone: "var(--blue)" },
    { icon: HardDrive, label: "Disk storage", value: "30%", sub: "117.5 GB free", bar: 30, tone: "var(--amber)" },
    { icon: Gauge, label: "Active workloads", value: "11", sub: "8 services · 3 databases", bar: null, tone: "var(--green)" },
  ];
  return (
    <div className="space-y-3">
      <Heading icon={Activity} title="Live Monitoring & Telemetry" sub="Real-time host, cluster nodes, container metrics and alerts." />
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-3">
            <p className="flex items-center gap-1.5 text-[10px] uppercase text-muted">
              <s.icon className="size-3" style={{ color: s.tone }} /> {s.label}
            </p>
            <p className="mt-1.5 text-[17px] font-semibold">{s.value}</p>
            {s.bar !== null && (
              <div className="mt-1.5 h-1 rounded-full bg-bg-2">
                <div className="h-full rounded-full" style={{ width: `${s.bar}%`, background: s.tone }} />
              </div>
            )}
            <p className="mt-1.5 truncate text-[10px] text-muted">{s.sub}</p>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {workloads.map((w, i) => (
          <div key={w.id} className={i >= 3 ? "hidden sm:block" : undefined}>
            <Workload w={w} live={live} />
          </div>
        ))}
      </div>
    </div>
  );
}

const hubApps = [
  { name: "n8n", icon: "n8n", tag: "Fair-code workflow automation", cat: "Automation", featured: true },
  { name: "Directus", icon: "directus", tag: "Instant REST & GraphQL API for SQL databases", cat: "Automation", featured: true },
  { name: "PocketBase", icon: "pocketbase", tag: "Open source backend in 1 file", cat: "Automation", featured: true },
  { name: "Ollama", icon: "ollama", tag: "Get up and running with large language models", cat: "AI", featured: true },
  { name: "Uptime Kuma", icon: "uptimekuma", tag: "A fancy self-hosted monitoring tool", cat: "Monitoring", featured: true },
  { name: "Grafana", icon: "grafana", tag: "Dashboards & observability", cat: "Monitoring", featured: true },
  { name: "Beszel", icon: null, tag: "Lightweight server resource monitoring hub", cat: "Monitoring", featured: false },
  { name: "Ghost", icon: "ghost", tag: "Modern publishing & newsletter platform", cat: "CMS", featured: false },
  { name: "Vaultwarden", icon: "vaultwarden", tag: "Bitwarden-compatible password server", cat: "Security", featured: false },
];

function HubView() {
  const chips = [`All ${site.stats.templates}`, `Verified ${site.stats.certified}`, `Community ${site.stats.templates - site.stats.certified}`, "Automation", "AI", "Analytics", "Monitoring", "Productivity"];
  return (
    <div className="space-y-3">
      <Heading icon={Rocket} title="Hub" sub="Curated one-click apps with transparent runtime certification." />
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c, i) => (
          <span
            key={c}
            className={`rounded-full border px-2.5 py-1 text-[10px] ${i === 0 ? "border-green/40 bg-green/15 text-green" : "border-rail text-muted"}`}
          >
            {c}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {hubApps.map((a, i) => (
          <motion.div key={a.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="flex h-full gap-3 p-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-rail bg-bg-2 text-ink">
                <TemplateIcon t={{ icon: a.icon, name: a.name }} className="size-4" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[12px] font-semibold">{a.name}</span>
                  <span className="rounded border border-green/25 bg-green/10 px-1 text-[8px] font-medium uppercase text-green">verified</span>
                  {a.featured && (
                    <span className="rounded border border-amber/25 bg-amber/10 px-1 text-[8px] font-medium uppercase text-amber">featured</span>
                  )}
                </div>
                <p className="mt-0.5 line-clamp-1 text-[10px] text-muted">{a.tag}</p>
                <span className="mt-2 inline-block rounded bg-bg-2 px-1.5 py-0.5 text-[9px] text-muted">{a.cat}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ServiceView({ live }: { live: boolean }) {
  const data = useSeries(live, 40, 6, 10, true);
  const nav = ["Overview", "Terminal & Exec", "Architecture", "Manifest & Traefik", "Deploys", "Environment", "Network & Domains", "Volumes & Storage", "Activity Logs"];
  const facts: [string, string][] = [
    ["Status", "running"],
    ["Commit SHA", "6f5d64c26237"],
    ["Internal port", ":3000"],
    ["Health endpoint", "/api/health"],
    ["Memory limit", "2048 MiB"],
    ["Replicas", "1"],
  ];
  return (
    <div className="space-y-3">
      <div>
        <p className="flex items-center gap-1 text-[10px] text-muted">
          <ArrowLeft className="size-3" /> Services
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <p className="text-[18px] font-semibold">Next.js Demo</p>
          <Pill />
        </div>
        <p className="mt-0.5 font-mono text-[9px] text-muted">DOCKER · main · :3000 · github.com/acme/nextjs-demo</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Btn icon={ExternalLink} tone="outline-green">
          Open site
        </Btn>
        <Btn icon={Rocket} tone="green">
          Deploy
        </Btn>
        <Btn icon={RefreshCw}>Restart</Btn>
        <Btn icon={Square}>Stop</Btn>
        <Btn icon={Terminal} ghost>
          Runtime logs
        </Btn>
        <Btn icon={Download} ghost>
          Export
        </Btn>
      </div>
      <div className="grid gap-2 lg:grid-cols-[150px_1fr]">
        <Card className="hidden p-2 lg:block">
          <p className="px-2 pb-1 text-[9px] uppercase text-muted">Service navigation</p>
          {nav.map((n, i) => (
            <p key={n} className={`rounded-md px-2 py-1 text-[10px] ${i === 0 ? "bg-green/12 text-green" : "text-muted"}`}>
              {n}
            </p>
          ))}
        </Card>
        <div className="grid gap-2 sm:grid-cols-2">
          <Card className="p-3">
            <p className="flex items-center justify-between text-[11px] font-semibold">
              <span className="flex items-center gap-1.5">
                <Activity className="size-3 text-green" /> Live Resource Telemetry
              </span>
              <span className="rounded border border-rail px-1 font-mono text-[8px] text-muted">live 5s</span>
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-rail bg-bg-2 p-2">
                <p className="flex justify-between text-[9px] text-muted">
                  CPU load <span className="font-mono text-ink">0.0%</span>
                </p>
                <Spark data={data} className="mt-2 h-8 w-full" />
              </div>
              <div className="rounded-lg border border-rail bg-bg-2 p-2">
                <p className="flex justify-between text-[9px] text-muted">
                  Memory <span className="font-mono text-ink">42 / 2048</span>
                </p>
                <div className="mt-6 h-px w-full bg-green" />
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <p className="flex items-center justify-between text-[11px] font-semibold">
              Runtime & Architecture <Pill />
            </p>
            <dl className="mt-2 grid grid-cols-1 gap-1">
              {facts.map(([k, v]) => (
                <div key={k} className="flex justify-between rounded-md border border-rail bg-bg-2 px-2 py-1 text-[9px]">
                  <dt className="text-muted">{k}</dt>
                  <dd className="font-mono">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TopologyView() {
  // nodes in a 600×300 board
  const domains = ["n8n.apps.example.com", "cms.apps.example.com", "web.apps.example.com"];
  const services = [
    { name: "n8n", y: 60 },
    { name: "Directus", y: 150 },
    { name: "Next.js Demo", y: 240 },
  ];
  return (
    <div className="space-y-3">
      <Heading icon={Network} title="Infrastructure Topology & Flow" sub="Routed domains, Traefik, services, databases, volumes and network bridges." />
      <Card className="blueprint relative overflow-hidden p-2">
        <svg viewBox="0 0 630 300" className="h-auto w-full" role="img" aria-label="Topology: three domains route through Traefik to three services, one with a Postgres database and volume">
          <defs>
            <style>{`.flow{stroke-dasharray:4 5;animation:flow 1.2s linear infinite}@keyframes flow{to{stroke-dashoffset:-18}}`}</style>
          </defs>
          {domains.map((_, i) => (
            <path key={i} className="flow" d={`M150 ${60 + i * 90} C 190 ${60 + i * 90}, 200 150, 240 150`} fill="none" stroke="var(--blue)" strokeWidth="1.2" />
          ))}
          {services.map((s) => (
            <path key={s.name} className="flow" d={`M330 150 C 370 150, 360 ${s.y}, 400 ${s.y}`} fill="none" stroke="var(--green)" strokeWidth="1.2" />
          ))}
          <path className="flow" d="M500 150 C 520 150, 520 150, 530 150" fill="none" stroke="var(--green)" strokeWidth="1.2" />
          <path d="M575 170 L575 215" fill="none" stroke="var(--amber)" strokeWidth="1.2" strokeDasharray="3 4" />
          {domains.map((d, i) => (
            <g key={d} transform={`translate(10 ${45 + i * 90})`}>
              <rect width="140" height="30" rx="6" fill="var(--panel)" stroke="var(--rail-strong)" />
              <circle cx="14" cy="15" r="4" fill="none" stroke="var(--blue)" />
              <text x="24" y="14" fontSize="7.5" fill="var(--ink)" fontFamily="var(--font-mono)">{d}</text>
              <text x="24" y="23" fontSize="6" fill="var(--green)" fontFamily="var(--font-mono)">TLS 1.3 / ACME</text>
            </g>
          ))}
          <g transform="translate(240 125)">
            <rect width="90" height="50" rx="8" fill="var(--panel)" stroke="var(--green)" />
            <text x="10" y="20" fontSize="10" fontWeight="600" fill="var(--ink)">Traefik v3</text>
            <text x="10" y="34" fontSize="7" fill="var(--muted)" fontFamily="var(--font-mono)">3 SSL routes</text>
          </g>
          {services.map((s) => (
            <g key={s.name} transform={`translate(400 ${s.y - 20})`}>
              <rect width="100" height="40" rx="7" fill="var(--panel)" stroke="var(--rail-strong)" />
              <text x="10" y="17" fontSize="8.5" fontWeight="600" fill="var(--ink)">{s.name}</text>
              <circle cx="12" cy="28" r="2.5" fill="var(--green)" />
              <text x="18" y="30.5" fontSize="6.5" fill="var(--green)">running</text>
            </g>
          ))}
          <g transform="translate(530 130)">
            <rect width="90" height="40" rx="7" fill="var(--panel)" stroke="var(--rail-strong)" />
            <text x="8" y="17" fontSize="8" fontWeight="600" fill="var(--ink)">Directus DB</text>
            <text x="8" y="30" fontSize="6.5" fill="var(--muted)" fontFamily="var(--font-mono)">postgres :5432</text>
          </g>
          <g transform="translate(530 215)">
            <rect width="90" height="24" rx="6" fill="var(--panel)" stroke="var(--amber)" strokeOpacity="0.6" />
            <text x="8" y="15" fontSize="7" fill="var(--amber)" fontFamily="var(--font-mono)">db-data</text>
          </g>
        </svg>
        <div className="absolute bottom-3 left-3 hidden rounded-lg border border-rail bg-panel/90 p-2 text-[9px] text-muted sm:block">
          <p className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-blue" /> Domain → Gateway</p>
          <p className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-green" /> Gateway → Service</p>
          <p className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed border-amber" /> Volume mount</p>
        </div>
      </Card>
    </div>
  );
}

function DatabaseView({ live }: { live: boolean }) {
  const ram = useSeries(live, 2, 40, 2);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl border border-rail bg-bg-2">
            <Database className="size-5 text-green" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[16px] font-semibold">Directus DB</p>
              <Pill />
            </div>
            <p className="font-mono text-[9px] text-muted">PostgreSQL · nd-db-directus:5432</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <Btn icon={RefreshCw}>Restart</Btn>
          <Btn icon={Download} tone="green">
            Backup now
          </Btn>
        </div>
      </div>
      <div className="flex gap-3 border-b border-rail text-[10px]">
        {["Overview", "Topology", "Files", "Backups", "Logs", "Settings"].map((t, i) => (
          <span key={t} className={`pb-1.5 ${i === 0 ? "border-b border-green text-ink" : "text-muted"}`}>
            {t}
          </span>
        ))}
      </div>
      <div className="grid gap-2 lg:grid-cols-[1.2fr_1fr]">
        <Card className="space-y-2 p-3">
          <div className="flex items-center justify-between">
            <Label>Connection details</Label>
            <span className="flex items-center gap-1 rounded-md border border-rail px-1.5 py-0.5 text-[9px]">
              <Copy className="size-2.5" /> Copy URI
            </span>
          </div>
          <p className="truncate rounded-lg bg-code px-2 py-1.5 font-mono text-[9px] text-[#4ecdc4]">
            postgres://app:••••••••••••@nd-db-directus:5432/app
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              ["Host (internal)", "nd-db-directus"],
              ["Port", "5432"],
              ["Username", "app"],
              ["Database", "app"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-md border border-rail bg-bg-2 px-2 py-1">
                <p className="text-[8px] uppercase text-muted">{k}</p>
                <p className="font-mono text-[10px]">{v}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-md border border-rail bg-bg-2 px-2 py-1.5">
            <span className="font-mono text-[10px] tracking-widest">••••••••••••••••</span>
            <Eye className="size-3 text-muted" />
          </div>
        </Card>
        <div className="space-y-2">
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <Label>Linked applications</Label>
              <span className="rounded-full bg-green/12 px-1.5 text-[9px] text-green">1 attached</span>
            </div>
            <div className="mt-2 flex items-center justify-between rounded-lg border border-rail bg-bg-2 px-2 py-1.5">
              <span className="flex items-center gap-1.5 text-[10px]">
                <Server className="size-3 text-muted" /> Directus
              </span>
              <span className="text-[9px] text-green">View service</span>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <Label>Live resources</Label>
              <Pill>live</Pill>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <div className="rounded-md border border-rail bg-bg-2 px-2 py-1.5">
                <p className="text-[8px] uppercase text-muted">CPU</p>
                <p className="font-mono text-[13px] font-semibold">0.0%</p>
              </div>
              <div className="rounded-md border border-rail bg-bg-2 px-2 py-1.5">
                <p className="text-[8px] uppercase text-muted">RAM</p>
                <p className="font-mono text-[13px] font-semibold tabular-nums">
                  {ram[ram.length - 1].toFixed(1)} <span className="text-[8px] text-muted">MB</span>
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <Label>Database web studio</Label>
            <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-green px-2 py-1 text-[9px] font-semibold text-bg">
              <Play className="size-2.5" /> Launch Web Studio
            </span>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ── chrome ────────────────────────────────────────────────────────────── */

function Heading({ icon: Icon, title, sub }: { icon: typeof Activity; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg border border-rail bg-bg-2">
        <Icon className="size-4 text-green" />
      </span>
      <div>
        <p className="text-[14px] font-semibold">{title}</p>
        <p className="text-[10px] text-muted">{sub}</p>
      </div>
    </div>
  );
}

function Btn({
  icon: Icon,
  children,
  tone,
  ghost,
}: {
  icon: typeof Activity;
  children: ReactNode;
  tone?: "green" | "outline-green";
  ghost?: boolean;
}) {
  const cls =
    tone === "green"
      ? "bg-green text-bg"
      : tone === "outline-green"
        ? "border border-green/40 text-green"
        : ghost
          ? "text-muted"
          : "border border-rail bg-bg-2";
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium ${cls}`}>
      <Icon className="size-3" /> {children}
    </span>
  );
}

const sidebars: Record<string, string[]> = {
  System: ["Activity", "Monitoring", "Doctor", "Docker", "Servers", "Users", "Settings"],
  Deploy: ["Hub", "Manifest Creator", "Dashboard", "Services", "Queue"],
  Network: ["Domains", "Traefik", "Networks", "Tunnels", "Topology"],
  Data: ["Databases", "Volumes", "Backups"],
};
const railIcons = [
  { icon: Rocket, section: "Deploy" },
  { icon: LayoutGrid, section: "" },
  { icon: Database, section: "Data" },
  { icon: Globe, section: "Network" },
  { icon: Settings, section: "System" },
  { icon: Shield, section: "" },
];

export function PanelTour() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-15% 0px" });
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  // `held` pauses while the pointer or keyboard focus is inside the section;
  // `stopped` is the user's explicit choice via the pause button.
  const [held, setHeld] = useState(false);
  const [stopped, setStopped] = useState(false);
  const view = views[index];
  const live = inView && !reduce; // live numbers and charts
  const autoplay = live && !held && !stopped;

  useEffect(() => {
    if (!autoplay) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % views.length), DURATION);
    return () => clearTimeout(t);
  }, [index, autoplay]);

  return (
    <section
      className="relative py-24"
      aria-labelledby="tour-heading"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHeld(false);
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 id="tour-heading" className="heading text-4xl sm:text-5xl">
              The panel you&apos;ll actually use.
            </h2>
            <p className="mt-4 text-lg text-muted">
              Redrawn here from the real dashboard, numbers moving. Everything on this page has a screen like these
              behind it.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Panel views" onKeyDown={tabListKeys(views.length, index, setIndex)}>
          {views.map((v, i) => {
            const on = i === index;
            return (
              <button
                key={v.id}
                role="tab"
                aria-selected={on}
                aria-controls="tour-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => setIndex(i)}
                className={`relative overflow-hidden rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  on ? "border-ink bg-ink text-bg" : "border-rail text-muted hover:text-ink"
                }`}
              >
                {v.label}
                {on && autoplay && (
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
        {!reduce && (
          <button
            type="button"
            onClick={() => setStopped((s) => !s)}
            aria-pressed={stopped}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-rail px-3 py-2 text-sm text-muted transition-colors hover:text-ink"
          >
            {stopped ? <Play className="size-4" /> : <Pause className="size-4" />}
            {stopped ? "Play tour" : "Pause tour"}
          </button>
        )}
        </div>

        <div
          ref={ref}
          id="tour-panel"
          role="tabpanel"
          aria-label={`${view.label} view`}
          className="mt-6 overflow-hidden rounded-[22px] border border-rail-strong bg-bg shadow-[0_50px_140px_-60px_var(--glow-green)]"
        >
          {/* top bar */}
          <div className="flex items-center gap-2 border-b border-rail bg-bg-2 px-3 py-2">
            <span className="hidden items-center gap-1.5 rounded-md border border-rail bg-panel px-2 py-1 text-[10px] sm:inline-flex">
              <Server className="size-3 text-muted" /> Admin&apos;s Workspace
              <span className="rounded-full border border-rail px-1.5 text-[8px] text-muted">OWNER</span>
            </span>
            <span className="hidden items-center gap-1 text-[10px] text-muted md:inline-flex">
              <Filter className="size-3" /> Filter
            </span>
            <span className="hidden rounded-md border border-green/30 bg-green/10 px-2 py-1 text-[10px] text-green lg:inline">Workspace Admin&apos;s Workspace</span>
            <span className="hidden rounded-md border border-rail px-2 py-1 text-[10px] text-muted lg:inline">Project Any</span>
            <span className="ml-1 text-[11px]">
              {view.section} <span className="text-muted">/ {view.page}</span>
            </span>
            <span className="ml-auto hidden items-center gap-1.5 rounded-md border border-rail px-2 py-1 text-[10px] text-muted sm:inline-flex">
              <Search className="size-3" /> Search <kbd className="font-mono text-[8px]">⌘K</kbd>
            </span>
          </div>
          <div className="flex min-h-[540px]">
            {/* icon rail */}
            <div className="hidden w-12 shrink-0 flex-col items-center gap-2 border-r border-rail bg-bg-2 py-3 sm:flex">
              {railIcons.map((r, i) => (
                <span
                  key={i}
                  className={`grid size-8 place-items-center rounded-lg ${r.section === view.section ? "bg-green/15 text-green ring-1 ring-green/30" : "text-muted"}`}
                >
                  <r.icon className="size-4" />
                </span>
              ))}
            </div>
            {/* section sidebar */}
            <div className="hidden w-40 shrink-0 border-r border-rail bg-bg-2/60 p-3 md:block">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted">{view.section}</p>
              {sidebars[view.section].map((item) => (
                <p
                  key={item}
                  className={`rounded-md px-2 py-1.5 text-[11px] ${item === view.page ? "bg-green/12 font-medium text-ink ring-1 ring-green/25" : "text-muted"}`}
                >
                  {item}
                </p>
              ))}
            </div>
            {/* content */}
            <div className="min-w-0 flex-1 p-4 sm:p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view.id}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ duration: 0.3, ease: [0.2, 0.9, 0.1, 1] }}
                >
                  {view.id === "monitoring" && <MonitoringView live={live} />}
                  {view.id === "hub" && <HubView />}
                  {view.id === "service" && <ServiceView live={live} />}
                  {view.id === "topology" && <TopologyView />}
                  {view.id === "database" && <DatabaseView live={live} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={view.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-muted"
          >
            {view.caption}
          </motion.p>
        </AnimatePresence>
      </div>
    </section>
  );
}
