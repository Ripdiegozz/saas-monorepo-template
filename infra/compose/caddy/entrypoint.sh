#!/bin/sh
set -e

# Generate Caddyfile from env: APP_DOMAIN, API_DOMAIN, TLS_SELF_SIGNED
APP_DOMAIN="${APP_DOMAIN:-app.localhost}"
API_DOMAIN="${API_DOMAIN:-api.localhost}"
if [ "${TLS_SELF_SIGNED}" = "true" ]; then
  TLS_BLOCK="tls internal"
else
  TLS_BLOCK=""
fi

if [ -n "$TLS_BLOCK" ]; then
	TLS_LINE="	$TLS_BLOCK"
else
	TLS_LINE=""
fi

cat > /etc/caddy/Caddyfile << CADDYFILE
# Generated - set APP_DOMAIN, API_DOMAIN, TLS_SELF_SIGNED in .env
${APP_DOMAIN} {
	reverse_proxy web:3000
${TLS_LINE}
}
${API_DOMAIN} {
	reverse_proxy server:4000
${TLS_LINE}
}
CADDYFILE

exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
