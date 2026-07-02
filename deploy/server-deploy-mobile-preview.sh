#!/usr/bin/env bash
set -Eeuo pipefail

: "${RELEASE_SHA:?RELEASE_SHA is required}"
: "${ARTIFACT:?ARTIFACT is required}"

APP=/opt/xuanshu-mobile-preview
RELEASE="$APP/releases/$RELEASE_SHA"
PORT=3210
NGINX_SITE=/etc/nginx/sites-available/superstaff-duckdns
SERVICE=/etc/systemd/system/xuanshu-mobile-preview.service

if ss -ltn | awk '{print $4}' | grep -Eq "(^|:)${PORT}$" && ! systemctl is-active --quiet xuanshu-mobile-preview.service; then
  echo "Port $PORT is already used by another service" >&2
  exit 1
fi

test -f "$ARTIFACT"
test -f "$NGINX_SITE"
mkdir -p "$APP/releases"
rm -rf "$RELEASE"
mkdir -p "$RELEASE"
tar -xzf "$ARTIFACT" -C "$RELEASE"
test -f "$RELEASE/server.js"
chown -R www-data:www-data "$RELEASE"

cat > "$SERVICE" <<EOF
[Unit]
Description=Xuanshu mobile preview
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$APP/current
Environment=NODE_ENV=production
Environment=PORT=$PORT
Environment=HOSTNAME=127.0.0.1
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

BACKUP="$NGINX_SITE.bak.$(date +%Y%m%d%H%M%S)"
cp "$NGINX_SITE" "$BACKUP"

python3 - "$NGINX_SITE" <<'PY'
from pathlib import Path
import re
import sys

path = Path(sys.argv[1])
text = path.read_text(encoding="utf-8")
start = "    # BEGIN XUANSHU_MOBILE_PREVIEW\n"
end = "    # END XUANSHU_MOBILE_PREVIEW\n"

if start in text:
    text = re.sub(
        re.escape(start) + r".*?" + re.escape(end),
        "",
        text,
        flags=re.DOTALL,
    )

anchor = "    location / {\n"
if text.count(anchor) != 1:
    raise SystemExit("Expected exactly one root location in the DuckDNS server block")

block = """    # BEGIN XUANSHU_MOBILE_PREVIEW
    location = /m {
        proxy_pass http://127.0.0.1:3210;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ^~ /m/ {
        proxy_pass http://127.0.0.1:3210;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location = /api/analytics {
        proxy_pass http://127.0.0.1:3210;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ^~ /xuanshu-assets/_next/ {
        rewrite ^/xuanshu-assets(/_next/.*)$ $1 break;
        proxy_pass http://127.0.0.1:3210;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    # END XUANSHU_MOBILE_PREVIEW

"""

path.write_text(text.replace(anchor, block + anchor), encoding="utf-8")
PY

if ! nginx -t; then
  cp "$BACKUP" "$NGINX_SITE"
  nginx -t
  exit 1
fi

systemctl reload nginx
curl -fsS -o /dev/null https://zzj-superstaff.duckdns.org/
curl -fsS -o /dev/null https://zzj-superstaff.duckdns.org/m
curl -fsS -o /dev/null https://zzj-superstaff.duckdns.org/m/report/bazi
curl -fsS -o /dev/null https://zzj-superstaff.duckdns.org/m/report/zodiac

find "$APP/releases" -mindepth 1 -maxdepth 1 -type d ! -path "$RELEASE" -printf '%T@ %p\n' \
  | sort -nr \
  | tail -n +4 \
  | cut -d' ' -f2- \
  | xargs -r rm -rf
rm -f "$ARTIFACT"

echo "Xuanshu mobile preview deployed at release $RELEASE_SHA"
