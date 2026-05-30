# Multi-stage build for the merchants mock x402 service.

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.7.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/merchants/package.json ./apps/merchants/
COPY packages/core/package.json ./packages/core/
RUN pnpm install --frozen-lockfile --filter @delegate/merchants...

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/core/node_modules ./packages/core/node_modules
COPY --from=deps /app/apps/merchants/node_modules ./apps/merchants/node_modules
COPY package.json pnpm-workspace.yaml ./
COPY apps/merchants ./apps/merchants
COPY packages/core ./packages/core

EXPOSE 4021
CMD ["pnpm", "--filter", "@delegate/merchants", "run", "start"]
