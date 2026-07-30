import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const baseUrl = process.env.XUANSHU_PREVIEW_URL || "http://127.0.0.1:3138";
const outputDir = "output/p0-expansion-qa";
await mkdir(outputDir, { recursive: true });

const profiles = [
  {
    id: "qa-primary",
    name: "小玄",
    gender: "female",
    calendarType: "solar",
    birthDate: "1990-06-18",
    birthTime: "09:30",
    birthTimeKnown: true,
    isLeapMonth: false,
    birthPlace: "广东省广州市",
    latitude: 23.1291,
    longitude: 113.2644,
    timezone: "Asia/Shanghai",
    isDemo: false,
    isLocalOnly: true,
    completeness: 100,
  },
  {
    id: "qa-partner",
    name: "小枢",
    gender: "male",
    calendarType: "solar",
    birthDate: "1992-11-02",
    birthTime: "18:20",
    birthTimeKnown: true,
    isLeapMonth: false,
    birthPlace: "北京市",
    latitude: 39.9042,
    longitude: 116.4074,
    timezone: "Asia/Shanghai",
    isDemo: false,
    isLocalOnly: true,
    completeness: 100,
  },
];

const browser = await chromium.launch({ headless: true });
const errors = [];
const results = [];

for (const viewport of [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
]) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript((seed) => {
    localStorage.setItem("xuanshu-mobile-profile", JSON.stringify(seed[0]));
    localStorage.setItem("xuanshu-mobile-profiles-v1", JSON.stringify(seed));
  }, profiles);
  const page = await context.newPage();
  page.on("console", (message) => { if (message.type() === "error") errors.push(`${viewport.width} ${page.url()}: ${message.text()}`); });
  page.on("pageerror", (error) => errors.push(`${viewport.width} ${page.url()}: ${error.message}`));

  await page.goto(`${baseUrl}/m/chart`, { waitUntil: "networkidle" });
  const chartMetrics = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth,
    planets: document.querySelectorAll(".astrology-wheel__planet").length,
    houses: document.querySelectorAll(".astrology-wheel__house-line").length,
    navItems: document.querySelectorAll(".mobile-bottom-nav a").length,
  }));
  await page.screenshot({ path: `${outputDir}/chart-${viewport.width}x${viewport.height}.png`, fullPage: true });
  results.push({ route: "/m/chart", viewport, ...chartMetrics });

  await page.goto(`${baseUrl}/m/report`, { waitUntil: "networkidle" });
  const reportMetrics = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > window.innerWidth, cards: document.querySelectorAll(".report-hub__grid > a").length }));
  await page.screenshot({ path: `${outputDir}/reports-${viewport.width}x${viewport.height}.png`, fullPage: true });
  results.push({ route: "/m/report", viewport, ...reportMetrics });

  if (viewport.width === 390) {
    await page.goto(`${baseUrl}/m/tools`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${outputDir}/tools-390x844.png`, fullPage: true });
    await page.goto(`${baseUrl}/m/compatibility/create?mode=astrology`, { waitUntil: "networkidle" });
    await page.locator("select").nth(1).selectOption("qa-partner");
    await page.getByRole("button", { name: "开始建立关系结构" }).click();
    await page.waitForURL("**/m/compatibility/result**", { timeout: 8000 });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(450);
    const compatibilityMetrics = await page.evaluate(() => {
      const stored = JSON.parse(localStorage.getItem("xuanshu-compatibility-latest-v1") || "null");
      return {
        overflow: document.documentElement.scrollWidth > window.innerWidth,
        dimensions: document.querySelectorAll(".compatibility-dimensions article").length,
        sections: document.querySelectorAll(".compatibility-sections article").length,
        storedMode: stored?.mode,
      };
    });
    await page.screenshot({ path: `${outputDir}/compatibility-result-390x844.png`, fullPage: true });
    results.push({ route: "/m/compatibility/result", viewport, ...compatibilityMetrics });

    await page.goto(`${baseUrl}/m/compatibility/create?mode=bazi`, { waitUntil: "networkidle" });
    await page.locator("select").nth(1).selectOption("qa-partner");
    await page.getByRole("button", { name: "开始建立关系结构" }).click();
    await page.waitForURL("**/m/compatibility/result**", { timeout: 8000 });
    await page.waitForTimeout(450);
    const baziMode = await page.evaluate(() => JSON.parse(localStorage.getItem("xuanshu-compatibility-latest-v1") || "null")?.mode);
    results.push({ route: "/m/compatibility/result?mode=bazi", viewport, overflow: await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), storedMode: baziMode });

    await page.goto(`${baseUrl}/m/chart/transit`, { waitUntil: "networkidle" });
    await page.waitForTimeout(350);
    results.push({ route: "/m/chart/transit", viewport, overflow: await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), planets: await page.locator(".astrology-wheel__planet").count() });
  }
  await context.close();
}

await browser.close();
if (errors.length) throw new Error(`Browser errors:\n${errors.join("\n")}`);
for (const result of results) {
  if (result.overflow) throw new Error(`${result.route} overflows at ${result.viewport.width}px`);
  if (result.route === "/m/chart" && (result.planets !== 10 || result.houses !== 12 || result.navItems !== 4)) throw new Error(`Chart structure failed: ${JSON.stringify(result)}`);
  if (result.route === "/m/compatibility/result" && (result.dimensions !== 5 || result.sections < 3 || result.storedMode !== "astrology")) throw new Error(`Compatibility flow failed: ${JSON.stringify(result)}`);
  if (result.route === "/m/compatibility/result?mode=bazi" && result.storedMode !== "bazi") throw new Error(`BaZi compatibility flow failed: ${JSON.stringify(result)}`);
  if (result.route === "/m/chart/transit" && result.planets !== 10) throw new Error(`Transit chart failed: ${JSON.stringify(result)}`);
}
console.log(JSON.stringify({ baseUrl, results, browserErrors: errors.length }, null, 2));
