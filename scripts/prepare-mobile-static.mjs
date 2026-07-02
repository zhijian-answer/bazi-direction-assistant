import { cp, readdir } from "node:fs/promises";
import path from "node:path";

const outputRoot = path.resolve("mobile-static/out");
let copies = 0;

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(absolute);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".txt")) continue;

    const relativeParts = path.relative(outputRoot, absolute).split(path.sep);
    const nextIndex = relativeParts.findIndex((part) => part.startsWith("__next."));
    if (nextIndex < 0 || nextIndex === relativeParts.length - 1) continue;

    const routeDirectory = path.join(outputRoot, ...relativeParts.slice(0, nextIndex));
    const flattenedName = relativeParts.slice(nextIndex).join(".");
    const destination = path.join(routeDirectory, flattenedName);
    await cp(absolute, destination, { force: true });
    copies += 1;
  }
}

await walk(outputRoot);
console.log(`Prepared ${copies} static RSC fallback files.`);
