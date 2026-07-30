# 玄枢移动首页重构记录

日期：2026-07-21

## 重构目标

将首页从高密度卡片集合，改为一条更容易理解和继续浏览的移动端路径：先看到今日结论，再获得一个具体行动，然后进入问题和完整报告。

## 新首页结构

1. 沉浸式今日观察：只保留日期、关键词、核心结论、简短依据和一个主动作。
2. 今日落点：使用浅色全宽区块展示“今天只做这一件”、适合事项和暂时放下的事项。
3. 具体问题：保留三条高相关问题及自由提问入口。
4. 核心报告：生辰、星座、紫微使用连续列表展示，并提供全部报告入口。

## 删除的重复结构

- Hero 内三栏仪表盘。
- 独立的“继续问玄枢”大卡。
- 四张同形问题卡。
- 重复的三条报告轨道和“报告 / 工具”双卡入口。
- 多层描边卡片和无效装饰。

## 保留的真实能力

- 当前档案切换。
- 每日内容稳定选择。
- 问题解读弹层。
- 1080 x 1920 分享图流程。
- 报告、工具和个人中心路由。
- 示例档案边界提示。

## 新增文件

- `src/lib/mobile/homePresentation.ts`
- `src/components/mobile/HomeDailyHero.tsx`
- `src/components/mobile/HomeTodayFocus.tsx`
- `src/components/mobile/HomeQuestionList.tsx`
- `src/components/mobile/HomeReportGateway.tsx`
- `src/styles/xuanshu-home-v2.css`

## 视觉验收

- 375 x 812：无横向溢出，首屏可见今日落点。
- 390 x 844：主设计尺寸通过。
- 430 x 932：布局没有被拉散。
- 所有首页链接与按钮可见触控高度不低于 44px。
- 主按钮、问题弹层、分享弹层和档案切换均完成浏览器操作验证。

截图位于 `output/home-redesign-2026-07-21/`。

- `09-home-v2-final-390.png`：最终 390px 首屏。
- `10-before-after-390.png`：旧首页与新首页并排对照。

本轮从现状检查到最终验证实际用时约 16 分钟。

## 工程验证

- `npm run lint`：通过。
- `npm test`：12 个测试文件、55 项测试通过。
- `npm run qa:product-flow`：通过，控制台错误为 0。
- `npm run build:mobile-static`：通过，25 个静态页面生成成功。
