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
