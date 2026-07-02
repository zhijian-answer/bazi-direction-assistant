#!/usr/bin/env bash
set -Eeuo pipefail

SITE=/etc/nginx/sites-available/superstaff-duckdns
BACKUP="$SITE.bak.disable-xuanshu-$(date +%Y%m%d%H%M%S)"

test -f "$SITE"
cp "$SITE" "$BACKUP"
systemctl disable --now xuanshu-mobile-preview.service 2>/dev/null || true

python3 - "$SITE" <<'PY'
from pathlib import Path
import re
import sys

path = Path(sys.argv[1])
text = path.read_text(encoding="utf-8")
text = re.sub(
    r"    # BEGIN XUANSHU_MOBILE_PREVIEW\n.*?    # END XUANSHU_MOBILE_PREVIEW\n\n?",
    "",
    text,
    flags=re.DOTALL,
)
path.write_text(text, encoding="utf-8")
PY

if ! nginx -t; then
  cp "$BACKUP" "$SITE"
  nginx -t
  exit 1
fi

systemctl reload nginx
curl -fsS -o /dev/null https://zzj-superstaff.duckdns.org/
echo "Server preview disabled; original site remains online."
