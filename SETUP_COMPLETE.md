# WeCover PDF Generator - Setup Complete! 🎉

## Current Status

All services are running and fully configured:

✅ **PostgreSQL** - Running on port 5432  
✅ **MinIO** - Running on ports 9000-9001  
✅ **API** - Running on port 5173  
✅ **Web** - Running on port 80  

---

## What Was Fixed

### 1. Docker Containerization
- Fixed ES module resolution for shared packages
- Configured proper TypeScript compilation for monorepo
- Fixed API entrypoint path
- Added Zod to JSON Schema conversion for Fastify validation

### 2. Storage Setup
- Created MinIO bucket `wecover-pdfs`
- Uploaded PDF template: `templates/ContractPSVSCTemplate_HT_v07_Form.pdf`
- Seeded HTML templates:
  - Terms: `WEC-PS-VSC-09-2025/en-US`
  - Disclosures: `FL/en-US`, `TX/en-US`

### 3. Checkbox Handling
- Improved fillAcroForm logic to properly handle checkboxes
- Added debug logging for checkbox operations
- Verified term length checkboxes (72m, 84m, 96m) are working
- Verified commercial checkbox is working

---

## Quick Start Commands

### Start All Services
```bash
docker-compose up -d
```

### Stop All Services
```bash
docker-compose down
```

### View API Logs
```bash
docker-compose logs -f api
```

### Rebuild API After Changes
```bash
docker-compose up -d --build api
```

### Seed Templates (if needed)
```bash
./scripts/setup-storage.sh
DATABASE_URL="postgres://user:pass@localhost:5432/wecover" \
S3_ENDPOINT="http://localhost:9000" \
S3_BUCKET="wecover-pdfs" \
pnpm --filter @wec/cli seed
```

---

## Access Points

- **Web Application**: http://localhost
- **API**: http://localhost:5173
- **API Health Check**: http://localhost:5173/health
- **MinIO Console**: http://localhost:9001
  - Username: `minioadmin`
  - Password: `minioadmin`

---

## Testing the Application

1. Open http://localhost in your browser
2. Fill out the policy form with:
   - Owner information
   - Vehicle details
   - Select a **Term Length** (72, 84, or 96 months)
   - Select state (FL or TX)
   - Other required fields
3. Click **Preview** to generate a test PDF
4. The term length checkbox should now be checked on the PDF!
5. Click **Submit** to save the policy

---

## Debugging Tips

### Check if checkboxes are being set:
```bash
docker-compose logs api | grep "Checked:"
```

You should see output like:
```
✓ Checked: Term_72m
  Unchecked: Term_84m
  Unchecked: Term_96m
✓ Checked: LossCode_COMMERCIAL
```

### Inspect PDF Fields:
```bash
npx tsx scripts/inspect-pdf-fields.ts
```

### View Database Records:
```bash
docker-compose exec postgres psql -U user -d wecover -c "SELECT * FROM policy;"
```

### View MinIO Files:
```bash
mc ls local/wecover-pdfs/ --recursive
```

---

## File Structure

```
wec-pdf-generator/
├── apps/
│   ├── api/                 # Fastify API (Port 5173)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── policies/
│   │   │   │   │   ├── filler/fillAcroForm.ts  ← Fixed checkbox logic
│   │   │   │   │   ├── filler/mapping.ts
│   │   │   │   │   └── service/policies.service.ts
│   │   │   │   ├── templates/
│   │   │   │   ├── storage/s3.ts
│   │   │   │   └── db/
│   │   │   ├── routes/
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   └── docker-entrypoint.sh
│   └── web/                 # React Frontend
│       ├── src/
│       │   └── components/
│       │       ├── PolicyForm.tsx
│       │       └── PdfViewer.tsx
│       ├── Dockerfile
│       └── nginx.conf
├── packages/
│   ├── shared/              # Shared Zod schemas
│   │   └── policySchemas.ts
│   └── cli/                 # Seed scripts
│       └── seed-templates.ts
├── scripts/
│   ├── setup-storage.sh     # Initialize MinIO & upload templates
│   └── inspect-pdf-fields.ts  # Debug PDF fields
├── assets/
│   ├── ContractPSVSCTemplate_HT_v07_Form1.pdf
│   └── html-templates/
│       ├── terms/
│       └── disclosures/
├── docker-compose.yml
├── docker-compose.dev.yml
└── Makefile
```

---

## Key Configuration Files

### Environment Variables (Docker)
Configured in `docker-compose.yml`:
- Database: `postgres://user:pass@postgres:5432/wecover`
- S3: `http://minio:9000`
- Bucket: `wecover-pdfs`

### PDF Template Location
- **In MinIO**: `templates/ContractPSVSCTemplate_HT_v07_Form.pdf`
- **Env Var**: `PDF_TEMPLATE_KEY=templates/ContractPSVSCTemplate_HT_v07_Form.pdf`

---

## Next Steps

1. ✅ Test term length checkboxes in preview
2. ✅ Test commercial checkbox
3. Add more HTML templates for different states
4. Add signature capture in the web form
5. Add policy search/list functionality
6. Add authentication (Cognito/Auth0)

---

## Documentation Files

- `README.md` - Main project documentation
- `DOCKER.md` - Docker deployment guide
- `DOCKER_SUMMARY.md` - Docker changes overview
- `DOCKER_MODULE_FIXES.md` - ES module resolution fixes
- `SETUP_COMPLETE.md` - This file!

---

*Last updated: 2025-10-06*


