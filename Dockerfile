# ── Stage 1: Build ────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build:prod

# ── Stage 2: Runtime ──────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Allow nginx to run as non-root
RUN addgroup --system rxp_users && \
    adduser --system --ingroup rxp_users rxp_user && \
    chown -R rxp_user:rxp_users /var/cache/nginx /var/log/nginx && \
    touch /tmp/nginx.pid && \
    chown rxp_user:rxp_users /tmp/nginx.pid

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder --chown=rxp_user:rxp_users \
  /app/dist/rural-experience-web \
  /usr/share/nginx/html

COPY --chown=rxp_user:rxp_users nginx/nginx.conf /etc/nginx/nginx.conf
COPY --chown=rxp_user:rxp_users nginx/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER rxp_user

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
