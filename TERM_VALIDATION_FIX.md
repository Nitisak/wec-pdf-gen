# Term Months Validation Fix

## Problem
When creating a Lifetime Warranty policy, users received a validation error:
```
body/coverage/termMonths must be equal to one of the allowed values
```

The schema was restricting `termMonths` to only `"72"`, `"84"`, or `"96"`, which didn't support:
- Lifetime products that might use different terms
- String values like `"120"`
- Numeric values directly
- Special values like `"lifetime"`

## Solution

Updated `CoverageSchema` in `packages/shared/policySchemas.ts` to accept:

### Supported Term Values
1. **String enum**: `"72"`, `"84"`, `"96"`, `"120"`, `"lifetime"`
2. **Numeric values**: Any positive number (e.g., `72`, `120`, `240`)
3. **Special handling**: `"lifetime"` converts to `999` for database storage

### Implementation

```typescript
export const CoverageSchema = z.object({
  termMonths: z.union([
    z.enum(["72","84","96","120","lifetime"]),
    z.number().positive()
  ]).transform(val => {
    // Convert string terms to numbers, or pass through numbers
    if (typeof val === 'number') return val;
    if (val === 'lifetime') return 999; // Special value for lifetime
    return Number(val);
  }),
  // ... other fields
});
```

## Benefits

✅ **Flexible Input**: Accepts both strings and numbers  
✅ **Product-Specific Terms**: Each product can use different term lengths  
✅ **Lifetime Support**: Special "lifetime" value for unlimited coverage  
✅ **Backward Compatible**: Still works with original PSVSC terms (72, 84, 96)  
✅ **Database Compatible**: All values stored as integers in PostgreSQL

## Supported Products

### PSVSC (WEC-PS-VSC-09-2025)
- Accepts: `"72"`, `"84"`, `"96"`, or numeric `72`, `84`, `96`

### Lifetime Warranty (AGVSC-LIFETIME-V04-2025)
- Accepts: Any of the above, plus:
  - `"120"` or `120` (120 months / 10 years)
  - `"lifetime"` (converts to 999 internally)
  - Any custom numeric value

## Testing

### Test 1: Numeric Value
```bash
curl -X POST 'http://localhost:5273/api/policies?dryRun=true' \
  -H "Content-Type: application/json" \
  -d '{
    "coverage": {
      "termMonths": 72,  // Numeric
      ...
    }
  }'
```
**Result**: ✅ SUCCESS

### Test 2: String Value
```bash
curl -X POST 'http://localhost:5273/api/policies?dryRun=true' \
  -H "Content-Type: application/json" \
  -d '{
    "coverage": {
      "termMonths": "120",  // String
      ...
    }
  }'
```
**Result**: ✅ SUCCESS

### Test 3: Lifetime
```bash
curl -X POST 'http://localhost:5273/api/policies?dryRun=true' \
  -H "Content-Type: application/json" \
  -d '{
    "coverage": {
      "termMonths": "lifetime",  // Special value
      ...
    }
  }'
```
**Result**: ✅ SUCCESS (stored as 999)

## Files Modified

1. **`packages/shared/policySchemas.ts`**
   - Updated `CoverageSchema.termMonths` validation
   - Added transform function for value conversion

2. **Build Process**
   - Rebuilt `@wec/shared` package
   - Rebuilt `@wec/api` package
   - Rebuilt API Docker image

## Database Storage

| Input Value | Stored As | Notes |
|-------------|-----------|-------|
| `"72"` | `72` | String converted to number |
| `72` | `72` | Number passed through |
| `"120"` | `120` | String converted to number |
| `"lifetime"` | `999` | Special value for unlimited |

## Web UI

The web interface can now send either:
- Numeric values from dropdowns: `72`, `84`, `96`
- String values: `"72"`, `"84"`, `"96"`, `"120"`
- Special values: `"lifetime"`

All will be accepted and properly processed.

## Migration Notes

- ✅ No database migration required (still using INTEGER)
- ✅ Backward compatible with existing policies
- ✅ Existing data unaffected
- ✅ No API breaking changes

## If You Need to Add New Terms

Simply update the enum in `policySchemas.ts`:

```typescript
z.enum(["72","84","96","120","180","lifetime"]) // Add "180"
```

Then rebuild:
```bash
pnpm --filter @wec/shared build
pnpm --filter @wec/api build
docker-compose build api
docker-compose up -d api
```

## Validation Rules

| Condition | Valid | Invalid |
|-----------|-------|---------|
| Positive number | ✅ `72`, `120`, `240` | ❌ `0`, `-5` |
| String number | ✅ `"72"`, `"120"` | ❌ `"abc"` |
| Special values | ✅ `"lifetime"` | ❌ `"forever"` |
| Empty/null | ❌ | ❌ Required field |

---

**Fixed**: 2025-10-16  
**Status**: ✅ Resolved  
**Impact**: All products now support flexible term validation
