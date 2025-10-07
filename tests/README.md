# Tests

Centralized test directory for the WeCoverUSA Policy PDF Generator.

## 📁 Structure

```
tests/
├── api/              # API and backend tests
│   └── fillAcroForm.e2e.test.ts
└── web/              # Frontend E2E tests
    └── policy-form.spec.ts
```

## 🧪 Running Tests

### All Tests

```bash
# Run all tests
pnpm test

# Run API tests only
pnpm test:api
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
pnpm test:e2e

# Run with UI mode
pnpm test:e2e:ui

# Run in headed mode (visible browser)
pnpm test:e2e:headed

# Debug mode
pnpm test:e2e:debug
```

### From Specific Workspaces

```bash
# Run API tests from api workspace
cd apps/api
pnpm test:e2e
```

## 📝 Test Types

### API Tests (`tests/api/`)

**Unit & Integration Tests**
- Test individual modules and functions
- Test PDF generation pipeline
- Test AcroForm field filling
- Test checkbox logic
- Test signature overlay

**Example**:
```bash
# Run fillAcroForm E2E test
pnpm test:api
```

### Web Tests (`tests/web/`)

**E2E Tests (Playwright)**
- Test complete user workflows
- Test form submission
- Test PDF preview
- Test validation

**Example**:
```bash
# Run web E2E tests
pnpm test:e2e
```

## 🎯 Test Coverage

### API Tests Cover:
- ✅ PDF form filling with all field types
- ✅ Checkbox state (72m/84m/96m terms)
- ✅ Commercial flag checkbox
- ✅ Signature overlay on multiple pages
- ✅ Field mapping correctness
- ✅ PDF structure validation

### Web Tests Cover:
- ✅ Policy form rendering
- ✅ Form validation
- ✅ API integration
- ✅ PDF preview functionality

## 📊 Test Output

Test outputs are saved to:
- **API tests**: `test-output/*.pdf`
- **E2E tests**: `test-output/e2e/`
- **Playwright reports**: `playwright-report/`
- **Test results**: `test-results/`

All test output directories are git-ignored.

## 🔧 Configuration

### Vitest (API Tests)

Configuration is in the workspace package.json files:
- `apps/api/package.json` - API test configuration

### Playwright (E2E Tests)

Configuration file: [`playwright.config.ts`](../playwright.config.ts)

Key settings:
- Test directory: `./tests/web`
- Output directory: `./test-output/e2e`
- Base URL: `http://localhost`
- Browsers: Chromium, Firefox, WebKit

## 📖 Writing Tests

### API Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { fillAcroForm } from '../../apps/api/src/modules/policies/filler/fillAcroForm.js';

describe('My Feature', () => {
  it('should do something', async () => {
    const result = await fillAcroForm(testData);
    expect(result).toBeDefined();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should submit policy form', async ({ page }) => {
  await page.goto('/policies/new');
  await page.fill('#owner-firstName', 'John');
  await page.click('button[type="submit"]');
  await expect(page.locator('.pdf-preview')).toBeVisible();
});
```

## 🐛 Debugging Tests

### API Tests

```bash
# Run with verbose output
pnpm test:api --reporter=verbose

# Run specific test file
pnpm vitest tests/api/fillAcroForm.e2e.test.ts
```

### E2E Tests

```bash
# Debug mode (opens inspector)
pnpm test:e2e:debug

# Run with trace
pnpm test:e2e --trace on

# Generate trace viewer
npx playwright show-trace test-results/*/trace.zip
```

## 📚 Related Documentation

- [Testing Guide](../docs/TESTING.md) - Comprehensive testing guide
- [E2E Testing](../docs/E2E_TESTING.md) - E2E test setup and examples
- [E2E Test Summary](../docs/E2E_TEST_SUMMARY.md) - Test results and coverage

---

**Last Updated**: October 6, 2025

