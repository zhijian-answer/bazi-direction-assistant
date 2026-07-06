import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const origin = process.argv[2] ?? "http://127.0.0.1:3130";
const route = process.argv[3] ?? "/m/";
const readySelector = process.argv[4] ?? "main";
const label = process.argv[5] ?? "market-screen";
const outputDir = path.resolve("output/playwright/market-screen");
const viewports = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
];

fs.mkdirSync(outputDir, { recursive: true });
const browser = await chromium.launch();

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(`${origin}/m/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  if (await page.locator(".home-welcome").count()) {
    await page.locator(".home-welcome button").click();
    await page.locator(".today-status-card").waitFor();
  }

  await page.goto(`${origin}${route}`, { waitUntil: "domcontentloaded" });
  await page.locator(readySelector).waitFor();
  await page.waitForTimeout(900);

  const suffix = `${viewport.width}x${viewport.height}`;
  await page.screenshot({ path: path.join(outputDir, `${label}-${suffix}.png`) });
  if (viewport.width === 390) {
    await page.screenshot({ path: path.join(outputDir, `${label}-full-${suffix}.png`), fullPage: true });
  }

  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    smallTargets: [...document.querySelectorAll("a, button")].filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
    }).length,
  }));
  console.log(JSON.stringify({ viewport, metrics, errors }));
  await page.close();
}

await browser.close();
