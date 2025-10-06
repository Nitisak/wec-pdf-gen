# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy root package files (context is project root)
COPY package.json pnpm-workspace.yaml ./

# Copy workspace package files
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies (no frozen lockfile for initial setup)
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY apps/web ./apps/web
COPY packages/shared ./packages/shared

# Build shared package first
WORKDIR /app/packages/shared
RUN pnpm build

# Build the web application
WORKDIR /app/apps/web
RUN pnpm build

# Production stage with Nginx
FROM nginx:alpine AS production

# Copy custom nginx config
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
