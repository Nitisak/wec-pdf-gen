# WeCoverUSA — Policy PDF Generator

A monorepo application for generating vehicle service contract policy PDFs by merging fillable AcroForms with contract terms and state disclosures.

## 🚀 Quick Start

```bash
# Start all services
docker-compose up -d

# Wait for services to be healthy (~30 seconds)
docker-compose ps

# Test the API
curl http://localhost:5273/health
```

The application will be available at:
- **API**: http://localhost:5273
- **Web**: http://localhost:9090
- **PostgreSQL**: localhost:5532
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)

## 🏗️ Architecture

### Services
- **API** (Fastify + Node.js): PDF generation and policy management
- **Web** (React + TypeScript): Policy form and PDF preview
- **PostgreSQL**: Policy metadata storage
- **MinIO**: S3-compatible object storage for PDFs

### PDF Pipeline

```
1. Fill AcroForm → 2. Merge Terms PDF → 3. Merge Disclosure PDF → 4. Final Policy PDF
   (3 pages)           (static)             (static)                (all pages)
```

**Final PDF Structure:**
1. Pages 1-3: Filled AcroForm
   - Page 1: Dealer Copy
   - Page 2: Internal (blank)
   - Page 3: Customer Copy
2. Pages 4-X: Contract Terms
3. Pages X+1-Y: State Disclosure

## 📁 Project Structure

```
wec-pdf-generator/
├── apps/
│   ├── api/              # Fastify API service
│   └── web/              # React frontend
├── packages/
│   ├── shared/           # Shared Zod schemas and types
│   └── cli/              # CLI tools (seed-templates)
├── tests/                # Centralized test directory
│   ├── api/              # API unit & E2E tests
│   └── web/              # Frontend E2E tests
├── assets/               # PDF template files
│   └── 001_Contract 2/   # Current template versions
├── scripts/              # Utility scripts
├── docs/                 # Documentation
└── docker-compose.yml    # Service orchestration
```

## 🔧 Common Tasks

### Seed Templates

Upload PDF templates to MinIO:

```bash
./scripts/upload-new-templates.sh
docker-compose restart api
```

### Run Tests

```bash
# All tests
pnpm test

# API tests only
pnpm test:api

# E2E tests (Playwright)
pnpm test:e2e

# E2E with UI
pnpm test:e2e:ui

# E2E in headed mode
pnpm test:e2e:headed
```

See [`tests/README.md`](./tests/README.md) for detailed testing documentation.

### View Logs

```bash
# All services
docker-compose logs -f

# API only
docker-compose logs -f api

# Last 50 lines
docker-compose logs --tail=50 api
```

### Generate a Test Policy

```bash
curl -X POST 'http://localhost:5273/api/policies?dryRun=true' \
  -H "Content-Type: application/json" \
  -d '{
    "policyNumber": "TEST-001",
    "productVersion": "WEC-PS-VSC-09-2025",
    "stateCode": "FL",
    "owner": {"firstName": "John", "lastName": "Doe", "address": "123 Main St", "city": "Miami", "state": "FL", "zip": "33101", "phone": "305-555-0100", "email": "john@example.com"},
    "dealer": {"id": "DLR-001", "name": "Test Dealer", "address": "456 Dealer St", "city": "Miami", "state": "FL", "zip": "33102", "phone": "305-555-0200"},
    "vehicle": {"vin": "1HGCM82633A123456", "year": "2023", "make": "Honda", "model": "Accord", "mileage": 10000, "salePrice": 25000},
    "coverage": {"termMonths": 72, "purchaseDate": "2025-10-06", "expirationDate": "2031-10-06", "contractPrice": 2000, "commercial": false}
  }' | jq
```

## 📚 Documentation

Comprehensive guides are available in the [`docs/`](./docs) folder:

### Getting Started
- [Setup Complete Guide](./docs/SETUP_COMPLETE.md)
- [Deployment Quick Start](./docs/DEPLOYMENT_QUICK_START.md)
- [Quick Reference](./docs/QUICK_REFERENCE.md)
- [Docker Guide](./docs/DOCKER.md)

### Features & Fixes
- [Seeding Templates](./docs/SEEDING_COMPLETE.md)
- [Three-Page Form Handling](./docs/THREE_PAGE_FORM_SUMMARY.md)
- [PDF Enhancement](./docs/PDF_ENHANCEMENT_SUMMARY.md)
- [Checkbox Fix](./docs/CHECKBOX_FIX_SUMMARY.md)
- [Signature Fix](./docs/SIGNATURE_FIX_SUMMARY.md)
- [CORS Fix](./docs/CORS_FIX_SUMMARY.md)
- [S3 URL Fix](./docs/S3_URL_FIX_SUMMARY.md)
- [Healthcheck Fix](./docs/HEALTHCHECK_FIX_SUMMARY.md)

### Development
- [Testing Guide](./docs/TESTING.md)
- [E2E Testing](./docs/E2E_TESTING.md)
- [Logging Guide](./docs/LOGGING_GUIDE.md)
- [cURL Examples](./docs/CURL_EXAMPLES.md)

### Docker Troubleshooting
- [Docker Fixes](./docs/DOCKER_FIXES.md)
- [Docker Module Fixes](./docs/DOCKER_MODULE_FIXES.md)
- [Docker Summary](./docs/DOCKER_SUMMARY.md)

## 🧪 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/policies` | Create policy (merge PDFs, store to S3) |
| `POST` | `/api/policies?dryRun=true` | Generate policy preview (no storage) |
| `GET` | `/api/policies/:id` | Get policy metadata + pre-signed URL |
| `GET` | `/health` | Health check |

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18 LTS
- **Framework**: Fastify
- **PDF**: pdf-lib, Playwright
- **Database**: PostgreSQL 15
- **Storage**: MinIO (S3-compatible)
- **Validation**: Zod

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Forms**: React Hook Form + Zod
- **PDF Viewer**: PDF.js
- **Build**: Vite

### DevOps
- **Containerization**: Docker + Docker Compose
- **Testing**: Vitest, Playwright
- **CI/CD**: (Configure as needed)

## ⚙️ Environment Variables

Key environment variables (see [`apps/api/env.example`](./apps/api/env.example)):

```bash
# Database
DATABASE_URL=postgres://user:pass@postgres:5432/wecover  # Internal Docker
# Or for local connection:
DATABASE_URL=postgres://user:pass@localhost:5532/wecover

# S3 Storage
S3_ENDPOINT=http://minio:9000
S3_BUCKET=wecover-pdfs

# PDF Templates
PDF_TEMPLATE_KEY=templates/ContractPSVSCTemplate_HT_v07_01.pdf
PDF_TERMS_KEY=templates/ContractPSVSCTemplate_HT_v07_02.pdf
PDF_DISCLOSURE_KEY=templates/ContractPSVSCTemplate_HT_v07_03.pdf
```

## 🧹 Cleanup

```bash
# Stop all services
docker-compose down

# Remove volumes (database + storage)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## 📄 License

Proprietary - WeCoverUSA

---

**Status**: 🟢 Fully Operational  
**Last Updated**: October 6, 2025

