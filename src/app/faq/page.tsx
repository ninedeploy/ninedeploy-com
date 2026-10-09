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
    a: "NineDeploy is deliberately smaller and stricter: a single SQLite core with no external database, coverage floors enforced in CI across the whole monorepo, a typed-operation agent protocol instead of raw shell over the wire, digest-pinned rollbacks, and a microkernel plugin SDK. If you want a self-hosted PaaS that reads like an audited codebase, this is it.",
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
    a: `Everything is API-first: a scoped /v1 REST API with an authenticated OpenAPI 3.1 document, a typed SDK, the ninedeploy CLI and ${site.stats.mcpTools} MCP tools. Generated tools inspect traffic, grants, terminal history and more; search_api discovers operations without calling them. Existing tools can mutate. Pair NINEDEPLOY_MCP_READONLY=1 with a read-scoped token for inspection agents.`,
  },
  {
    q: "Which sign-in methods are supported?",
    a: "Passkeys (WebAuthn), OpenID Connect for Google, GitHub, Okta, Keycloak and custom providers, TOTP two-factor with replay protection, and Argon2id passwords with brute-force lockout.",
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
];

export default function FaqPage() {
  return (
    <div className="page-in">
      <PageHero title="Questions, answered." lede="The things people ask before they put NineDeploy on a real server." />
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_300px] lg:px-8">
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
