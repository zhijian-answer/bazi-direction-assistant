import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.CHAT_QA_BASE_URL || "http://127.0.0.1:3131";
const outputDir = path.resolve("output/chat-qa");
const viewports = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
];
const profile = {
  id: "qa-chat-profile",
  name: "测试档案",
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
  isDemo: false,
  isLocalOnly: true,
  completeness: 100,
  syncStatus: "local",
};

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: "reduce" });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));
    await page.addInitScript((savedProfile) => {
      window.localStorage.setItem("xuanshu-mobile-profile", JSON.stringify(savedProfile));
      window.localStorage.setItem("xuanshu-mobile-profiles-v1", JSON.stringify([savedProfile]));
    }, profile);

    await page.goto(`${baseUrl}/m`, { waitUntil: "domcontentloaded" });
    const chatEntry = page.locator('a[href*="/m/chat"]').first();
    await chatEntry.waitFor({ state: "visible" });
    if (viewport.width === 390) await page.screenshot({ path: path.join(outputDir, "home-390-chat-entry.png"), fullPage: true });
    await chatEntry.click();
    await page.locator('textarea[aria-label="输入你想了解的问题"]').waitFor({ state: "visible" });
    await page.screenshot({ path: path.join(outputDir, `chat-${viewport.width}-initial.png`), fullPage: true });
    await page.locator('textarea[aria-label="输入你想了解的问题"]').fill("我在关系里最容易卡在哪里？");
    await page.getByRole("button", { name: "发送问题" }).click();
    await page.getByText("查看这条回答用了什么依据").waitFor({ state: "visible", timeout: 20_000 });

    const layout = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      composerHeight: document.querySelector('form textarea[aria-label="输入你想了解的问题"]')?.getBoundingClientRect().height || 0,
      sendSize: (() => {
        const rect = document.querySelector('button[aria-label="发送问题"]')?.getBoundingClientRect();
        return rect ? { width: rect.width, height: rect.height } : { width: 0, height: 0 };
      })(),
    }));
    if (layout.scrollWidth > layout.clientWidth) throw new Error(`${viewport.width}px 出现横向溢出：${layout.scrollWidth}/${layout.clientWidth}`);
    if (layout.composerHeight < 44 || layout.sendSize.width < 44 || layout.sendSize.height < 44) throw new Error(`${viewport.width}px 输入区触控尺寸不足`);

    await page.getByText("查看这条回答用了什么依据").click();
    await page.screenshot({ path: path.join(outputDir, `chat-${viewport.width}-answer.png`), fullPage: true });

    let posterSize;
    if (viewport.width === 390) {
      await page.getByRole("button", { name: "生成分享图" }).first().click();
      await page.getByRole("button", { name: "生成高清图" }).click();
      const generatedImage = page.locator('.share-poster-preview-frame img[alt$="分享图"]');
      await generatedImage.waitFor({ state: "visible", timeout: 20_000 });
      posterSize = await generatedImage.evaluate((image) => ({
        width: image.naturalWidth,
        height: image.naturalHeight,
      }));
      if (posterSize.width !== 1080 || posterSize.height !== 1920) throw new Error(`分享图尺寸错误：${posterSize.width}x${posterSize.height}`);
      await page.screenshot({ path: path.join(outputDir, "chat-390-share-sheet.png"), fullPage: false });
    }

    results.push({ viewport, layout, posterSize, consoleErrors });
    if (consoleErrors.length) throw new Error(`${viewport.width}px 控制台错误：${consoleErrors.join(" | ")}`);
    await context.close();
  }
} finally {
  await browser.close();
}

await writeFile(path.join(outputDir, "summary.json"), JSON.stringify({ baseUrl, results }, null, 2), "utf8");
console.log(JSON.stringify({ ok: true, baseUrl, outputDir, results }, null, 2));
