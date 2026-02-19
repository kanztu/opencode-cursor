# OpenCode-Cursor API proxy (open-cursor serve)
# Requires CURSOR_CLI_CONFIG_JSON secret at runtime for Cursor API auth.

# ---- Build ----
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY package.json bun.lockb* package-lock.json* ./
RUN bun install

COPY . .
RUN bun run build

# ---- Runtime ----
FROM node:20-bookworm-slim
WORKDIR /app

# Install cursor-agent (Cursor CLI) so the proxy can call the Cursor API
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates bash \
  && curl -fsSL https://cursor.com/install | bash \
  && apt-get purge -y curl && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

# Cursor install typically puts binary under ~/.cursor/bin
ENV PATH="/root/.cursor/bin:${PATH:-/usr/local/bin:/usr/bin:/bin}"

# Copy built app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 32124

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "dist/cli/opencode-cursor.js", "serve"]
