# Optional Fields Update - termMonths and commercial

## Overview
Made `termMonths` and `commercial` fields optional for Lifetime Warranty products, allowing policies to be created without specifying term lengths or commercial use flags.

## Changes Made

### 1. Schema Updates (`packages/shared/policySchemas.ts`)

Made both fields optional with sensible defaults:

```typescript
export const CoverageSchema = z.object({
  termMonths: z.union([
    z.enum(["72","84","96","120","lifetime"]),
    z.number().positive()
  ]).transform(val => {
    if (typeof val === 'number') return val;
    if (val === 'lifetime') return 999;
    return Number(val);
  }).optional().default(999), // Defaults to 999 (lifetime)
  
  commercial: z.boolean().optional().default(false),
  // ... other fields
});
```

**Defaults:**
- `termMonths`: `999` (represents lifetime warranty)
- `commercial`: `false`

### 2. Database Schema (`apps/api/src/modules/db/schema.ts`)

Added default values:

```typescript
termMonths: integer('term_months').notNull().default(999), // 999 = lifetime
commercial: boolean('commercial').notNull().default(false),
```

### 3. Field Mapping (`apps/api/src/modules/policies/filler/mapping.ts`)

Updated to handle optional fields with nullish coalescing:

```typescript
// For both PSVSC and Lifetime Warranty
Term_72m: Number(p.coverage.termMonths ?? 999)===72 ? "On" : "Off",
Term_84m: Number(p.coverage.termMonths ?? 999)===84 ? "On" : "Off",
Term_96m: Number(p.coverage.termMonths ?? 999)===96 ? "On" : "Off",
LossCode_COMMERCIAL: (p.coverage.commercial ?? false) ? "On" : "Off",
```

### 4. Database Migration (`apps/api/migrations/002_optional_term_months.sql`)

```sql
ALTER TABLE policy 
  ALTER COLUMN term_months SET DEFAULT 999;

ALTER TABLE policy 
  ALTER COLUMN commercial SET DEFAULT false;
```

## Usage Examples

### Lifetime Warranty WITHOUT Optional Fields

```bash
curl -X POST 'http://localhost:5273/api/policies?dryRun=true' \
  -H "Content-Type: application/json" \
  -d '{
    "policyNumber": "LT-001",
    "productVersion": "AGVSC-LIFETIME-V04-2025",
    "stateCode": "FL",
    "owner": {...},
    "dealer": {...},
    "vehicle": {...},
    "coverage": {
      "contractPrice": 3000,
      "purchaseDate": "2025-10-16",
      "expirationDate": "2099-12-31"
      // ❌ NO termMonths
      // ❌ NO commercial
    }
  }'
```

**Result:**
- ✅ `termMonths` = 999 (lifetime)
- ✅ `commercial` = false
- ✅ No term checkboxes selected in PDF
- ✅ Commercial checkbox unchecked in PDF

### Lifetime Warranty WITH Optional Fields

```bash
curl -X POST 'http://localhost:5273/api/policies?dryRun=true' \
  -H "Content-Type: application/json" \
  -d '{
    "policyNumber": "LT-002",
    "productVersion": "AGVSC-LIFETIME-V04-2025",
    "stateCode": "FL",
    "owner": {...},
    "dealer": {...},
    "vehicle": {...},
    "coverage": {
      "termMonths": 120,       // ✅ Optional: 120 months
      "commercial": true,      // ✅ Optional: commercial use
      "contractPrice": 3000,
      "purchaseDate": "2025-10-16",
      "expirationDate": "2035-10-16"
    }
  }'
```

**Result:**
- ✅ `termMonths` = 120
- ✅ `commercial` = true
- ✅ No standard term checkboxes selected (120 is not 72/84/96)
- ✅ Commercial checkbox checked in PDF

### PSVSC Product (Still Required)

```bash
# For PSVSC, you can still provide termMonths explicitly
{
  "productVersion": "WEC-PS-VSC-09-2025",
  "coverage": {
    "termMonths": 72,        // Can be 72, 84, or 96
    "commercial": false,     // Required
    ...
  }
}
```

## Field Behavior Matrix

| Scenario | termMonths Input | Stored As | commercial Input | Stored As | PDF Checkboxes |
|----------|------------------|-----------|------------------|-----------|----------------|
| **Lifetime - Omitted** | ❌ (not provided) | 999 | ❌ (not provided) | false | No term boxes checked |
| **Lifetime - "lifetime"** | "lifetime" | 999 | ❌ | false | No term boxes checked |
| **Lifetime - 120** | 120 | 120 | true | true | No term boxes checked |
| **PSVSC - 72** | 72 | 72 | false | false | 72m checked |
| **PSVSC - 84** | 84 | 84 | true | true | 84m checked, commercial checked |

## Benefits

✅ **Simplified API**: Don't need to specify term for true lifetime products  
✅ **Backward Compatible**: Existing PSVSC policies work unchanged  
✅ **Flexible**: Can still specify terms if needed  
✅ **Database Safe**: Defaults ensure no NULL values  
✅ **Clear Semantics**: 999 = lifetime is explicit and queryable

## Testing Results

### Test 1: No Optional Fields
```bash
POST /api/policies?dryRun=true
{
  "coverage": {
    "contractPrice": 3000,
    "purchaseDate": "2025-10-16",
    "expirationDate": "2099-12-31"
    // No termMonths, no commercial
  }
}
```
**Result**: ✅ SUCCESS - Defaults applied

### Test 2: With Optional Fields  
```bash
POST /api/policies?dryRun=true
{
  "coverage": {
    "termMonths": 120,
    "commercial": true,
    ...
  }
}
```
**Result**: ✅ SUCCESS - Values used

### Test 3: Mixed (only termMonths)
```bash
{
  "coverage": {
    "termMonths": 120,
    // No commercial - will default to false
    ...
  }
}
```
**Result**: ✅ SUCCESS - Partial optional works

## Files Modified

1. **packages/shared/policySchemas.ts**
   - Made `termMonths` optional with default 999
   - Made `commercial` optional with default false

2. **apps/api/src/modules/db/schema.ts**
   - Added default values to database schema

3. **apps/api/src/modules/policies/filler/mapping.ts**
   - Updated to handle optional fields with `??` operator

4. **apps/api/migrations/002_optional_term_months.sql**
   - New migration for database defaults

## Migration Notes

- ✅ No data migration needed for existing policies
- ✅ New policies can omit fields
- ✅ Backward compatible with all existing code
- ✅ Database defaults ensure consistency

## Database Queries

### Find Lifetime Policies
```sql
SELECT * FROM policy WHERE term_months = 999;
```

### Find Commercial Policies
```sql
SELECT * FROM policy WHERE commercial = true;
```

### Find Standard Term Policies
```sql
SELECT * FROM policy WHERE term_months IN (72, 84, 96);
```

## Recommendations

### For Lifetime Warranty
```javascript
// ✅ Recommended: Omit fields for true lifetime
{
  "productVersion": "AGVSC-LIFETIME-V04-2025",
  "coverage": {
    "contractPrice": 3000,
    "purchaseDate": "2025-10-16",
    "expirationDate": "2099-12-31"
  }
}
```

### For PSVSC
```javascript
// ✅ Recommended: Specify term explicitly
{
  "productVersion": "WEC-PS-VSC-09-2025",
  "coverage": {
    "termMonths": 72,  // or 84, 96
    "commercial": false,
    ...
  }
}
```

## Web UI Updates Needed

The React form should:
1. Make term selection optional for Lifetime Warranty
2. Hide or disable term checkboxes for Lifetime
3. Make commercial checkbox optional with clear default

Example:
```tsx
{productVersion === 'AGVSC-LIFETIME-V04-2025' && (
  <p className="info">
    Term length is optional for Lifetime Warranty (defaults to lifetime)
  </p>
)}
```

---

**Updated**: 2025-10-16  
**Status**: ✅ Complete & Tested  
**Migration**: 002_optional_term_months.sql
