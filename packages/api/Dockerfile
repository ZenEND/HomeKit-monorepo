FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/api/package.json ./packages/api/
COPY packages/engine/package.json ./packages/engine/
COPY packages/types/package.json ./packages/types/

RUN pnpm install --filter api...

COPY packages/api ./packages/api
COPY packages/engine ./packages/engine
COPY packages/types ./packages/types

EXPOSE 3000

CMD ["pnpm", "--filter", "api", "start:dev"]
