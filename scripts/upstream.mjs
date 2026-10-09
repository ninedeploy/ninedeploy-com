import { readFile, mkdir, rename, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repository = "ninedeploy/ninedeploy";

async function download(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

// Resolve main once: every generated file and the installer use the same commit.
export async function openUpstream(localPath) {
  if (localPath) return { ref: null, read: (file) => readFile(join(localPath, file)) };
  const requestedRef = process.env.NINEDEPLOY_REF || "main";
  const commit = /^[a-f0-9]{40}$/i.test(requestedRef)
    ? requestedRef
    : JSON.parse((await download(`https://api.github.com/repos/${repository}/commits/${encodeURIComponent(requestedRef)}`)).toString("utf8")).sha;
  if (!/^[a-f0-9]{40}$/i.test(commit)) throw new Error("GitHub did not return a commit SHA");
  return { ref: commit, read: (file) => download(`https://raw.githubusercontent.com/${repository}/${commit}/${file}`) };
}

export function validateInstaller(bytes) {
  const body = bytes.toString("utf8");
  if (!body.startsWith("#!/usr/bin/env bash\n") || !body.includes("NineDeploy") || bytes.length < 10_000) {
    throw new Error(`install.sh: unexpected content (${bytes.length} bytes)`);
  }
  return createHash("sha256").update(bytes).digest("hex");
}

export async function publishInstaller(bytes) {
  const sha256 = validateInstaller(bytes);
  const target = join(root, "public/install.sh");
  await mkdir(dirname(target), { recursive: true });
  await writeFile(`${target}.tmp`, bytes);
  await rename(`${target}.tmp`, target);
  return sha256;
}
