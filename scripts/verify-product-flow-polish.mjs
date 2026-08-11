import { chromium } from "playwright";

const baseUrl = process.env.XUANSHU_PREVIEW_URL || "http://127.0.0.1:3156";
const demoProfile = {
  id: "demo-profile",
  name: "示例：小玄",
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
  birthPlaceResolution: "catalog",
  isDemo: true,
  isLocalOnly: true,
  completeness: 100,
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
const page = await context.newPage();
const errors = [];

page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
page.on("pageerror", (error) => errors.push(error.message));
await page.addInitScript((profile) => {
  localStorage.setItem("xuanshu-mobile-profile", JSON.stringify(profile));
  localStorage.setItem("xuanshu-mobile-profiles-v1", JSON.stringify([profile]));
  localStorage.setItem("xuanshu-reading-progress:zodiac:demo-profile", "96");
}, demoProfile);

await page.route("**/api/mobile-chat", async (route) => {
  await route.fulfill({ contentType: "application/json", body: JSON.stringify({
    answer: {
      title: "先看现实里的回应，再决定要不要继续猜。",
      summary: "你现在需要的不是更多假设，而是一个能被确认的事实。",
      observations: ["对方是否愿意把态度说清楚", "现实行动是否与说法一致"],
      action: "把最想确认的问题写成一句话，直接问事实。",
      suggestions: ["我该观察什么？"],
      evidence: [],
      limitations: ["仅供自我观察与生活参考"],
      delivery: { source: "api", provider: "deepseek", model: "deepseek-chat" },
    },
  }) });
});

await page.goto(`${baseUrl}/m/compatibility/create?mode=astrology`, { waitUntil: "domcontentloaded" });
await page.getByText("选择双方与类型", { exact: true }).waitFor({ state: "visible", timeout: 10_000 });
await page.getByRole("button", { name: /新建对方档案/ }).waitFor({ state: "visible" });

const compatibilityState = await page.evaluate(() => ({
  history: JSON.parse(localStorage.getItem("xuanshu-compatibility-history-v1") || "[]").length,
  demoNotice: document.body.innerText.includes("当前正在查看示例档案"),
}));
if (compatibilityState.history !== 0 || !compatibilityState.demoNotice) {
  throw new Error(`Demo compatibility boundary failed: ${JSON.stringify(compatibilityState)}`);
}

await page.goto(`${baseUrl}/m/chat`, { waitUntil: "domcontentloaded" });
await page.locator('textarea[aria-label="输入你想了解的问题"]').waitFor({ state: "visible", timeout: 10_000 });
await page.locator('textarea[aria-label="输入你想了解的问题"]').fill("我该观察什么？");
await page.getByRole("button", { name: "发送" }).click();
await page.getByText("先看现实里的回应，再决定要不要继续猜。", { exact: true }).waitFor({ state: "visible", timeout: 20_000 });
const chatState = await page.evaluate(() => ({
  persisted: localStorage.getItem("xuanshu-mobile-chat-v2:demo-profile"),
}));
if (chatState.persisted !== null) throw new Error(`Demo chat boundary failed: ${JSON.stringify(chatState)}`);

await page.goto(`${baseUrl}/m/report/zodiac`, { waitUntil: "domcontentloaded" });
const zodiacTabList = page.getByRole("tablist", { name: "星盘报告视图" });
await zodiacTabList.waitFor({ state: "visible", timeout: 10_000 });
const reportTabs = zodiacTabList.getByRole("tab");
if (await reportTabs.count() !== 4) throw new Error("The Figma zodiac report should expose four report tabs.");
if (await reportTabs.nth(0).getAttribute("aria-selected") !== "true") throw new Error("The zodiac report did not start on its overview tab.");
await page.getByRole("tab", { name: "相位" }).click();
await page.getByText("主要相位", { exact: true }).waitFor({ state: "visible", timeout: 10_000 });
const activeReportTab = await page.getByRole("tab", { name: "相位" }).getAttribute("aria-selected");
if (activeReportTab !== "true") throw new Error("The zodiac aspect tab did not become active.");
const zodiacReport = { tabCount: await reportTabs.count(), activeTab: "相位" };

await page.goto(`${baseUrl}/m/create?mode=new`, { waitUntil: "domcontentloaded" });
if (await page.locator(".create-secondary").count()) throw new Error("The ambiguous partial-save action is still visible.");

const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
if (overflow) throw new Error("The create flow overflows horizontally at 390px.");
if (errors.length) throw new Error(`Browser errors:\n${errors.join("\n")}`);

await context.close();
await browser.close();

console.log(JSON.stringify({
  ok: true,
  baseUrl,
  compatibilityState,
  chatState,
  zodiacReport,
  browserErrors: errors.length,
}, null, 2));
