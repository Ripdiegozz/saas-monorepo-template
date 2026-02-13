FROM node:20-alpine AS builder
RUN corepack enable pnpm
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter server build

FROM node:20-alpine
RUN corepack enable pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/db ./packages/db
COPY packages/typescript-config ./packages/typescript-config
COPY apps/server/package.json apps/server/dist ./apps/server/
COPY turbo.json ./
RUN pnpm install --frozen-lockfile --prod
ENV NODE_ENV=production
EXPOSE 4000
CMD ["pnpm", "--filter", "server", "start"]
