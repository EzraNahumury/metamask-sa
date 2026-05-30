# Multi-stage build for the agent service in a pnpm workspace.
# Builds @delegate/core (workspace dep) then runs the agent at /app/apps/agent.

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.7.0 --activate
WORKDIR /app

FROM base AS deps
# Copy only the manifests first so the layer cache survives source edits.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/agent/package.json ./apps/agent/
COPY packages/core/package.json ./packages/core/
# Install the agent + its workspace deps only.
RUN pnpm install --frozen-lockfile --filter @delegate/agent...

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/core/node_modules ./packages/core/node_modules
COPY --from=deps /app/apps/agent/node_modules ./apps/agent/node_modules
COPY package.json pnpm-workspace.yaml ./
COPY apps/agent ./apps/agent
COPY packages/core ./packages/core

EXPOSE 4030
CMD ["pnpm", "--filter", "@delegate/agent", "run", "start"]
