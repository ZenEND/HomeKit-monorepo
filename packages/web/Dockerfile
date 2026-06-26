FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/web/package.json ./packages/web/
COPY packages/engine/package.json ./packages/engine/
COPY packages/types/package.json ./packages/types/

RUN pnpm install --filter web...

COPY packages/web ./packages/web
COPY packages/engine ./packages/engine
COPY packages/types ./packages/types

EXPOSE 5173

CMD ["pnpm", "--filter", "web", "dev", "--host"]
