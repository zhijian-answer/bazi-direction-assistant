import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const packageRoot = path.join(process.cwd(), "node_modules", "bazi-calculator-by-alvamind");
const sourceRoot = path.join(packageRoot, "src");
const outputRoot = path.join(packageRoot, "dist");

async function compileDirectory(sourceDir, outputDir) {
  await mkdir(outputDir, { recursive: true });
  for (const entry of await readdir(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    if (entry.isDirectory()) {
      await compileDirectory(sourcePath, path.join(outputDir, entry.name));
    } else if (entry.name.endsWith(".ts")) {
      const source = await readFile(sourcePath, "utf8");
      const result = ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2020,
          esModuleInterop: true,
        },
        fileName: sourcePath,
      });
      await writeFile(path.join(outputDir, entry.name.replace(/\.ts$/, ".js")), result.outputText, "utf8");
    }
  }
}

await compileDirectory(sourceRoot, outputRoot);
await cp(path.join(sourceRoot, "dates_mapping.json"), path.join(outputRoot, "dates_mapping.json"));
await writeFile(path.join(outputRoot, "index.js"), '"use strict";\nmodule.exports = require("./bazi-calculator.js");\n', "utf8");
await writeFile(path.join(outputRoot, "index.d.ts"), 'export { BaziCalculator } from "../src/bazi-calculator";\n', "utf8");

console.log("Prepared bazi-calculator-by-alvamind runtime files.");
