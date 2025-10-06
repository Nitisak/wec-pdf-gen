# Docker Deployment Guide

This guide covers how to deploy the WeCover USA Policy PDF Generator using Docker and Docker Compose.

## Table of Contents

1. [Architecture](#architecture)
2. [Development Setup](#development-setup)
3. [Production Deployment](#production-deployment)
4. [Docker Commands](#docker-commands)
5. [Troubleshooting](#troubleshooting)

## Architecture

The application consists of the following Docker services:

- **postgres**: PostgreSQL 15 database
- **minio**: MinIO object storage (dev only)
- **api**: Node.js Fastify API with Playwright
- **web**: React application served by Nginx
- **nginx**: Reverse proxy (prod only)

### Docker Images

- **API Image**: Multi-stage build with Node.js 18 Alpine + Chromium
- **Web Image**: Multi-stage build with static files served by Nginx Alpine

## Development Setup

### Quick Start

```bash
# Start only infrastructure (PostgreSQL + MinIO)
make dev-up

# Or manually
docker-compose -f docker-compose.dev.yml up -d
```

This starts:
- PostgreSQL on `localhost:5432`
- MinIO on `localhost:9000`
- MinIO Console on `localhost:9001`

### Full Stack Development

```bash
# Build images
make build

# Start all services
make up

# Check status
make ps
make health

# View logs
make logs          # All services
make logs-api      # API only
make logs-web      # Web only

# Run migrations
make migrate

# Seed templates
make seed
```

### Accessing Services

- **Web App**: http://localhost
- **API**: http://localhost:5173
- **API Health**: http://localhost:5173/health
- **MinIO Console**: http://localhost:9001
- **PostgreSQL**: localhost:5432

### Container Management

```bash
# Stop all services
make down

# Restart services
make restart

# Clean everything (including volumes)
make clean

# Shell access
make shell-api     # API container
make shell-web     # Web container
```

## Production Deployment

### Prerequisites

1. **Docker Host** with Docker Engine 20.10+ and Docker Compose 2.0+
2. **AWS S3** or compatible object storage
3. **PostgreSQL** (can use Docker or managed service)
4. **Domain** with SSL certificate (recommended)

### Step 1: Prepare Environment

```bash
# Copy production environment template
cp env.prod.example .env.prod

# Edit with your values
nano .env.prod
```

Required environment variables:
- `POSTGRES_PASSWORD`: Secure database password
- `S3_ENDPOINT`: AWS S3 endpoint
- `S3_ACCESS_KEY`: AWS access key
- `S3_SECRET_KEY`: AWS secret key
- `S3_BUCKET`: S3 bucket name
- `CORS_ORIGIN`: Your frontend domain

### Step 2: Configure Production Compose

```bash
# Use production compose file
cp docker-compose.prod.yml docker-compose.yml

# Or run with specific file
docker-compose -f docker-compose.prod.yml up -d
```

### Step 3: Build and Deploy

```bash
# Load environment
export $(cat .env.prod | xargs)

# Build images
docker-compose build

# Start services
docker-compose up -d

# Verify services are running
docker-compose ps
```

### Step 4: Initialize Database

```bash
# Run migrations
docker-compose exec api node migrations/run.js

# Verify migration
docker-compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "\dt"
```

### Step 5: Upload Templates

```bash
# Upload PDF template to S3
aws s3 cp assets/ContractPSVSCTemplate_HT_v07_Form.pdf \
  s3://$S3_BUCKET/templates/ContractPSVSCTemplate_HT_v07_Form.pdf

# Seed HTML templates (requires template files in S3)
docker-compose exec api node ../../packages/cli/seed-templates.js
```

### Step 6: Configure SSL (Optional)

If using the included Nginx proxy:

```bash
# Place SSL certificates
mkdir -p nginx/ssl
cp your-cert.pem nginx/ssl/cert.pem
cp your-key.pem nginx/ssl/key.pem

# Update nginx/nginx.conf with SSL configuration
```

## Docker Commands

### Using Make (Recommended)

```bash
make help          # Show all available commands
make build         # Build all images
make up            # Start all services
make down          # Stop all services
make restart       # Restart all services
make logs          # View all logs
make logs-api      # View API logs
make logs-web      # View web logs
make ps            # Show running containers
make health        # Check service health
make migrate       # Run database migrations
make seed          # Seed templates
make shell-api     # Shell into API container
make shell-web     # Shell into web container
make clean         # Remove everything
make dev-up        # Start infrastructure only
make dev-down      # Stop infrastructure
```

### Using Docker Compose Directly

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service]

# Execute commands
docker-compose exec api sh
docker-compose exec web sh

# Scale services
docker-compose up -d --scale api=3

# Remove volumes
docker-compose down -v
```

## Troubleshooting

### API Container Fails to Start

**Problem**: API container exits with error

**Solutions**:
```bash
# Check logs
docker-compose logs api

# Common issues:
# 1. Database not ready - wait for postgres health check
# 2. Missing environment variables - check .env
# 3. Migration failure - check database connection

# Restart API only
docker-compose restart api
```

### Chromium/Playwright Issues

**Problem**: PDF rendering fails

**Solutions**:
```bash
# Verify Chromium is installed
docker-compose exec api which chromium-browser

# Check Playwright environment
docker-compose exec api env | grep PLAYWRIGHT

# Test Chromium manually
docker-compose exec api chromium-browser --version
```

### Database Connection Issues

**Problem**: Cannot connect to PostgreSQL

**Solutions**:
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check health
docker-compose exec postgres pg_isready -U user -d wecover

# Connect to database
docker-compose exec postgres psql -U user -d wecover

# Check DATABASE_URL format
echo $DATABASE_URL
```

### MinIO/S3 Connection Issues

**Problem**: Cannot upload/download from S3

**Solutions**:
```bash
# Check MinIO is running
docker-compose ps minio

# Test connectivity
curl http://localhost:9000/minio/health/live

# Verify bucket exists
docker-compose exec api sh -c "mc alias set myminio http://minio:9000 minioadmin minioadmin && mc ls myminio"

# Check S3 credentials in API
docker-compose exec api env | grep S3_
```

### Web App Shows 502 Bad Gateway

**Problem**: Nginx cannot connect to API

**Solutions**:
```bash
# Check API is running
docker-compose ps api

# Check API health
curl http://localhost:5173/health

# Check Nginx configuration
docker-compose exec web cat /etc/nginx/conf.d/default.conf

# Restart Nginx
docker-compose restart web
```

### Out of Memory Issues

**Problem**: Container crashes with OOM

**Solutions**:
```bash
# Check container memory limits
docker stats

# Increase memory limits in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 4G  # Increase from 2G

# Restart with new limits
docker-compose up -d
```

### Clean Start

If everything fails, clean start:

```bash
# Stop everything
docker-compose down

# Remove all volumes (WARNING: deletes data)
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Clean Docker system
docker system prune -af

# Rebuild and start
docker-compose build --no-cache
docker-compose up -d
```

## Performance Tuning

### API Performance

```yaml
# docker-compose.yml
api:
  deploy:
    replicas: 3  # Multiple instances
    resources:
      limits:
        cpus: '2'
        memory: 2G
```

### Database Performance

```yaml
postgres:
  command:
    - "postgres"
    - "-c"
    - "max_connections=200"
    - "-c"
    - "shared_buffers=256MB"
```

### Nginx Caching

```nginx
# nginx.conf
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=pdf_cache:10m max_size=1g;

location /api/policies {
    proxy_cache pdf_cache;
    proxy_cache_valid 200 1h;
}
```

## Monitoring

### Health Checks

```bash
# Check all services
docker-compose ps

# API health endpoint
curl http://localhost:5173/health

# Database health
docker-compose exec postgres pg_isready

# MinIO health
curl http://localhost:9000/minio/health/live
```

### Logs

```bash
# Follow all logs
docker-compose logs -f

# Filter by service
docker-compose logs -f api

# Filter by time
docker-compose logs --since 30m api

# Save logs to file
docker-compose logs api > api.log
```

## Security Best Practices

1. **Use secrets management** (Docker Secrets or AWS Secrets Manager)
2. **Run containers as non-root** (already configured)
3. **Limit resources** (CPU/memory limits in place)
4. **Keep images updated** (regularly rebuild with latest base images)
5. **Use private registry** for production images
6. **Enable SSL/TLS** for all external connections
7. **Restrict network access** (use Docker networks)
8. **Scan images for vulnerabilities** (`docker scan`)

## Backup and Recovery

### Database Backup

```bash
# Backup
docker-compose exec postgres pg_dump -U user wecover > backup.sql

# Restore
cat backup.sql | docker-compose exec -T postgres psql -U user wecover
```

### Volume Backup

```bash
# Backup volume
docker run --rm -v wec-pdf-generator_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volume
docker run --rm -v wec-pdf-generator_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## License

Private - WeCover USA Internal Use Only

