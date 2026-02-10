const totalRequests = 1000;
const concurrency = 10;
const benchmarkRuns = 3;

async function makeRequest(url) {
  const start = performance.now();
  try {
    const response = await fetch(url);
    await response.json();
    return performance.now() - start;
  } catch (error) {
    return -1;
  }
}

async function runBenchmarkOnce(url, name) {
  const times = [];
  const batchSize = concurrency;
  const batches = Math.ceil(totalRequests / batchSize);
  const overallStart = performance.now();

  for (let i = 0; i < batches; i++) {
    const promises = [];
    for (let j = 0; j < batchSize && (i * batchSize + j) < totalRequests; j++) {
      promises.push(makeRequest(url));
    }
    const batchTimes = await Promise.all(promises);
    times.push(...batchTimes.filter(t => t > 0));
  }

  const totalTime = performance.now() - overallStart;
  const successfulRequests = times.length;
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const requestsPerSecond = (successfulRequests / totalTime) * 1000;
  times.sort((a, b) => a - b);
  const p50 = times[Math.floor(times.length * 0.5)];
  const p95 = times[Math.floor(times.length * 0.95)];
  const p99 = times[Math.floor(times.length * 0.99)];

  return {
    successfulRequests,
    totalTime,
    requestsPerSecond,
    avgTime,
    p50,
    p95,
    p99
  };
}

async function runBenchmark(url, name) {
  console.log(`\nTestando ${name} em ${url} (${benchmarkRuns} execuções)...`);
  const runs = [];
  for (let r = 0; r < benchmarkRuns; r++) {
    runs.push(await runBenchmarkOnce(url, name));
  }
  const avgReqPerSec = runs.reduce((a, b) => a + b.requestsPerSecond, 0) / benchmarkRuns;
  const avgLatency = runs.reduce((a, b) => a + b.avgTime, 0) / benchmarkRuns;
  const avgP50 = runs.reduce((a, b) => a + b.p50, 0) / benchmarkRuns;
  const avgP95 = runs.reduce((a, b) => a + b.p95, 0) / benchmarkRuns;
  const avgP99 = runs.reduce((a, b) => a + b.p99, 0) / benchmarkRuns;

  console.log(`  Req/s (média): ${avgReqPerSec.toFixed(2)}`);
  console.log(`  Latência média: ${avgLatency.toFixed(2)}ms`);
  console.log(`  P50: ${avgP50?.toFixed(2)}ms | P95: ${avgP95?.toFixed(2)}ms | P99: ${avgP99?.toFixed(2)}ms`);

  return {
    name,
    requestsPerSecond: avgReqPerSec,
    avgTime: avgLatency,
    p50: avgP50,
    p95: avgP95,
    p99: avgP99,
    runs
  };
}

async function main() {
  console.log("=== Benchmark HTTP - Comparação de Runtimes ===");
  console.log(`Total de requisições por execução: ${totalRequests}`);
  console.log(`Concorrência: ${concurrency}`);
  console.log(`Execuções por runtime: ${benchmarkRuns}`);

  const results = [];

  try {
    results.push(await runBenchmark("http://localhost:3000/users", "Bun"));
  } catch (e) {
    console.log("Bun server não disponível");
  }

  try {
    results.push(await runBenchmark("http://localhost:3001/users", "Node.js"));
  } catch (e) {
    console.log("Node.js server não disponível");
  }

  try {
    results.push(await runBenchmark("http://localhost:3002/users", "Deno"));
  } catch (e) {
    console.log("Deno server não disponível");
  }

  console.log("\n=== Resumo Comparativo ===");
  console.log(JSON.stringify(results.map(r => ({ name: r.name, requestsPerSecond: r.requestsPerSecond, avgTime: r.avgTime, p50: r.p50, p95: r.p95, p99: r.p99 })), null, 2));
}

main();
