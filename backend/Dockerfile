# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev

# ---- runtime ----
FROM node:20-alpine AS runtime
WORKDIR /usr/src/app

RUN addgroup -S app && adduser -S app -G app

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --chown=app:app . .

USER app

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "index.js"]
