# 玄枢移动 H5 产品闭环设计验收

## 验收对象

- 机制参考：`output/reference-audit/cece-recording/contact-sheet-1.jpg`
- 分享参考：`output/reference-audit/cece-recording/contact-sheet-2.jpg`
- 方案基准：`output/reference-audit/xuanshu-product-loop-plan-2026-07-01.md`
- 首页实现：`output/product-loop/01-home-first-screen-390x844.png`
- 问题弹层：`output/product-loop/02-question-sheet-390x844.png`
- 生辰继续探索：`output/product-loop/03-bazi-continue-exploring-390x844.png`
- 星座关系问题：`output/product-loop/04-zodiac-relationship-questions-390x844.png`
- 分享弹层：`output/product-loop/05-share-sheet-390x844.png`
- 视口：375 × 812、390 × 844、430 × 932

## 对照证据

- 首页机制并排：`output/product-loop/source-home-comparison.png`
- 分享机制并排：`output/product-loop/source-share-comparison.png`
- 聚焦证据：四类 `output/product-loop/*-1080x1920.png` 已单独打开检查。
- 参考用于判断内容顺序、问题链和分享闭环，不作为品牌、配色、排版或原文的复制目标。

## Findings

- 无 P0、P1、P2 问题。
- 信息架构：首页第一屏从功能目录改为日期稳定的今日状态，完整呈现关键词、适合、少做、行动和两个主动作，并露出问题入口。
- 问题链：首页六题、生辰四题、星座五个关系问题均进入同一解读结构；弹层可滚动、可换题、可生成分享卡，关闭后焦点返回触发按钮。
- 字体与排版：人格结论继续使用宋体，解释与操作使用系统黑体；长中文标题在三档宽度自然换行，没有负字距、裁切或横向溢出。
- 间距与节奏：今日主卡、问题入口、继续探索、报告入口依次出现；生辰与星座在长术语阅读前出现具体问题，没有连续堆叠四张分享卡。
- 颜色与视觉令牌：沿用玄枢已有墨绿、米杏、古铜与星座浅蓝体系，没有复制参考产品的粉色、图标或插画。
- 图片质量：海报由实际 DOM 和中文字体生成，不使用占位图；四类输出均为可重新打开的 1080 × 1920 PNG，透明背景未变黑。
- 文案：所有内容明确标注来自本地结构与示例配置，不使用实时 AI、准确率、确定性断言、假评论或假在线人数。
- 交互与无障碍：可见点击目标均不低于 44px；底部弹层支持 Esc、焦点约束、滚动锁定和安全区；减少动画模式下过渡降为 `0.00001s`。
- 分享闭环：支持预览、生成、保存 PNG、设备文件分享、失败重试；不支持文件分享时显示完整图片供长按保存，不回退成文本分享。

## 本轮修正

- 新增每日内容库与“日期 + 档案”确定性选择逻辑。
- 新增统一问题题库、问题入口、继续探索和问题解读弹层。
- 新增海报模板、分享弹层和真实图片生成 Hook。
- 将生辰连续四卡缩为一张主卡，其余进入分享选择器。
- 将星座五个关系问题前置，并为今日提醒增加星座能量图入口。
- 补齐三档移动宽度、焦点返回、减少动画、PNG 尺寸和控制台验证。

## Follow-up Polish

- P3：未来接入真实报告数据后，应由服务端保存海报历史，避免用户更换设备后丢失已生成图片。
- P3：微信内置浏览器仍需在真实 iOS 和安卓设备上补一次长按保存手势验收。

final result: passed

---

# 市场交付闭环补强 2026-07-06

## 已验证

- 新增统一档案切换弹层，首页、生辰/流盘、星座和紫微均可直接切换；档案甲切换档案乙后，日柱、流盘本命、星座组合与紫微档案同步刷新。
- 档案弹层挂载到 `document.body`，不再被底部导航遮挡；375/390/430 无横向溢出，关闭后焦点返回触发按钮。
- 首页和生辰问题链改为真实档案规则结果；档案甲显示甲寅/火重心，档案乙显示壬午/金重心，来源、结论和行动建议均变化。
- 静态版新建档案正确识别 `?mode=new`，不会带入当前档案资料。
- 静态体验版不展示无效登录入口，明确说明仅本机保存；动态版保留真实登录、同步、数据导出和云端账号删除。
- 新增并统一 `/privacy`、`/terms`、`/about`，动态版和静态版共用真实内容；GitHub Pages 基路径、图标和根入口重定向已验证。
- 静态内部链接遍历无 404；欢迎、创建、生成、我的四页在 375/390/430 下均无溢出、无小于 44px 的可见操作区、控制台无错误。
- 问题弹层与分享弹层改用 Portal 后回归正常，PNG 输出仍为 1080×1920。

## 截图

- 首次体验与主要流程：`output/design-qa/full-app-static-2026-07-06/`。
- 档案切换：`output/design-qa/profile-switcher-2026-07-06/switcher-375-settled.png`、`switcher-390-settled.png`、`switcher-430-settled.png`。
- 法律与本地模式：`output/design-qa/market-info-2026-07-06/`。

## 仍待外部验证

- iPhone Safari、微信 iOS、Android Chrome、微信 Android 的真实设备保存、长按图片和系统分享。
- 中国大陆不同运营商访问正式预发布域名的稳定性。

current result: implementation and browser QA verified; real-device and network QA pending

---

# 市场交付真实数据硬化（进行中）

## 本轮完成

- 星座报告接入隔离的 `ZodiacEngine`，广州样本实际结果为太阳双子、月亮白羊、上升狮子，不再使用固定上升金牛。
- 时辰未知只展示全天不换座的星体；地点未知不生成上升；保存精确坐标时允许未收录城市生成完整配置。
- 生辰封面、结构重点和今日行动全部改为当前档案计算结果，移除页面中的固定庚午、土金和火元素文案。
- 流盘按当前档案和日期生成本命、大运、流年、流月、近四个月、问题解读与分享图，移除固定月份示例。
- 首页今日观察改为本命日主与当日干支的结构关系，同日稳定、次日更新，不加载星盘或紫微算法。
- 修复真实档案继承示例广州坐标的问题；城市留空时本地、同步 API 和星座部分报告边界保持一致。
- 静态导出停用网络埋点，分享图生成期间控制台无 501 请求。

## 证据

- 星座三档：`output/design-qa/zodiac-real-engine-2026-07-06/zodiac-375.png`、`zodiac-390.png`、`zodiac-430.png`。
- 星座分享图：`output/design-qa/zodiac-real-engine-2026-07-06/zodiac-share-1080x1920.png`。
- 生辰与流盘：`output/design-qa/bazi-flow-real-data-2026-07-06/bazi-390.png`、`flow-375.png`、`flow-390.png`、`flow-430.png`。
- 流盘分享图：`output/design-qa/bazi-flow-real-data-2026-07-06/flow-share-1080x1920.png`。
- 动态今日观察：`output/design-qa/market-data-loop-2026-07-06/home-dynamic-daily-390.png`。

## 尚未冒充通过的项目

- iPhone Safari、微信 iOS、Android Chrome、微信 Android 的真实设备保存与系统分享仍需用户侧真机验证。
- 中国大陆不同运营商的正式访问稳定性仍需部署后实测。

current result: implementation verified, real-device verification pending

---

# A 风格全 App 第一阶段设计验收

## 验收范围

- 本阶段仅验收 Design Token、黄铜天体仪资产、移动外壳、顶部栏、体系切换、底部导航与公共仪器组件。
- 首页内容结构、创建档案、三大报告正文、问题弹层和分享图的完整参考图复刻属于后续 P1-P3，不在本阶段冒充完成。
- 参考视觉真值：`output/design-qa/a-style-p0/reference-home.png`
- 实现截图：`output/design-qa/a-style-p0/home-375.png`、`home-390.png`、`home-430.png`
- 完整对照：`output/design-qa/a-style-p0/home-reference-vs-implementation-390.png`
- 视口：375 × 812、390 × 844、430 × 932。

## 对照证据

- 全景对照确认墨黑实验室背景、黄铜结构、朱砂选中线、顶部品牌和四项底部导航已经进入同一视觉体系。
- 聚焦对照确认真实天体仪图像替代了原有纯 CSS 圆环主视觉；图像为本地 853 × 1844 WebP，149KB，不依赖远程资源。
- 三档视口均无横向溢出；所有当前可见链接和按钮的点击区域均不小于 44px。
- `prefers-reduced-motion: reduce` 下轨道动画与按钮过渡均降至 `0.00001s`。

## Findings

- 本阶段范围内没有遗留 P0、P1、P2 问题。
- 字体与排版：品牌、结论继续使用宋体，正文使用系统黑体，时间和结构标签使用等宽字体；未使用负字距。
- 间距与布局：首页在三档宽度均保留完整今日结论，并在首屏下方露出问题入口；安全区和固定底栏未遮挡内容。
- 颜色与令牌：基础色收敛到 `#030608`、`#071011`、`#D8AA5D`、`#D65A45`、`#7EAD98`、`#8DB8D8`，未出现 AI 蓝紫渐变或高密度发光。
- 图片质量：天体仪主体、刻度、机械连接和朱砂节点清晰；移动端裁切稳定，WebP 无透明边缘或压缩色块。
- 图标：品牌轨道标记使用来源母版的本地真实资产；通用操作图标继续沿用项目已有图标库，后续报告页再按体系逐页替换。
- 交互：顶部按钮、体系标签、底部导航保留原路由，按压和焦点状态可见；没有新增第五个底部导航。
- 文案：顶部品牌改为“东方命理数据实验室”，没有新增预测、准确率、假 AI 或商业化承诺。

## 本阶段修正

- 新增本地黄铜天体仪和品牌轨道标记。
- 重构颜色、材质、字体、间距、边框、阴影和动效 Token。
- 新增 `InstrumentPanel`、`OrbitChart`、`DataPill`、`SectionTitle`、`BrassButton`。
- 统一移动外壳、顶部栏、体系标签和四项底部导航。
- 保持紫微算法、问题链、分享 Hook 和业务数据不变。

## 后续阶段

- P1：首页和创建档案按参考图 01、02 完整重排。
- P2：生辰、星座、紫微分别建立五行、星轨和十二宫视觉中心。
- P3：问题弹层和 1080 × 1920 分享图同步 A 风格。

final result: passed
