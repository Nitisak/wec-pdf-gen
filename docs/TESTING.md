# Testing Guide - WeCover PDF Generator

## Quick Start - Generate Test PDFs

### Option 1: Using the Test Script (Recommended)

Generate sample PDFs with different configurations:

```bash
cd /Users/nitisak/00_Workspace/Builder/wec-pdf-generator
npx tsx scripts/generate-test-pdf.ts
```

**Output**: Creates PDFs in `test-pdfs/` directory:
- `policy-72month.pdf` - 72-month term, personal use
- `policy-84month.pdf` - 84-month term, personal use  
- `policy-96month-commercial.pdf` - 96-month term, commercial vehicle
- `policy-with-signature.pdf` - With signature overlay

### Option 2: Run E2E Tests

Run automated tests that verify PDF generation and field filling:

```bash
cd apps/api
pnpm test:e2e
```

**Output**: 
- Test results in terminal
- PDFs in `apps/api/test-output/` directory

---

## Test Coverage

### fillAcroForm E2E Tests

Located in: `apps/api/src/modules/policies/filler/__tests__/fillAcroForm.e2e.test.ts`

**Test Cases:**

1. ✅ **72-Month Term Policy**
   - Verifies text fields are filled correctly
   - Confirms Term_72m checkbox is checked
   - Confirms other term checkboxes are unchecked

2. ✅ **84-Month Term Policy**
   - Verifies Term_84m checkbox is checked
   - Confirms other term checkboxes are unchecked

3. ✅ **Commercial Vehicle (96-Month)**
   - Verifies Term_96m checkbox is checked
   - Verifies LossCode_COMMERCIAL checkbox is checked

4. ✅ **Signature Overlay**
   - Verifies signature PNG is embedded at correct position

### Running Tests

**Run all tests:**
```bash
cd apps/api
pnpm test
```

**Run only E2E tests:**
```bash
pnpm test:e2e
```

**Watch mode (for development):**
```bash
pnpm test --watch
```

---

## Manual Testing via Web Interface

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **Open browser:**
   ```
   http://localhost
   ```

3. **Fill the form with test data**

4. **Click "Preview"** to generate test PDF

5. **Verify checkboxes:**
   - Check Docker logs:
     ```bash
     docker-compose logs api | grep "Checked:"
     ```
   - Expected output:
     ```
     ✓ Checked: Term_72m
       Unchecked: Term_84m
       Unchecked: Term_96m
     ```

---

## Test Data Examples

### Personal Use - 72 Month

```json
{
  "policyNumber": "WEC-2025-001",
  "owner": {
    "firstName": "John",
    "lastName": "Smith",
    "address": "123 Main St",
    "city": "Miami",
    "state": "FL",
    "zip": "33101",
    "phone": "305-555-0100",
    "email": "john@example.com"
  },
  "dealer": {
    "id": "DLR-001",
    "name": "Auto Sales Inc",
    "address": "456 Dealer Ave",
    "city": "Miami",
    "state": "FL",
    "zip": "33102",
    "phone": "305-555-0200"
  },
  "vehicle": {
    "vin": "1HGCM82633A123456",
    "year": "2023",
    "make": "Honda",
    "model": "Accord",
    "mileage": 15000,
    "salePrice": 28500.00
  },
  "coverage": {
    "productVersion": "WEC-PS-VSC-09-2025",
    "termMonths": 72,
    "purchaseDate": "2025-10-06",
    "expirationDate": "2031-10-06",
    "contractPrice": 2500.00,
    "commercial": false
  }
}
```

### Commercial - 96 Month

```json
{
  "policyNumber": "WEC-2025-002",
  "owner": {
    "firstName": "Bob",
    "lastName": "Builder",
    "address": "555 Construction Way",
    "city": "Tampa",
    "state": "FL",
    "zip": "33601",
    "phone": "813-555-0100",
    "email": "bob@construction.com"
  },
  "vehicle": {
    "vin": "1FTFW1EF5DFC12345",
    "year": "2023",
    "make": "Ford",
    "model": "F-150",
    "mileage": 25000,
    "salePrice": 45000.00
  },
  "coverage": {
    "termMonths": 96,
    "commercial": true
  }
}
```

---

## Debugging Tests

### View Generated PDFs

After running tests, PDFs are saved to:
- **E2E Tests**: `apps/api/test-output/`
- **Test Script**: `test-pdfs/`

### Check Form Fields

List all fields in the PDF template:
```bash
npx tsx scripts/inspect-pdf-fields.ts
```

### Verify S3 Storage

Check MinIO for uploaded templates:
```bash
mc ls local/wecover-pdfs/templates/ --recursive
```

### Database Queries

View policies in database:
```bash
docker-compose exec postgres psql -U user -d wecover -c "SELECT policy_number, state_code, term_months, commercial FROM policy;"
```

---

## Expected Test Results

### Checkbox Verification

| Test Case | Term_72m | Term_84m | Term_96m | Commercial |
|-----------|----------|----------|----------|------------|
| 72-month personal | ✅ | ❌ | ❌ | ❌ |
| 84-month personal | ❌ | ✅ | ❌ | ❌ |
| 96-month commercial | ❌ | ❌ | ✅ | ✅ |

### Field Mapping

All text fields should be populated from `toAcroFields()` mapping:
- Owner information
- Co-owner (if present)
- Dealer information
- Vehicle details
- Contract dates and pricing
- Lender (if present)

---

## Continuous Integration

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Run E2E Tests
  run: |
    docker-compose up -d postgres minio
    sleep 5
    cd apps/api
    pnpm test:e2e
```

---

## Troubleshooting

### Issue: "Cannot find module '@wec/shared'"

**Solution**: Build shared package first
```bash
pnpm --filter @wec/shared build
```

### Issue: "NoSuchKey: templates/ContractPSVSCTemplate_HT_v07_Form.pdf"

**Solution**: Upload template to MinIO
```bash
./scripts/setup-storage.sh
```

### Issue: Tests timeout

**Solution**: Increase timeout in test file
```typescript
it('should fill PDF', async () => {
  // test code
}, 60000); // 60 second timeout
```

---

## Next Steps

1. ✅ Run test script to generate sample PDFs
2. ✅ Run E2E tests to verify functionality  
3. ✅ Test via web interface at http://localhost
4. Add more test cases for edge scenarios
5. Add integration tests for full API workflow
6. Add performance tests for bulk PDF generation

---

*Last updated: 2025-10-06*


