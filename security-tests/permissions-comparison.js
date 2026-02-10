const FLAGS = { filesystem: "--allow-read", network: "--allow-net", env: "--allow-env" };

async function run() {
  const r = typeof Bun !== "undefined" ? "Bun" : typeof Deno !== "undefined" ? "Deno" : "Node.js";
  const out = { runtime: r, filesystem: null, network: null, env: null };

  try {
    if (r === "Deno") await Deno.readTextFile("./nonexistent-perm-test.txt");
    else if (r === "Bun") await Bun.file("./nonexistent-perm-test.txt").text();
    else await require("fs").promises.readFile("./nonexistent-perm-test.txt");
    out.filesystem = "allowed";
  } catch (e) {
    out.filesystem = e.name === "PermissionDenied" ? "blocked" : (e.code === "ENOENT" || e.code === "ENOTFOUND" ? "allowed" : (e.code || e.name));
    if (e.name === "PermissionDenied" && r === "Deno") out.filesystemBlockedBy = FLAGS.filesystem;
  }

  try {
    await fetch("https://example.com", { signal: AbortSignal.timeout(5000) });
    out.network = "allowed";
  } catch (e) {
    out.network = e.name === "PermissionDenied" ? "blocked" : e.name;
    if (e.name === "PermissionDenied" && r === "Deno") out.networkBlockedBy = FLAGS.network;
  }

  try {
    r === "Deno" ? Deno.env.get("PATH") : process.env.PATH;
    out.env = "allowed";
  } catch (e) {
    out.env = e.name === "PermissionDenied" ? "blocked" : e.name;
    if (e.name === "PermissionDenied" && r === "Deno") out.envBlockedBy = FLAGS.env;
  }

  console.log(JSON.stringify(out, null, 2));
}
run();
