import { chromium } from "playwright";

const baseUrl = process.env.XUANSHU_PREVIEW_URL || "http://127.0.0.1:3139";
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

await page.goto(`${baseUrl}/m/compatibility/create?mode=astrology`, { waitUntil: "domcontentloaded" });
await page.locator(".compatibility-form-panel").waitFor({ state: "visible", timeout: 10_000 });
const selects = page.locator(".compatibility-form-panel select");
if (await selects.count() !== 2) throw new Error("Compatibility pair step did not render two profile selectors.");
const selectedPartner = await selects.nth(1).inputValue();
if (selectedPartner !== "demo-partner-profile") throw new Error(`Unexpected demo partner: ${selectedPartner}`);
await page.locator(".compatibility-primary-action").click();
await page.waitForURL("**/m/compatibility/result", { timeout: 10_000 });
await page.locator(".compatibility-result-cover").waitFor({ state: "visible", timeout: 10_000 });

const compatibilityState = await page.evaluate(() => ({
  latest: Boolean(localStorage.getItem("xuanshu-compatibility-latest-v1")),
  history: JSON.parse(localStorage.getItem("xuanshu-compatibility-history-v1") || "[]").length,
  activeNav: document.querySelector(".mobile-bottom-nav a.is-active small")?.textContent || "",
  demoNotice: Boolean(document.querySelector(".compatibility-demo-note")),
}));
if (!compatibilityState.latest || compatibilityState.history !== 0 || compatibilityState.activeNav !== "工具" || !compatibilityState.demoNotice) {
  throw new Error(`Demo compatibility boundary failed: ${JSON.stringify(compatibilityState)}`);
}

await page.goto(`${baseUrl}/m/chat`, { waitUntil: "domcontentloaded" });
await page.locator('textarea[aria-label="输入你想了解的问题"]').waitFor({ state: "visible", timeout: 10_000 });
const starterButtons = page.locator("[class*='starters'] button");
const starterCount = await starterButtons.count();
if (!starterCount) throw new Error("Demo chat starters are missing.");
await starterButtons.nth(0).click();
await page.locator("article[class*='answer']").waitFor({ state: "visible", timeout: 20_000 });
const chatState = await page.evaluate(() => ({
  persisted: localStorage.getItem("xuanshu-mobile-chat-v1:demo-profile"),
  activeNav: document.querySelector(".mobile-bottom-nav a.is-active small")?.textContent || "",
}));
if (chatState.persisted !== null || chatState.activeNav !== "工具") throw new Error(`Demo chat boundary failed: ${JSON.stringify(chatState)}`);

await page.goto(`${baseUrl}/m/report/zodiac`, { waitUntil: "domcontentloaded" });
await page.locator(".report-reading-mode").waitFor({ state: "visible", timeout: 10_000 });
if (await page.locator(".report-reading-guide__resume").count()) {
  throw new Error("A nearly completed report should not show a resume-reading prompt.");
}
const modeButtons = page.locator(".report-reading-mode button");
if (await modeButtons.count() !== 2) throw new Error("Report reading mode switch is missing.");
const quickDisplay = await page.locator("#reading-zodiac").evaluate((element) => getComputedStyle(element).display);
if (quickDisplay !== "none") throw new Error(`Professional zodiac content should be hidden in quick mode, got ${quickDisplay}.`);
await modeButtons.nth(1).click();
const professionalDisplay = await page.locator("#reading-zodiac").evaluate((element) => getComputedStyle(element).display);
if (professionalDisplay === "none") throw new Error("Professional zodiac content did not open.");

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
  readingModes: { quickDisplay, professionalDisplay },
  browserErrors: errors.length,
}, null, 2));
