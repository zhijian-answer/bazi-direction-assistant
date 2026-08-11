import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.RELEASE_QA_BASE_URL || "http://127.0.0.1:3156";
const outputDir = path.resolve("output/release-qa");
const email = `release-${Date.now()}@example.test`;
const password = "release-pass-2026";
const profile = {
  id: `release-profile-${Date.now()}`,
  name: "交付测试",
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
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
const page = await context.newPage();
const consoleErrors = [];

page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
page.on("pageerror", (error) => consoleErrors.push(error.message));
await page.addInitScript((savedProfile) => {
  localStorage.setItem("xuanshu-mobile-profile", JSON.stringify(savedProfile));
  localStorage.setItem("xuanshu-mobile-profiles-v1", JSON.stringify([savedProfile]));
}, profile);

try {
  await page.goto(`${baseUrl}/m/tools`, { waitUntil: "domcontentloaded" });
  await page.getByText("想先看哪件事？", { exact: true }).waitFor({ state: "visible", timeout: 15_000 });
  const bodyCopy = await page.locator("body").innerText();
  for (const phrase of ["规划中", "内容校准中", "仅示例", "接入中", "历史记录接入中", "数据实验室"]) {
    if (bodyCopy.includes(phrase)) throw new Error(`Unreleased copy is visible: ${phrase}`);
  }
  for (const tool of ["两人合盘", "完整星盘", "玄枢问答"]) {
    await page.getByRole("button", { name: new RegExp(tool) }).first().waitFor({ state: "visible" });
  }
  await page.screenshot({ path: path.join(outputDir, "tools-released.png"), fullPage: true });

  await page.goto(`${baseUrl}/m/profile`, { waitUntil: "domcontentloaded" });
  await page.getByText("我的", { exact: true }).first().waitFor({ state: "visible", timeout: 15_000 });
  const profileCopy = await page.locator("body").innerText();
  for (const phrase of ["状态预览", "版本 0.1.0", "测试记录"]) {
    if (profileCopy.includes(phrase)) throw new Error(`Internal profile entry is visible: ${phrase}`);
  }

  await page.getByRole("button", { name: /了解保存方式/ }).click();
  await page.getByRole("button", { name: /登录或注册/ }).click();
  await page.getByRole("button", { name: "注册", exact: true }).click();
  await page.getByLabel("称呼").fill("交付测试");
  await page.getByLabel("邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: /注册并保存档案/ }).click();
  await page.getByRole("button", { name: /同步当前档案/ }).waitFor({ state: "visible", timeout: 20_000 });

  const firstSync = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("xuanshu-mobile-profile") || "{}");
    return { syncStatus: saved.syncStatus, cloudProfileId: saved.cloudProfileId };
  });
  if (firstSync.syncStatus !== "synced" || !firstSync.cloudProfileId) {
    throw new Error(`The local profile did not sync after registration: ${JSON.stringify(firstSync)}`);
  }

  await page.getByRole("button", { name: /退出登录/ }).click();
  await page.getByText("已经退出登录，本机档案仍然保留。", { exact: true }).waitFor({ state: "visible", timeout: 10_000 });
  await page.getByRole("button", { name: /登录或注册/ }).click();
  await page.getByLabel("邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: /登录并保存档案/ }).click();
  await page.getByRole("button", { name: /同步当前档案/ }).waitFor({ state: "visible", timeout: 20_000 });
  await page.screenshot({ path: path.join(outputDir, "profile-synced.png"), fullPage: true });

  const cloudHistory = await page.evaluate(async () => {
    const savedProfile = JSON.parse(localStorage.getItem("xuanshu-mobile-profile") || "{}");
    const chatResponse = await fetch("/api/mobile-chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        profile: savedProfile,
        question: "我现在应该先稳住，还是主动推进？",
        history: [],
      }),
    });
    const chat = await chatResponse.json();
    const meResponse = await fetch("/api/me");
    const me = await meResponse.json();
    return {
      chatStatus: chatResponse.status,
      saved: chat.saved,
      source: chat.answer?.delivery?.source,
      questionCount: me.questions?.length || 0,
    };
  });
  if (cloudHistory.chatStatus !== 200 || !cloudHistory.saved || cloudHistory.questionCount < 1) {
    throw new Error(`Online guidance was not saved to cloud history: ${JSON.stringify(cloudHistory)}`);
  }

  const manifestResponse = await context.request.get(`${baseUrl}/manifest.webmanifest`);
  const appManifest = await manifestResponse.json();
  if (appManifest.start_url !== "/m" || appManifest.display !== "standalone") {
    throw new Error(`Unexpected manifest: ${JSON.stringify(appManifest)}`);
  }
  const swResponse = await context.request.get(`${baseUrl}/sw.js`);
  const swText = await swResponse.text();
  if (!swResponse.ok() || !swText.includes('url.pathname.startsWith("/api/")')) {
    throw new Error("The mobile service worker is missing its API cache boundary.");
  }

  const cleanup = await page.evaluate(async () => {
    const response = await fetch("/api/me", { method: "DELETE" });
    return { ok: response.ok, status: response.status };
  });
  if (!cleanup.ok) throw new Error(`Could not clean up the release QA account: ${cleanup.status}`);
  if (consoleErrors.length) throw new Error(`Browser errors:\n${consoleErrors.join("\n")}`);

  const result = { ok: true, baseUrl, firstSync, cloudHistory, manifest: { start_url: appManifest.start_url, display: appManifest.display }, consoleErrors };
  await writeFile(path.join(outputDir, "summary.json"), JSON.stringify(result, null, 2), "utf8");
  console.log(JSON.stringify(result, null, 2));
} finally {
  await context.close();
  await browser.close();
}
