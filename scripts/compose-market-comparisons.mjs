import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const referenceRoot = path.resolve("output/market-delivery-pack-2026-07-05/01_高清设计图");
const outputRoot = path.resolve("output/design-qa/market-comparison-2026-07-06");
const pages = {
  home: "a_dark_high_detail_ui_design_guide_mobile_app_c.png",
  create: "创建个人档案界面设计.png",
  generating: "命盘生成界面设计展示.png",
  bazi: "命盘翻译界面设计展示.png",
  flow: "流盘占星应用界面设计.png",
  zodiac: "星座命理报告界面设计.png",
  ziwei: "紫微命理实验室界面设计.png",
  profile: "a_wide_composite_ui_concept_image_design_mockup.png",
};

function dataUrl(filePath) {
  return `data:image/png;base64,${fs.readFileSync(filePath).toString("base64")}`;
}

const browser = await chromium.launch();
for (const [name, referenceFile] of Object.entries(pages)) {
  const reference = dataUrl(path.join(referenceRoot, referenceFile));
  const implementation = dataUrl(path.join(outputRoot, `implementation-${name}.png`));
  const page = await browser.newPage({ viewport: { width: 860, height: 920 } });
  await page.setContent(`
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; background: #080b0c; color: #e8dcc9; font-family: Arial, sans-serif; }
      .title { height: 52px; display: flex; align-items: center; justify-content: center; color: #cba45f; font-size: 17px; }
      .grid { display: grid; grid-template-columns: 390px 390px; gap: 24px; justify-content: center; }
      .column { display: grid; gap: 8px; }
      .label { text-align: center; color: #aaa194; font-size: 13px; }
      .frame { width: 390px; height: 844px; display: flex; align-items: flex-start; justify-content: center; overflow: hidden; border: 1px solid #715832; background: #030608; }
      .frame img { width: 100%; height: 100%; object-fit: contain; object-position: top center; }
    </style>
    <div class="title">玄枢 ${name} 视觉对照</div>
    <div class="grid">
      <div class="column"><div class="label">高清参考图</div><div class="frame"><img src="${reference}" alt=""></div></div>
      <div class="column"><div class="label">当前实现 390 × 844</div><div class="frame"><img src="${implementation}" alt=""></div></div>
    </div>
  `);
  await page.screenshot({ path: path.join(outputRoot, `comparison-${name}.png`), fullPage: true });
  await page.close();
}
await browser.close();
console.log(`Created ${Object.keys(pages).length} market comparison images.`);
