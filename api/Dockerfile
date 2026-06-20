FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY api/package.json ./api/

RUN pnpm install --filter api...

COPY api ./api

EXPOSE 3000

CMD ["pnpm", "--filter", "api", "start:dev"]
