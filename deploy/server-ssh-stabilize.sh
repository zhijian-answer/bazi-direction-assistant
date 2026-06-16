#!/usr/bin/env bash
set -Eeuo pipefail

echo "== stabilize ssh $(date) =="

install -d -m 0755 /etc/ssh/sshd_config.d

cat > /etc/ssh/sshd_config.d/99-bazi-stability.conf <<'EOF'
UseDNS no
GSSAPIAuthentication no
MaxStartups 50:30:100
LoginGraceTime 60
ClientAliveInterval 30
ClientAliveCountMax 3
EOF

sshd -t
systemctl reload ssh || systemctl reload sshd

echo "== ssh config ok $(date) =="
