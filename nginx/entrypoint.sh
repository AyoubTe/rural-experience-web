#!/bin/sh
set -e

# Build the env block from container environment variables
ENV_BLOCK="<script>
  window.__RXP_ENV__ = {
    API_BASE_URL: '${API_BASE_URL:-/api/v1}',
    WS_BASE_URL:  '${WS_BASE_URL:-/ws}',
    APP_VERSION:  '${APP_VERSION:-unknown}'
  };
</script>"

# Replace the placeholder in all index.html files
for INDEX in /usr/share/nginx/html/*/index.html; do
  sed -i "s|<!--ENVIRONMENT_PLACEHOLDER-->|${ENV_BLOCK}|g" \
    "$INDEX"
done

echo "Environment injected for: $(echo $API_BASE_URL)"

# Execute CMD (nginx)
exec "$@"
