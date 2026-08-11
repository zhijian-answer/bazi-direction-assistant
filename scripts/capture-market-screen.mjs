import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const origin = process.argv[2] ?? "http://127.0.0.1:3130";
const route = process.argv[3] ?? "/m/";
const readySelector = process.argv[4] ?? "main";
const label = process.argv[5] ?? "market-screen";
const clickLabel = process.argv[6];
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
  await page.locator(".home-welcome, .home-v2").first().waitFor();
  if (await page.locator(".home-welcome").isVisible()) {
    await page.getByRole("button", { name: /先看示例/ }).click();
    await page.locator(".home-v2").waitFor();
  }

  await page.goto(`${origin}${route}`, { waitUntil: "domcontentloaded" });
  if (clickLabel) {
    await page.getByRole("button", { name: clickLabel, exact: true }).click();
  }
  await page.locator(readySelector).waitFor();
  await page.waitForTimeout(900);

  const suffix = `${viewport.width}x${viewport.height}`;
  await page.screenshot({ path: path.join(outputDir, `${label}-${suffix}.png`) });
  if (viewport.width === 390) {
    await page.screenshot({ path: path.join(outputDir, `${label}-full-${suffix}.png`), fullPage: true });
  }

  const metrics = await page.evaluate(() => {
    const smallTargets = [...document.querySelectorAll("a, button")].filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
    });
    return {
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      smallTargets: smallTargets.length,
      smallTargetDetails: smallTargets.slice(0, 4).map((element) => ({
        label: element.getAttribute("aria-label") || element.textContent?.trim().slice(0, 24),
        className: element.className,
        width: Math.round(element.getBoundingClientRect().width),
        height: Math.round(element.getBoundingClientRect().height),
      })),
    };
  });
  console.log(JSON.stringify({ viewport, metrics, errors }));
  await page.close();
}

await browser.close();
