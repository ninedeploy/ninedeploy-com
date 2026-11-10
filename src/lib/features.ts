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
        title: "Build placement and image transfer",
        text: "Build on the runtime host, the panel or a dedicated build server. Move images to nodes over the sealed agent channel or through an operator-bound registry. A failed build or transfer leaves the running version serving.",
      },
      {
        title: "Docker Swarm, opt-in",
        text: "Operators can enable Swarm per Docker service for rolling, start-first updates and replicas. Traefik remains the public entry point. Compose, PM2, volumes and managed databases keep their separate runtimes.",
      },
      {
        title: "The .ninedeploy manifest",
        text: "Commit build, runtime, routing, storage and alert config next to the code. Panel beats manifest beats auto-detect, and a secret scanner refuses credential-shaped values before they reach git.",
      },
      {
        title: "Rollback and cancel",
        text: "Manual rollback redeploys a recorded commit or image with current settings and environment. Recorded Docker artifacts and inline Compose releases offer explicit promotion and restore paths with documented limits. In-flight deploys cancel at any stage.",
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
      {"title": "Protected lanes and approval gates", "text": "Production lanes can hide variables and logs from members while still allowing deploys, hold changes for an admin's approval, and apply deploy freezes. Pushes, schedules and deploy hooks follow the same gate."},
      {"title": "Canaries, replicas and autoscaling", "text": "Docker services can use staged traffic, resource or request-rate scaling, and scale to zero on supported placements. Node canaries and RPS scaling require explicit capabilities; node sleep/wake remains work in progress. Swarm uses native rolling updates and its configured replicas."},
      {"title": "CI on your own runners", "text": "Run pipeline jobs on enrolled runners, inspect attempts and logs, and require CI before deployment. Cancellation, lease expiry, retry and capacity are tracked by the panel."},
      {"title": "Deploy without a repository", "text": "Upload source archives, use an inline Dockerfile, paste a Compose stack, or trigger image redeploys from registry webhooks. File mounts, deploy hooks and container options have explicit operator and runtime boundaries."},
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
    summary: `${site.stats.dbEngines} database engines, encrypted backups and volumes — on your panel host or nodes.`,
    items: [
      {
        title: `${site.stats.dbEngines} managed engines`,
        text: "PostgreSQL (with pgvector), MySQL, MariaDB, Redis, Valkey, KeyDB, Dragonfly, MongoDB, ClickHouse, Meilisearch and RabbitMQ. KeyDB and Dragonfly include Redis-compatible connection strings, RDB backup/restore, imports and drills.",
      },
      {
        title: "Databases and volumes on nodes",
        text: "Place managed databases on a node, attach services on the same host, and back up or restore node volumes over the sealed channel. Node databases support logs, limits, backups, imports and shells; Studio, PgBouncer and public access stay on the panel host.",
      },
      {
        title: "Public access and dump import",
        text: "Opt-in TCP access for eight database engines on the panel host, through a dedicated sidecar and a required IP allowlist. Import resumable uploads or S3 dumps with a pre-import safety backup.",
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
      {"title": "Restore verification and PostgreSQL PITR", "text": "Verify backups of every managed engine by restoring into isolated copies and checking named data. PostgreSQL WAL archiving adds point-in-time recovery into a new database. RabbitMQ restores definitions, not queued messages; structural drills do not prove a real restore."},
      {"title": "Panel self-backup and backup policies", "text": "Back up panel state and encryption keys, schedule database and volume recovery points, and manage retention and off-site replicas. Recovery documentation separates restore success from cleanup and verification results."},
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
        text: "Dynamic routing with IP allowlists, rate limits, basic auth, redirects and custom headers. Traefik owns 80/443; the panel first-boot port and explicitly published service or database ports need their own access policy.",
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
        text: "Remote hosts advertise their agent version and capabilities. Updated nodes support Docker and Compose, Nixpacks/Railpack builds, private clones and volumes. Each node has its own Traefik; PM2 remains on the panel host.",
      },
      {
        title: "Topology view",
        text: "Interactive diagrams of services, databases and routes, with live inspectors and one-click endpoint copying.",
      },
      {
        title: "Cloud nodes and private networking",
        text: "Provision nodes on Hetzner Cloud, DigitalOcean or Vultr. SSH bootstrap can enroll an agent over Tailscale or Headscale with its listener on the private tailnet. Provider guides state image, region, permission and deletion boundaries.",
      },
      {"title": "Service-domain controls", "text": "Maintenance mode, custom error pages, panel sign-in through forward auth, sticky sessions and path routes apply on supported runtimes. The generated capability matrix explains refusals before settings are saved."},
      {"title": "Uptime monitors and status pages", "text": "Configure monitors and public status pages alongside resource alerts. Operators can investigate failures with the configured AI provider; integrations remain optional."},
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
        text: "Argon2id, passkeys (WebAuthn), TOTP, OIDC and SAML sign-in, account-linking controls and lockouts. An optional panel IP allowlist protects sessions and can also restrict API and remote-MCP tokens.",
      },
      {
        title: "Pinned Git SSH host keys",
        text: "Opt in per deploy-key source: a successful panel clone learns the Git host's keys and later clones refuse a changed key. Disabling pinning or resetting keys requires an interactive password re-check and is audited.",
      },
      {
        title: "Secrets vault",
        text: "AES-256-GCM with a rotatable master-key ring. Resolve Infisical, Doppler, Vault/OpenBao, AWS, GCP, Azure, 1Password or an operator-configured command at deploy time, with each provider's documented network policy.",
      },
      {
        title: "Alerts and notifications",
        text: "Rules on CPU, memory, disk, cert expiry and offline nodes, delivered to Telegram, Discord, Slack, Microsoft Teams, ntfy, SMTP, Resend or webhooks. Password resets and invitations can use Resend, with SMTP preferred when both are configured.",
      },
      {
        title: "Log drains and audit",
        text: "Forward and search shipped logs, export Prometheus or OTLP/HTTP metrics, track Sentry-compatible error events, and inspect usage and cost. Audit history records sensitive operations. Integrations and retention remain operator-configurable.",
      },
      {
        title: "Plugins on a microkernel",
        text: "An event bus, hook pipeline, config center and menu registry; write plugins against @ninedeploy/plugin-sdk.",
      },
      {"title": "Remote MCP with OAuth", "text": "Connect AI clients over HTTP using OAuth 2.1 or scoped API tokens, or run the local stdio server. Tools use the same role, scope, 2FA and IP checks as direct API requests. Inspection agents can use read-only mode."},
      {"title": "AI diagnosis and proposed fixes", "text": "Use Claude or an OpenAI-compatible provider for failed-deploy diagnosis, sanitized log analysis, alert investigations and manifest suggestions. Review proposed changes before applying them; operators configure the provider and encrypted API key."},
      {"title": "Instance GitOps, import and desktop", "text": "Review configuration drift and apply or write back changes with instance GitOps. Plan and apply imports from other self-hosted platforms, then migrate supported database contents. A desktop client, translated panel and template mirrors extend the platform."},
      {"title": "First-boot HTTPS and stable updates", "text": "Set --domain and --email during installation, create the first admin with a one-time setup token, and choose the stable update channel when wanted. Keep port 3000 reachable from Docker; use an upstream firewall to block public access once HTTPS routing is ready."},
      {
        title: "Every interface",
        text: `Web dashboard with a ⌘K palette, the ninedeploy CLI, a typed REST SDK, an authenticated OpenAPI 3.1 document, and ${site.stats.mcpTools} MCP tools including generated read-only tools and API search.`,
      },
    ],
  },
];
