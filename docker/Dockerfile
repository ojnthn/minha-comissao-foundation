FROM node:20-alpine AS dev
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY prisma ./prisma
RUN npx prisma generate
EXPOSE 3000 9229
CMD ["sh", "-c", "npx prisma migrate deploy && node_modules/.bin/nest start --debug 0.0.0.0:9229 --watch"]

FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
ARG CACHE_BUST=1
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN yarn build

FROM node:20-alpine AS production
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json yarn.lock ./
COPY prisma ./prisma
RUN yarn install --frozen-lockfile --production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]