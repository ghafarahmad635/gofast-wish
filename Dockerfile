# syntax=docker.io/docker/dockerfile:1

FROM node:20-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# IMPORTANT:
# - Docker Compose env_file/environment does NOT apply during image build.
# - Next.js does NOT load .env.sample automatically.
# - We copy .env.sample (dummy values) to .env.production so `npm run build` succeeds.
# - NEVER put real secrets in .env.sample.
RUN set -eux; \
  if [ -f .env.sample ]; then \
    cp .env.sample .env; \
  else \
    echo "ERROR: .env.sample not found in repo root. Add it and commit it." >&2; \
    exit 1; \
  fi

# Prisma client generation (does not require DB connection)
RUN npx prisma generate

# Build Next.js
RUN set -eux; npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# OPTIONAL (recommended):
# prevent app from failing silently if critical env vars are missing at runtime
# (If you do not want this, delete the next line.)
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
