// Standalone refresh for local development. Builds use sync-content.mjs so
// content and installer are taken from one immutable upstream snapshot.
import { openUpstream, publishInstaller } from "./upstream.mjs";

const source = await openUpstream(process.argv[2]);
const bytes = await source.read("install.sh");
const sha256 = await publishInstaller(bytes);
console.log(`install.sh: ${bytes.length} bytes, sha256 ${sha256}, source ${source.ref ?? "local clone"}`);
