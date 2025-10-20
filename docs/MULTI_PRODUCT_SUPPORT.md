# Multi-Product Support Implementation

## Overview
The PDF generator now supports multiple product types, allowing the system to generate PDFs for different warranty products using product-specific templates and field mappings.

## Supported Products

### 1. **PSVSC (Powertrain Service Contract)**
- **Product Version**: `WEC-PS-VSC-09-2025`
- **Templates**:
  - Form: `templates/ContractPSVSCTemplate_HT_v07_01.pdf` (3-page fillable form)
  - Terms: `templates/ContractPSVSCTemplate_HT_v07_02.pdf`
  - Disclosure: `templates/ContractPSVSCTemplate_HT_v07_03.pdf`

### 2. **Lifetime Warranty**
- **Product Version**: `AGVSC-LIFETIME-V04-2025`
- **Templates**:
  - Form: `templates/AGVSC_LifeTime_V04_01_Form.pdf`
  - Terms: `templates/AGVSC_LifeTime_V04_02_Contract.pdf`
  - Disclosure: `templates/AGVSC_LifeTime_V04_03_State.pdf`

## Architecture

### Template Selection System

The system uses a centralized configuration in `policies.service.ts`:

```typescript
const PRODUCT_TEMPLATES: Record<string, { form: string; terms: string; disclosure: string }> = {
  'WEC-PS-VSC-09-2025': {
    form: 'templates/ContractPSVSCTemplate_HT_v07_01.pdf',
    terms: 'templates/ContractPSVSCTemplate_HT_v07_02.pdf',
    disclosure: 'templates/ContractPSVSCTemplate_HT_v07_03.pdf'
  },
  'AGVSC-LIFETIME-V04-2025': {
    form: 'templates/AGVSC_LifeTime_V04_01_Form.pdf',
    terms: 'templates/AGVSC_LifeTime_V04_02_Contract.pdf',
    disclosure: 'templates/AGVSC_LifeTime_V04_03_State.pdf'
  }
};

export function getProductTemplates(productVersion: string) {
  const templates = PRODUCT_TEMPLATES[productVersion];
  if (!templates) {
    throw new Error(`Unknown product version: ${productVersion}. Available: ${Object.keys(PRODUCT_TEMPLATES).join(', ')}`);
  }
  return templates;
}
```

### Field Mapping System

The `mapping.ts` file now routes to product-specific mapping functions:

```typescript
export const toAcroFields = (p: PolicyCreate): Record<string, string> => {
  // Determine which mapping to use based on product version
  if (p.productVersion === 'AGVSC-LIFETIME-V04-2025') {
    return toLifetimeWarrantyFields(p);
  }
  
  // Default to PSVSC mapping
  return toPSVSCFields(p);
};
```

## Implementation Details

### Files Modified

1. **`apps/api/src/modules/policies/service/policies.service.ts`**
   - Added `PRODUCT_TEMPLATES` configuration
   - Added `getProductTemplates()` function
   - Updated `loadTermsPdf()` and `loadDisclosurePdf()` to accept `productVersion` parameter

2. **`apps/api/src/modules/policies/filler/fillAcroForm.ts`**
   - Imported `getProductTemplates` from service
   - Updated to dynamically load template based on product version
   - Added logging for product version

3. **`apps/api/src/modules/policies/filler/mapping.ts`**
   - Added product routing logic in `toAcroFields()`
   - Created `toPSVSCFields()` for PSVSC product
   - Created `toLifetimeWarrantyFields()` for Lifetime Warranty product

4. **`scripts/upload-lifetime-warranty-templates.sh`**
   - New script to upload Lifetime Warranty templates to MinIO

## Usage

### API Request

To generate a PDF for a specific product, include the `productVersion` in your request:

#### PSVSC Product Example

```bash
curl -X POST 'http://localhost:5273/api/policies?dryRun=true' \
  -H "Content-Type: application/json" \
  -d '{
    "policyNumber": "TEST-PSVSC-001",
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

#### Lifetime Warranty Product Example

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
      "name": "Lifetime Auto Dealer"
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

## Adding New Products

To add a new product to the system:

### 1. Upload PDF Templates to MinIO

```bash
# Copy templates to MinIO container
docker cp path/to/new_product_form.pdf wec-minio:/tmp/new_form.pdf
docker cp path/to/new_product_terms.pdf wec-minio:/tmp/new_terms.pdf
docker cp path/to/new_product_disclosure.pdf wec-minio:/tmp/new_disclosure.pdf

# Upload to MinIO bucket
docker exec wec-minio mc cp /tmp/new_form.pdf myminio/wecover-pdfs/templates/NEW_PRODUCT_Form.pdf
docker exec wec-minio mc cp /tmp/new_terms.pdf myminio/wecover-pdfs/templates/NEW_PRODUCT_Terms.pdf
docker exec wec-minio mc cp /tmp/new_disclosure.pdf myminio/wecover-pdfs/templates/NEW_PRODUCT_Disclosure.pdf
```

### 2. Add Product Configuration

Edit `apps/api/src/modules/policies/service/policies.service.ts`:

```typescript
const PRODUCT_TEMPLATES: Record<string, { form: string; terms: string; disclosure: string }> = {
  // ... existing products ...
  'NEW-PRODUCT-VERSION-2025': {
    form: 'templates/NEW_PRODUCT_Form.pdf',
    terms: 'templates/NEW_PRODUCT_Terms.pdf',
    disclosure: 'templates/NEW_PRODUCT_Disclosure.pdf'
  }
};
```

### 3. Add Field Mapping (if different from existing products)

Edit `apps/api/src/modules/policies/filler/mapping.ts`:

```typescript
export const toAcroFields = (p: PolicyCreate): Record<string, string> => {
  if (p.productVersion === 'NEW-PRODUCT-VERSION-2025') {
    return toNewProductFields(p);
  }
  // ... existing product checks ...
};

// Add new mapping function
const toNewProductFields = (p: PolicyCreate): Record<string, string> => {
  return {
    // Map fields specific to new product
    Field_Name_1: p.owner.firstName,
    Field_Name_2: p.owner.lastName,
    // ... etc
  };
};
```

### 4. Rebuild and Deploy

```bash
# Build packages
pnpm --filter @wec/shared build
pnpm --filter @wec/api build

# Rebuild Docker image
docker-compose build api

# Restart services
docker-compose up -d
```

### 5. Test the New Product

```bash
curl -X POST 'http://localhost:5273/api/policies?dryRun=true' \
  -H "Content-Type: application/json" \
  -d '{
    "policyNumber": "TEST-NEW-001",
    "productVersion": "NEW-PRODUCT-VERSION-2025",
    ...
  }'
```

## Template Management

### Uploading Templates

#### Option 1: Using Scripts
```bash
# Create a new upload script in scripts/
bash scripts/upload-new-product-templates.sh
```

#### Option 2: Manual Upload
```bash
docker exec wec-minio mc cp /path/to/template.pdf myminio/wecover-pdfs/templates/template.pdf
```

### Verifying Templates

```bash
# List all templates
docker exec wec-minio mc ls myminio/wecover-pdfs/templates/

# Test access from API
docker exec wec-api wget -qO- "http://minio:9000/wecover-pdfs/templates/YOUR_TEMPLATE.pdf" | head -c 100
```

## Error Handling

### Unknown Product Version

If an unknown `productVersion` is provided, the system will return an error:

```json
{
  "error": "Policy creation failed",
  "message": "Unknown product version: INVALID-PRODUCT. Available: WEC-PS-VSC-09-2025, AGVSC-LIFETIME-V04-2025"
}
```

### Missing Template

If a template file is missing from MinIO:

```json
{
  "error": "Policy creation failed",
  "message": "The specified key does not exist."
}
```

**Solution**: Upload the missing template using the upload scripts.

### Field Mapping Issues

If PDF form fields don't match the mapping:
- Check logs: `docker logs wec-api`
- Look for: `Field not found: FieldName`
- Update mapping in `mapping.ts` to match actual PDF field names

## Testing

### Test Both Products

```bash
# Test PSVSC
curl -X POST 'http://localhost:5273/api/policies?dryRun=true' \
  -H "Content-Type: application/json" \
  -d '{"productVersion":"WEC-PS-VSC-09-2025",...}' \
  | jq '.policyNumber'

# Test Lifetime Warranty
curl -X POST 'http://localhost:5273/api/policies?dryRun=true' \
  -H "Content-Type: application/json" \
  -d '{"productVersion":"AGVSC-LIFETIME-V04-2025",...}' \
  | jq '.policyNumber'
```

### Expected Response

```json
{
  "id": "dry-run",
  "policyNumber": "TEST-PSVSC-001",
  "pdfUrl": "data:application/pdf;base64,JVBERi0..."
}
```

## Best Practices

1. **Product Version Naming**
   - Use descriptive, version-controlled names
   - Format: `{PRODUCT-NAME}-{VERSION}-{YEAR}`
   - Example: `AGVSC-LIFETIME-V04-2025`

2. **Template Organization**
   - Store templates in `assets/{product_folder}/`
   - Use consistent naming: `{Product}_{Version}_{01|02|03}_{Type}.pdf`
   - Example: `AGVSC_LifeTime_V04_01_Form.pdf`

3. **Field Mapping**
   - Document PDF field names in comments
   - Use consistent mapping patterns across products
   - Handle optional fields with `??` operator

4. **Testing**
   - Test each new product with `dryRun=true` first
   - Verify all three PDFs are correctly merged
   - Check that all form fields are filled
   - Validate read-only fields are locked

## Troubleshooting

### Problem: PDF Generation Fails

**Symptoms**: `The specified key does not exist`

**Solutions**:
1. Verify templates are uploaded:
   ```bash
   docker exec wec-minio mc ls myminio/wecover-pdfs/templates/
   ```

2. Check template paths in `policies.service.ts`

3. Rebuild API container:
   ```bash
   docker-compose build api && docker-compose up -d api
   ```

### Problem: Fields Not Filling

**Symptoms**: PDF generated but fields are empty

**Solutions**:
1. Check field names in PDF:
   - Open PDF in Adobe Acrobat
   - Go to Tools → Prepare Form
   - Note exact field names

2. Update mapping in `mapping.ts` to match

3. Check logs for "Field not found" warnings:
   ```bash
   docker logs wec-api | grep "Field not found"
   ```

### Problem: Wrong Template Used

**Symptoms**: Correct product version but wrong PDF

**Solutions**:
1. Verify product version in request
2. Check `PRODUCT_TEMPLATES` configuration
3. Restart API to pick up configuration changes

## Related Documentation

- [PDF Enhancement Summary](./PDF_ENHANCEMENT_SUMMARY.md)
- [Three Page Form Summary](./THREE_PAGE_FORM_SUMMARY.md)
- [Read-Only Fields](./READ_ONLY_FIELDS_SUMMARY.md)
- [Seeding Complete](./SEEDING_COMPLETE.md)

---

**Last Updated**: 2025-10-16  
**Version**: 1.0.0  
**Status**: ✅ Complete

