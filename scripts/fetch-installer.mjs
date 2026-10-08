// Copies the canonical installer from github.com/ninedeploy/ninedeploy into
// public/, so the static site serves it as https://ninedeploy.com/install.sh.
// The product repo stays the source of truth; this file is never committed.
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE = "https://raw.githubusercontent.com/ninedeploy/ninedeploy/main/install.sh";
const target = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "install.sh");

const res = await fetch(SOURCE);
if (!res.ok) throw new Error(`install.sh: ${SOURCE} answered ${res.status}`);
// Kept as raw bytes so the published file is identical to the repo's.
const bytes = Buffer.from(await res.arrayBuffer());
const body = bytes.toString("utf8");

// Refuse anything that isn't plainly the NineDeploy installer, rather than
// publishing an error page or a truncated download as a script people pipe to bash.
if (!body.startsWith("#!/usr/bin/env bash") || !body.includes("NineDeploy") || body.length < 10_000) {
  throw new Error(`install.sh: unexpected content from ${SOURCE} (${bytes.length} bytes)`);
}

await writeFile(target, bytes);
console.log(`install.sh: ${bytes.length} bytes from ${SOURCE}`);
