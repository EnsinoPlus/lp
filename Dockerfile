# ── Build ──────────────────────────────────────────────────────────────────────
FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lockb bunfig.toml ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# ── Runtime ────────────────────────────────────────────────────────────────────
FROM oven/bun:1-slim

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/wrangler.jsonc ./wrangler.jsonc
COPY --from=builder /app/vite.config.ts ./vite.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 80

ENV NODE_ENV=production

CMD ["bunx", "wrangler", "dev", "--port", "80", "--host", "0.0.0.0", "--local"]
