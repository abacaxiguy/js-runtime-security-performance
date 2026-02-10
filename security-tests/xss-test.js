const PAYLOADS = [
  "<script>alert(1)</script>",
  "<img src=x onerror=alert(1)>",
  "<div>${alert(1)}</div>"
];

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderUnsafe(input) {
  return `<div>${input}</div>`;
}

function renderSafe(input) {
  return `<div>${escapeHtml(input)}</div>`;
}

function hasScript(html) {
  return /<script\b/i.test(html) || /<[^>]*\son\w+\s*=/i.test(html);
}

const runtime = typeof Bun !== "undefined" ? "Bun" : typeof Deno !== "undefined" ? "Deno" : "Node.js";
const results = { runtime, tests: [] };
for (const payload of PAYLOADS) {
  const unsafe = renderUnsafe(payload);
  const safe = renderSafe(payload);
  results.tests.push({
    payload: payload.slice(0, 40),
    unsafeVulnerable: hasScript(unsafe),
    safeVulnerable: hasScript(safe),
    unsafeSnippet: unsafe.slice(0, 60),
    safeSnippet: safe.slice(0, 60)
  });
}
console.log(JSON.stringify(results, null, 2));
