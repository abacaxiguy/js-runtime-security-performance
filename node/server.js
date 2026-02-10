const http = require('http');

const users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
  { id: 3, name: "Charlie", email: "charlie@example.com" }
];

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  res.setHeader('Content-Type', 'application/json');
  
  if (url.pathname === "/" && req.method === "GET") {
    res.writeHead(200);
    res.end(JSON.stringify({
      runtime: "Node.js",
      version: process.version,
      message: "API REST de demonstração"
    }));
    return;
  }
  
  if (url.pathname === "/users" && req.method === "GET") {
    res.writeHead(200);
    res.end(JSON.stringify(users));
    return;
  }
  
  if (url.pathname === "/users" && req.method === "POST") {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const data = JSON.parse(body);
      res.writeHead(201);
      res.end(JSON.stringify({
        id: Date.now(),
        ...data,
        created: true
      }));
    });
    return;
  }
  
  if (url.pathname === "/health" && req.method === "GET") {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: "healthy",
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }));
    return;
  }
  
  res.writeHead(404);
  res.end(JSON.stringify({ error: "Not Found" }));
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Node.js server running at http://localhost:${PORT}`);
});
