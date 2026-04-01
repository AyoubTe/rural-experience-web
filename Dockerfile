# ── Stage 1: Build ────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files first (layer cache — only invalidated if
# package.json changes, not on every source file change)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source and build
COPY . .
RUN npm run build:prod
# Equivalent to: ng build --configuration production --localize
# Produces: dist/ruralxperience-web/en-GB/ and dist/.../fr/

# ── Stage 2: Runtime ──────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove default Nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built bundles from builder stage
COPY --from=builder \
  /app/dist/ruralxperience-web \
  /usr/share/nginx/html

# Copy our custom Nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Copy the entrypoint script (for runtime env injection)
COPY nginx/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
