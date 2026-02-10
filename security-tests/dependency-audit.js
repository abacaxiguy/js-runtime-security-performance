const path = require("path");
const { execSync } = require("child_process");
const fs = require("fs");

const fixtureDir = path.join(__dirname, "audit-fixture");

function getRuntime() {
  if (typeof Bun !== "undefined") return "Bun";
  if (typeof Deno !== "undefined") return "Deno";
  return "Node.js";
}

function runNpmAudit(cwd) {
  try {
    return JSON.parse(execSync("npm audit --json", { cwd, encoding: "utf8", maxBuffer: 1024 * 1024 }));
  } catch (e) {
    if (e.stdout) return JSON.parse(e.stdout);
    throw e;
  }
}

function summarizeNpmAudit(data) {
  const m = data.metadata?.vulnerabilities || {};
  return { total: m.total ?? 0, critical: m.critical ?? 0, high: m.high ?? 0, moderate: m.moderate ?? 0, low: m.low ?? 0, info: m.info ?? 0 };
}

function main() {
  const runtime = getRuntime();
  const out = { runtime, fixtureDir, audit: null };

  if (!fs.existsSync(path.join(fixtureDir, "package.json"))) throw new Error("audit-fixture/package.json not found");

  if (!fs.existsSync(path.join(fixtureDir, "node_modules"))) {
    execSync("npm install", { cwd: fixtureDir, encoding: "utf8", stdio: "pipe" });
  }

  const auditResult = runNpmAudit(fixtureDir);
  out.audit = { tool: "npm audit --json", ...summarizeNpmAudit(auditResult) };
  out.fixtureDirRelative = "scripts/security-tests/audit-fixture";

  console.log(JSON.stringify(out, null, 2));
}

main();
