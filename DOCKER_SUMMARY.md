# Docker Support Summary

Docker support has been fully integrated into the WeCover USA Policy PDF Generator project.

## What Was Added

### 1. Dockerfiles

#### API Dockerfile (`apps/api/Dockerfile`)
- **Multi-stage build** for optimized production images
- **Builder stage**: Installs dependencies and compiles TypeScript
- **Production stage**: Minimal Alpine image with:
  - Chromium browser for Playwright
  - netcat for health checks
  - Production dependencies only
- **Health checks**: Built-in container health monitoring
- **Entrypoint script**: Waits for dependencies and runs migrations

#### Web Dockerfile (`apps/web/Dockerfile`)
- **Multi-stage build** for static assets
- **Builder stage**: Compiles React application with Vite
- **Production stage**: Nginx Alpine serving static files
- **Custom Nginx config**: API proxy and security headers
- **Health endpoint**: `/health` for monitoring

### 2. Docker Compose Files

#### `docker-compose.yml` (Full Stack)
Complete production-ready stack with:
- **PostgreSQL**: Database with health checks and data persistence
- **MinIO**: Object storage with automatic bucket creation
- **API**: Node.js service with Playwright support (2 replicas)
- **Web**: React app with Nginx
- **Networks**: Isolated Docker network
- **Health checks**: All services monitored
- **Restart policies**: `unless-stopped` for reliability

#### `docker-compose.dev.yml` (Development)
Infrastructure only for local development:
- **PostgreSQL**: Database on localhost:5432
- **MinIO**: Object storage on localhost:9000
- Allows running API/Web locally while using Docker for infrastructure

#### `docker-compose.prod.yml` (Production)
Production-optimized configuration with:
- **Environment validation**: Required secrets enforcement
- **Resource limits**: CPU and memory constraints
- **Service scaling**: Multiple API replicas
- **Optional Nginx**: Reverse proxy for SSL termination
- **AWS S3 support**: Production storage configuration

### 3. Configuration Files

#### `Makefile`
Convenient commands for Docker operations:
- `make build` - Build all images
- `make up` - Start all services
- `make down` - Stop all services
- `make logs` - View logs
- `make migrate` - Run migrations
- `make seed` - Seed templates
- `make clean` - Remove everything
- `make dev-up` - Start infrastructure only
- And more...

#### `apps/web/nginx.conf`
Nginx configuration with:
- Client-side routing support
- API proxy to backend
- Static asset caching
- Security headers
- Health check endpoint
- Gzip compression

#### `apps/api/docker-entrypoint.sh`
Startup script that:
- Waits for PostgreSQL to be ready
- Waits for MinIO to be ready
- Runs database migrations
- Starts the API server

#### `.dockerignore` Files
Optimized Docker contexts excluding:
- `node_modules`
- Build artifacts
- Environment files
- Development files

### 4. Documentation

#### `DOCKER.md`
Comprehensive Docker deployment guide covering:
- Architecture overview
- Development setup
- Production deployment
- Docker commands
- Troubleshooting
- Performance tuning
- Monitoring
- Security best practices
- Backup and recovery

#### `README.md` Updates
Added Docker deployment instructions:
- Quick start with Docker
- Option 1: Full Docker stack
- Option 2: Hybrid (Docker infrastructure + local dev)
- Production deployment guide

#### `env.prod.example`
Production environment template with:
- PostgreSQL configuration
- AWS S3 settings
- Application settings
- Security considerations

## How to Use

### Development (Quick Start)

```bash
# Start infrastructure only
make dev-up

# Run API and Web locally
pnpm dev
```

### Development (Full Docker)

```bash
# Build and start everything
make build
make up

# Run migrations and seed data
make migrate
make seed

# View logs
make logs
```

### Production Deployment

```bash
# Configure environment
cp env.prod.example .env.prod
# Edit .env.prod with your settings

# Deploy
export $(cat .env.prod | xargs)
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Initialize
docker-compose exec api node migrations/run.js
```

## Key Features

✅ **Multi-stage builds** - Optimized image sizes
✅ **Health checks** - All services monitored
✅ **Auto-restart** - Services recover from failures
✅ **Service isolation** - Docker networks for security
✅ **Resource limits** - Prevent resource exhaustion
✅ **Development mode** - Infrastructure only for local dev
✅ **Production ready** - Scaled and optimized
✅ **Easy commands** - Makefile for convenience
✅ **Comprehensive docs** - Full deployment guide
✅ **Security hardened** - Best practices implemented

## Service Ports

| Service | Port | Description |
|---------|------|-------------|
| Web | 80 | React application |
| API | 5173 | Fastify REST API |
| PostgreSQL | 5432 | Database |
| MinIO | 9000 | Object storage API |
| MinIO Console | 9001 | Web UI |

## Container Specifications

### API Container
- **Base**: node:18-alpine
- **Additions**: Chromium, netcat
- **Memory**: 2GB limit
- **CPU**: 2 cores limit
- **Replicas**: 2 (production)

### Web Container
- **Base**: nginx:alpine
- **Memory**: 512MB limit
- **CPU**: 1 core limit
- **Replicas**: 1

### PostgreSQL Container
- **Base**: postgres:15-alpine
- **Memory**: 2GB limit
- **CPU**: 2 cores limit
- **Volume**: Persistent data storage

## Network Architecture

```
Internet
    ↓
[Nginx Reverse Proxy] :80, :443
    ↓
[Docker Network: wec-network]
    ↓
[Web Container] :80 ←→ [API Container] :5173
                        ↓
                    [PostgreSQL] :5432
                        ↓
                    [MinIO] :9000
```

## Benefits

1. **Consistency**: Same environment across dev, staging, and production
2. **Isolation**: Each service runs in its own container
3. **Scalability**: Easy to scale API replicas
4. **Portability**: Deploy anywhere Docker runs
5. **Simplicity**: One command to start everything
6. **Recovery**: Auto-restart on failures
7. **Monitoring**: Built-in health checks
8. **Security**: Isolated networks and resource limits

## Next Steps

1. **Test locally**: `make build && make up`
2. **Upload PDF template** to MinIO
3. **Run migrations**: `make migrate`
4. **Seed templates**: `make seed`
5. **Access application**: http://localhost

For production deployment, see `DOCKER.md` for detailed instructions.

---

All Docker support is now complete and production-ready! 🐳

