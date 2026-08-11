import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = process.env.BASE_URL || "http://127.0.0.1:3156";
const output = "output/chart-v22-qa";
const profile = {
  id: "qa-profile",
  name: "知夏",
  gender: "female",
  calendarType: "solar",
  birthDate: "1992-04-16",
  birthTime: "08:30",
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
};

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

for (const width of [375, 390, 430]) {
  const context = await browser.newContext({ viewport: { width, height: width === 430 ? 932 : 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript((value) => {
    localStorage.setItem("xuanshu-mobile-profile", JSON.stringify(value));
    localStorage.setItem("xuanshu-mobile-profiles-v1", JSON.stringify([value]));
  }, profile);
  await page.route("**/api/report-narratives", async (route) => {
    const body = route.request().postDataJSON();
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        bundle: {
          title: "今天适合把话说清楚，但不用急着得到答案。",
          summary: "你会比平时更快注意到别人的态度变化。先确认事实，再回应情绪，能减少很多不必要的猜测。",
          action: "把最想确认的问题写成一句话，只问事实，不替对方回答。",
          shareLine: "先看事实，再决定要不要继续猜。",
          questions: ["今天适合主动吗？"],
          sections: [{ id: "observe", title: "可以观察什么", body: "留意对方是否愿意给出明确回应，而不只是语气上的安慰。" }],
        },
        source: "api",
        provider: "deepseek",
        model: "deepseek-chat",
        promptVersion: body.promptVersion,
        issues: [],
      }),
    });
  });

  for (const route of ["natal", "transit"]) {
    await page.goto(`${baseURL}/m/chart/${route}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${output}/${route}-${width}.png`, fullPage: true });
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      text: document.body.innerText,
      minButtons: [...document.querySelectorAll("button,a")]
        .map((node) => ({ label: node.textContent?.trim(), width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height }))
        .filter((item) => item.width > 0 && item.height > 0 && (item.width < 44 || item.height < 44)),
    }));
    results.push({ route, width, overflow: metrics.scrollWidth - metrics.clientWidth, errors: [...errors], hasExpectedText: route === "natal" ? metrics.text.includes("本命星盘") : metrics.text.includes("今天适合把话说清楚"), smallTargets: metrics.minButtons.slice(0, 8) });
  }
  await context.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
if (results.some((item) => item.overflow > 0 || item.errors.length || !item.hasExpectedText)) process.exit(1);
