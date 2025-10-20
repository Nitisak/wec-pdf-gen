# WeCover PDF Generator - Quick Start Guide

## 🚀 Access the Application

### Web Interface
```
http://localhost:5270
```

### API Endpoint
```
http://localhost:5273/api
```

## 📦 Available Products

### 1. PSVSC (Powertrain Service Contract)
- **Product Version**: `WEC-PS-VSC-09-2025`
- **Icon**: 🔧
- **Color**: Blue
- **Terms**: 72, 84, or 96 months
- **Templates**:
  - Form: `ContractPSVSCTemplate_HT_v07_01.pdf`
  - Terms: `ContractPSVSCTemplate_HT_v07_02.pdf`
  - Disclosure: `ContractPSVSCTemplate_HT_v07_03.pdf`

### 2. Lifetime Warranty
- **Product Version**: `AGVSC-LIFETIME-V04-2025`
- **Icon**: 🛡️
- **Color**: Green
- **Coverage**: Extended lifetime protection
- **Templates**:
  - Form: `AGVSC_LifeTime_V04_01_Form.pdf`
  - Terms: `AGVSC_LifeTime_V04_02_Contract.pdf`
  - Disclosure: `AGVSC_LifeTime_V04_03_State.pdf`

## 🖥️ Using the Web Interface

### Step 1: Select Product
- Open http://localhost:5270
- Click on either **PSVSC** or **Lifetime** card
- Selected card will highlight in blue/green

### Step 2: Fill Policy Information
- Policy Number (auto-generated if empty)
- State selection

### Step 3: Owner Information
- First Name, Last Name
- Address, City, State, ZIP
- Phone, Email

### Step 4: Dealer Information
- Dealer ID, Name
- Address (optional)
- City, State, ZIP (optional)
- Phone, Sales Rep (optional)

### Step 5: Vehicle Information
- VIN
- Year, Make, Model
- Mileage, Sale Price

### Step 6: Coverage Information
- Term Length (72, 84, or 96 months)
- Commercial/Farm Use checkbox
- Contract Price
- Purchase Date (auto-calculates expiration)

### Step 7: Lender Information (Optional)
- Lender Name, Address
- City, State, ZIP

### Step 8: Generate PDF
- **Preview PDF**: Test without saving
- **Create Policy**: Generate and save to database

## 🔧 Using the API

### Quick Test (PSVSC)
```bash
curl -X POST 'http://localhost:5273/api/policies?dryRun=true' \
  -H "Content-Type: application/json" \
  -d '{
    "policyNumber": "TEST-001",
    "productVersion": "WEC-PS-VSC-09-2025",
    "stateCode": "FL",
    "owner": {
      "firstName": "John",
      "lastName": "Doe",
      "address": "123 Main St",
      "city": "Miami",
      "state": "FL",
      "zip": "33101",
      "phone": "305-555-0100",
      "email": "john@example.com"
    },
    "dealer": {
      "id": "DLR-001",
      "name": "Test Dealer"
    },
    "vehicle": {
      "vin": "1HGCM82633A123456",
      "year": "2023",
      "make": "Honda",
      "model": "Accord",
      "mileage": 10000,
      "salePrice": 25000
    },
    "coverage": {
      "termMonths": "72",
      "purchaseDate": "2025-10-15",
      "expirationDate": "2031-10-15",
      "contractPrice": 2000,
      "commercial": false
    }
  }'
```

### Quick Test (Lifetime)
```bash
curl -X POST 'http://localhost:5273/api/policies?dryRun=true' \
  -H "Content-Type: application/json" \
  -d '{
    "policyNumber": "TEST-LIFETIME-001",
    "productVersion": "AGVSC-LIFETIME-V04-2025",
    "stateCode": "FL",
    "owner": {
      "firstName": "Jane",
      "lastName": "Smith",
      "address": "456 Oak Ave",
      "city": "Tampa",
      "state": "FL",
      "zip": "33602",
      "phone": "813-555-0200",
      "email": "jane@example.com"
    },
    "dealer": {
      "id": "DLR-002",
      "name": "Lifetime Auto"
    },
    "vehicle": {
      "vin": "2T1BURHE4JC123456",
      "year": "2024",
      "make": "Toyota",
      "model": "Camry",
      "mileage": 5000,
      "salePrice": 30000
    },
    "coverage": {
      "termMonths": "96",
      "purchaseDate": "2025-10-15",
      "expirationDate": "2033-10-15",
      "contractPrice": 3500,
      "commercial": false
    }
  }'
```

## 🐳 Docker Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker logs wec-api -f
docker logs wec-web -f
docker logs wec-minio -f
docker logs wec-postgres -f
```

### Rebuild Services
```bash
# Rebuild API
docker-compose build api
docker-compose up -d api

# Rebuild Web
docker-compose build web
docker-compose up -d web
```

### Check Service Status
```bash
docker-compose ps
```

## 🗄️ Database & Storage

### PostgreSQL
- **Host**: localhost:5432
- **Database**: wecover
- **User**: wecover
- **Password**: wecover_password

### MinIO (S3)
- **Console**: http://localhost:9001
- **API**: http://localhost:9000
- **Access Key**: minioadmin
- **Secret Key**: minioadmin
- **Bucket**: wecover-pdfs

### View Templates in MinIO
```bash
docker exec wec-minio mc ls myminio/wecover-pdfs/templates/
```

## 🔍 Troubleshooting

### Service Won't Start
```bash
# Check logs
docker logs wec-api --tail 50

# Restart service
docker-compose restart api
```

### PDF Generation Fails
```bash
# Verify templates exist
docker exec wec-minio mc ls myminio/wecover-pdfs/templates/

# Check API logs
docker logs wec-api | grep ERROR
```

### Web UI Not Loading
```bash
# Check web container
docker logs wec-web

# Verify port 5270 is free
lsof -i :5270

# Restart web
docker-compose restart web
```

### Database Issues
```bash
# Connect to database
docker exec -it wec-postgres psql -U wecover -d wecover

# Check tables
\dt

# View policies
SELECT * FROM policy LIMIT 5;
```

## 📚 Documentation

### Main Guides
- [Multi-Product Support](docs/MULTI_PRODUCT_SUPPORT.md)
- [Product Selector UI](docs/PRODUCT_SELECTOR_UI.md)
- [UI Enhancement Summary](docs/UI_ENHANCEMENT_SUMMARY.md)
- [Read-Only Fields](docs/READ_ONLY_FIELDS_SUMMARY.md)

### Technical Docs
- [Three-Page Form](docs/THREE_PAGE_FORM_SUMMARY.md)
- [PDF Enhancement](docs/PDF_ENHANCEMENT_SUMMARY.md)

## 🎯 Common Tasks

### Add a New Product
1. Upload templates to MinIO
2. Update `policies.service.ts` with template paths
3. Update `mapping.ts` with field mapping
4. Add to `PRODUCTS` array in `PolicyForm.tsx`
5. Rebuild and restart

### Change Product Colors
Edit `apps/web/src/components/PolicyForm.tsx`:
```typescript
{
  id: 'YOUR-PRODUCT',
  color: '#ff6b6b'  // Change this
}
```

### Update PDF Templates
```bash
# Upload new template
docker cp path/to/new_template.pdf wec-minio:/tmp/template.pdf
docker exec wec-minio mc cp /tmp/template.pdf \
  myminio/wecover-pdfs/templates/YOUR_TEMPLATE.pdf
```

## ✅ Health Checks

### API Health
```bash
curl http://localhost:5273/api/health
```

### MinIO Health
```bash
curl http://localhost:9000/minio/health/live
```

### Database Health
```bash
docker exec wec-postgres pg_isready
```

## 🚨 Emergency Commands

### Reset Everything
```bash
docker-compose down -v
docker-compose up -d
bash scripts/upload-new-templates.sh
bash scripts/upload-lifetime-warranty-templates.sh
```

### Clear Database Only
```bash
docker exec -it wec-postgres psql -U wecover -d wecover -c "TRUNCATE TABLE policy CASCADE;"
```

### Rebuild All
```bash
pnpm install
pnpm build
docker-compose build
docker-compose up -d
```

---

**Need Help?**
- Check logs: `docker-compose logs -f`
- View docs: `docs/` folder
- API docs: http://localhost:5273/api/documentation (if enabled)
