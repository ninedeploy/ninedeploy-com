export const site = {
  name: "NineDeploy",
  url: "https://ninedeploy.com",
  version: "0.12.0",
  tagline: "Ship like you mean it.",
  description:
    "NineDeploy is a self-hosted PaaS for servers you own: zero-downtime blue-green deploys, managed databases, wildcard HTTPS, multi-server agents and an MCP server for AI agents — all in one SQLite file.",
  github: "https://github.com/ninedeploy/ninedeploy",
  changelogFull: "https://github.com/ninedeploy/ninedeploy/blob/main/CHANGELOG.md",
  // Served from this site, copied from the product repo on every deploy (scripts/fetch-installer.mjs).
  install: "curl -fsSL https://ninedeploy.com/install.sh | bash",
  installDocker: "curl -fsSL https://ninedeploy.com/install.sh | bash -s -- --docker",
  installerSource: "https://github.com/ninedeploy/ninedeploy/blob/main/install.sh",
  stats: {
    templates: 130,
    certified: 101,
    tables: 52,
    tests: 7991,
    mcpTools: 38,
    routeModules: 66,
    dbEngines: 9,
    cliCommands: 40,
  },
};

export const nav = [
  { href: "/features", label: "Features" },
  { href: "/templates", label: "Templates" },
  { href: "/docs", label: "Docs" },
  { href: "/changelog", label: "Changelog" },
  { href: "/faq", label: "FAQ" },
] as const;

export const oxog = {
  name: "OXOGNET OÜ",
  url: "https://oxog.net",
  siblings: [
    { name: "AGEZT", what: "An agentic operating system", href: "https://oxog.net/projects" },
    { name: "WrongStack", what: "AI coding orchestration", href: "https://oxog.net/projects" },
    { name: "WrongTrace", what: "Agent observability", href: "https://oxog.net/projects" },
    { name: "UWAS", what: "Unified web app server", href: "https://oxog.net/projects" },
  ],
};
