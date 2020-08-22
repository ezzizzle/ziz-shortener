FROM node:14.8-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json .
COPY jest.config.js .
COPY src ./src

RUN npm install && npm run test && npm run build

RUN npm ci --production

FROM node:14.8-alpine
WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./
COPY package.json ./

ENTRYPOINT [ "node", "index.js" ]
