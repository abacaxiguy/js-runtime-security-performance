const users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
  { id: 3, name: "Charlie", email: "charlie@example.com" }
];

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  if (url.pathname === "/" && req.method === "GET") {
    return new Response(JSON.stringify({
      runtime: "Deno",
      version: Deno.version.deno,
      message: "API REST de demonstração"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }
  
  if (url.pathname === "/users" && req.method === "GET") {
    return new Response(JSON.stringify(users), {
      headers: { "Content-Type": "application/json" }
    });
  }
  
  if (url.pathname === "/users" && req.method === "POST") {
    const body = await req.json();
    return new Response(JSON.stringify({
      id: Date.now(),
      ...body,
      created: true
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  if (url.pathname === "/health" && req.method === "GET") {
    return new Response(JSON.stringify({
      status: "healthy",
      memory: Deno.memoryUsage()
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }
  
  return new Response(JSON.stringify({ error: "Not Found" }), { 
    status: 404,
    headers: { "Content-Type": "application/json" }
  });
}

const PORT = 3002;
console.log(`Deno server running at http://localhost:${PORT}`);
Deno.serve({ port: PORT }, handler);
