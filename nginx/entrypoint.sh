#!/bin/sh
set -e

API="${API_BASE_URL:-/api/v1}"
WS="${WS_BASE_URL:-/ws}"
VERSION="${APP_VERSION:-unknown}"

ENV_BLOCK="<script>window.__RXP_ENV__ = { API_BASE_URL: '${API}', WS_BASE_URL: '${WS}', APP_VERSION: '${VERSION}' };</script>"

# Find index.html files explicitly (no glob expansion issues)
find /usr/share/nginx/html -name "index.html" | while read INDEX; do
  echo "Injecting env into: $INDEX"
  awk -v block="${ENV_BLOCK}" '{
    gsub(/<!--ENVIRONMENT_PLACEHOLDER-->/, block)
    print
  }' "$INDEX" > "${INDEX}.tmp" && mv "${INDEX}.tmp" "$INDEX"
done

echo "Environment injected — API: ${API}"

exec "$@"
