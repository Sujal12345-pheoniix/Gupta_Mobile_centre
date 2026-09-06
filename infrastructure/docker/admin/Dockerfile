# Build stage
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Install dependencies
COPY apps/admin-web/package*.json ./
COPY pnpm-lock.yaml .
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY apps/admin-web/ .
RUN pnpm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

# Install production dependencies only
COPY --from=builder /usr/src/app/package*.json ./
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# Start application
CMD ["node", "server.js"]