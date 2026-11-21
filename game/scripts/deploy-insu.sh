#!/usr/bin/env bash
# Build the game and publish it at https://insu.ng/cds/ (host Caddy on bfdev@main, static files).
# Run on main, from anywhere: game/scripts/deploy-insu.sh
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=$(mktemp -d)
NODE_ENV=production npx vite build --outDir "$OUT" --emptyOutDir >/dev/null
sudo -n mkdir -p /var/www/insu-files/cds
sudo -n rsync -a --delete "$OUT"/ /var/www/insu-files/cds/
sudo -n chmod -R a+rX /var/www/insu-files/cds
rm -rf "$OUT"
SNIP=/etc/caddy/insu-files.d/cds.caddy
if [ ! -f "$SNIP" ]; then
  sudo -n tee "$SNIP" >/dev/null <<'CADDY'
# /cds -> the CDS-SH hackathon game, static build (game/scripts/deploy-insu.sh)
redir /cds /cds/ 308
handle_path /cds/* {
	root * /var/www/insu-files/cds
	header Cache-Control "no-cache"
	file_server
}
CADDY
  if ! sudo -n caddy validate --config /etc/caddy/Caddyfile >/tmp/cds-caddy-validate.log 2>&1; then
    tail -n 15 /tmp/cds-caddy-validate.log >&2
    sudo -n rm -f "$SNIP"
    echo "caddy config invalid, snippet removed" >&2
    exit 1
  fi
  sudo -n systemctl reload caddy
  sleep 1
fi
curl -sS -o /dev/null -m 20 -w 'https://insu.ng/cds/ -> %{http_code} %{content_type}\n' https://insu.ng/cds/
