FROM node:16-slim AS base
WORKDIR /app
RUN npm install -g pm2@latest
COPY package.json ./
COPY package-lock.json ./
RUN npm ci

FROM base as source
COPY . .
EXPOSE 3000
WORKDIR /app

FROM source AS dev
CMD [ "npm", "run", "dev"]

FROM source AS build
RUN npm run build

FROM build AS deploy
CMD [ "pm2", "start", "dist/src/index.js", "--name", "crawler_api" ]