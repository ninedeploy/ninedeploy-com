import type { Metadata } from "next";
import Link from "next/link";
import { Accordion } from "@/components/accordion";
import { PageHero, Prose } from "@/components/page-hero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: "How NineDeploy compares to Dokploy and Coolify, why it only needs SQLite, how blue-green deploys work, and more.",
};

const faqs = [
  {
    q: "How is this different from Dokploy or Coolify?",
    a: "NineDeploy keeps panel state in SQLite and combines typed remote operations, isolated restore verification, PostgreSQL PITR, protected production lanes and remote MCP with the same access checks as the API. The support matrix states runtime limits. Compare those workflows against your needs; feature names alone do not establish parity with another platform.",
  },
  {
    q: "Does it really need only SQLite?",
    a: "Yes. Users, workspaces, services, deployments, metrics, alert rules and backup metadata all live in one .data directory with a single SQLite file. WAL is handled so backup tarballs and snapshots copy the database cleanly.",
  },
  {
    q: "Can I run it in Docker?",
    a: `Yes. The published image mounts the host Docker socket with a persistent /data volume. PM2 services need the systemd install because they run natively on the host; containers, Compose stacks and all ${site.stats.templates} hub templates work in both modes.`,
  },
  {
    q: "How does a zero-downtime blue-green deploy work?",
    a: "The new container is started and healthchecked on the internal network while the old one keeps serving. Traefik's routing flips only after the healthcheck passes, and the old container is retired two seconds later. If the healthcheck fails, the new container is removed and nothing about live traffic changes. Try it in the demo on the home page.",
  },
  {
    q: "How do multi-server agents stay secure?",
    a: "Remote agents accept a fixed table of typed operations — docker pull, build and run, compose up and down, git checkout, env injection. Requests never carry raw shell argv, every operand is regex-validated on both ends, and transport is sealed by default. Keep nodes on a private network: the agent transport has no TLS of its own.",
  },
  {
    q: "Is there an API, CLI and AI integration?",
    a: `Everything is API-first: a scoped /v1 REST API with an authenticated OpenAPI 3.1 document, a typed SDK, the ninedeploy CLI and ${site.stats.mcpTools} MCP tools. Connect remotely over HTTP with OAuth 2.1 or scoped API tokens, or use local stdio. Tools use the same role, scope, 2FA and IP checks as direct API calls. Pair NINEDEPLOY_MCP_READONLY=1 with a read-scoped token for inspection agents.`,
  },
  {
    q: "Can nodes build apps and host databases now?",
    a: "Yes. Updated agents support Nixpacks/Railpack, private clones and volumes from v0.15.2, databases from v0.15.3 and KeyDB/Dragonfly from v0.15.6. You can also build on the panel or a build server and transfer the image. Node databases attach to services on the same host; Studio, PgBouncer and public access remain unavailable there.",
  },
  {
    q: "Is Docker Swarm required?",
    a: "No. It starts off, and existing services keep their container runtime. Operators can opt Docker services into Swarm for rolling updates and replicas after initializing the manager and enrolling opted-in nodes. Compose, PM2, volumes and managed databases keep their separate runtimes.",
  },
  {
    q: "Does Git SSH host-key pinning cover remote clones?",
    a: "Pinning is optional per SSH deploy-key source and covers panel clones across deployments. A successful clone learns the host keys; later panel clones refuse a changed key. Remote nodes retain their per-job policy. Disabling pinning or resetting the keys requires an interactive password re-check.",
  },
  {
    q: "Which sign-in methods are supported?",
    a: "Passkeys (WebAuthn), OpenID Connect, SAML, controlled SSO account linking, TOTP two-factor and Argon2id passwords with brute-force lockout. Operators can enable a panel IP allowlist and optionally apply it to API and remote-MCP tokens.",
  },
  {
    q: "What happens to my data on upgrade?",
    a: "Re-running the installer is the upgrade path. It snapshots the SQLite database and encryption keys to `.data/upgrade-backups/` first, applies forward-only migrations, and only reports success once `/health` answers.",
  },
  {
    q: "Will heavy templates like n8n or Supabase run on a 1–2 GB VPS?",
    a: "The installer can configure swap on low-memory hosts, but that does not guarantee enough RAM for every template. Size the VPS for the application's own requirements, especially multi-service stacks such as Supabase.",
  },
  {
    q: "Can I use a GitHub App instead of a PAT?",
    a: "Yes. Register an App under Sources → GitHub Apps and select its installation in the Deploy Wizard. Clones use short-lived, repository-scoped tokens. Commit statuses and PR preview comments are opt-in; existing PAT services can migrate, finalize or revert their App link.",
  },
  {
    q: "Who can open terminals?",
    a: "Terminals require the instance-operator flag. Container and database shells support real TTYs, resize and session audits. Host shells start disabled and require an interactive session and a password re-check (or recent SSO authentication). Remote terminals require node agent v0.15.0 or newer. Session metadata is stored; commands and output are not.",
  },
  {
    q: "Does traffic analytics collect visitor details?",
    a: "It is off by default. When enabled, it aggregates requests, status classes and latency per domain and service. Traefik access logs omit client IP, path, query and headers. Minute rollups remain for 48 hours and hourly rollups for 30 days by default.",
  },
  {
    q: "Can guests access only one project or environment?",
    a: "Workspace admins can grant access to a project, an environment or their intersection. Grants raise access within that workspace, and guests see only matching resources. They never grant workspace administration or instance-operator privileges, and guests cannot create services or databases.",
  },
  {"q": "How do I create the first admin and enable HTTPS?", "a": "The installer prints a one-time setup token required by the first-admin form. Pass --domain panel.example.com --email you@example.com for an HTTPS panel domain from the first boot. Keep port 3000 reachable from Docker so Traefik can forward to the panel; block public access with a firewall in front of the host. --private selects loopback for a deliberate private setup."},
  {"q": "Which Linux and Node versions are supported?", "a": "The installer supports Debian/Ubuntu, RPM-based distributions, openSUSE/SLES and Arch-family hosts. Alpine uses Docker mode under OpenRC and needs bash and curl first. Bare-metal Node versions must satisfy the supported patch levels in the installation guide; Docker mode requires no host Node."},
  {"q": "Are canaries, autoscaling and scale to zero available everywhere?", "a": "No. Check the generated runtime support matrix. Node RPS scaling needs proxy traffic observation; a node canary needs a single replica and strict HTTP readiness. Node scale to zero is still being built. Swarm keeps configured replicas, skips canary logic for native rolling updates, and does not sleep."},
  {"q": "Do backup drills prove that I can restore?", "a": "Structural drills check archives; real restore verification loads a backup into an isolated copy and checks named data. Verification covers all eleven managed engines. PostgreSQL also supports point-in-time recovery into a new database. RabbitMQ backups contain definitions and topology, not queued messages."},
  {"q": "Can production deployments require approval?", "a": "Yes. Protected lanes can hide variables and logs while allowing members to deploy, require an admin approval for every deploy trigger, and apply deploy freezes. Required CI can run on your own enrolled runners."},
  {"q": "Does the AI assistant send my data outside the server?", "a": "AI features use the provider, model and encrypted API key configured by the operator. Sanitized logs and the relevant context are sent to that provider. Access is restricted, log context follows lane permissions, and proposed fixes require review before applying them."},
  {"q": "Can I track stable releases or edge code?", "a": "The default installs the newest published release. --channel stable follows the stable tag and fails clearly if none exists; the panel also exposes an update-channel setting. --channel main explicitly selects edge code. The changelog labels Unreleased changes separately."},
];

export default function FaqPage() {
  return (
    <div className="page-in">
      <PageHero title="Questions, answered." lede="The things people ask before they put NineDeploy on a real server." />
      <div className="site-container sidebar-layout sidebar-layout--trailing reading-flow section-compact">
        <Accordion items={faqs.map((f) => ({ q: f.q, a: <Prose text={f.a} /> }))} />
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-rail bg-panel p-6">
            <p className="heading text-2xl">Still unsure?</p>
            <p className="mt-2 text-muted">Read the architecture spec, or open an issue and ask the people who wrote it.</p>
            <div className="mt-5 flex flex-col gap-2">
              <Link href="/docs/introduction" className="rounded-full bg-ink px-5 py-2.5 text-center text-sm font-semibold text-bg">
                Read the docs
              </Link>
              <a
                href={`${site.github}/issues`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-rail px-5 py-2.5 text-center text-sm font-semibold hover:bg-bg-2"
              >
                Open an issue
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
