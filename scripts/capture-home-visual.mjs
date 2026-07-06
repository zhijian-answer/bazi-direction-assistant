import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:3131/m";
const label = process.argv[3] ?? "latest";
const outputDir = path.resolve("output/playwright/home-visual-rework");
const profile = {
  id: "visual-demo",
  name: "Demo",
  gender: "female",
  calendarType: "solar",
  birthDate: "1990-06-18",
  birthTime: "09:30",
  birthTimeKnown: true,
  isLeapMonth: false,
  birthPlace: "",
  isDemo: true,
  isLocalOnly: true,
  completeness: 75,
};
const viewports = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
];

fs.mkdirSync(outputDir, { recursive: true });
console.log(`Capturing ${baseUrl} as ${label}`);
const browser = await chromium.launch();

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  console.log(`Opened ${viewport.width}`);
  await page.waitForTimeout(800);
  if (await page.locator(".home-welcome").count()) {
    await page.locator(".home-welcome button").click();
  } else {
    await page.evaluate((value) => {
      window.localStorage.setItem("xuanshu-mobile-profile", JSON.stringify(value));
      window.dispatchEvent(new Event("xuanshu-mobile-profile-change"));
    }, profile);
  }
  await page.waitForTimeout(1200);
  if (!(await page.locator(".today-status-card").count())) {
    console.log(JSON.stringify({
      viewport,
      profile: await page.evaluate(() => window.localStorage.getItem("xuanshu-mobile-profile")),
      body: (await page.locator("body").innerText()).slice(0, 160),
      errors,
    }));
    await page.screenshot({ path: path.join(outputDir, `${label}-blocked-${viewport.width}.png`) });
    await page.close();
    continue;
  }
  await page.waitForTimeout(300);

  const suffix = `${viewport.width}x${viewport.height}`;
  await page.screenshot({ path: path.join(outputDir, `${label}-${suffix}.png`) });
  if (viewport.width === 390) {
    await page.screenshot({ path: path.join(outputDir, `${label}-full-${suffix}.png`), fullPage: true });
  }

  const metrics = await page.evaluate(() => {
    const title = document.querySelector(".today-status-card h1");
    const titleStyle = title ? window.getComputedStyle(title) : null;
    const smallTargets = [...document.querySelectorAll("a, button")].filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
    }).length;
    return {
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      titleFont: titleStyle?.fontFamily,
      titleSize: titleStyle?.fontSize,
      titleWeight: titleStyle?.fontWeight,
      smallTargets,
    };
  });

  console.log(JSON.stringify({ viewport, metrics, errors }));
  await page.close();
}

await browser.close();
