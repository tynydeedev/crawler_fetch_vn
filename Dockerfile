FROM node:16-slim AS base
RUN apt-get update
WORKDIR /app
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

FROM source AS deploy
CMD [ "node", "dist/src/index.js" ]