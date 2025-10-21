# Quote PDF Generator - Quick Start

## 🚀 Generate Your First Quote

### 1. Create a Quote

```bash
curl -X POST 'http://localhost:5273/api/quotes' \
  -H 'Content-Type: application/json' \
  -d '{
    "quoteNumber": "Q2025-001",
    "stateCode": "FL",
    "productVersion": "WEC-PS-VSC-09-2025",
    "owner": {
      "firstName": "John",
      "lastName": "Doe",
      "address": "123 Main St",
      "city": "Miami",
      "state": "FL",
      "zip": "33101",
      "phone": "3055550100",
      "email": "john@example.com"
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
      "name": "Premier Auto",
      "address": "456 Dealer Blvd",
      "city": "Miami",
      "state": "FL",
      "zip": "33102",
      "phone": "3055550200",
      "salesRep": "Jane Smith"
    },
    "coverage": {
      "termMonths": 72,
      "coverageLevel": "Premium"
    },
    "pricing": {
      "basePrice": 2500.00,
      "coverageOptions": [
        {"name": "Roadside Assistance", "price": 150.00}
      ],
      "fees": [
        {"name": "Admin Fee", "amount": 50.00}
      ],
      "taxes": 187.50,
      "subtotal": 2887.50,
      "total": 2887.50
    },
    "validUntil": "2025-11-20"
  }'
```

### 2. View the PDF

The response includes a `pdfUrl`:
```json
{
  "id": "...",
  "quoteNumber": "Q2025-001",
  "pdfUrl": "http://localhost:9000/wecover-pdfs/quotes/2025/10/Q2025-001.pdf",
  "total": "2887.50"
}
```

**Open in browser**: `http://localhost:9000/wecover-pdfs/quotes/2025/10/Q2025-001.pdf`

---

## 📋 Pricing Breakdown Examples

### Simple Quote (Base Price Only)

```json
"pricing": {
  "basePrice": 2500.00,
  "subtotal": 2500.00,
  "total": 2500.00
}
```

### With Options and Fees

```json
"pricing": {
  "basePrice": 2500.00,
  "coverageOptions": [
    {"name": "Roadside Assistance", "price": 150.00},
    {"name": "Rental Car", "price": 200.00}
  ],
  "fees": [
    {"name": "Admin Fee", "amount": 50.00},
    {"name": "Processing", "amount": 25.00}
  ],
  "taxes": 187.50,
  "dealerMarkup": 300.00,
  "subtotal": 3112.50,
  "total": 3412.50
}
```

---

## 🔧 Common Operations

### Retrieve Quote

```bash
curl http://localhost:5273/api/quotes/Q2025-001 | jq .
```

### List All Quotes

```bash
curl http://localhost:5273/api/quotes | jq .
```

### Filter by State

```bash
curl 'http://localhost:5273/api/quotes?stateCode=FL' | jq .
```

---

## ⚠️ Required Fields

Minimum required:
- `quoteNumber` - Unique ID
- `stateCode` - 2-letter state
- `productVersion` - Product ID
- `owner` - Customer info (all fields)
- `vehicle` - Vehicle info (VIN, year, make, model, mileage)
- `dealer` - Dealer info (id, name)
- `pricing` - basePrice, subtotal, total
- `validUntil` - Expiration date

---

## 💡 Tips

1. **Quote Numbers**: Use a systematic format (e.g., `Q2025-001`, `Q2025-FL-001`)
2. **Valid Until**: Typically 30-60 days from issue date
3. **Pricing**: Always include `basePrice`, `subtotal`, and `total`
4. **Coverage Options**: Use clear names (e.g., "24/7 Roadside Assistance")
5. **Dealer Markup**: Optional but recommended for transparency

---

## 📄 Full Documentation

See [QUOTE_PDF_GENERATOR.md](./QUOTE_PDF_GENERATOR.md) for:
- Complete API reference
- Schema documentation
- Database details
- PDF layout guide
- Advanced examples

---

**Need Help?**

Check logs: `docker logs wec-api --tail 50`

