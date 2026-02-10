const isWin = typeof process !== "undefined" ? process.platform === "win32" : (typeof Deno !== "undefined" && Deno.build?.os === "windows");
const PAYLOADS = isWin
  ? ["& echo hacked", "| echo hacked"]
  : ["; echo hacked", "&& echo hacked", "| echo hacked"];
const SAFE_PREFIX = "SAFE";

function runtimeName() {
  if (typeof Bun !== "undefined") return "Bun";
  if (typeof Deno !== "undefined") return "Deno";
  return "Node.js";
}

async function testNodeUnsafe(input) {
  const { exec } = require("child_process");
  return new Promise((resolve) => {
    exec(`echo ${SAFE_PREFIX} ${input}`, { shell: true }, (_, stdout) => resolve({ stdout: (stdout || "").trim() }));
  });
}

async function testNodeSafe(input) {
  const { execFile } = require("child_process");
  const cmd = isWin ? "cmd" : "echo";
  const args = isWin ? ["/c", "echo", SAFE_PREFIX, input] : [SAFE_PREFIX, input];
  return new Promise((resolve) => {
    execFile(cmd, args, (_, stdout) => resolve({ stdout: (stdout || "").trim() }));
  });
}

async function testBunUnsafe(input) {
  const shell = isWin ? "cmd.exe" : "sh";
  const args = isWin ? ["/c", `echo ${SAFE_PREFIX} ${input}`] : ["-c", `echo ${SAFE_PREFIX} ${input}`];
  const proc = Bun.spawn([shell, ...args], { stdout: "pipe" });
  const text = await new Response(proc.stdout).text();
  return { stdout: text.trim() };
}

async function testBunSafe(input) {
  const cmd = isWin ? "cmd.exe" : "echo";
  const args = isWin ? ["/c", "echo", SAFE_PREFIX, input] : [SAFE_PREFIX, input];
  const proc = Bun.spawn([cmd, ...args], { stdout: "pipe" });
  const text = await new Response(proc.stdout).text();
  return { stdout: text.trim() };
}

async function testDenoUnsafe(input) {
  const shell = isWin ? "cmd" : "sh";
  const args = isWin ? ["/c", `echo ${SAFE_PREFIX} ${input}`] : ["-c", `echo ${SAFE_PREFIX} ${input}`];
  const out = await new Deno.Command(shell, { args }).output();
  const stdout = new TextDecoder().decode(out.stdout).trim();
  return { stdout };
}

async function testDenoSafe(input) {
  const shell = isWin ? "cmd" : "echo";
  const args = isWin ? ["/c", "echo", SAFE_PREFIX, input] : [SAFE_PREFIX, input];
  const out = await new Deno.Command(shell, { args }).output();
  const stdout = new TextDecoder().decode(out.stdout).trim();
  return { stdout };
}

const injected = (s) => s.trim().endsWith("hacked") || /\nhacked\r?\n?$/.test(s) || s.trim() === "hacked";

async function runTests() {
  const r = runtimeName();
  const out = { runtime: r, payloads: PAYLOADS, tests: [] };
  let unsafeRun, safeRun;
  if (r === "Node.js") { unsafeRun = testNodeUnsafe; safeRun = testNodeSafe; }
  else if (r === "Bun") { unsafeRun = testBunUnsafe; safeRun = testBunSafe; }
  else { unsafeRun = testDenoUnsafe; safeRun = testDenoSafe; }

  let anyUnsafeVuln = false;
  let anySafeVuln = false;
  for (const payload of PAYLOADS) {
    const u = await unsafeRun(payload);
    const s = await safeRun(payload);
    const uV = injected(u.stdout);
    const sV = injected(s.stdout);
    if (uV) anyUnsafeVuln = true;
    if (sV) anySafeVuln = true;
    out.tests.push({ payload, api: "unsafe (shell)", vulnerable: uV, stdout: u.stdout });
    out.tests.push({ payload, api: "safe (array)", vulnerable: sV, stdout: s.stdout });
  }
  out.unsafeVulnerable = anyUnsafeVuln;
  out.safeVulnerable = anySafeVuln;
  return out;
}

runTests().then((out) => console.log(JSON.stringify(out, null, 2)));
