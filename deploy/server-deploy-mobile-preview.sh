#!/usr/bin/env bash
set -Eeuo pipefail

: "${RELEASE_SHA:?RELEASE_SHA is required}"
: "${ARTIFACT:?ARTIFACT is required}"

APP=/opt/xuanshu-mobile-preview
RELEASE="$APP/releases/$RELEASE_SHA"
PORT=3210
DOMAIN=xuanshu.fjzxhc.cn
NGINX_SITE=/etc/nginx/sites-available/xuanshu-fjzxhc-cn
NGINX_ENABLED=/etc/nginx/sites-enabled/xuanshu-fjzxhc-cn
SERVICE=/etc/systemd/system/xuanshu-mobile-preview.service
SHARED_ENV="$APP/shared/app.env"
ACME_ROOT=/var/www/xuanshu-acme
CERT_DIR="/etc/letsencrypt/live/$DOMAIN"

if ss -ltn | awk '{print $4}' | grep -Eq "(^|:)${PORT}$" && ! systemctl is-active --quiet xuanshu-mobile-preview.service; then
  echo "Port $PORT is already used by another service" >&2
  exit 1
fi

test -f "$ARTIFACT"
mkdir -p "$APP/releases"
rm -rf "$RELEASE"
mkdir -p "$RELEASE"
tar -xzf "$ARTIFACT" -C "$RELEASE"
test -f "$RELEASE/server.js"
chown -R www-data:www-data "$RELEASE"

cat > "$SERVICE" <<EOF
[Unit]
Description=Xuanshu mobile app
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$APP/current
Environment=NODE_ENV=production
Environment=PORT=$PORT
Environment=HOSTNAME=127.0.0.1
EnvironmentFile=-$SHARED_ENV
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
KillSignal=SIGINT
TimeoutStopSec=20
SyslogIdentifier=xuanshu-mobile-preview

[Install]
WantedBy=multi-user.target
EOF

ln -sfn "$RELEASE" "$APP/current"
systemctl daemon-reload
systemctl enable xuanshu-mobile-preview.service
systemctl restart xuanshu-mobile-preview.service

for attempt in $(seq 1 20); do
  if curl -fsS -o /dev/null "http://127.0.0.1:${PORT}/m"; then
    break
  fi
  if [ "$attempt" -eq 20 ]; then
    journalctl -u xuanshu-mobile-preview.service -n 80 --no-pager
    exit 1
  fi
  sleep 2
done

mkdir -p "$ACME_ROOT"
if [ ! -f "$CERT_DIR/fullchain.pem" ]; then
  if ! command -v certbot >/dev/null 2>&1; then
    apt-get update
    apt-get install -y certbot
  fi

  cat > "$NGINX_SITE" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    location ^~ /.well-known/acme-challenge/ {
        root $ACME_ROOT;
    }

    location / {
        return 302 https://\$host\$request_uri;
    }
}
EOF
  ln -sfn "$NGINX_SITE" "$NGINX_ENABLED"
  nginx -t
  systemctl reload nginx
  certbot certonly \
    --webroot \
    --webroot-path "$ACME_ROOT" \
    --domain "$DOMAIN" \
    --non-interactive \
    --agree-tos \
    --register-unsafely-without-email
fi

cat > "$NGINX_SITE" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate $CERT_DIR/fullchain.pem;
    ssl_certificate_key $CERT_DIR/privkey.pem;

    location = / {
        return 302 /m;
    }

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

ln -sfn "$NGINX_SITE" "$NGINX_ENABLED"
nginx -t
systemctl reload nginx

for path in / /m /m/report/bazi /m/report/zodiac /m/chart/natal /m/chart/transit /api/health; do
  curl --retry 5 --retry-delay 2 --retry-all-errors -fsS -o /dev/null "https://$DOMAIN${path}"
done

find "$APP/releases" -mindepth 1 -maxdepth 1 -type d ! -path "$RELEASE" -printf '%T@ %p\n' \
  | sort -nr \
  | tail -n +4 \
  | cut -d' ' -f2- \
  | xargs -r rm -rf
rm -f "$ARTIFACT"

echo "Xuanshu mobile app deployed at release $RELEASE_SHA on https://$DOMAIN"
