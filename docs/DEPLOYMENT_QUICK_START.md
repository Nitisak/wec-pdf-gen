# WeCover PDF Generator - Quick Deployment Guide

## 🚀 Quick Start (Docker)

### Prerequisites

- Docker Desktop installed and running
- Git (to clone the repository)
- Ports available: 80 (Web), 5173 (API), 5432 (PostgreSQL), 9000-9001 (MinIO)

### 1. Start All Services

```bash
# Clone the repository (if not already)
cd /path/to/wec-pdf-generator

# Start everything
docker-compose up -d

# Wait for services to be ready (about 60 seconds)
sleep 60

# Check status
docker ps --filter "name=wec"
```

Expected output:
```
NAMES          STATUS
wec-web        Up X minutes (healthy)
wec-api        Up X minutes (healthy)
wec-postgres   Up X minutes (healthy)
wec-minio      Up X minutes (healthy)
```

### 2. Upload PDF Template

The PDF template needs to be uploaded to MinIO:

```bash
# Run the setup script
chmod +x scripts/setup-storage.sh
./scripts/setup-storage.sh
```

Or manually:
```bash
# Upload the template
docker exec -i wec-minio mc cp /data/ContractPSVSCTemplate_HT_v07_Form1.pdf minio:9000/wecover-pdfs/templates/

# Or use the MinIO console
open http://localhost:9001
# Login: minioadmin / minioadmin
# Upload to: wecover-pdfs/templates/
```

### 3. Seed HTML Templates (Optional)

```bash
cd packages/cli
pnpm seed
```

### 4. Verify Everything Works

```bash
# Test API health
curl http://localhost:5173/health

# Should return:
# {"status":"ok","timestamp":"2025-10-06T..."}

# Test Web
open http://localhost
# or
curl -I http://localhost

# Should return HTTP/1.1 200 OK
```

### 5. Create Your First Policy

Using curl:
```bash
curl -X POST http://localhost:5173/api/policies \
  -H "Content-Type: application/json" \
  -d '{
    "policyNumber":"TEST-001",
    "productVersion":"WEC-PS-VSC-09-2025",
    "stateCode":"FL",
    "owner":{
      "firstName":"John",
      "lastName":"Doe",
      "address":"123 Main St",
      "city":"Miami",
      "state":"FL",
      "zip":"33101",
      "phone":"555-0100",
      "email":"john@example.com"
    },
    "dealer":{
      "id":"DLR-001",
      "name":"Test Dealer",
      "address":"456 Dealer St",
      "city":"Miami",
      "state":"FL",
      "zip":"33102",
      "phone":"555-0200"
    },
    "vehicle":{
      "vin":"1HGCM82633A123456",
      "year":"2023",
      "make":"Honda",
      "model":"Accord",
      "mileage":10000,
      "salePrice":25000
    },
    "coverage":{
      "termMonths":96,
      "purchaseDate":"2025-10-06",
      "expirationDate":"2033-10-06",
      "contractPrice":2000,
      "commercial":false
    }
  }'
```

Or using the web interface:
```bash
# Open in browser
open http://localhost

# Fill out the form
# Click "Create Policy"
# PDF will be generated and displayed
```

## 🛠️ Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
```

### Restart Services

```bash
# Restart everything
docker-compose restart

# Restart specific service
docker-compose restart api
```

### Stop Services

```bash
# Stop all
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### Rebuild After Code Changes

```bash
# Rebuild API
docker-compose build api
docker-compose up -d api

# Rebuild Web
docker-compose build web
docker-compose up -d web

# Rebuild all
docker-compose build
docker-compose up -d
```

## 🔧 Troubleshooting

### API Container is Unhealthy

```bash
# Check if API is actually responding
curl http://localhost:5173/health

# If it responds, just wait - it might still be in start-period
sleep 30
docker ps --filter "name=wec-api"

# Check logs for errors
docker-compose logs api --tail=50
```

### Web Container Won't Start

```bash
# Check if API is running
docker ps -a | grep wec-api

# Manually start web
docker-compose up -d web
```

### Can't Access PDF Files (403 Forbidden)

This was fixed! But if you still see issues:

```bash
# 1. Check MinIO CORS is configured
curl -I 'http://localhost:9000/wecover-pdfs/' -H 'Origin: http://localhost' | grep -i "access-control"

# Should show: Access-Control-Allow-Origin: http://localhost

# 2. Check bucket is public
docker exec wec-minio mc anonymous list myminio/wecover-pdfs

# Should show: Access permission for `myminio/wecover-pdfs` is set to `public`

# 3. Re-run minio-setup
docker-compose down minio-setup
docker-compose up -d minio-setup
```

### Database Connection Errors

```bash
# Check PostgreSQL is running
docker-compose logs postgres

# Connect to database
docker exec -it wec-postgres psql -U user -d wecover

# Check tables exist
\dt

# Should show: policy, html_template
```

### MinIO Connection Errors

```bash
# Check MinIO is running
docker-compose logs minio

# Check health
curl http://localhost:9000/minio/health/live

# Access console
open http://localhost:9001
# Login: minioadmin / minioadmin
```

## 📁 Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Web App | http://localhost | - |
| API | http://localhost:5173 | - |
| API Health | http://localhost:5173/health | - |
| MinIO Console | http://localhost:9001 | minioadmin / minioadmin |
| MinIO API | http://localhost:9000 | minioadmin / minioadmin |
| PostgreSQL | localhost:5432 | user / pass / wecover |

## 🏗️ Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ├─── http://localhost ────────► ┌─────────────┐
       │                                │  Nginx (Web)│
       │                                └─────────────┘
       │
       └─── http://localhost:5173 ───► ┌─────────────┐
                                        │  API Server │
                                        └──────┬──────┘
                                               │
                  ┌────────────────────────────┼────────────────────────────┐
                  │                            │                            │
                  ▼                            ▼                            ▼
         ┌─────────────┐            ┌─────────────┐            ┌─────────────┐
         │ PostgreSQL  │            │    MinIO    │            │  Playwright │
         │  (Policies) │            │   (PDFs)    │            │ (HTML→PDF)  │
         └─────────────┘            └─────────────┘            └─────────────┘
```

## 🔐 Security Notes

**⚠️ Development Setup Only**

Current configuration is for **development only**:
- Public MinIO bucket (no authentication)
- Default credentials (minioadmin / minioadmin)
- No HTTPS
- No authentication on API endpoints

**For Production:**
1. Use pre-signed URLs (see `SIGNATURE_FIX_SUMMARY.md`)
2. Add authentication (JWT, OAuth2, etc.)
3. Use HTTPS with valid certificates
4. Change all default passwords
5. Restrict CORS origins to your domain
6. Use secrets management (AWS Secrets Manager, Vault, etc.)
7. Enable audit logging
8. Set up monitoring and alerting

## 📦 What's Included

- ✅ Complete Docker setup with health checks
- ✅ PostgreSQL database with migrations
- ✅ MinIO S3-compatible storage
- ✅ PDF generation (AcroForm filling + HTML→PDF)
- ✅ CORS configured for local development
- ✅ React web application
- ✅ REST API with validation
- ✅ Sample templates and test data

## 📚 Documentation

- `DOCKER.md` - Detailed Docker setup guide
- `HEALTHCHECK_FIX_SUMMARY.md` - Health check troubleshooting
- `CORS_FIX_SUMMARY.md` - CORS configuration details
- `SIGNATURE_FIX_SUMMARY.md` - S3 URL configuration
- `CURL_EXAMPLES.md` - API examples
- `LOGGING_GUIDE.md` - Logging best practices
- `E2E_TESTING.md` - End-to-end testing guide

## 🎯 Next Steps

1. **Customize the PDF template** - Replace `ContractPSVSCTemplate_HT_v07_Form1.pdf` with your own
2. **Add more term templates** - Create HTML templates for different products
3. **Add more state disclosures** - Create HTML templates for all states
4. **Customize the web UI** - Modify `apps/web/src/components/PolicyForm.tsx`
5. **Add authentication** - Implement user login and authorization
6. **Deploy to production** - Use Docker Compose on a server or Kubernetes

## 💡 Tips

### Fast Development Workflow

```bash
# 1. Make changes to API code
vim apps/api/src/...

# 2. Rebuild and restart (with logs)
pnpm --filter @wec/api build && \
docker-compose build api && \
docker-compose up -d api && \
docker-compose logs -f api
```

### Using Docker Compose Profiles

If you want to run only some services:

```bash
# Start only databases (no API/Web)
docker-compose up -d postgres minio

# Then run API locally
cd apps/api
pnpm dev
```

### Backup Database

```bash
# Export
docker exec wec-postgres pg_dump -U user wecover > backup.sql

# Import
docker exec -i wec-postgres psql -U user wecover < backup.sql
```

### Backup MinIO Data

```bash
# Export bucket
docker exec wec-minio mc mirror myminio/wecover-pdfs /tmp/backup

# Import bucket
docker exec wec-minio mc mirror /tmp/backup myminio/wecover-pdfs
```

## 🎉 Success!

If you've reached this point and everything is working:

```bash
# All containers healthy
docker ps --filter "name=wec" --format "table {{.Names}}\t{{.Status}}"

# API responding
curl http://localhost:5173/health

# Web accessible
curl -I http://localhost

# PDFs generating
curl -X POST http://localhost:5173/api/policies -d '{...}'
```

**Congratulations! Your WeCover PDF Generator is ready to use! 🎊**

---

## 🆘 Need Help?

1. Check the documentation files (listed above)
2. Review logs: `docker-compose logs`
3. Check GitHub issues (if applicable)
4. Verify all prerequisites are met
5. Try a clean rebuild: `docker-compose down -v && docker-compose up -d`

## 📝 Quick Reference Card

```bash
# Start
docker-compose up -d

# Check status
docker ps --filter "name=wec"

# View logs
docker-compose logs -f [service]

# Restart
docker-compose restart [service]

# Stop
docker-compose down

# Rebuild
docker-compose build [service]
docker-compose up -d [service]

# Clean everything
docker-compose down -v
```

