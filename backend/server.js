// ---------- HTTP server ----------
import { createServer } from "http"; // ✅ make sure this is at the top of your file if not already there

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

function matchRoute(method, pathname) {
  //1️⃣ exact match
  let found = routes.find((r) => r.method === method && r.path === pathname);
  if (found) return { route: found, params: {} };

  // 2️⃣ dynamic param match (/escrows/:id/sign)
  for (const r of routes) {
    if (r.method !== method) continue;
    const pattern = r.path.replace(/:[^/]+/g, "([^/]+)");
    const regex = new RegExp(`^${pattern}$`);
    const match = pathname.match(regex);
    if (match) {
      const keys = (r.path.match(/:([^/]+)/g) || []).map((k) => k.slice(1));
      const params = {};
      keys.forEach((k, i) => (params[k] = match[i + 1]));
      return { route: r, params };
    }
  }

  // 3️⃣ prefix match (nested routes like /tent/create)
  found = routes.find(
    (r) => r.method === method && pathname.startsWith(r.path)
  );
  if (found) return { route: found, params: {} };

  // 4️⃣ nothing matched
  return null;
}

const server = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const { pathname } = parseUrl(req.url || "/", true);
  const match = matchRoute(req.method, pathname);

  if (!match) {
    return err(res, 404, `Route not found: ${pathname}`);
  }

  const body =
    ["POST", "PUT", "PATCH"].includes(req.method) &&
    req.headers["content-type"]?.includes("application/json")
      ? await parseBody(req).catch(() => ({}))
      : null;

  try {
    await match.route.handler({
      req,
      res,
      body,
      params: match.params,
    });
  } catch (e) {
    console.error("Handler error:", e);
    err(res, 500, e.message || "Internal server error");
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 HavenOx backend running on http://localhost:${PORT}`);
});
