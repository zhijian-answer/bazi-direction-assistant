# GitHub 拉取部署手册

服务器部署只走 GitHub 仓库拉取，不再使用本地分片上传。

## 目标结构

```bash
/opt/bazi-direction-assistant/current
/opt/bazi-direction-assistant/data
/opt/bazi-direction-assistant/data/backups
```

## 首次部署

把 `<repo-url>` 换成 GitHub 仓库地址：

```bash
mkdir -p /opt/bazi-direction-assistant/data/backups
cd /opt/bazi-direction-assistant
git clone <repo-url> current
cd current
npm ci
npm run build
```

## 环境变量

生产环境先用免费本地规则，不接 OpenAI 费用：

```bash
cat >/opt/bazi-direction-assistant/current/.env.production <<'EOF'
NODE_ENV=production
PORT=3100
HOSTNAME=127.0.0.1
APP_URL=https://你的域名
NEXT_PUBLIC_SITE_URL=https://你的域名
APP_DATA_DIR=/opt/bazi-direction-assistant/data
BACKUP_DIR=/opt/bazi-direction-assistant/data/backups
BACKUP_RETENTION=30
AI_FORCE_LOCAL=true
AI_FALLBACK_ON_ERROR=true
DAILY_QUESTION_LIMIT=5
MAX_PROFILES_PER_USER=3
ADMIN_EMAILS=
EOF
```

## systemd

```bash
cp deploy/bazi-direction-assistant.service /etc/systemd/system/bazi-direction-assistant.service
systemctl daemon-reload
systemctl enable bazi-direction-assistant
systemctl restart bazi-direction-assistant
curl -fsS http://127.0.0.1:3100/api/health
```

## Nginx

把 `server_name` 改成实际域名后：

```bash
cp deploy/nginx.conf.example /etc/nginx/sites-available/bazi-direction-assistant
ln -sf /etc/nginx/sites-available/bazi-direction-assistant /etc/nginx/sites-enabled/bazi-direction-assistant
nginx -t
systemctl reload nginx
```

## 后续更新

```bash
cd /opt/bazi-direction-assistant/current
git pull --ff-only
npm ci
npm run build
systemctl restart bazi-direction-assistant
curl -fsS http://127.0.0.1:3100/api/health
```

## 清理旧的分片上传残留

只删除本项目曾经产生的临时包：

```bash
rm -f /opt/bazi-direction-assistant-*.tar.gz /opt/bazi-direction-assistant-*.tar.gz.b64
```

## 验证

本地或服务器上执行：

```bash
SMOKE_BASE_URL=https://你的域名 npm run smoke
```
