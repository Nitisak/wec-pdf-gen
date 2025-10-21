# Quote PDF Generator

## Overview

The Quote PDF Generator is a first-class feature that produces professional, dealer-branded insurance quotes with comprehensive pricing breakdowns. Quotes are generated as PDF documents and stored in S3 for easy distribution.

---

## Features

✅ **Professional PDF Output**: Clean, dealer-branded quotes with WeCoverUSA logo  
✅ **Price Breakdown**: Detailed pricing with base price, options, fees, taxes, markup  
✅ **Multi-Product Support**: Works with PSVSC and Lifetime Warranty products  
✅ **Dealer Branding**: Includes dealer information and logo support  
✅ **Valid-Through Date**: Clear validity period for quotes  
✅ **Comprehensive Details**: Customer, vehicle, coverage, and pricing information  
✅ **S3 Storage**: Automatic upload and pre-signed URLs  
✅ **Database Tracking**: Full quote metadata stored for audit and retrieval  

---

## API Endpoints

### 1. Create Quote
**POST** `/api/quotes`

Generate a new insurance quote PDF with comprehensive pricing details.

**Request Body**:
```json
{
  "quoteNumber": "Q2025-001",
  "stateCode": "FL",
  "productVersion": "WEC-PS-VSC-09-2025",
  "owner": {
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main Street",
    "city": "Miami",
    "state": "FL",
    "zip": "33101",
    "phone": "(305) 555-0100",
    "email": "john.doe@example.com"
  },
  "vehicle": {
    "vin": "1HGCM82633A123456",
    "year": "2024",
    "make": "Honda",
    "model": "Accord",
    "mileage": 15000,
    "salePrice": 28500
  },
  "dealer": {
    "id": "DLR001",
    "name": "Premier Auto Group",
    "address": "456 Dealer Blvd",
    "city": "Miami",
    "state": "FL",
    "zip": "33102",
    "phone": "(305) 555-0200",
    "salesRep": "Jane Smith"
  },
  "coverage": {
    "termMonths": 72,
    "commercial": false,
    "deductible": 100,
    "coverageLevel": "Premium"
  },
  "pricing": {
    "basePrice": 2500.00,
    "coverageOptions": [
      {"name": "Roadside Assistance", "price": 150.00},
      {"name": "Rental Reimbursement", "price": 200.00}
    ],
    "fees": [
      {"name": "Administration Fee", "amount": 50.00},
      {"name": "Processing Fee", "amount": 25.00}
    ],
    "taxes": 187.50,
    "dealerMarkup": 300.00,
    "subtotal": 3112.50,
    "total": 3412.50
  },
  "validUntil": "2025-11-20",
  "issueDate": "2025-10-20",
  "disclaimers": [
    "This quote is valid for the specified period only.",
    "Final pricing may vary based on vehicle inspection."
  ],
  "notes": "Thank you for choosing our service!"
}
```

**Response** (200 OK):
```json
{
  "id": "1429fa92-6721-42db-ba43-29dcb49555b8",
  "quoteNumber": "Q2025-001",
  "pdfUrl": "http://localhost:9000/wecover-pdfs/quotes/2025/10/Q2025-001.pdf",
  "pdfKey": "quotes/2025/10/Q2025-001.pdf",
  "issueDate": "2025-10-20",
  "validUntil": "2025-11-20",
  "total": "3412.50"
}
```

---

### 2. Get Quote
**GET** `/api/quotes/:quoteNumber`

Retrieve quote details by quote number.

**Example**:
```bash
curl http://localhost:5273/api/quotes/Q2025-001
```

**Response**:
```json
{
  "id": "1429fa92-6721-42db-ba43-29dcb49555b8",
  "quoteNumber": "Q2025-001",
  "productVersion": "WEC-PS-VSC-09-2025",
  "stateCode": "FL",
  "termMonths": 72,
  "commercial": false,
  "basePrice": "2500.00",
  "subtotal": "3112.50",
  "total": "3412.50",
  "issueDate": "2025-10-20",
  "validUntil": "2025-11-20",
  "pdfUrl": "http://localhost:9000/wecover-pdfs/quotes/2025/10/Q2025-001.pdf",
  "pdfKey": "quotes/2025/10/Q2025-001.pdf",
  "payload": { /* full request */ },
  "createdAt": "2025-10-20T14:59:55.123Z"
}
```

---

### 3. List Quotes
**GET** `/api/quotes?stateCode=FL&productVersion=WEC-PS-VSC-09-2025&limit=50&offset=0`

List all quotes with optional filters.

**Query Parameters**:
- `stateCode` (optional): Filter by state
- `productVersion` (optional): Filter by product
- `limit` (optional, default: 50): Number of results
- `offset` (optional, default: 0): Pagination offset

**Response**:
```json
[
  {
    "id": "1429fa92-6721-42db-ba43-29dcb49555b8",
    "quoteNumber": "Q2025-001",
    "productVersion": "WEC-PS-VSC-09-2025",
    "stateCode": "FL",
    "total": "3412.50",
    "issueDate": "2025-10-20",
    "validUntil": "2025-11-20",
    "createdAt": "2025-10-20T14:59:55.123Z"
  }
]
```

---

## Schema Reference

### QuoteCreateSchema

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `quoteNumber` | string | ✅ | - | Unique quote identifier |
| `stateCode` | string(2) | ✅ | - | Two-letter state code |
| `productVersion` | string | ✅ | - | Product identifier |
| `owner` | OwnerSchema | ✅ | - | Customer information |
| `vehicle` | VehicleSchema | ✅ | - | Vehicle details |
| `dealer` | DealerSchema | ✅ | - | Dealer information |
| `coverage` | CoverageSchema | ✅ | - | Coverage details |
| `pricing` | PriceBreakdownSchema | ✅ | - | Price breakdown |
| `validUntil` | string (ISO date) | ✅ | - | Quote expiration date |
| `issueDate` | string (ISO date) | ❌ | Current date | Quote issue date |
| `disclaimers` | string[] | ❌ | [defaults] | Legal disclaimers |
| `notes` | string | ❌ | - | Additional notes |

### PriceBreakdownSchema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `basePrice` | number | ✅ | Base coverage price |
| `coverageOptions` | array | ❌ | Additional coverage options |
| `fees` | array | ❌ | Administrative fees |
| `taxes` | number | ❌ | Tax amount |
| `dealerMarkup` | number | ❌ | Dealer profit margin |
| `subtotal` | number | ✅ | Subtotal before total |
| `total` | number | ✅ | Final total amount |

**Coverage Options Format**:
```json
{"name": "Roadside Assistance", "price": 150.00}
```

**Fees Format**:
```json
{"name": "Processing Fee", "amount": 25.00}
```

---

## PDF Layout

### Page 1: Quote Details

1. **Header**
   - WeCoverUSA Logo (top-left)
   - "INSURANCE QUOTE" title

2. **Quote Info Box** (gray background)
   - Quote Number
   - Issue Date
   - Valid Until Date (highlighted in red)
   - Product Name

3. **Two-Column Layout**
   - Left: Dealer Information
   - Right: Customer Information

4. **Vehicle Information**
   - Year, Make, Model
   - VIN
   - Mileage
   - Sale Price (if provided)

5. **Coverage Details**
   - Term (months or "Lifetime")
   - Type (Commercial/Personal)
   - Coverage Level
   - Deductible

6. **Price Breakdown** (Primary Section)
   - Base Coverage
   - Coverage Options (itemized)
   - Fees (itemized)
   - Taxes
   - Dealer Markup
   - Subtotal (with line separator)
   - **TOTAL** (highlighted blue background)

### Page 2: Additional Information (if needed)

- Additional Notes
- Disclaimers (italic, gray text)
- Footer: "This quote is not a binding contract..."

---

## Database Schema

### `quote` Table

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | ❌ | gen_random_uuid() | Primary key |
| `quote_number` | TEXT | ❌ | - | Unique quote number |
| `product_version` | TEXT | ❌ | - | Product identifier |
| `state_code` | TEXT | ❌ | - | State code |
| `term_months` | INT | ❌ | 999 | Term length |
| `commercial` | BOOLEAN | ❌ | false | Commercial flag |
| `base_price` | NUMERIC(12,2) | ❌ | - | Base price |
| `subtotal` | NUMERIC(12,2) | ❌ | - | Subtotal |
| `total` | NUMERIC(12,2) | ❌ | - | Total amount |
| `issue_date` | DATE | ❌ | CURRENT_DATE | Issue date |
| `valid_until` | DATE | ❌ | - | Expiration date |
| `payload` | JSONB | ❌ | - | Full request payload |
| `pdf_key` | TEXT | ✅ | - | S3 key for PDF |
| `created_at` | TIMESTAMPTZ | ❌ | now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | ❌ | now() | Update timestamp |

**Indexes**:
- `idx_quote_number` on `quote_number`
- `idx_quote_state` on `state_code`
- `idx_quote_product` on `product_version`
- `idx_quote_valid_until` on `valid_until`
- `idx_quote_created` on `created_at DESC`

---

## S3 Storage

### Path Format
```
quotes/{YYYY}/{MM}/{quoteNumber}.pdf
```

**Example**:
```
quotes/2025/10/Q2025-001.pdf
```

### Logo Storage
```
templates/logo.png
```

The WeCoverUSA logo is automatically included in all quote PDFs.

---

## Testing

### Test Quote Creation

```bash
curl -X POST 'http://localhost:5273/api/quotes' \
  -H 'Content-Type: application/json' \
  -d @test-quote.json
```

### Test Quote Retrieval

```bash
# Get specific quote
curl http://localhost:5273/api/quotes/Q2025-001 | jq .

# List all quotes
curl http://localhost:5273/api/quotes | jq .

# Filter by state
curl 'http://localhost:5273/api/quotes?stateCode=FL' | jq .
```

### Verify PDF Generation

```bash
# Download PDF
wget http://localhost:9000/wecover-pdfs/quotes/2025/10/Q2025-001.pdf

# Or open in browser
open http://localhost:9000/wecover-pdfs/quotes/2025/10/Q2025-001.pdf
```

---

## Example Use Cases

### 1. Standard PSVSC Quote

```bash
curl -X POST 'http://localhost:5273/api/quotes' \
  -H 'Content-Type: application/json' \
  -d '{
    "quoteNumber": "Q2025-PSVSC-001",
    "stateCode": "FL",
    "productVersion": "WEC-PS-VSC-09-2025",
    "owner": { /* customer info */ },
    "vehicle": { /* vehicle info */ },
    "dealer": { /* dealer info */ },
    "coverage": {
      "termMonths": 72,
      "commercial": false,
      "coverageLevel": "Premium"
    },
    "pricing": {
      "basePrice": 2500.00,
      "subtotal": 2500.00,
      "total": 2687.50
    },
    "validUntil": "2025-11-20"
  }'
```

### 2. Lifetime Warranty Quote

```bash
curl -X POST 'http://localhost:5273/api/quotes' \
  -H 'Content-Type: application/json' \
  -d '{
    "quoteNumber": "Q2025-LT-001",
    "stateCode": "FL",
    "productVersion": "AGVSC-LIFETIME-V04-2025",
    "owner": { /* customer info */ },
    "vehicle": { /* vehicle info */ },
    "dealer": { /* dealer info */ },
    "coverage": {
      "coverageLevel": "Elite Lifetime"
    },
    "pricing": {
      "basePrice": 4500.00,
      "coverageOptions": [
        {"name": "Lifetime Powertrain", "price": 1500.00}
      ],
      "subtotal": 6000.00,
      "total": 6875.00
    },
    "validUntil": "2025-12-31"
  }'
```

### 3. Commercial Vehicle Quote

```bash
curl -X POST 'http://localhost:5273/api/quotes' \
  -H 'Content-Type: application/json' \
  -d '{
    "quoteNumber": "Q2025-COMM-001",
    "stateCode": "TX",
    "productVersion": "WEC-PS-VSC-09-2025",
    "owner": { /* business info */ },
    "vehicle": { /* commercial vehicle */ },
    "dealer": { /* dealer info */ },
    "coverage": {
      "termMonths": 96,
      "commercial": true,
      "coverageLevel": "Heavy Duty"
    },
    "pricing": {
      "basePrice": 3500.00,
      "dealerMarkup": 500.00,
      "subtotal": 4000.00,
      "total": 4320.00
    },
    "validUntil": "2025-12-15"
  }'
```

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `S3_ENDPOINT` | http://127.0.0.1:9000 | S3/MinIO endpoint |
| `S3_BUCKET` | wecover-pdfs | S3 bucket name |
| `S3_PUBLIC_ENDPOINT` | http://localhost:9000 | Public S3 URL |

### Logo Configuration

The logo is loaded from:
```
templates/logo.png
```

To use a custom logo:
1. Upload to S3: `mc cp custom-logo.png myminio/wecover-pdfs/templates/logo.png`
2. Restart API: `docker-compose restart api`

---

## Migration Details

### Migration 003: Quotes

**File**: `apps/api/migrations/003_quotes.sql`

**Changes**:
- Created `quote` table
- Added indexes for performance
- Added `update_updated_at_column()` function
- Added trigger for automatic `updated_at` updates

**Run migrations**:
```bash
docker-compose restart api
# Migrations run automatically on startup
```

---

## Non-Goals (for this release)

❌ **Rating/Price Discovery**: Pricing is supplied by caller  
❌ **Digital Signatures**: Not implemented (future phase)  
❌ **Email Distribution**: Manual distribution via PDF URL  
❌ **Quote Expiration**: No automatic expiration handling  
❌ **Quote-to-Policy Conversion**: Separate workflow  

---

## Files Added

### Backend
- `packages/shared/policySchemas.ts` - Added Quote schemas
- `apps/api/src/modules/quotes/generator/generateQuotePdf.ts` - PDF generator
- `apps/api/src/modules/quotes/service/quotes.service.ts` - Business logic
- `apps/api/src/routes/quotes.routes.ts` - API routes
- `apps/api/src/modules/db/schema.ts` - Added `quote` table
- `apps/api/migrations/003_quotes.sql` - Database migration

### Scripts
- `scripts/upload-logo.sh` - Logo upload script

### Documentation
- `docs/QUOTE_PDF_GENERATOR.md` - This file

---

## FAQ

**Q: Can I customize the PDF layout?**  
A: Yes, edit `apps/api/src/modules/quotes/generator/generateQuotePdf.ts`

**Q: How do I add more coverage options?**  
A: Include them in the `pricing.coverageOptions` array

**Q: Can I have multiple pages?**  
A: Yes, the generator automatically adds pages for disclaimers and notes

**Q: What image format is supported for the logo?**  
A: PNG format is required

**Q: Can I exclude the logo?**  
A: Yes, pass `includeLogo: false` in `QuotePdfOptions`

**Q: How long are quotes valid?**  
A: Determined by the `validUntil` field in the request

---

## Support

For issues or questions:
1. Check API logs: `docker logs wec-api`
2. Verify MinIO: `docker exec wec-minio mc ls myminio/wecover-pdfs/quotes/`
3. Check database: `docker exec wec-postgres psql -U user -d wecover -c "SELECT * FROM quote;"`

---

**Version**: 1.0.0  
**Date**: October 20, 2025  
**Status**: ✅ Production Ready

