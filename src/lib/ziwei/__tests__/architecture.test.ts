import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

function sourceFiles(root: string): string[] {
  return readdirSync(root).flatMap((name) => {
    const path = join(root, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : /\.tsx?$/.test(name) ? [path] : [];
  });
}

describe("Ziwei dependency boundary", () => {
  it("allows importing iztro only inside the engine implementation", () => {
    const sourceRoot = join(process.cwd(), "src");
    const violations = sourceFiles(sourceRoot)
      .filter((file) => !file.endsWith(join("ziwei", "engines", "iztroEngine.ts")))
      .filter((file) => /(?:from\s+["']iztro["']|import\(["']iztro["']\))/.test(readFileSync(file, "utf8")))
      .map((file) => relative(process.cwd(), file));
    expect(violations).toEqual([]);
  });
});
