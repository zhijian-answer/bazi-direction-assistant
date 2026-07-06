# 玄枢市场交付数据与 API

## 数据边界

- 游客档案、未上传的分享图片和阅读状态默认保存在浏览器本地。
- 登录后只在用户主动点击同步时上传档案。
- 同一 `localProfileId` 的本地和云端内容不一致时返回 `409`，不会静默覆盖。
- 分享图片本体仍由浏览器生成和保存；服务端只保存分享记录和可选的非 `data:` 图片地址。
- 管理接口在每次请求和服务端页面渲染时都校验 `ADMIN_EMAILS`。

## 核心数据表

当前开发环境使用 `data/app-db.json`，结构与未来关系型数据库表一一对应：

| 集合 | 主键 | 关键关联 | 用途 |
| --- | --- | --- | --- |
| `users` | `id` | - | 账号与免费额度 |
| `sessions` | `token` | `userId` | 30 天登录会话 |
| `profiles` | `id` | `userId` | 出生档案与八字计算结果 |
| `questions` | `id` | `userId`, `profileId` | 问题链历史 |
| `reports` | `id` | `userId`, `profileId` | 生辰、星座、紫微、流盘版本快照 |
| `shareImages` | `id` | `userId`, `profileId` | 分享图生成记录 |
| `contentRules` | `id` | - | 文案和解释规则版本 |
| `syncStates` | `userId + localProfileId` | `cloudProfileId` | 本地到云端映射与冲突状态 |

## 市场交付接口

### 星座计算契约

- 档案可保存 `latitude`、`longitude` 和 `timezone`；城市目录匹配成功时由客户端补齐，未来接地图服务后可直接写入精确坐标。
- 出生城市允许留空，不能阻塞建档和同步；留空时星座报告不生成上升星座，其他报告按各自资料边界降级。
- 星座页面只消费 `ZodiacEngine` 标准结构，第三方库仅在 `src/lib/zodiac/circularEngine.ts` 中读取。
- 出生时辰和坐标都明确时，生成太阳、月亮、水星、金星、火星、上升、中天、宫位与主要相位。
- 出生时辰未知时，比较当天 00:00、12:00、23:59 三个时点，只展示当天没有换座的星体，不生成上升星座。
- 出生地点无法解析且没有保存坐标时，不生成上升星座；页面必须显示部分报告说明，不能使用默认城市冒充。
- 当前引擎与规则版本随报告快照保存，后续升级算法时不得静默覆盖旧报告。

### 档案同步

- `GET /api/sync/profiles`：当前账号的云端档案与同步状态。
- `POST /api/sync/profiles`：上传或关联本地档案。
- `201`：创建云端档案。
- `200`：复用相同档案或已有关联。
- `409`：本地与云端内容冲突，返回 `local`、`cloud` 和 `syncState`。

### 报告记录

- `GET /api/reports`：当前账号最近 50 份报告。
- `GET /api/reports?profileId=...&type=bazi&history=1`：某档案的报告历史。
- `POST /api/reports`：保存报告快照。八字报告由服务端重新生成；其他报告接收不超过 100KB 的结构化内容。

### 分享记录

- `GET /api/share-images?profileId=...`：分享图记录。
- `POST /api/share-images`：保存类型、来源、标题和可选图片地址。
- `DELETE /api/share-images?imageId=...`：删除自己的分享记录。

### 内容规则

- `GET /api/content-rules?type=daily`：公开读取已启用规则。
- `POST /api/content-rules`：管理员新增或更新规则，内容不超过 100KB。

### 移动端事件

动态部署通过 `POST /api/analytics` 接收白名单事件；静态导出会自动停用网络埋点，避免对不存在的 API 发请求。

- 首次体验：`app_open`、`onboarding_start`、`onboarding_demo_select`。
- 建档：`profile_create_start`、`profile_create_step_complete`、`profile_create_complete`。
- 报告与资料边界：`report_view`、`insufficient_data_show`。
- 问题链：`question_click`、`question_sheet_open`、`question_change`。
- 分享：`share_poster_open`、图片生成开始/成功/失败、保存成功、分享成功/失败。
- 登录与同步：`login_prompt_show`、`login_success`、`sync_success`、`sync_fail`。
- 每条事件包含版本、规则版本、时间、路由、会话、设备环境、耗时和受限长度的结构化元数据，不上传出生日期或出生地点。

### 后台

- `/admin`：真实数据管理页面。
- `/api/admin/stats`：用户、档案、问题、报告、分享、规则和同步冲突统计。
- `/api/admin/export`：脱敏导出；完整备份仍需显式确认参数。

## 生产迁移建议

1. 将 `AppDb` 集合迁移到 PostgreSQL，对 `userId`、`profileId`、`createdAt` 和同步复合键建立索引。
2. 图片本体迁移到对象存储，`shareImages.imageUrl` 只保存受控地址。
3. 内容规则增加发布人、发布时间和回滚版本字段。
4. 将 JSON 文件写队列替换为数据库事务，保留现有 API 契约不变。
