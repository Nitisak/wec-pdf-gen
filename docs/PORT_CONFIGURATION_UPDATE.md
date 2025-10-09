# Port Configuration Update

All service ports have been updated to avoid conflicts with other commonly used ports.

## 🔄 Port Changes

| Service | Old Port | New Port | Access URL |
|---------|----------|----------|------------|
| **API** | 5173 | **5273** | http://localhost:5273 |
| **Web** | 80 | **9090** | http://localhost:9090 |
| **PostgreSQL** | 5432 | **5532** | localhost:5532 |
| MinIO | 9000 | 9000 | http://localhost:9000 |
| MinIO Console | 9001 | 9001 | http://localhost:9001 |

## 📝 Updated Files

### Docker Configuration
- ✅ `docker-compose.yml` - Production configuration
- ✅ `docker-compose.dev.yml` - Development configuration

### Application Configuration
- ✅ `apps/api/env.example` - API environment example
- ✅ `playwright.config.ts` - E2E test configuration
- ✅ `minio-cors.json` - CORS configuration

### Scripts & CLI
- ✅ `packages/cli/seed-templates.ts` - Database connection string

### Documentation
- ✅ `README.md` - Updated all port references

## 🚀 Quick Start

After pulling these changes, restart your services:

```bash
# Stop existing services
docker-compose down

# Start with new ports
docker-compose up -d

# Wait for services to be healthy
docker-compose ps

# Test the API
curl http://localhost:5273/health

# Access the web app
open http://localhost:9090
```

## 🔧 Local Development

If you're running services locally (outside Docker), update your local `.env` file:

```bash
# apps/api/.env
PORT=5273
DATABASE_URL=postgres://user:pass@localhost:5532/wecover
CORS_ORIGIN=http://localhost:9090
```

## 🧪 Testing

Test commands now use the new ports:

```bash
# Test API health
curl http://localhost:5273/health

# Test policy creation
curl -X POST 'http://localhost:5273/api/policies?dryRun=true' \
  -H "Content-Type: application/json" \
  -d '{ ... policy data ... }'

# Run E2E tests (automatically uses new web port)
pnpm test:e2e
```

## 🔌 Database Connections

### From Docker Containers
Use internal Docker network name:
```
postgres://user:pass@postgres:5432/wecover
```

### From Host Machine
Use localhost with mapped port:
```
postgres://user:pass@localhost:5532/wecover
```

### Example Connection Strings

**psql:**
```bash
psql postgres://user:pass@localhost:5532/wecover
```

**Node.js:**
```javascript
const connectionString = 'postgres://user:pass@localhost:5532/wecover';
```

**Database Tools:**
- Host: localhost
- Port: 5532
- Database: wecover
- Username: user
- Password: pass

## 🌐 CORS Configuration

Updated CORS origins:
- `http://localhost:9090` (Web app)
- `http://localhost:5273` (API)
- `http://localhost:3000` (Development fallback)

## 📚 API Endpoints

All API endpoints now use port **5273**:

| Method | Endpoint | Example URL |
|--------|----------|-------------|
| GET | `/health` | http://localhost:5273/health |
| POST | `/api/policies` | http://localhost:5273/api/policies |
| GET | `/api/policies/:id` | http://localhost:5273/api/policies/123 |

## 🔍 Verification

Verify all services are running on new ports:

```bash
# Check Docker services
docker-compose ps

# Expected output:
# wec-api       running  0.0.0.0:5273->5273/tcp
# wec-web       running  0.0.0.0:9090->80/tcp
# wec-postgres  running  0.0.0.0:5532->5432/tcp
# wec-minio     running  0.0.0.0:9000->9000/tcp, 0.0.0.0:9001->9001/tcp

# Test each service
curl http://localhost:5273/health        # API
curl http://localhost:9090               # Web
psql postgres://user:pass@localhost:5532/wecover -c "SELECT 1;"  # DB
curl http://localhost:9000/minio/health/live  # MinIO
```

## ⚠️ Breaking Changes

If you have:
- **Bookmarks**: Update URLs to new ports
- **Scripts**: Update hardcoded ports
- **CI/CD**: Update port configurations
- **External integrations**: Update API endpoint URLs

## 🐛 Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Check what's using the port
lsof -i :5273
lsof -i :9090
lsof -i :5532

# Kill the process if needed
kill -9 <PID>
```

### Can't Connect to Database

```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Test connection
psql postgres://user:pass@localhost:5532/wecover -c "SELECT version();"
```

### CORS Errors

If you get CORS errors, verify:
1. `CORS_ORIGIN` environment variable is set to `http://localhost:9090`
2. MinIO CORS configuration includes the new ports
3. Browser is accessing the correct port (9090, not 80)

## 📖 Related Documentation

- [Quick Reference](./QUICK_REFERENCE.md) - Common commands
- [Deployment Guide](./DEPLOYMENT_QUICK_START.md) - Deployment instructions
- [Docker Guide](./DOCKER.md) - Docker configuration

---

**Date**: October 6, 2025  
**Status**: ✅ COMPLETE  
**Breaking Changes**: Yes - Port changes require service restart

