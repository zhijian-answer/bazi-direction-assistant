#!/usr/bin/env bash
set -Eeuo pipefail

exec > /tmp/bazi-deploy.log 2>&1
trap 'echo FAILED > /tmp/bazi-deploy.failed' ERR
rm -f /tmp/bazi-deploy.done /tmp/bazi-deploy.failed

APP=/opt/bazi-direction-assistant
REPO=https://github.com/zhijian-answer/bazi-direction-assistant.git
DOMAIN=https://zzj-superstaff.duckdns.org
NGINX_SITE=/etc/nginx/sites-available/superstaff-duckdns

echo "== start $(date) =="

rm -f /opt/bazi-direction-assistant-*.tar.gz /opt/bazi-direction-assistant-*.tar.gz.b64
mkdir -p "$APP/data/backups"

if [ -d "$APP/current/.git" ]; then
  git -C "$APP/current" fetch origin main
  git -C "$APP/current" reset --hard origin/main
else
  rm -rf "$APP/current"
  git clone "$REPO" "$APP/current"
fi

cd "$APP/current"
npm ci
npm run build

cat > .env.production <<EOF
NODE_ENV=production
PORT=3100
HOSTNAME=127.0.0.1
APP_URL=$DOMAIN
NEXT_PUBLIC_SITE_URL=$DOMAIN
APP_DATA_DIR=$APP/data
BACKUP_DIR=$APP/data/backups
BACKUP_RETENTION=30
AI_FORCE_LOCAL=true
AI_FALLBACK_ON_ERROR=true
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
ADMIN_EMAILS=
APP_VERSION=0.1.0
EOF

chown -R www-data:www-data "$APP"
cp deploy/bazi-direction-assistant.service /etc/systemd/system/bazi-direction-assistant.service
systemctl daemon-reload
systemctl enable bazi-direction-assistant
systemctl restart bazi-direction-assistant
sleep 5
curl -fsS http://127.0.0.1:3100/api/health

if [ -f "$NGINX_SITE" ]; then
  cp "$NGINX_SITE" "$NGINX_SITE.bak.$(date +%Y%m%d%H%M%S)"
fi

cat > "$NGINX_SITE" <<'EOF'
server {
    listen 80;
    server_name zzj-superstaff.duckdns.org;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name zzj-superstaff.duckdns.org;

    ssl_certificate /etc/letsencrypt/live/zzj-superstaff.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zzj-superstaff.duckdns.org/privkey.pem;

    client_max_body_size 2m;

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/superstaff-duckdns
nginx -t
systemctl reload nginx
curl -fsS "$DOMAIN/api/health"
systemctl disable --now superstaff-agent.service superstaff-api.service 2>/dev/null || true

echo "DONE $(date)" > /tmp/bazi-deploy.done
echo "== done $(date) =="
