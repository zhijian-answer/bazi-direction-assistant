import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.CHAT_QA_BASE_URL || "http://127.0.0.1:3156";
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
  isDemo: false,
  isLocalOnly: true,
  completeness: 100,
  syncStatus: "local",
};

function apiAnswer(question) {
  return {
    id: "qa-answer",
    question,
    category: "relationship",
    title: "先看对方有没有持续回应",
    summary: "你在意的可能不只是联系变少，而是不确定这段关系是否还值得投入。先把猜测放一放，观察对方是否愿意解释和安排下一步。",
    observations: ["是否主动说明最近的状态", "是否愿意安排下一次见面"],
    action: "把你真正需要确认的一件事直接说清楚。",
    suggestions: ["我该主动联系吗？", "这段关系最容易卡在哪里？"],
    evidence: [],
    evidenceTrace: { claims: [], excluded: [] },
    limitations: [],
    poster: { id: "qa-answer", category: "question", eyebrow: "玄枢", title: "先看行动", body: "先看对方有没有持续回应。", tags: ["关系"], footer: "仅供参考", tone: "coral" },
    delivery: { source: "api", provider: "qa", model: "qa-model" },
  };
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("pageerror", (error) => consoleErrors.push(error.message));
    await page.addInitScript((savedProfile) => {
      localStorage.setItem("xuanshu-mobile-profile", JSON.stringify(savedProfile));
      localStorage.setItem("xuanshu-mobile-profiles-v1", JSON.stringify([savedProfile]));
    }, profile);
    await page.route("**/api/mobile-chat", async (route) => {
      const body = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ answer: apiAnswer(body.question) }) });
    });

    await page.goto(`${baseUrl}/m/chat`, { waitUntil: "networkidle" });
    const textarea = page.getByRole("textbox", { name: "输入你想了解的问题" });
    await textarea.waitFor({ state: "visible" });
    await page.screenshot({ path: path.join(outputDir, `chat-${viewport.width}-initial.png`), fullPage: true });
    await textarea.fill("他最近变冷淡，我该继续等吗？");
    await page.getByRole("button", { name: "发送" }).click();
    await page.getByText("先看对方有没有持续回应").waitFor({ state: "visible" });
    await page.screenshot({ path: path.join(outputDir, `chat-${viewport.width}-answer.png`), fullPage: true });

    const layout = await page.evaluate(() => {
      const send = document.querySelector('button[aria-label="发送"]')?.getBoundingClientRect();
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        sendSize: send ? { width: send.width, height: send.height } : { width: 0, height: 0 },
      };
    });
    if (layout.scrollWidth > layout.clientWidth) throw new Error(`${viewport.width}px 出现横向溢出`);
    if (layout.sendSize.width < 44 || layout.sendSize.height < 44) throw new Error(`${viewport.width}px 发送按钮触控尺寸不足`);
    if (consoleErrors.length) throw new Error(`${viewport.width}px 控制台错误：${consoleErrors.join(" | ")}`);
    results.push({ viewport, layout, consoleErrors });
    await context.close();
  }
} finally {
  await browser.close();
}

await writeFile(path.join(outputDir, "summary.json"), JSON.stringify({ baseUrl, results }, null, 2), "utf8");
console.log(JSON.stringify({ ok: true, baseUrl, outputDir, results }, null, 2));
