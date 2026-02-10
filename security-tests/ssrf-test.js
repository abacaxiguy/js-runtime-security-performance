const PORT = 4999;
const TARGETS = ["http://127.0.0.1:" + PORT, "http://localhost:" + PORT];

function getRuntime() {
  if (typeof Bun !== "undefined") return "Bun";
  if (typeof Deno !== "undefined") return "Deno";
  return "Node.js";
}

async function startServer() {
  const r = getRuntime();
  if (r === "Node.js") {
    const http = require("http");
    return new Promise((resolve) => {
      const s = http.createServer((_, res) => { res.writeHead(200); res.end("internal"); });
      s.listen(PORT, "127.0.0.1", () => resolve(s));
    });
  }
  if (r === "Bun") {
    const server = Bun.serve({
      port: PORT,
      fetch() { return new Response("internal"); }
    });
    return { close: () => server.stop() };
  }
  if (r === "Deno") {
    const server = Deno.serve({ port: PORT, hostname: "127.0.0.1" }, () => new Response("internal"));
    return { close: () => server.shutdown() };
  }
  return null;
}

async function probe(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(3000) });
    const body = await r.text();
    return { url, status: r.status, ok: r.ok, body: body.slice(0, 20), blocked: false };
  } catch (e) {
    return { url, blocked: e.name === "PermissionDenied", error: e.name };
  }
}

async function main() {
  const runtime = getRuntime();
  const server = await startServer();
  await new Promise((r) => setTimeout(r, 100));
  const results = { runtime, targets: [] };
  for (const url of TARGETS) {
    results.targets.push(await probe(url));
  }
  server.close();
  console.log(JSON.stringify(results, null, 2));
}

main().then(() => {}, (e) => console.log(JSON.stringify({ error: e.message })));
