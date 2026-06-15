# 八字方向助手

免费的四柱八字人生方向参考网站 MVP。用户注册后可以创建出生档案，系统根据四柱八字给出“适合做什么、不适合做什么、下一步行动建议”的温和参考。

## 当前能力

- 注册、登录、退出
- 创建出生档案：出生年月日、时间、地点、性别、农历/阳历
- 使用 `lunar-javascript` 生成四柱、五行、十神、纳音和日主
- 登录后根据命盘生成“今日方向卡”：适合做、暂缓做、三步行动
- 根据命盘生成“低谷行动卡”：稳定步骤、15 分钟小行动、复盘问题
- 根据命盘生成完整报告数据：自我底色、五行能量、事业学习、关系沟通、近期行动计划
- 根据命盘生成流年/月度方向：年度关键词、当前月建议、12 个月节奏
- 根据命盘生成 SVG 图片：报告封面、五行能量图，可预览和下载
- 用户可导出或删除自己的命盘、报告、流年、行动卡和提问历史
- 每个用户每日免费提问限制，默认 5 次
- 无 `OPENAI_API_KEY` 时使用本地规则引擎回答
- 配置 `OPENAI_API_KEY` 后自动改用 OpenAI Responses API
- 历史问答保存到本地 JSON
- 管理员统计后台：用户、命盘、提问、估算 token、最近问题
- 广告位预留：当前只显示占位，不接广告 SDK
- 公开页面：关于、隐私说明、使用边界

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

完整部署说明见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

本地服务启动后，可以跑一遍核心链路烟测：

```bash
npm run smoke
```

## 环境变量

复制 `.env.example` 为 `.env.local` 后按需填写：

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
OPENAI_TIMEOUT_MS=20000
AI_FORCE_LOCAL=false
AI_FALLBACK_ON_ERROR=true
DAILY_QUESTION_LIMIT=5
MAX_PROFILES_PER_USER=3
MAX_QUESTION_CHARS=500
MAX_PROFILE_NAME_CHARS=40
MAX_BIRTH_PLACE_CHARS=80
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_REGISTER=10
RATE_LIMIT_LOGIN=20
RATE_LIMIT_PROFILE_WRITE=20
RATE_LIMIT_QUESTION_WRITE=30
APP_DATA_DIR=./data
ADMIN_EMAILS=
APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
APP_VERSION=0.1.0
```

说明：

- `OPENAI_API_KEY` 不填也能用，系统会走本地规则引擎。
- `AI_FORCE_LOCAL=true` 可以强制不调用 OpenAI，适合免费运营早期控成本。
- `AI_FALLBACK_ON_ERROR=true` 会在 OpenAI 失败时自动降级到本地规则回答。
- `ADMIN_EMAILS` 用英文逗号分隔，例如 `admin@example.com,owner@example.com`。只有这些邮箱注册/登录后才能看到统计后台。
- `APP_DATA_DIR` 是本地 JSON 数据目录。正式公开运营前建议迁移到数据库，或者至少做好定时备份。
- `MAX_*` 系列用于限制免费站成本和滥用。
- `RATE_LIMIT_*` 系列用于限制短时间内重复调用接口，防止注册、登录、提问被脚本刷爆。

## 健康检查

```bash
curl http://localhost:3000/api/health
```

正常情况下会返回 `status: ok`。

## 自动烟测

```bash
npm run smoke
```

默认测试 `http://localhost:3000`。如果要测试线上地址：

```bash
SMOKE_BASE_URL=https://你的域名 npm run smoke
```

烟测会验证健康检查、注册、创建命盘、今日方向、低谷行动卡、命盘报告、流年/月度方向、分享图片、提问、读取用户数据、个人数据导出、账号数据删除，以及普通用户不能访问管理员导出。

## 产品边界

本产品定位为文化娱乐、自我探索、参考解读，不替代医疗、法律、投资、心理咨询、职业咨询等专业建议。

## 上线前建议

- 配置正式 `OPENAI_API_KEY`
- 配置 `ADMIN_EMAILS`
- 配置 HTTPS 和域名
- 持久化数据目录并设置备份
- 确认隐私说明、使用边界和广告展示规则
- 用户量变大后，把本地 JSON 存储迁移到 PostgreSQL 或 MySQL
