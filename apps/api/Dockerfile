# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy root package files (context is project root)
COPY package.json pnpm-workspace.yaml ./

# Copy workspace package files
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies (no frozen lockfile for initial setup)
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Build shared package first
WORKDIR /app/packages/shared
RUN pnpm build

# Build the API application
WORKDIR /app/apps/api
RUN pnpm build

# Production stage
FROM node:18-alpine AS production

# Install pnpm and Playwright dependencies
RUN npm install -g pnpm && \
    apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    netcat-openbsd

# Set Chromium path for Playwright
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium-browser
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Set working directory
WORKDIR /app

# Copy package files (context is project root)
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install production dependencies only
RUN pnpm install --no-frozen-lockfile --prod

# Copy built application and shared package from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/migrations ./apps/api/migrations
COPY --from=builder /app/packages/shared ./packages/shared

# Copy entrypoint script
COPY apps/api/docker-entrypoint.sh ./apps/api/
RUN chmod +x ./apps/api/docker-entrypoint.sh

# Set working directory to API
WORKDIR /app/apps/api

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:5173/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use entrypoint script
ENTRYPOINT ["/app/apps/api/docker-entrypoint.sh"]
