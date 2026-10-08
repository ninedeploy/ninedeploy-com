import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Published as plain files on GitHub Pages (see .github/workflows/deploy.yml).
  output: "export",
  // Emit /docs/index.html rather than /docs.html: GitHub Pages resolves a
  // directory like /docs/ before a sibling .html file, so this keeps both
  // /docs and /docs/mcp working.
  trailingSlash: true,
  images: { unoptimized: true },
  // No Cache Components: a static export has no server to stream from, and its
  // segment rules forbid the force-static the exported route handlers need.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
