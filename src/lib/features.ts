import type { LucideIcon } from "lucide-react";
import { Boxes, Database, Network, ShieldCheck } from "lucide-react";
import { site } from "@/lib/site";

export interface Feature {
  title: string;
  text: string;
}

export interface FeatureRoom {
  id: string;
  name: string;
  icon: LucideIcon;
  summary: string;
  items: Feature[];
}

// Grouped the way the dashboard's icon rail groups them.
export const rooms: FeatureRoom[] = [
  {
    id: "deploy",
    name: "Deploy",
    icon: Boxes,
    summary: "From a push, an image or a template to a healthy container — and back again by digest.",
    items: [
      {
        title: "Three service types",
        text: "Docker images (built or pulled), PM2-managed Node processes, and Docker Compose stacks with an ndcmp- project prefix — first-class, not bolted on.",
      },
      {
        title: "Git, registry, or hub",
        text: `Use a GitHub App, PAT or SSH deploy key, pull from private registries, or start from ${site.stats.templates} hub templates — ${site.stats.certified} runtime-certified. GitHub Apps use short-lived repository-scoped tokens and can report deploy status and PR preview URLs.`,
      },
      {
        title: "The .ninedeploy manifest",
        text: "Commit build, runtime, routing, storage and alert config next to the code. Panel beats manifest beats auto-detect, and a secret scanner refuses credential-shaped values before they reach git.",
      },
      {
        title: "Rollback and cancel",
        text: "Every deployment records the exact image digest, so a rollback redeploys that precise image — never a moved :latest. In-flight deploys cancel at any stage.",
      },
      {
        title: "Watch paths and cron",
        text: "Monorepo-friendly webhooks that only fire on watched path globs. Cron-scheduled redeploys and container commands with run history.",
      },
      {
        title: "Live build logs",
        text: "WebSocket log streaming with backlog replay and on-disk log persistence. Operators get real TTY terminals for services, databases and managed containers, locally and on nodes, with resize and audited session metadata.",
      },
      {
        title: "HMAC webhooks",
        text: "GitHub, GitLab and Gitea verification, branch matching and replay dedup — a captured push can't flood the deploy queue.",
      },
      {
        title: "Ephemeral PR previews",
        text: "A pull request spins up service-pr-123 with the parent's non-secret config, capped by a max-active limit and destroyed when the PR closes.",
      },
      {
        title: "One-click demo stack",
        text: "A pre-configured stack with PostgreSQL, a Next.js standalone container and a Next.js PM2 cluster — to see the whole loop in a minute.",
      },
    ],
  },
  {
    id: "data",
    name: "Data",
    icon: Database,
    summary: "Nine database engines, encrypted backups, volumes you can snapshot — all on your disk.",
    items: [
      {
        title: "Nine managed engines",
        text: "PostgreSQL (with pgvector), MySQL, MariaDB, Redis, Valkey, MongoDB, ClickHouse, Meilisearch and RabbitMQ, with one-click provisioning and a web studio.",
      },
      {
        title: "Public access and dump import",
        text: "Opt-in TCP access for six database engines through a dedicated sidecar and a required IP allowlist. Import resumable uploads or S3 dumps with a pre-import safety backup.",
      },
      {
        title: "Injected connection strings",
        text: "Attach a database to a service and its connection string arrives as environment on every deploy — resolved fresh from the vault, never pasted once and forgotten.",
      },
      {
        title: "Encrypted backups",
        text: "Dumps and volume archives are sealed with AES-256-GCM as they're written. Restore and download decrypt transparently.",
      },
      {
        title: "Off-site to any S3",
        text: "Cloudflare R2, AWS S3, MinIO, Wasabi or Backblaze B2 through a dependency-free SigV4 client, with retention pruning per destination.",
      },
      {
        title: "Volume snapshots",
        text: "Snapshot, restore and download any managed volume through a throwaway sidecar. Restores are tar-slip validated and refuse to run under a live service.",
      },
      {
        title: "Container file manager",
        text: "Browse a container's filesystem in the browser, edit files, and drag and drop uploads and downloads.",
      },
      {
        title: "One SQLite core",
        text: "All panel state in one .data directory — no PostgreSQL or Redis to babysit for the panel itself. Migrations apply on every start.",
      },
    ],
  },
  {
    id: "network",
    name: "Network",
    icon: Network,
    summary: "Traefik in front, certificates handled, nothing exposed you didn't ask for.",
    items: [
      {
        title: "Traefik ingress and middlewares",
        text: "Dynamic routing with IP allowlists, rate limits, basic auth, www→apex redirects and custom headers. Only 80 and 443 are open on the host.",
      },
      {
        title: "Wildcard HTTPS",
        text: "ACME DNS-01 through Cloudflare, DigitalOcean, Hetzner, Linode, Gandi or DuckDNS. One *.your-domain certificate; {slug}.your-domain for every service.",
      },
      {
        title: "Bring your own proxy config and TLS",
        text: "Upload certificates with encrypted private keys, or add custom- routers, middlewares and services. Traefik validates custom config before applying it and reverts a rejected change.",
      },
      {
        title: "Traffic analytics",
        text: "Opt-in requests, status classes and latency charts per service and domain. Traefik access logs omit client IP, path, query and headers; rollups keep 48 hours of minute data and 30 days of hourly data by default.",
      },
      {
        title: "Cloudflare Tunnels",
        text: "Expose services from a host with no inbound ports, with managed cloudflared tunnels straight from the dashboard.",
      },
      {
        title: "Multi-server agents",
        text: "Remote hosts run the same binary in agent mode and accept about 24 typed operations — never raw shell over the wire. Each node runs its own Traefik.",
      },
      {
        title: "Topology view",
        text: "Interactive diagrams of services, databases and routes, with live inspectors and one-click endpoint copying.",
      },
      {
        title: "Direct port publishing",
        text: "Expose a service on a dedicated TCP port when you need to. Reserved ports (the panel, 22, 80, 443) are refused outright.",
      },
    ],
  },
  {
    id: "system",
    name: "System",
    icon: ShieldCheck,
    summary: "Teams, secrets, alerts and every way in — a web panel, a CLI, an SDK and an MCP server.",
    items: [
      {
        title: "Workspaces and roles",
        text: "Owner, admin, member and viewer, enforced at the route layer. Project and environment grants can raise a user's role or give guests access to selected resources without a workspace seat. Instance operator is a separate privilege.",
      },
      {
        title: "Serious auth",
        text: "Argon2id, passkeys (WebAuthn), TOTP with replay protection, OIDC for Google, GitHub, Okta and Keycloak, and a 5-fails-then-15-minutes lockout.",
      },
      {
        title: "Secrets vault",
        text: "AES-256-GCM in versioned envelopes with a rotatable master-key ring. Resolve Infisical, Doppler, HashiCorp Vault / OpenBao and AWS Secrets Manager references at deploy time.",
      },
      {
        title: "Alerts and notifications",
        text: "Rules on CPU, memory, disk, cert expiry and offline nodes, delivered to Telegram, Discord, Slack, ntfy, email or webhooks.",
      },
      {
        title: "Log drains and audit",
        text: "Forward logs to Loki, Datadog, Vector or syslog. Every destructive action lands in the audit log.",
      },
      {
        title: "Plugins on a microkernel",
        text: "An event bus, hook pipeline, config center and menu registry; write plugins against @ninedeploy/plugin-sdk.",
      },
      {
        title: "Every interface",
        text: `Web dashboard with a ⌘K palette, the ninedeploy CLI, a typed REST SDK, an authenticated OpenAPI 3.1 document, and ${site.stats.mcpTools} MCP tools including generated read-only tools and API search.`,
      },
    ],
  },
];
