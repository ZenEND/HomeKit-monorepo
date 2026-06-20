FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY web/package.json ./web/

RUN pnpm install --filter web...

COPY web ./web

EXPOSE 5173

CMD ["pnpm", "--filter", "web", "dev", "--host"]
