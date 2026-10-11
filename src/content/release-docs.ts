import type { Doc } from "./docs";

export const releaseDocs: Doc[] = [
  {
    slug: "build-placement",
    title: "Build placement & image transfer",
    description: "Build where the workload runs, on the panel or on a dedicated build server.",
    group: "Core",
    source: "MULTI_NODE.md",
    blocks: [
      { kind: "h2", text: "Choose where to build" },
      { kind: "p", text: "Service → Settings selects build placement: the runtime host (default), the panel, or a build server. Operators mark a node as a build server and set its concurrency under Servers. Building on the panel keeps private-repository credentials off runtime nodes." },
      { kind: "h2", text: "Deliver the image" },
      { kind: "list", items: [
        "The default path transfers the built image through the panel over a sealed, checksum-verified agent channel. Operators can bind a push registry instead, so hosts pull the image by digest.",
        "A failed build or image transfer stops before cutover and leaves the running service serving. Transfer history appears on the service and deployment.",
        "Image transfer needs agent v0.15.2 or newer. Managed node databases need v0.15.3, and KeyDB/Dragonfly on nodes need v0.15.6.",
      ] },
      { kind: "h2", text: "Build packs on nodes" },
      { kind: "p", text: "Nixpacks and Railpack run on agents from v0.15.2. Use v0.15.5 or newer for the Railpack preflight that explains a missing containerd image store. Enable that store, configure NINEDEPLOY_AGENT_BUILDKIT_HOST, or build on another host. Node owners can disable builds with NINEDEPLOY_AGENT_BUILDS=off." },
      { kind: "callout", tone: "warn", title: "Nixpacks and pushed images", text: "A Nixpacks service with a push registry and secret env values, attached-database credentials or vault references is refused because its build environment is baked into the image. Choose Dockerfile or Railpack, remove those build values, or clear the push registry. A Nixpacks build on a build server also leaves its build environment in that host's image until the next deploy." },
      { kind: "code", body: "ninedeploy servers roles\nninedeploy services placement\nninedeploy services transfers" },
    ],
  },
  {
    slug: "docker-swarm",
    title: "Docker Swarm",
    description: "Opt-in orchestration for Docker services, with rolling updates and replicas.",
    group: "Core",
    source: "MULTI_NODE.md",
    blocks: [
      { kind: "h2", text: "Enable deliberately" },
      { kind: "p", text: "Swarm is off until an operator initializes it on the panel, confirms with an interactive password re-check, and enables it. Each node needs agent v0.15.4 or newer and NINEDEPLOY_AGENT_SWARM_MANAGER=<panel-address>:2377 to opt in. Set the Docker service's orchestrator to swarm and deploy; existing services keep their container runtime." },
      { kind: "h2", text: "Updates and routing" },
      { kind: "list", items: [
        "One stack per service applies the image, env, replicas and limits on every deploy. Updates are rolling and start-first; a failed Traefik probe triggers rollback.",
        "Only nodes joined through the panel receive NineDeploy tasks. Images arrive by registry digest or sealed image transfer before a node gets tasks.",
        "Traefik is the public entry point; workload ports are not published on the Swarm ingress mesh. Overlay networks are encrypted.",
        "Between Swarm hosts, allow 2377/tcp, 7946/tcp and udp, 4789/udp and ESP (IP protocol 50), restricted to the cluster. Encrypted overlays do not support Windows nodes.",
      ] },
      { kind: "h2", text: "Supported scope" },
      { kind: "p", text: "Swarm does not accept Compose, PM2, node-pinned services, volumes, Docker socket mounts, published host ports, managed databases, fan-out targets or multiline env values. PR previews use ordinary containers. Swarm cannot express memory-swap caps or CPU shares. Read the multi-node rollback runbook before reverting to a pre-Swarm panel." },
      { kind: "code", body: "ninedeploy swarm status\nninedeploy services swarm\n\n# SDK: placement, image transfers, Swarm and server roles\n# MCP inspection: get_service_placement, list_image_transfers,\n# get_service_swarm, get_swarm_status" },
    ],
  },
  {
    slug: "ssh-host-keys",
    title: "Git SSH host-key pinning",
    description: "Remember a Git host's SSH keys across panel deploys and refuse unexpected changes.",
    group: "Security",
    source: "PRIVATE_REPO_GUIDE.md",
    blocks: [
      { kind: "h2", text: "Opt in per source" },
      { kind: "p", text: "Enable Sources → Pin git host keys on an SSH deploy-key source. Pinning starts off for existing sources. The first successful clone learns the host keys, and later panel clones refuse a changed key with pinned host key changed in the deploy log. The panel displays fingerprints, never the raw keys." },
      { kind: "code", body: "ninedeploy sources pin-host-keys <id> on\nninedeploy sources host-keys <id>\nninedeploy sources reset-host-keys <id>" },
      { kind: "h2", text: "Rotation and scope" },
      { kind: "p", text: "Disabling pinning or resetting keys allows a changed key through, so both require an interactive password re-check (or a recent SSO sign-in) and are audited. The next successful clone after reset learns the new keys. Pinning covers panel clones with the deploy key; remote-node clones retain their per-job host-key policy." },
      { kind: "h2", text: "CI deploy outcomes" },
      { kind: "p", text: "From v0.15.8, ninedeploy deploys watch exits 1 after a failed or cancelled deploy, so a following shell command joined with && does not run. If deployment status cannot be read, it keeps the previous exit-0 behavior; inspect status explicitly when your automation needs certainty." },
    ],
  },
];
