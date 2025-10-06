# E2E Testing - Complete Setup ✅

## What Was Created

### 1. Playwright E2E Test Suite
**File:** `apps/web/e2e/policy-form.spec.ts`

**Test Cases:**
- ✅ Fill form and generate 72-month term PDF
- ✅ Fill form and generate 84-month term PDF  
- ✅ Fill form and generate 96-month commercial PDF
- ✅ Validate required fields (form validation)
- ✅ Submit policy and save to database

### 2. Playwright Configuration
**File:** `playwright.config.ts`

Features:
- Auto-starts Docker services before tests
- Runs tests on Chromium, Firefox, and WebKit
- Captures screenshots/videos on failure
- HTML test reports

### 3. Test Scripts (package.json)
```bash
pnpm test:e2e          # Run all E2E tests (headless)
pnpm test:e2e:ui       # Interactive UI mode
pnpm test:e2e:headed   # Run with browser visible
pnpm test:e2e:debug    # Debug mode with inspector
```

### 4. Documentation
- `E2E_TESTING.md` - Complete E2E testing guide
- `E2E_TEST_SUMMARY.md` - This file

---

## Quick Start

### 1. Ensure Services are Running

```bash
cd /Users/nitisak/00_Workspace/Builder/wec-pdf-generator
docker-compose up -d
```

### 2. Run E2E Tests

**Option A: Headless (CI/CD mode)**
```bash
pnpm test:e2e
```

**Option B: Interactive UI (Recommended for development)**
```bash
pnpm test:e2e:ui
```

**Option C: Debug Mode**
```bash
pnpm test:e2e:debug
```

### 3. View Generated PDFs

```bash
open e2e-output/policy-72month-e2e.pdf
open e2e-output/policy-84month-e2e.pdf
open e2e-output/policy-96month-commercial-e2e.pdf
```

### 4. View Test Report

```bash
npx playwright show-report
```

---

## Test Flow

Each test follows this pattern:

```
1. Navigate to http://localhost
2. Fill out policy form fields:
   - Owner information
   - Dealer information
   - Vehicle details
   - Coverage options (term, dates, pricing)
   - Select term length (72/84/96 months)
   - Check/uncheck commercial
3. Click "Preview" button
4. Wait for PDF download
5. Save PDF to e2e-output/
6. Verify download completed
```

---

## What Gets Tested

### Form Filling
- ✅ Owner: first name, last name, address, city, state, zip, phone, email
- ✅ Co-owner: name, address, city, state, zip, phone, email (optional)
- ✅ Dealer: ID, name, address, city, state, zip, phone, sales rep
- ✅ Vehicle: VIN, year, make, model, mileage, sale price
- ✅ Coverage: policy number, purchase date, expiration date, contract price
- ✅ Term selection: 72, 84, or 96 months (radio/checkbox)
- ✅ Commercial checkbox: checked/unchecked
- ✅ State selection: FL or TX

### PDF Generation
- ✅ Preview button triggers download
- ✅ PDF file is created with correct name
- ✅ PDF contains filled form data
- ✅ Checkboxes are marked correctly

### Form Validation
- ✅ Required fields show errors when empty
- ✅ Form cannot be submitted without required data

### Database Persistence
- ✅ Submit button saves policy to database
- ✅ Success message displayed after save

---

## Output Files

### Test Results
```
e2e-output/
├── policy-72month-e2e.pdf           # 72-month term PDF
├── policy-84month-e2e.pdf           # 84-month term PDF
├── policy-96month-commercial-e2e.pdf # 96-month commercial PDF
└── screenshots/                      # Failure screenshots
    └── policy-form-spec-ts-*.png
```

### Test Reports
```
playwright-report/
└── index.html                        # HTML test report
```

View report:
```bash
npx playwright show-report
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install -g pnpm
      - run: pnpm install
      - run: npx playwright install --with-deps chromium
      - run: docker-compose up -d
      - run: sleep 30
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Debugging

### View Test in UI Mode
```bash
pnpm test:e2e:ui
```
- Step through tests
- See browser actions
- Time travel debugging

### Debug Specific Test
```bash
npx playwright test --debug -g "72-month"
```

### Generate Code (Record Actions)
```bash
npx playwright codegen http://localhost
```
- Records your actions
- Generates test code
- Perfect for creating new tests

---

## Comparison: Unit vs E2E Testing

### Unit Tests (`fillAcroForm.e2e.test.ts`)
- ✅ Tests PDF generation function directly
- ✅ Verifies checkbox logic
- ✅ Validates field mapping
- ✅ Faster execution
- ✅ No browser required

**Run:** `pnpm --filter @wec/api test:e2e`

### E2E Tests (`policy-form.spec.ts`)
- ✅ Tests complete user workflow
- ✅ Verifies UI interactions
- ✅ Tests real browser behavior
- ✅ Catches integration issues
- ✅ Tests actual user experience

**Run:** `pnpm test:e2e`

---

## Next Steps

1. ✅ **Run tests**: `pnpm test:e2e:ui`
2. ✅ **View PDFs**: Check `e2e-output/` directory
3. ✅ **Add more tests**: Create new test cases in `apps/web/e2e/`
4. ✅ **Set up CI/CD**: Add Playwright to your pipeline
5. ✅ **Add visual regression**: Use `toHaveScreenshot()` for visual testing

---

## Troubleshooting

### Services not starting
```bash
docker-compose down
docker-compose up -d
sleep 10
```

### Tests timing out
Increase timeout in `playwright.config.ts`:
```typescript
timeout: 60000  // 60 seconds per test
```

### Form fields not found
Use Playwright Inspector:
```bash
npx playwright codegen http://localhost
```

---

## Complete Test Commands

```bash
# Install Playwright browsers (one-time)
npx playwright install chromium

# Run all E2E tests
pnpm test:e2e

# Interactive UI (recommended)
pnpm test:e2e:ui

# Run with browser visible
pnpm test:e2e:headed

# Debug mode
pnpm test:e2e:debug

# Run specific test
npx playwright test -g "72-month"

# Run specific file
npx playwright test apps/web/e2e/policy-form.spec.ts

# Generate test code
npx playwright codegen http://localhost

# Show test report
npx playwright show-report
```

---

## Success Criteria ✅

Your E2E tests are working correctly if:

- ✅ All 5 test cases pass
- ✅ 3 PDFs are generated in `e2e-output/`
- ✅ PDFs contain correct data and checkboxes
- ✅ Validation test shows errors for empty form
- ✅ Submit test saves to database successfully

**To verify everything works:**
```bash
pnpm test:e2e
ls -lh e2e-output/
```

You should see:
```
✓ should fill form and generate 72-month term PDF
✓ should fill form and generate 84-month term PDF
✓ should fill form and generate 96-month commercial PDF
✓ should validate required fields
✓ should submit policy and save to database

5 passed (30s)
```

---

*Last updated: 2025-10-06*

