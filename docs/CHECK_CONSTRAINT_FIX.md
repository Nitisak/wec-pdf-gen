# Database CHECK Constraint Fix

## Problem
When trying to save a Lifetime Warranty policy with `termMonths=999`, the database rejected it with:
```
new row for relation "policy" violates check constraint "policy_term_months_check"
```

The initial schema had a restrictive CHECK constraint:
```sql
CHECK (term_months IN (72,84,96))
```

This only allowed PSVSC term values and prevented:
- Lifetime warranties (999)
- Custom term lengths (120, 180, etc.)

## Root Cause
The `001_init.sql` migration created the `policy` table with a CHECK constraint that was too restrictive for multi-product support.

## Solution

### 1. Updated Migration (`002_optional_term_months.sql`)

```sql
-- Drop the restrictive CHECK constraint
ALTER TABLE policy 
  DROP CONSTRAINT IF EXISTS policy_term_months_check;

-- Add a flexible CHECK constraint (any positive integer)
ALTER TABLE policy 
  ADD CONSTRAINT policy_term_months_check CHECK (term_months > 0);

-- Set default value for optional field
ALTER TABLE policy 
  ALTER COLUMN term_months SET DEFAULT 999;

ALTER TABLE policy 
  ALTER COLUMN commercial SET DEFAULT false;
```

### 2. Updated Migration Runner (`run.js`)

Added the new migration to the execution list:

```javascript
const migrationFiles = [
  '001_init.sql',
  '002_optional_term_months.sql'  // NEW
];
```

## Changes Summary

| Aspect | Before | After |
|--------|--------|-------|
| **CHECK Constraint** | `IN (72,84,96)` | `> 0` (any positive) |
| **Allowed Values** | Only 72, 84, 96 | Any positive integer |
| **Lifetime Support** | ❌ Blocked | ✅ Allowed (999) |
| **Custom Terms** | ❌ Blocked | ✅ Allowed (120, 180, etc.) |
| **Default Value** | None | 999 (lifetime) |

## Testing Results

### ✅ Test 1: Lifetime Without termMonths
```json
{
  "coverage": {
    // No termMonths specified
  }
}
```
**Result**: SUCCESS - Saved with termMonths=999

### ✅ Test 2: Lifetime With termMonths=120
```json
{
  "coverage": {
    "termMonths": 120
  }
}
```
**Result**: SUCCESS - Saved with termMonths=120

### ✅ Test 3: Lifetime With commercial=true
```json
{
  "coverage": {
    "commercial": true
    // No termMonths - defaults to 999
  }
}
```
**Result**: SUCCESS - Saved with termMonths=999, commercial=true

### ✅ Test 4: PSVSC With termMonths=72
```json
{
  "coverage": {
    "termMonths": 72,
    "commercial": false
  }
}
```
**Result**: SUCCESS - Saved with termMonths=72

## Migration Execution

### Logs Confirm Success
```
Running migration: 001_init.sql
✓ Migration 001_init.sql completed
Running migration: 002_optional_term_months.sql
✓ Migration 002_optional_term_months.sql completed
All migrations completed successfully
```

### Database State After Migration
- ✅ Old CHECK constraint removed
- ✅ New flexible CHECK constraint added
- ✅ Default values set
- ✅ Existing data preserved

## Files Modified

1. **`apps/api/migrations/002_optional_term_months.sql`** (NEW)
   - Drops old CHECK constraint
   - Adds new flexible CHECK constraint
   - Sets default values

2. **`apps/api/migrations/run.js`**
   - Added `002_optional_term_months.sql` to migration list

3. **`packages/shared/policySchemas.ts`**
   - Made fields optional with defaults (already done)

4. **`apps/api/src/modules/db/schema.ts`**
   - Added default values (already done)

5. **`apps/api/src/modules/policies/filler/mapping.ts`**
   - Added nullish coalescing for optional fields (already done)

## Database Verification

### Query Current Constraint
```sql
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'policy'::regclass 
  AND conname = 'policy_term_months_check';
```

**Result**:
```
conname                     | pg_get_constraintdef
----------------------------+----------------------
policy_term_months_check    | CHECK ((term_months > 0))
```

### Query Policies by Term
```sql
-- Lifetime warranties
SELECT policy_number, term_months 
FROM policy 
WHERE term_months = 999;

-- Standard terms
SELECT policy_number, term_months 
FROM policy 
WHERE term_months IN (72, 84, 96);

-- Custom terms
SELECT policy_number, term_months 
FROM policy 
WHERE term_months NOT IN (72, 84, 96, 999);
```

## Benefits

✅ **Flexible**: Supports any positive term length  
✅ **Future-Proof**: Can add new products without schema changes  
✅ **Backward Compatible**: Existing PSVSC policies unaffected  
✅ **Data Integrity**: Still validates (must be positive)  
✅ **Clean Migration**: Runs automatically on container restart

## Deployment Notes

### For New Environments
1. Deploy code with updated migrations
2. Start containers
3. Migrations run automatically
4. Ready to use

### For Existing Environments
1. Backup database (recommended)
2. Deploy updated code
3. Restart API container
4. Migration runs automatically
5. Verify with test policies

### Rollback (if needed)
```sql
ALTER TABLE policy 
  DROP CONSTRAINT IF EXISTS policy_term_months_check;

ALTER TABLE policy 
  ADD CONSTRAINT policy_term_months_check 
  CHECK (term_months IN (72,84,96));
```

## Related Issues Fixed

1. ❌ **Original**: `termMonths=999` validation error → ✅ **Fixed**
2. ❌ **Original**: Can't save Lifetime policies → ✅ **Fixed**
3. ❌ **Original**: CHECK constraint too restrictive → ✅ **Fixed**
4. ✅ **Bonus**: Now supports any custom term length

## Documentation Updated

- `OPTIONAL_FIELDS_UPDATE.md` - Schema changes
- `TERM_VALIDATION_FIX.md` - Validation updates
- `CHECK_CONSTRAINT_FIX.md` - This document

---

**Fixed**: 2025-10-16  
**Status**: ✅ Complete & Deployed  
**Migration**: 002_optional_term_months.sql  
**All Tests**: ✅ Passing
