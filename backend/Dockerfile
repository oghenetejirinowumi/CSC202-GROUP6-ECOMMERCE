FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY init-db.js index.js ./
RUN mkdir -p data && node init-db.js

ENV NODE_ENV=production
ENV PORT=10000
EXPOSE 10000

CMD ["node", "index.js"]
