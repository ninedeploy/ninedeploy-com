import { Check, Minus, X } from "lucide-react";
import { site } from "@/lib/site";

type Mark = "yes" | "no" | "meh";
const rows: { label: string; nd: [Mark, string]; raw: [Mark, string]; paas: [Mark, string] }[] = [
  { label: "Your data stays on your server", nd: ["yes", "Always"], raw: ["yes", "Yes"], paas: ["no", "Vendor cloud"] },
  { label: "Zero-downtime deploys", nd: ["yes", "Blue-green"], raw: ["no", "DIY scripts"], paas: ["yes", "Yes"] },
  { label: "Managed databases and backups", nd: ["yes", "9 engines, S3"], raw: ["no", "Manual"], paas: ["meh", "Metered"] },
  { label: "Automatic HTTPS and wildcard domains", nd: ["yes", "ACME DNS-01"], raw: ["no", "Manual proxy"], paas: ["yes", "Yes"] },
  { label: "AI agents can operate it", nd: ["yes", `${site.stats.mcpTools} MCP tools`], raw: ["no", "Shell access"], paas: ["meh", "Varies"] },
  { label: "Price at 50 services", nd: ["yes", "$0, your hardware"], raw: ["meh", "$0, your weekends"], paas: ["no", "Per seat, per GB"] },
  { label: "Lock-in", nd: ["yes", "None, MIT"], raw: ["yes", "None"], paas: ["no", "Proprietary"] },
];

function Cell({ mark, text, strong }: { mark: Mark; text: string; strong?: boolean }) {
  const Icon = mark === "yes" ? Check : mark === "no" ? X : Minus;
  const color = mark === "yes" ? "text-green" : mark === "no" ? "text-pink" : "text-amber";
  return (
    <td className={`px-4 py-4 ${strong ? "bg-green/[0.06]" : ""}`}>
      <span className="flex items-center gap-2 text-[15px]">
        <Icon className={`size-4 shrink-0 ${color}`} aria-label={mark === "yes" ? "Yes:" : mark === "no" ? "No:" : "Partly:"} />
        <span className={strong ? "font-semibold" : "text-muted"}>{text}</span>
      </span>
    </td>
  );
}

export function Comparison() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="compare-heading">
      <h2 id="compare-heading" className="heading max-w-3xl text-4xl sm:text-5xl">
        Raw Docker, a managed PaaS, or the one in between.
      </h2>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        The honest pitch: you get the managed-platform experience and keep the bill and the data of a box you rent.
      </p>
      <div className="mt-10 overflow-x-auto rounded-3xl border border-rail bg-panel">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-rail">
              <th scope="col" className="px-4 py-4 text-sm font-medium text-muted">
                <span className="sr-only">Capability</span>
              </th>
              <th scope="col" className="bg-green/[0.06] px-4 py-4">
                <span className="heading text-xl">NineDeploy</span>
              </th>
              <th scope="col" className="px-4 py-4 text-sm font-semibold text-muted">
                Raw Docker
              </th>
              <th scope="col" className="px-4 py-4 text-sm font-semibold text-muted">
                Managed PaaS
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-rail last:border-0">
                <th scope="row" className="px-4 py-4 text-[15px] font-medium">
                  {r.label}
                </th>
                <Cell mark={r.nd[0]} text={r.nd[1]} strong />
                <Cell mark={r.raw[0]} text={r.raw[1]} />
                <Cell mark={r.paas[0]} text={r.paas[1]} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const plate: [string, string][] = [
  ["Release", `v${site.version}`],
  ["Runtime", "Node ≥ 22.13 + Docker"],
  ["Panel state", `1 SQLite file, ${site.stats.tables} tables`],
  ["API contract", "OpenAPI 3.1 + typed SDK"],
  ["Database engines", String(site.stats.dbEngines)],
  ["Templates", `${site.stats.templates} (${site.stats.certified} certified)`],
  ["MCP tools", String(site.stats.mcpTools)],
  ["Secrets", "AES-256-GCM, rotatable keys"],
  ["Releases", "Sigstore-signed, SLSA provenance"],
];

/** A hardware rating plate — it runs on your machine, so it gets one. */
export function DataPlate() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="plate-heading">
      <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <h2 id="plate-heading" className="heading text-4xl sm:text-5xl">
            One process. One file. The Docker socket.
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
            No scheduler, no service mesh, no cluster consensus. One panel that knows how to drive Docker on one host,
            and on a handful of remote ones when you add them. Upgrades snapshot your data first and gate on a health
            endpoint.
          </p>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
            It is not Kubernetes, and doesn&apos;t pretend to be.
          </p>
        </div>

        <div className="relative rounded-[22px] border border-rail-strong bg-gradient-to-br from-panel to-bg-2 p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_30px_80px_-50px_rgb(0_0_0/0.6)] sm:p-8">
          {["left-3 top-3", "right-3 top-3", "bottom-3 left-3", "bottom-3 right-3"].map((p) => (
            <span
              key={p}
              aria-hidden
              className={`absolute ${p} grid size-3.5 place-items-center rounded-full border border-rail-strong bg-bg-2`}
            >
              <span className="h-px w-2 rotate-45 bg-rail-strong" />
            </span>
          ))}
          <div className="flex items-start justify-between gap-4 border-b border-dashed border-rail-strong pb-4">
            <div>
              <p className="heading text-2xl">NineDeploy</p>
              <p className="font-mono text-xs text-muted">Self-hosted deployment platform</p>
            </div>
            <span className="rounded-md border border-rail-strong px-2 py-1 font-mono text-[11px] text-muted">MIT</span>
          </div>
          <dl className="mt-2 divide-y divide-rail font-mono text-[13px]">
            {plate.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5">
                <dt className="text-muted">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 border-t border-dashed border-rail-strong pt-4 font-mono text-[11px] text-muted">
            Serial: your-server-01. Made by OXOGNET OÜ, Estonia.
          </p>
        </div>
      </div>
    </section>
  );
}

const limits = [
  {
    title: "Agent transport has no TLS of its own.",
    text: "It fails closed and uses sealed operations, but keep worker nodes on a private network or VPN.",
  },
  {
    title: "Remote nodes run docker and compose services.",
    text: "PM2 and Nixpacks builds are refused on a node with a reason, instead of quietly running on the panel host.",
  },
  {
    title: "Remote health is container state, not an HTTP probe.",
    text: "Probing would mean publishing ports on the node's public interface. The deploy log says so.",
  },
  {
    title: "PM2 services have no blue-green window.",
    text: "They stop, then start, with automatic rollback on failure.",
  },
];

export function Limits() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="limits-heading">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 id="limits-heading" className="heading text-4xl sm:text-5xl">
            The fine print, in large print.
          </h2>
          <p className="mt-5 max-w-md text-lg text-muted">
            Finding these out during an incident is worse than reading them here. The architecture doc tracks each one
            against the code and marks it when it closes.
          </p>
        </div>
        <ul className="divide-y divide-rail border-y border-rail">
          {limits.map((l) => (
            <li key={l.title} className="grid grid-cols-[minmax(0,1fr)] gap-1 py-5 sm:grid-cols-[1fr_1fr] sm:gap-8">
              <p className="font-semibold">{l.title}</p>
              <p className="text-muted">{l.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
