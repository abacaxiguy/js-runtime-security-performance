const server = Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    
    if (url.pathname === "/") {
      return new Response(JSON.stringify({ 
        runtime: "Bun",
        version: Bun.version,
        message: "API REST de demonstração"
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    if (url.pathname === "/users" && req.method === "GET") {
      const users = [
        { id: 1, name: "Alice", email: "alice@example.com" },
        { id: 2, name: "Bob", email: "bob@example.com" },
        { id: 3, name: "Charlie", email: "charlie@example.com" }
      ];
      return new Response(JSON.stringify(users), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    if (url.pathname === "/users" && req.method === "POST") {
      return req.json().then(body => {
        return new Response(JSON.stringify({ 
          id: Date.now(),
          ...body,
          created: true 
        }), {
          status: 201,
          headers: { "Content-Type": "application/json" }
        });
      });
    }
    
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({
        status: "healthy",
        uptime: process.uptime(),
        memory: process.memoryUsage()
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    return new Response("Not Found", { status: 404 });
  }
});

console.log(`Bun server running at http://localhost:${server.port}`);
