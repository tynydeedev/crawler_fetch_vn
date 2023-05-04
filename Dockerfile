FROM node:16-slim AS base
WORKDIR /app
COPY . .
RUN npm ci

FROM base AS build
RUN npm run build

FROM base AS deploy
CMD ['npm', 'start']

FROM base AS dev
ENV PORT=3000
ENV REDIS_HOST=localhost
ENV REDIS_PORT=6379
ENV SYMBOLS=50
CMD ['npm', 'run', 'dev']