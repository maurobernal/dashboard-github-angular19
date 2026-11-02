# --- build: Angular 22 needs Node >= 24.15; bun is the package manager ---
FROM node:26-alpine AS build
COPY --from=oven/bun:1.3.14-alpine /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN test -f src/environments/github.secrets.ts \
  || (echo 'Missing src/environments/github.secrets.ts (see README)' && exit 1)
RUN bun run build

# --- runtime: static files served by nginx ---
FROM nginx:1.29-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/dashboard-github/browser /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://127.0.0.1/ || exit 1
