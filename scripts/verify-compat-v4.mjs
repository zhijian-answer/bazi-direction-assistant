import path from "node:path";
import { chromium } from "playwright";

const origin = process.argv[2] || "http://127.0.0.1:3156";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
page.on("pageerror", (error) => errors.push(error.message));

await page.goto(`${origin}/m`, { waitUntil: "domcontentloaded" });
await page.evaluate(() => {
  const profile = {
    id: "qa-user", name: "小雅", gender: "female", calendarType: "solar",
    birthDate: "1993-05-17", birthTime: "08:30", birthTimeKnown: true,
    isLeapMonth: false, birthPlace: "上海市", latitude: 31.2304, longitude: 121.4737,
    timezone: "Asia/Shanghai", birthPlaceResolution: "catalog", isDemo: false,
    isLocalOnly: true, completeness: 100, syncStatus: "local",
  };
  localStorage.setItem("xuanshu-mobile-profile", JSON.stringify(profile));
  localStorage.setItem("xuanshu-mobile-profiles-v1", JSON.stringify([profile]));
  localStorage.removeItem("xuanshu-compatibility-history-v1");
  localStorage.removeItem("xuanshu-compatibility-latest-v1");
});

await page.goto(`${origin}/m/compatibility`, { waitUntil: "networkidle" });
await page.screenshot({ path: path.resolve("artifacts/compat-v4-home-390.png") });
const metrics = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  viewportWidth: window.innerWidth,
  bodyText: document.body.innerText.slice(0, 1200),
  smallTargets: [...document.querySelectorAll("button, a")].filter((element) => {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
  }).length,
}));

console.log(JSON.stringify({ metrics, errors }, null, 2));

await page.getByRole("button", { name: /开始新合盘/ }).click();
await page.waitForURL(/compatibility\/create/);
await page.waitForTimeout(700);
await page.getByRole("button", { name: /新建对方档案/ }).click();
await page.getByPlaceholder("对方的名字").fill("阿泽");
await page.getByPlaceholder("对方的名字").press("Enter");
await page.waitForTimeout(200);
await page.getByRole("button", { name: "恋人" }).click();
await page.waitForTimeout(200);
await page.screenshot({ path: path.resolve("artifacts/compat-v4-create-step1-390.png") });
await page.getByRole("button", { name: /填写出生信息/ }).click();
await page.locator('input[type="date"]').fill("1991-09-08");
await page.getByRole("button", { name: "不知道" }).click();
await page.getByPlaceholder(/城市名/).fill("杭州市");
await page.waitForTimeout(700);
await page.screenshot({ path: path.resolve("artifacts/compat-v4-create-step2-390.png") });
console.log(JSON.stringify({ createUrl: page.url(), createText: (await page.locator("body").innerText()).slice(0, 1200), errors }, null, 2));
await page.getByRole("button", { name: "生成合盘报告" }).click();
await page.waitForURL(/compatibility\/generating/);
await page.screenshot({ path: path.resolve("artifacts/compat-v4-generating-390.png") });
await page.waitForURL(/compatibility\/result/, { timeout: 60_000 });
await page.waitForTimeout(800);
await page.screenshot({ path: path.resolve("artifacts/compat-v4-result-390.png"), fullPage: true });
console.log(JSON.stringify({ resultUrl: page.url(), resultText: (await page.locator("body").innerText()).slice(0, 1800), errors }, null, 2));
await page.goto(`${origin}/m/compatibility/history`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.screenshot({ path: path.resolve("artifacts/compat-v4-history-390.png") });
console.log(JSON.stringify({ historyText: (await page.locator("body").innerText()).slice(0, 1000), errors }, null, 2));
await browser.close();
