# JavaScript Runtime Security and Performance Evaluation

This repository contains the experimental artifacts used in an undergraduate Computer Science thesis focused on **security and performance analysis of modern JavaScript runtimes**: **Node.js**, **Deno**, and **Bun**.

The goal of this repository is **reproducibility**. All scripts correspond directly to the experiments described in **Chapter 5** of the thesis and are designed to be executed under controlled conditions.

---

## 1. Research Context

Modern JavaScript runtimes have evolved beyond simple execution engines and now embed security models, permission systems, and runtime-specific APIs that may significantly impact both **performance** and **attack surface**.

This work evaluates:
- Performance trade-offs between runtimes
- Security guarantees provided by default configurations
- Practical implications of runtime design decisions

This repository **does not aim to discover new vulnerabilities**, but to **empirically evaluate known classes of weaknesses and protections** across runtimes using reproducible experiments.

---

## 2. Repository Structure

```text
scripts/
├── benchmarks/
│   ├── benchmark.js              # CPU benchmarks (warm-up + 5 runs)
│   └── http-benchmark.js          # HTTP benchmark (1k req × 3 runs)
│
├── security-tests/
│   ├── command-injection-test.js
│   ├── dependency-audit.js
│   ├── ssrf-test.js
│   ├── xss-test.js
│   ├── prototype-pollution-test.js
│   └── permissions-comparison.js
│
├── bun/                           # HTTP test server (Bun)
├── node/                          # HTTP test server (Node.js)
└── deno/                          # HTTP test server (Deno)
```

Each script is self-contained and prints its results to stdout for transparency and traceability.

---

## 3. Experimental Design

### 3.1 Performance Benchmarks

**CPU benchmarks**
- JSON parsing
- Array operations
- Object manipulation
- String processing
- Async operations
- Cryptographic hashing (SHA-256)

Each benchmark:
- Includes a warm-up phase
- Executes 5 independent runs
- Reports averaged results

**HTTP benchmark**
- Identical server logic per runtime
- 1000 sequential requests per run
- 3 runs per runtime
- Localhost execution to minimize network noise

### 3.2 Security Experiments

The security tests cover **well-documented vulnerability classes** and **runtime-level mitigations**:

| Test | Description |
|----|----|
| Command Injection | Shell execution vs argument array APIs |
| Dependency Audit | Known vulnerable packages and audit tooling |
| SSRF | Internal network access and metadata endpoints |
| XSS | Contextual output encoding and sanitization |
| Prototype Pollution | Object merging edge cases |
| Permissions | Filesystem, network, environment access |

The tests are intentionally **controlled and minimal**, focusing on runtime behavior rather than application complexity.

---

## 4. Requirements

| Runtime | Version Tested | Install |
|------|---------------|--------|
| Bun | 1.2.x | https://bun.sh |
| Node.js | 23.x (18+) | https://nodejs.org |
| Deno | 2.6.x (1.40+) | https://deno.land |

Experiments were conducted on **Windows 11**. Results may vary depending on hardware and OS.

---

## 5. How to Run

### 5.1 Clone Repository

```bash
git clone https://github.com/abacaxiguy/js-runtime-security-performance.git
cd js-runtime-security-performance
```

### 5.2 Start HTTP Servers

```bash
cd scripts/bun && bun run server.ts
cd scripts/node && node server.js
cd scripts/deno && deno run --allow-net server.ts
```

### 5.3 Run Benchmarks

CPU benchmarks:
```bash
bun run scripts/benchmarks/benchmark.js
node scripts/benchmarks/benchmark.js
deno run scripts/benchmarks/benchmark.js
```

HTTP benchmarks:
```bash
bun run scripts/benchmarks/http-benchmark.js
```

### 5.4 Run Security Tests

Command Injection:
```bash
node scripts/security-tests/command-injection-test.js
bun run scripts/security-tests/command-injection-test.js
deno run --allow-run scripts/security-tests/command-injection-test.js
```

SSRF:
```bash
node scripts/security-tests/ssrf-test.js
bun run scripts/security-tests/ssrf-test.js
deno run --allow-net scripts/security-tests/ssrf-test.js
```

Prototype Pollution:
```bash
node scripts/security-tests/prototype-pollution-test.js
bun run scripts/security-tests/prototype-pollution-test.js
deno run scripts/security-tests/prototype-pollution-test.js
```

Permissions:
```bash
node scripts/security-tests/permissions-comparison.js
bun run scripts/security-tests/permissions-comparison.js
deno run scripts/security-tests/permissions-comparison.js
deno run --allow-read --allow-net --allow-env scripts/security-tests/permissions-comparison.js
```

---

## 6. Reproducibility

- All experiments reference a **specific commit hash** in the thesis
- No external services are required
- Network tests are restricted to localhost and well-known metadata IPs
- Scripts are deterministic except for runtime scheduling noise

---

## 7. Limitations

- Tests are not exhaustive security audits
- Results are environment-dependent
- Performance benchmarks focus on runtime-level behavior, not real-world frameworks

These limitations are discussed explicitly in the thesis.

---

## 8. License

MIT License.

This repository is intended for **academic and research use**, but the license permits reuse with attribution.
