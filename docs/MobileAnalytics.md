# 移动端埋点说明

## 原则

- 只记录交互事件、内容 ID、页面、设备环境类别和耗时。
- 不记录出生日期、地点、问题正文、报告正文、用户名或其他个人敏感信息。
- 浏览器开启 `Do Not Track` 时不发送。
- 埋点失败不影响页面操作。

## 事件

| 事件 | 触发时机 | 关键字段 |
| --- | --- | --- |
| `home_hero_impression` | 首页今日卡完成首屏渲染 | `dailyId`, `dataSource` |
| `question_click` | 点击具体问题 | `questionId`, `context` |
| `question_sheet_open` | 问题弹层可见 | `questionId`, `context`, `durationMs` |
| `question_change` | 弹层内换题 | `fromId`, `toId`, `context` |
| `share_image_generate_start` | 开始生成 PNG | `posterId`, `category` |
| `share_image_generate_success` | PNG 生成完成 | `posterId`, `category`, `durationMs` |
| `share_image_generate_failure` | PNG 生成失败 | `posterId`, `category`, `durationMs` |
| `share_image_save_success` | 浏览器接受保存动作 | `posterId`, `category`, `delivery` |
| `share_image_share_success` | 系统文件分享完成 | `posterId`, `category`, `durationMs` |
| `share_image_share_failure` | 文件分享不支持或失败 | `posterId`, `category`, `reason`, `durationMs` |

`POST /api/analytics` 当前将规范化后的事件写入服务端结构化日志。后续接入正式分析平台时，只需要替换服务端消费端，不需要改页面事件名。

## 数据适配

页面通过 `src/lib/mobile/insightDataAdapter.ts` 读取每日内容与问题题库。默认适配器使用本地目录；后续可以注入真实命盘或星盘解析结果，页面组件无需修改。
