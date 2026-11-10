// Stable public URLs for the product's canonical guides. Other Markdown guides
// are discovered from the same immutable Git tree, including dated records.
export const guideRoutes = {
  'README.md': ['introduction', 'Start', 'Introduction'],
  'ARCHITECTURE.md': ['architecture', 'Reference', 'Architecture'],
  'docs/README.md': ['guide-index', 'Start', 'Guide index'],
  'docs/QUICKSTART.md': ['installation', 'Start', 'Installation & upgrades'],
  'docs/SUPPORT_MATRIX.md': ['support-matrix', 'Start', 'Runtime support matrix'],
  'docs/TROUBLESHOOTING.md': ['troubleshooting', 'Start', 'Troubleshooting'],
  'docs/IMPORTING.md': ['importing', 'Start', 'Moving to NineDeploy'],
  'docs/DEPLOYMENTS.md': ['deploy-pipeline', 'Core', 'Deployments & delivery'],
  'docs/DATABASES_BACKUPS.md': ['databases', 'Core', 'Databases & backups'],
  'docs/RESTORE_VERIFICATION.md': ['restore-verification', 'Core', 'Restore verification & PITR'],
  'docs/PANEL_BACKUP.md': ['panel-backup', 'Core', 'Panel self-backup'],
  'docs/MULTI_NODE.md': ['multi-server', 'Core', 'Remote nodes & build placement'],
  'docs/NODE_OPERATIONS.md': ['node-operations', 'Core', 'Node operations'],
  'docs/TRAEFIK_INGRESS.md': ['ingress-traefik-tunnels', 'Core', 'Ingress, routing & tunnels'],
  'docs/GITHUB_APP.md': ['github-apps', 'Core', 'GitHub Apps'],
  'docs/CI_RUNNERS.md': ['ci-runners', 'Core', 'CI on your own runners'],
  'docs/NINEDEPLOY_MANIFEST.md': ['ninedeploy-manifest', 'Core', 'The .ninedeploy manifest'],
  'docs/PRIVATE_REPO_GUIDE.md': ['private-repos', 'Core', 'Private repositories'],
  'docs/OBSERVABILITY.md': ['observability', 'Core', 'Metrics, logs & error tracking'],
  'docs/UPTIME.md': ['uptime', 'Core', 'Uptime monitors & status pages'],
  'docs/SECURITY_SSO.md': ['security-sso', 'Security', 'Security & single sign-on'],
  'docs/SSO_ACCOUNT_LINKING.md': ['sso-account-linking', 'Security', 'SSO account linking'],
  'docs/WORKSPACES_RBAC.md': ['workspaces-rbac', 'Security', 'Workspaces, roles & access'],
  'docs/SECRET_MANAGERS.md': ['secret-managers', 'Security', 'Secret managers'],
  'docs/TERMINALS.md': ['terminals', 'Interfaces', 'Interactive terminals'],
  'docs/AI_MCP_CLI.md': ['mcp', 'Interfaces', 'API, MCP, CLI & SDK'],
  'docs/AI.md': ['ai-assistant', 'Interfaces', 'AI assistant'],
  'docs/DESKTOP.md': ['desktop', 'Interfaces', 'Desktop client'],
  'docs/PLUGINS_MICROKERNEL.md': ['microkernel', 'Extend', 'Plugins & microkernel'],
  'docs/INSTANCE_GITOPS.md': ['instance-gitops', 'Extend', 'Instance GitOps'],
  'docs/TEMPLATE_MIRRORS.md': ['template-mirrors', 'Extend', 'Template mirrors'],
  'docs/TRANSLATIONS.md': ['translations', 'Reference', 'Interface translations'],
  'docs/MACOS_DEVELOPMENT.md': ['macos-development', 'Reference', 'Developing on macOS'],
};

// Existing incoming URLs remain valid; these use the current complete guide.
export const guideAliases = {
  'upgrade-guide': 'installation', 'build-placement': 'multi-server',
  'docker-swarm': 'deploy-pipeline', 'ssh-host-keys': 'private-repos',
  'traffic-analytics': 'ingress-traefik-tunnels', 'database-access-import': 'databases',
  'volumes-storage': 'databases', 'tags-projects-labels': 'workspaces-rbac',
  'alerts-notifications': 'observability', 'cli': 'mcp', 'api': 'mcp',
  'config-center': 'microkernel', 'plugin-sdk': 'microkernel', 'configuration': 'architecture',
};

export function describeGuide(path, markdown) {
  const route = guideRoutes[path];
  const record = /(?:AUDIT|ROADMAP|\/plans\/|COMPETITIVE_DELIVERY|SWARM_RUNTIME_ACCEPTANCE|NODE_RPS_AUTOSCALING|NODE_SLEEP_WAKE)/.test(path);
  const slug = route?.[0] ?? path.replace(/^docs\//, '').replace(/\.md$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const title = route?.[2] ?? /^# (.+)$/m.exec(markdown)?.[1]?.replace(/[*`]/g, '') ?? slug;
  return { slug, title, group: route?.[1] ?? (record ? 'Project records' : 'Reference'), record, source: path,
    description: record ? 'Dated project evidence or work in progress. This is not a promise of released runtime support.' : `The complete upstream guide to ${title.toLowerCase()}, synchronized with the product repository.`, markdown };
}

export function canonicalInstall(markdown) {
  return markdown.replace(/https:\/\/raw\.githubusercontent\.com\/ninedeploy\/ninedeploy\/main\/install\.sh/gi, 'https://ninedeploy.com/install.sh');
}
