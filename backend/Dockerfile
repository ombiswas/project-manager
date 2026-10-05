# Stage 1: Build & Dependencies
FROM node:20-alpine AS dependencies
WORKDIR /app

# Install native dependencies required for build if necessary
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package.json package-lock.json ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Expose backend API port
EXPOSE 5000

# Run container as non-root user
USER node

CMD ["node", "index.js"]
