# ninedeploy.com

The website for [NineDeploy](https://github.com/ninedeploy/ninedeploy), published to GitHub Pages at [ninedeploy.com](https://ninedeploy.com).

```bash
pnpm install
pnpm dev     # http://localhost:3000
pnpm build   # static site in out/
```

Pushing to `main` deploys it via `.github/workflows/deploy.yml`, which also publishes a copy of the product repo's `install.sh` as [ninedeploy.com/install.sh](https://ninedeploy.com/install.sh) (`pnpm installer`).

Template and changelog data come from the product repo:

```bash
node scripts/sync-content.mjs <path-to-ninedeploy-clone>
```
