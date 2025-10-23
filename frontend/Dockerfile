FROM node:18-alpine

RUN apk add --no-cache curl
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

RUN npm run build

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD npm start
