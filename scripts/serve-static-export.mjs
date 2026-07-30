import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2] || "mobile-static/out");
const port = Number(process.argv[3] || 3140);
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8" };

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || "/", `http://${request.headers.host || "localhost"}`).pathname);
    const relative = pathname.replace(/^\/+/, "");
    let filePath = path.resolve(root, relative);
    if (!filePath.startsWith(root)) throw new Error("invalid path");
    const fileStat = await stat(filePath).catch(() => null);
    if (fileStat?.isDirectory()) filePath = path.join(filePath, "index.html");
    if (!fileStat && !path.extname(filePath)) filePath = path.join(filePath, "index.html");
    const content = await readFile(filePath);
    response.writeHead(200, { "content-type": mime[path.extname(filePath)] || "application/octet-stream", "cache-control": "no-store" });
    response.end(content);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, "127.0.0.1", () => console.log(`Static export available at http://127.0.0.1:${port}`));
