const iterations = 1000000;
const defaultRuns = 5;

function measureTime(name, fn) {
  const start = performance.now();
  fn();
  const end = performance.now();
  return end - start;
}

async function measureTimeAsync(name, fn) {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
}

function runNTimes(name, fn, runs = defaultRuns) {
  fn();
  const times = [];
  for (let i = 0; i < runs; i++) {
    times.push(measureTime(name, fn));
  }
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  console.log(`${name}: avg ${avg.toFixed(2)}ms (${runs} runs)`);
  return avg;
}

async function runNTimesAsync(name, fn, runs = defaultRuns) {
  await fn();
  const times = [];
  for (let i = 0; i < runs; i++) {
    times.push(await measureTimeAsync(name, fn));
  }
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  console.log(`${name}: avg ${avg.toFixed(2)}ms (${runs} runs)`);
  return avg;
}

function jsonParseStringify() {
  const data = { name: "test", value: 123, nested: { a: 1, b: 2, c: [1, 2, 3] } };
  for (let i = 0; i < iterations; i++) {
    JSON.parse(JSON.stringify(data));
  }
}

function arrayOperations() {
  const arr = [];
  for (let i = 0; i < iterations; i++) {
    arr.push(i);
  }
  arr.map(x => x * 2);
  arr.filter(x => x % 2 === 0);
  arr.reduce((acc, x) => acc + x, 0);
}

function objectCreation() {
  for (let i = 0; i < iterations; i++) {
    const obj = { id: i, name: `item_${i}`, data: [1, 2, 3] };
  }
}

function stringOperations() {
  let str = "";
  for (let i = 0; i < iterations / 10; i++) {
    str += `item_${i}_`;
  }
  str.split("_").join("-");
}

async function asyncOperations() {
  const promises = [];
  for (let i = 0; i < 1000; i++) {
    promises.push(Promise.resolve(i));
  }
  return Promise.all(promises);
}

async function cryptoHashing() {
  const crypto = globalThis.crypto || (typeof require !== 'undefined' && require('crypto').webcrypto);
  const encoder = new TextEncoder();
  for (let i = 0; i < 10000; i++) {
    const data = encoder.encode(`hash_test_${i}`);
    await crypto.subtle.digest("SHA-256", data);
  }
}
/* Crypto: serial latency (await in loop), not throughput; see thesis for interpretation */

async function main() {
  console.log("=== Benchmark de Performance ===\n");
  console.log(`Runtime: ${typeof Bun !== 'undefined' ? 'Bun ' + Bun.version :
    typeof Deno !== 'undefined' ? 'Deno ' + Deno.version.deno :
      'Node.js ' + process.version}`);
  console.log(`Iterações: ${iterations.toLocaleString()}`);
  console.log(`Execuções por categoria: ${defaultRuns} (com warm-up)\n`);

  const results = {};
  results.jsonParseStringify = runNTimes("JSON Parse/Stringify", jsonParseStringify);
  results.arrayOperations = runNTimes("Array Operations", arrayOperations);
  results.objectCreation = runNTimes("Object Creation", objectCreation);
  results.stringOperations = runNTimes("String Operations", stringOperations);
  results.asyncOperations = await runNTimesAsync("Async Operations (1k Promise.all)", asyncOperations);
  results.cryptoHashing = await runNTimesAsync("Crypto SHA-256", cryptoHashing);

  console.log("\n=== Resultados JSON ===");
  console.log(JSON.stringify(results, null, 2));
}

main();
