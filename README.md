# ninedeploy.com

The website for [NineDeploy](https://github.com/ninedeploy/ninedeploy), published to GitHub Pages at [ninedeploy.com](https://ninedeploy.com).

```bash
pnpm install
pnpm dev     # http://localhost:3000
pnpm build   # sync product content + installer, then export to out/
pnpm verify:export
```

Pushing to `main` deploys via `.github/workflows/deploy.yml`. The same workflow refreshes daily or through an `installer-updated` / `content-updated` repository dispatch. Every build resolves the product repo's `main` to a single commit and downloads its changelog, template registry, product metadata and installer from that snapshot. Failed downloads or invalid metadata stop the build.

The installer is copied byte for byte into `public/install.sh`, exported as [ninedeploy.com/install.sh](https://ninedeploy.com/install.sh), and checked against the snapshot's SHA-256 before deployment. The website's install command is:

```bash
curl -fsSL https://ninedeploy.com/install.sh | bash
curl -fsSL https://ninedeploy.com/install.sh | bash -s -- --docker
```

`pnpm sync:content` refreshes checked-in content and the local installer without building. `pnpm installer` refreshes only the installer for local development. Set `NINEDEPLOY_REF` to a tag or commit to build from a specific upstream version.

For offline content generation, use `node scripts/sync-content.mjs <path-to-ninedeploy-clone>` followed by `pnpm exec next build` and `pnpm verify:export`. The local clone must include the generated MCP spec tools. Hand-written docs and feature summaries should be reviewed against the product guides when features change; their text is not automatically regenerated.
