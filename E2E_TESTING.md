# End-to-End Testing Guide

## Overview

E2E tests use **Playwright** to automate browser interactions, filling out the policy form and generating PDFs just like a real user would.

## Quick Start

### 1. Install Playwright

```bash
cd /Users/nitisak/00_Workspace/Builder/wec-pdf-generator
pnpm install
npx playwright install
```

### 2. Ensure Services are Running

```bash
docker-compose up -d
```

Wait for all services to be healthy:
- ✅ PostgreSQL (port 5432)
- ✅ MinIO (ports 9000-9001)
- ✅ API (port 5173)
- ✅ Web (port 80)

### 3. Run E2E Tests

```bash
# Run all E2E tests (headless)
pnpm test:e2e

# Run with UI (interactive mode)
pnpm test:e2e:ui

# Run with browser visible
pnpm test:e2e:headed

# Debug mode (step through)
pnpm test:e2e:debug
```

---

## Test Cases

### Test 1: 72-Month Term Policy
- Fills owner, dealer, vehicle information
- Selects 72-month term checkbox
- Unchecks commercial checkbox
- Clicks "Preview" button
- Downloads PDF to `e2e-output/policy-72month-e2e.pdf`

### Test 2: 84-Month Term Policy
- Fills form with different data
- Selects 84-month term
- Downloads PDF to `e2e-output/policy-84month-e2e.pdf`

### Test 3: 96-Month Commercial Policy
- Fills form for commercial vehicle
- Selects 96-month term
- Checks commercial checkbox
- Downloads PDF to `e2e-output/policy-96month-commercial-e2e.pdf`

### Test 4: Form Validation
- Attempts to submit empty form
- Verifies validation errors appear

### Test 5: Policy Submission
- Fills form completely
- Clicks "Submit" button (not Preview)
- Verifies policy is saved to database
- Checks for success message

---

## Test Output

### Generated Files

After running tests, check these directories:

```
e2e-output/
├── policy-72month-e2e.pdf
├── policy-84month-e2e.pdf
├── policy-96month-commercial-e2e.pdf
└── screenshots/           # On failure
    └── test-failure.png
```

### Test Reports

View HTML test report:
```bash
npx playwright show-report
```

---

## Configuration

### Playwright Config (`playwright.config.ts`)

```typescript
{
  testDir: './apps/web/e2e',     // Test location
  outputDir: './e2e-output',      // Output directory
  baseURL: 'http://localhost',    // Web app URL
  
  // Auto-start services before tests
  webServer: {
    command: 'docker-compose up',
    url: 'http://localhost',
    timeout: 120000
  }
}
```

### Browser Support

Tests run on:
- ✅ Chromium (Chrome/Edge)
- ✅ Firefox
- ✅ WebKit (Safari)

Run specific browser:
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

---

## Debugging Tests

### Interactive UI Mode (Recommended)

```bash
pnpm test:e2e:ui
```

Features:
- Step through tests
- See browser actions
- Inspect DOM
- Time travel debugging

### Debug Mode

```bash
pnpm test:e2e:debug
```

Opens Playwright Inspector:
- Set breakpoints
- Step through code
- Inspect elements
- View console logs

### Headed Mode (See Browser)

```bash
pnpm test:e2e:headed
```

Runs tests with browser visible but no debugging.

### Screenshots & Videos

On test failure, Playwright automatically captures:
- Screenshots
- Videos
- Traces

Find them in: `e2e-output/`

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install pnpm
        run: npm install -g pnpm
        
      - name: Install dependencies
        run: pnpm install
        
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: Start services
        run: docker-compose up -d
        
      - name: Wait for services
        run: sleep 30
        
      - name: Run E2E tests
        run: pnpm test:e2e
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Advanced Usage

### Run Specific Test

```bash
npx playwright test policy-form.spec.ts
```

### Run Specific Test Case

```bash
npx playwright test -g "72-month term"
```

### Run with Different Base URL

```bash
BASE_URL=http://staging.example.com pnpm test:e2e
```

### Parallel Execution

```bash
npx playwright test --workers=4
```

### Update Snapshots

```bash
npx playwright test --update-snapshots
```

---

## Troubleshooting

### Issue: Tests timeout waiting for services

**Solution:** Increase timeout in `playwright.config.ts`:
```typescript
webServer: {
  timeout: 180000  // 3 minutes
}
```

### Issue: Download not captured

**Solution:** Ensure download event is awaited:
```typescript
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.click('button:has-text("Preview")')
]);
```

### Issue: Form fields not found

**Solution:** Inspect actual field names:
```bash
# Open browser inspector
npx playwright codegen http://localhost
```

### Issue: Services not starting

**Solution:** Start services manually first:
```bash
docker-compose up -d
sleep 10
pnpm test:e2e
```

---

## Best Practices

### ✅ Do's

1. **Use data-testid attributes** for reliable selectors
   ```tsx
   <input data-testid="owner-firstname" />
   ```
   ```typescript
   await page.fill('[data-testid="owner-firstname"]', 'John');
   ```

2. **Wait for elements** before interacting
   ```typescript
   await page.waitForSelector('button:has-text("Preview")');
   ```

3. **Use page objects** for reusable code
   ```typescript
   class PolicyPage {
     async fillOwner(data) { /* ... */ }
   }
   ```

4. **Clean up test data** after tests
   ```typescript
   test.afterEach(async () => {
     // Delete test policies from DB
   });
   ```

### ❌ Don'ts

1. Don't use hard-coded waits
   ```typescript
   // Bad
   await page.waitForTimeout(5000);
   
   // Good
   await page.waitForSelector('.success-message');
   ```

2. Don't rely on element position
   ```typescript
   // Bad
   await page.click('.button:nth-child(3)');
   
   // Good
   await page.click('button:has-text("Submit")');
   ```

3. Don't test third-party code
   - Focus on your application logic
   - Mock external services

---

## Writing New Tests

### Test Template

```typescript
test('should do something', async ({ page }) => {
  // Arrange: Navigate and setup
  await page.goto('/');
  
  // Act: Perform actions
  await page.fill('input[name="field"]', 'value');
  await page.click('button');
  
  // Assert: Verify results
  await expect(page.locator('.result')).toBeVisible();
  await expect(page.locator('.result')).toHaveText('Expected');
});
```

### Page Object Pattern

```typescript
// pages/PolicyFormPage.ts
export class PolicyFormPage {
  constructor(private page: Page) {}
  
  async fillOwnerInfo(data: OwnerData) {
    await this.page.fill('[name="owner.firstName"]', data.firstName);
    await this.page.fill('[name="owner.lastName"]', data.lastName);
    // ...
  }
  
  async selectTerm(months: 72 | 84 | 96) {
    await this.page.check(`input[value="${months}"]`);
  }
  
  async clickPreview() {
    return await Promise.all([
      this.page.waitForEvent('download'),
      this.page.click('button:has-text("Preview")')
    ]);
  }
}

// In test
const policyPage = new PolicyFormPage(page);
await policyPage.fillOwnerInfo({ firstName: 'John', ... });
await policyPage.selectTerm(72);
const [download] = await policyPage.clickPreview();
```

---

## Resources

- [Playwright Docs](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Examples](https://playwright.dev/docs/ci)

---

*Last updated: 2025-10-06*


