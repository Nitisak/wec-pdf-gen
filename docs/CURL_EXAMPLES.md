# WeCover PDF Generator - cURL Examples

## API Endpoint
- **Base URL (Docker)**: `http://localhost:5173/api`
- **Base URL (Local Dev)**: `http://localhost:5173/api`

---

## 1. Create Policy (72-Month Term)

### Preview Mode (Dry Run)
```bash
curl -X POST http://localhost:5173/api/policies?dryRun=true \
  -H "Content-Type: application/json" \
  -d '{
    "policyNumber": "WEC-2025-72M-001",
    "productVersion": "WEC-PS-VSC-09-2025",
    "owner": {
      "firstName": "John",
      "lastName": "Smith",
      "address": "123 Main Street",
      "city": "Miami",
      "state": "FL",
      "zip": "33101",
      "phone": "305-555-0100",
      "email": "john.smith@example.com"
    },
    "coOwner": {
      "name": "Jane Smith",
      "address": "123 Main Street",
      "city": "Miami",
      "state": "FL",
      "zip": "33101",
      "phone": "305-555-0101",
      "email": "jane.smith@example.com"
    },
    "dealer": {
      "id": "DLR-FL-001",
      "name": "Sunshine Auto Sales",
      "address": "456 Dealer Boulevard",
      "city": "Miami",
      "state": "FL",
      "zip": "33102",
      "phone": "305-555-0200",
      "salesRep": "Bob Johnson"
    },
    "vehicle": {
      "vin": "1HGCM82633A123456",
      "year": "2023",
      "make": "Honda",
      "model": "Accord EX-L",
      "mileage": 15000,
      "salePrice": 28500.00
    },
    "coverage": {
      "termMonths": 72,
      "purchaseDate": "2025-10-06",
      "expirationDate": "2031-10-06",
      "contractPrice": 2500.00,
      "commercial": false
    },
    "lender": {
      "name": "First National Bank of Florida",
      "address": "789 Bank Street",
      "cityStateZip": "Miami, FL 33103"
    },
    "stateCode": "FL"
  }'
```

### Create and Save Policy
```bash
curl -X POST http://localhost:5173/api/policies \
  -H "Content-Type: application/json" \
  -d '{
    "policyNumber": "WEC-2025-72M-001",
    "productVersion": "WEC-PS-VSC-09-2025",
    "owner": {
      "firstName": "John",
      "lastName": "Smith",
      "address": "123 Main Street",
      "city": "Miami",
      "state": "FL",
      "zip": "33101",
      "phone": "305-555-0100",
      "email": "john.smith@example.com"
    },
    "coOwner": {
      "name": "Jane Smith",
      "address": "123 Main Street",
      "city": "Miami",
      "state": "FL",
      "zip": "33101",
      "phone": "305-555-0101",
      "email": "jane.smith@example.com"
    },
    "dealer": {
      "id": "DLR-FL-001",
      "name": "Sunshine Auto Sales",
      "address": "456 Dealer Boulevard",
      "city": "Miami",
      "state": "FL",
      "zip": "33102",
      "phone": "305-555-0200",
      "salesRep": "Bob Johnson"
    },
    "vehicle": {
      "vin": "1HGCM82633A123456",
      "year": "2023",
      "make": "Honda",
      "model": "Accord EX-L",
      "mileage": 15000,
      "salePrice": 28500.00
    },
    "coverage": {
      "termMonths": 72,
      "purchaseDate": "2025-10-06",
      "expirationDate": "2031-10-06",
      "contractPrice": 2500.00,
      "commercial": false
    },
    "lender": {
      "name": "First National Bank of Florida",
      "address": "789 Bank Street",
      "cityStateZip": "Miami, FL 33103"
    },
    "stateCode": "FL"
  }'
```

**Expected Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "policyNumber": "WEC-2025-72M-001",
  "pdfUrl": "https://localhost:9000/wecover-pdfs/policies/2025/10/WEC-2025-72M-001.pdf?..."
}
```

---

## 2. Create Policy (84-Month Term)

```bash
curl -X POST http://localhost:5173/api/policies \
  -H "Content-Type: application/json" \
  -d '{
    "policyNumber": "WEC-2025-84M-002",
    "productVersion": "WEC-PS-VSC-09-2025",
    "owner": {
      "firstName": "Maria",
      "lastName": "Garcia",
      "address": "789 Oak Avenue",
      "city": "Orlando",
      "state": "FL",
      "zip": "32801",
      "phone": "407-555-0300",
      "email": "maria.garcia@example.com"
    },
    "dealer": {
      "id": "DLR-FL-002",
      "name": "Central Florida Motors",
      "address": "321 Auto Park Drive",
      "city": "Orlando",
      "state": "FL",
      "zip": "32802",
      "phone": "407-555-0400"
    },
    "vehicle": {
      "vin": "5YJ3E1EA5JF123456",
      "year": "2024",
      "make": "Tesla",
      "model": "Model 3",
      "mileage": 2500,
      "salePrice": 42000.00
    },
    "coverage": {
      "termMonths": 84,
      "purchaseDate": "2025-10-06",
      "expirationDate": "2032-10-06",
      "contractPrice": 2800.00,
      "commercial": false
    },
    "stateCode": "FL"
  }'
```

---

## 3. Create Policy (96-Month Commercial)

```bash
curl -X POST http://localhost:5173/api/policies \
  -H "Content-Type: application/json" \
  -d '{
    "policyNumber": "WEC-2025-96M-003",
    "productVersion": "WEC-PS-VSC-09-2025",
    "owner": {
      "firstName": "Robert",
      "lastName": "Williams",
      "address": "555 Construction Way",
      "city": "Tampa",
      "state": "FL",
      "zip": "33601",
      "phone": "813-555-0500",
      "email": "rwilliams@construction.com"
    },
    "dealer": {
      "id": "DLR-FL-003",
      "name": "Commercial Truck Center",
      "address": "999 Industrial Parkway",
      "city": "Tampa",
      "state": "FL",
      "zip": "33602",
      "phone": "813-555-0600",
      "salesRep": "Mike Brown"
    },
    "vehicle": {
      "vin": "1FTFW1EF5DFC12345",
      "year": "2023",
      "make": "Ford",
      "model": "F-150 XLT",
      "mileage": 28000,
      "salePrice": 48500.00
    },
    "coverage": {
      "termMonths": 96,
      "purchaseDate": "2025-10-06",
      "expirationDate": "2033-10-06",
      "contractPrice": 3500.00,
      "commercial": true
    },
    "lender": {
      "name": "Tampa Bay Credit Union",
      "address": "111 Finance Street",
      "cityStateZip": "Tampa, FL 33603"
    },
    "stateCode": "FL"
  }'
```

---

## 4. Create Policy with Customer Signature

```bash
curl -X POST http://localhost:5173/api/policies \
  -H "Content-Type: application/json" \
  -d '{
    "policyNumber": "WEC-2025-SIG-004",
    "productVersion": "WEC-PS-VSC-09-2025",
    "owner": {
      "firstName": "Emily",
      "lastName": "Davis",
      "address": "222 Signature Lane",
      "city": "Jacksonville",
      "state": "FL",
      "zip": "32201",
      "phone": "904-555-0700",
      "email": "emily.davis@example.com"
    },
    "dealer": {
      "id": "DLR-FL-004",
      "name": "Jacksonville Auto Gallery",
      "address": "444 Premium Drive",
      "city": "Jacksonville",
      "state": "FL",
      "zip": "32202",
      "phone": "904-555-0800"
    },
    "vehicle": {
      "vin": "WBAPL5G50ANP12345",
      "year": "2024",
      "make": "BMW",
      "model": "330i",
      "mileage": 5000,
      "salePrice": 52000.00
    },
    "coverage": {
      "termMonths": 72,
      "purchaseDate": "2025-10-06",
      "expirationDate": "2031-10-06",
      "contractPrice": 2900.00,
      "commercial": false
    },
    "customerSignaturePngBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==",
    "stateCode": "FL"
  }'
```

---

## 5. Get Policy by ID

```bash
curl -X GET http://localhost:5173/api/policies/550e8400-e29b-41d4-a716-446655440000
```

**Expected Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "policyNumber": "WEC-2025-72M-001",
  "pdfUrl": "https://minio:9000/wecover-pdfs/policies/2025/10/WEC-2025-72M-001.pdf?..."
}
```

---

## 6. Download PDF Directly (using pre-signed URL)

After creating a policy, use the returned `pdfUrl`:

```bash
# Get the pdfUrl from the response
curl -o policy.pdf "https://minio:9000/wecover-pdfs/policies/2025/10/WEC-2025-72M-001.pdf?X-Amz-Algorithm=..."
```

---

## Testing with Different States

### Texas (TX) Policy
```bash
curl -X POST http://localhost:5173/api/policies \
  -H "Content-Type: application/json" \
  -d '{
    "policyNumber": "WEC-2025-TX-005",
    "productVersion": "WEC-PS-VSC-09-2025",
    "owner": {
      "firstName": "Sarah",
      "lastName": "Johnson",
      "address": "100 Lone Star Drive",
      "city": "Austin",
      "state": "TX",
      "zip": "78701",
      "phone": "512-555-1000",
      "email": "sarah.johnson@example.com"
    },
    "dealer": {
      "id": "DLR-TX-001",
      "name": "Texas Auto World",
      "address": "200 Highway 35",
      "city": "Austin",
      "state": "TX",
      "zip": "78702",
      "phone": "512-555-2000"
    },
    "vehicle": {
      "vin": "1G1ZD5ST5JF123456",
      "year": "2023",
      "make": "Chevrolet",
      "model": "Malibu LT",
      "mileage": 12000,
      "salePrice": 26000.00
    },
    "coverage": {
      "termMonths": 72,
      "purchaseDate": "2025-10-06",
      "expirationDate": "2031-10-06",
      "contractPrice": 2400.00,
      "commercial": false
    },
    "stateCode": "TX"
  }'
```

---

## Error Handling Examples

### Missing Required Fields
```bash
curl -X POST http://localhost:5173/api/policies \
  -H "Content-Type: application/json" \
  -d '{
    "policyNumber": "WEC-2025-ERROR-001"
  }'
```

**Expected Response (400):**
```json
{
  "error": "Validation failed",
  "message": "Required fields missing"
}
```

### Invalid Term Length
```bash
curl -X POST http://localhost:5173/api/policies \
  -H "Content-Type: application/json" \
  -d '{
    "policyNumber": "WEC-2025-ERROR-002",
    "coverage": {
      "termMonths": 60
    }
  }'
```

---

## Pretty Print JSON Response

Add `-s` (silent) and pipe to `jq` for formatted output:

```bash
curl -s -X POST http://localhost:5173/api/policies \
  -H "Content-Type: application/json" \
  -d @policy-payload.json | jq '.'
```

---

## Save Response to File

```bash
curl -X POST http://localhost:5173/api/policies \
  -H "Content-Type: application/json" \
  -d @policy-payload.json \
  -o response.json
```

---

## Batch Testing Script

Create a file `test-policies.sh`:

```bash
#!/bin/bash

echo "Testing Policy Creation..."

# Test 1: 72-month
echo "\n1. Creating 72-month policy..."
curl -s -X POST http://localhost:5173/api/policies \
  -H "Content-Type: application/json" \
  -d @examples/policy-72m.json | jq '.'

# Test 2: 84-month
echo "\n2. Creating 84-month policy..."
curl -s -X POST http://localhost:5173/api/policies \
  -H "Content-Type: application/json" \
  -d @examples/policy-84m.json | jq '.'

# Test 3: 96-month commercial
echo "\n3. Creating 96-month commercial policy..."
curl -s -X POST http://localhost:5173/api/policies \
  -H "Content-Type: application/json" \
  -d @examples/policy-96m-commercial.json | jq '.'

echo "\n✅ All tests completed!"
```

Make it executable:
```bash
chmod +x test-policies.sh
./test-policies.sh
```

---

## Notes

1. **Base64 Signature**: For `customerSignaturePngBase64`, use a real PNG signature encoded in base64
2. **Date Format**: Use ISO format `YYYY-MM-DD` for all dates
3. **Term Months**: Only `72`, `84`, or `96` are valid
4. **State Codes**: Use 2-letter state codes (e.g., `FL`, `TX`, `CA`)
5. **Dry Run**: Add `?dryRun=true` to preview without saving to database

---

## Quick Test Command

Minimal policy for quick testing:

```bash
curl -X POST http://localhost:5173/api/policies?dryRun=true \
  -H "Content-Type: application/json" \
  -d '{
    "policyNumber": "TEST-001",
    "productVersion": "WEC-PS-VSC-09-2025",
    "owner": {
      "firstName": "Test",
      "lastName": "User",
      "address": "123 Test St",
      "city": "Miami",
      "state": "FL",
      "zip": "33101",
      "phone": "555-0100",
      "email": "test@example.com"
    },
    "dealer": {
      "id": "DLR-001",
      "name": "Test Dealer",
      "address": "456 Dealer St",
      "city": "Miami",
      "state": "FL",
      "zip": "33102",
      "phone": "555-0200"
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
      "termMonths": 72,
      "purchaseDate": "2025-10-06",
      "expirationDate": "2031-10-06",
      "contractPrice": 2000,
      "commercial": false
    },
    "stateCode": "FL"
  }'
```

