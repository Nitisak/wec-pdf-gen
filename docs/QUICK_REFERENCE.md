# Quick Reference Guide

## PDF Template Files

| File | Purpose | Size | Location in MinIO |
|------|---------|------|-------------------|
| `ContractPSVSCTemplate_HT_v07_01.pdf` | Fillable AcroForm | 919 KB | `templates/ContractPSVSCTemplate_HT_v07_01.pdf` |
| `ContractPSVSCTemplate_HT_v07_02.pdf` | Contract Terms | 662 KB | `templates/ContractPSVSCTemplate_HT_v07_02.pdf` |
| `ContractPSVSCTemplate_HT_v07_03.pdf` | State Disclosure | 696 KB | `templates/ContractPSVSCTemplate_HT_v07_03.pdf` |

## Environment Variables

```env
PDF_TEMPLATE_KEY=templates/ContractPSVSCTemplate_HT_v07_01.pdf
PDF_TERMS_KEY=templates/ContractPSVSCTemplate_HT_v07_02.pdf
PDF_DISCLOSURE_KEY=templates/ContractPSVSCTemplate_HT_v07_03.pdf
```

## Common Commands

### Upload Templates to MinIO
```bash
./scripts/upload-new-templates.sh
```

### Rebuild and Restart API
```bash
docker-compose build api
docker-compose up -d api
```

### Test PDF Generation (Dry Run)
```bash
curl -s -X POST 'http://localhost:5173/api/policies?dryRun=true' \
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
      "phone":"305-555-0100",
      "email":"john@example.com"
    },
    "dealer":{
      "id":"DLR-001",
      "name":"Test Dealer",
      "address":"456 Dealer St",
      "city":"Miami",
      "state":"FL",
      "zip":"33102",
      "phone":"305-555-0200"
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
      "termMonths":72,
      "purchaseDate":"2025-10-06",
      "expirationDate":"2031-10-06",
      "contractPrice":2000,
      "commercial":false
    }
  }' | jq
```

### View API Logs
```bash
docker-compose logs -f api
```

### Check MinIO Templates
```bash
docker exec wec-minio mc ls myminio/wecover-pdfs/templates/
```

## PDF Generation Flow

```
┌─────────────────────────────────────────────────┐
│ 1. Fill AcroForm (Template 01)                 │
│    - Customer information                       │
│    - Vehicle details                            │
│    - Coverage options                           │
│    - Checkboxes (Term length, Commercial)       │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ 2. Load Contract Terms (Template 02)           │
│    - Static pre-designed PDF                    │
│    - No rendering required                      │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ 3. Load State Disclosure (Template 03)         │
│    - Static pre-designed PDF                    │
│    - No rendering required                      │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ 4. Merge PDFs                                   │
│    - Combines all three PDFs                    │
│    - Maintains page order                       │
└─────────────────────────────────────────────────┘
                      ↓
              Final Policy PDF
```

## Field Mapping

### Text Fields
- `Text_Contract_Number` → Policy Number
- `Text_Owner_*` → Owner information
- `Text_Co_Owner_*` → Co-owner information (optional)
- `Text_Dealer_*` → Dealer information
- `Text_Vehicle_*` → Vehicle information
- `Text_Contract_*` → Coverage dates and price
- `Text_Lender_*` → Lender information (optional)

### Checkboxes
- `Term_72m`, `Term_84m`, `Term_96m` → Term length (only one checked)
- `LossCode_COMMERCIAL` → Commercial/Farm use flag

### Signature
- `CustomerSignature` → Base64 PNG overlay at coordinates (360, 120)

## Troubleshooting

### Problem: PDF templates not found
**Solution**: Run `./scripts/upload-new-templates.sh` to upload templates to MinIO

### Problem: Checkboxes not checked correctly
**Solution**: Verify `termMonths` is a valid number (72, 84, or 96) and rebuild API

### Problem: Fields not filling
**Solution**: Check field names in `apps/api/src/modules/policies/filler/mapping.ts` match PDF form fields

### Problem: MinIO connection error
**Solution**: 
```bash
docker-compose up -d minio
docker-compose restart api
```

## Testing Checklist

- [ ] Upload all three PDF templates to MinIO
- [ ] Rebuild API with latest code
- [ ] Test 72-month policy generation
- [ ] Test 84-month policy generation
- [ ] Test 96-month policy generation
- [ ] Test commercial policy (checkbox)
- [ ] Verify all three PDFs are merged correctly
- [ ] Check field values in generated PDF
- [ ] Test with and without optional fields (co-owner, lender, signature)

