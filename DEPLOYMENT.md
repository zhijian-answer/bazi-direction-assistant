# 部署说明

这个项目目前支持两种部署方式：普通 Node.js 部署和 Docker 部署。等服务器确定后，优先推荐 Docker，因为数据目录和健康检查更明确。

## 必填配置

复制环境变量模板：

```bash
cp .env.example .env.local
```

至少确认这些值：

```bash
APP_URL=https://你的域名
NEXT_PUBLIC_SITE_URL=https://你的域名
ADMIN_EMAILS=你的管理员邮箱@example.com
DAILY_QUESTION_LIMIT=5
MAX_PROFILES_PER_USER=3
MAX_QUESTION_CHARS=500
MAX_CHECKIN_ACTION_CHARS=160
MAX_CHECKIN_NOTE_CHARS=240
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_REGISTER=10
RATE_LIMIT_LOGIN=20
RATE_LIMIT_PROFILE_WRITE=20
RATE_LIMIT_QUESTION_WRITE=30
RATE_LIMIT_CHECKIN_WRITE=40
APP_DATA_DIR=./data
```

如果要启用真实 AI 回答：

```bash
OPENAI_API_KEY=你的 OpenAI API Key
OPENAI_MODEL=gpt-4.1-mini
OPENAI_TIMEOUT_MS=20000
AI_FORCE_LOCAL=false
AI_FALLBACK_ON_ERROR=true
```

不配置 `OPENAI_API_KEY` 时，系统会使用本地规则引擎，适合早期免费测试和服务器联调。

如果希望控制成本，可以设置：

```bash
AI_FORCE_LOCAL=true
```

如果 OpenAI 出现网络、额度或模型错误，默认会降级到本地规则回答：

```bash
AI_FALLBACK_ON_ERROR=true
```

## Docker 部署

准备环境变量：

```bash
cp .env.docker.example .env
```

编辑 `.env` 后启动：

```bash
docker compose up -d --build
```

检查健康状态：

```bash
curl http://127.0.0.1:3000/api/health
```

查看日志：

```bash
docker compose logs -f bazi-direction-assistant
```

停止：

```bash
docker compose down
```

数据默认挂载在项目的 `./data` 目录。上线后要定时备份这个目录。

## 普通 Node.js 部署

```bash
npm ci
npm run build
npm run start
```

默认端口是 `3000`。如果要换端口：

```bash
PORT=8080 npm run start
```

## systemd + Nginx 部署模板

项目内提供了三个模板：

- `deploy/production.env.example`
- `deploy/bazi-direction-assistant.service`
- `deploy/nginx.conf.example`

典型目录结构：

```bash
/opt/bazi-direction-assistant/current
/opt/bazi-direction-assistant/data
```

安装服务示例：

```bash
sudo mkdir -p /opt/bazi-direction-assistant/data
sudo cp deploy/production.env.example /opt/bazi-direction-assistant/current/.env.production
sudo cp deploy/bazi-direction-assistant.service /etc/systemd/system/bazi-direction-assistant.service
sudo systemctl daemon-reload
sudo systemctl enable bazi-direction-assistant
sudo systemctl start bazi-direction-assistant
```

Nginx 示例：

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/bazi-direction-assistant
sudo ln -s /etc/nginx/sites-available/bazi-direction-assistant /etc/nginx/sites-enabled/bazi-direction-assistant
sudo nginx -t
sudo systemctl reload nginx
```

## 健康检查

接口：

```bash
GET /api/health
```

正常返回：

```json
{
  "app_id": "bazi-direction-assistant",
  "status": "ok"
}
```

## 自动烟测

服务启动后执行：

```bash
SMOKE_BASE_URL=https://你的域名 npm run smoke
```

如果是在服务器本机测试本地端口：

```bash
SMOKE_BASE_URL=http://127.0.0.1:3000 npm run smoke
```

烟测会创建一个临时测试账号，并验证：

- `/api/health`
- `/manifest.webmanifest` 和应用图标
- 注册与 session cookie
- 创建命盘
- 删除错误命盘档案，并清理关联提问和打卡
- 今日方向
- 每日行动打卡和连续天数统计
- 低谷行动卡
- 命盘报告
- 流年/月度方向
- 分享图片
- 提问
- `/api/me` 持久化读取
- `/api/me/export` 个人数据导出
- `DELETE /api/me` 账号和个人数据删除
- 普通用户访问 `/api/admin/export` 返回 `403`

## 管理员备份

管理员账号登录后可访问：

```bash
/api/admin/export
```

默认导出会脱敏密码哈希和 session token。完整备份用于迁移或灾备：

```bash
/api/admin/export?mode=backup&confirm=full
```

完整备份包含密码哈希、salt 和 session token，只能由管理员保存，不要公开传输。

## 免费运营限制

这些环境变量用于控制成本和滥用：

```bash
DAILY_QUESTION_LIMIT=5
MAX_PROFILES_PER_USER=3
MAX_QUESTION_CHARS=500
MAX_CHECKIN_ACTION_CHARS=160
MAX_CHECKIN_NOTE_CHARS=240
MAX_PROFILE_NAME_CHARS=40
MAX_BIRTH_PLACE_CHARS=80
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_REGISTER=10
RATE_LIMIT_LOGIN=20
RATE_LIMIT_PROFILE_WRITE=20
RATE_LIMIT_QUESTION_WRITE=30
RATE_LIMIT_CHECKIN_WRITE=40
```

说明：当前限流是单进程内存级，适合 MVP 和单台服务器。以后如果多实例部署，需要改成 Redis 限流。

## 上线前检查

- `npm run check` 通过
- `SMOKE_BASE_URL=https://你的域名 npm run smoke` 通过
- `/api/health` 返回 `status: ok`
- `/manifest.webmanifest` 可以打开，手机浏览器能识别站点图标
- 普通用户不能访问 `/api/admin/stats`
- 普通用户不能访问 `/api/admin/export`
- 普通用户可以访问 `/api/me/export` 导出自己的数据
- 普通用户可以通过 `DELETE /api/me` 删除自己的账号和数据
- 管理员邮箱在 `ADMIN_EMAILS` 中
- `/privacy`、`/terms`、`/about` 可以打开
- 反向代理配置 HTTPS
- `data` 目录有持久化和备份
