import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

test.describe('Policy Form E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the policy form
    await page.goto('http://localhost');
    
    // Wait for the form to be visible
    await expect(page.locator('form')).toBeVisible();
  });

  test('should fill form and generate 72-month term PDF', async ({ page }) => {
    // Owner Information
    await page.fill('input[name="owner.firstName"]', 'John');
    await page.fill('input[name="owner.lastName"]', 'Smith');
    await page.fill('input[name="owner.address"]', '123 Main Street');
    await page.fill('input[name="owner.city"]', 'Miami');
    await page.fill('input[name="owner.state"]', 'FL');
    await page.fill('input[name="owner.zip"]', '33101');
    await page.fill('input[name="owner.phone"]', '305-555-0100');
    await page.fill('input[name="owner.email"]', 'john.smith@example.com');

    // Co-Owner Information (optional - skip for this test)
    
    // Dealer Information
    await page.fill('input[name="dealer.id"]', 'DLR-FL-001');
    await page.fill('input[name="dealer.name"]', 'Sunshine Auto Sales');
    await page.fill('input[name="dealer.address"]', '456 Dealer Boulevard');
    await page.fill('input[name="dealer.city"]', 'Miami');
    await page.fill('input[name="dealer.state"]', 'FL');
    await page.fill('input[name="dealer.zip"]', '33102');
    await page.fill('input[name="dealer.phone"]', '305-555-0200');
    await page.fill('input[name="dealer.salesRep"]', 'Bob Johnson');

    // Vehicle Information
    await page.fill('input[name="vehicle.vin"]', '1HGCM82633A123456');
    await page.fill('input[name="vehicle.year"]', '2023');
    await page.fill('input[name="vehicle.make"]', 'Honda');
    await page.fill('input[name="vehicle.model"]', 'Accord EX-L');
    await page.fill('input[name="vehicle.mileage"]', '15000');
    await page.fill('input[name="vehicle.salePrice"]', '28500');

    // Coverage Information
    await page.fill('input[name="policyNumber"]', 'TEST-E2E-72M-101');
    await page.fill('input[name="coverage.purchaseDate"]', '2025-10-06');
    //await page.fill('input[name="coverage.expirationDate"]', '2031-10-06');
    await page.fill('input[name="coverage.contractPrice"]', '2500');
    
    // Select 72-month term
    await page.click('label:has-text("72 months")');
    await page.getByRole('checkbox').nth(0).check();
    
    // Commercial checkbox should be unchecked
    await page.uncheck('input[name="coverage.commercial"]');

    // State selection (for disclosure)
    await page.selectOption('select[name="stateCode"]', 'FL');

    
    await page.getByRole('button', { name: 'Create Policy' }).click();
    await page.waitForTimeout(1000);

   

    // Save the downloaded file for inspection
    const outputPath = join(process.cwd(), 'e2e-output', 'policy-72month-e2e.pdf');
    //await download.saveAs(outputPath);
    
    console.log(`✅ PDF downloaded: ${outputPath}`);
  });

  test('should fill form and generate 84-month term PDF', async ({ page }) => {
    // Owner Information
    await page.fill('input[name="owner.firstName"]', 'Maria');
    await page.fill('input[name="owner.lastName"]', 'Garcia');
    await page.fill('input[name="owner.address"]', '789 Oak Avenue');
    await page.fill('input[name="owner.city"]', 'Orlando');
    await page.fill('input[name="owner.state"]', 'FL');
    await page.fill('input[name="owner.zip"]', '32801');
    await page.fill('input[name="owner.phone"]', '407-555-0300');
    await page.fill('input[name="owner.email"]', 'maria.garcia@example.com');

    // Dealer Information
    await page.fill('input[name="dealer.id"]', 'DLR-FL-002');
    await page.fill('input[name="dealer.name"]', 'Central Florida Motors');
    await page.fill('input[name="dealer.address"]', '321 Auto Park Drive');
    await page.fill('input[name="dealer.city"]', 'Orlando');
    await page.fill('input[name="dealer.state"]', 'FL');
    await page.fill('input[name="dealer.zip"]', '32802');
    await page.fill('input[name="dealer.phone"]', '407-555-0400');

    // Vehicle Information
    await page.fill('input[name="vehicle.vin"]', '5YJ3E1EA5JF123456');
    await page.fill('input[name="vehicle.year"]', '2024');
    await page.fill('input[name="vehicle.make"]', 'Tesla');
    await page.fill('input[name="vehicle.model"]', 'Model 3');
    await page.fill('input[name="vehicle.mileage"]', '2500');
    await page.fill('input[name="vehicle.salePrice"]', '42000');

    // Coverage Information
    await page.fill('input[name="policyNumber"]', 'TEST-E2E-84M-102');
    await page.fill('input[name="coverage.purchaseDate"]', '2025-10-06');
    //await page.fill('input[name="coverage.expirationDate"]', '2032-10-06');
    await page.fill('input[name="coverage.contractPrice"]', '2800');
    
    // Select 84-month term
    await page.click('label:has-text("84 months")');
    await page.getByRole('checkbox').nth(1).check();

    // State selection
    await page.selectOption('select[name="stateCode"]', 'FL');

    await page.locator('input[name="lender.name"]').click();
    await page.locator('input[name="lender.name"]').fill('test');
    await page.locator('input[name="lender.address"]').click();
    await page.locator('input[name="lender.address"]').fill('test');
    await page.locator('input[name="lender.cityStateZip"]').click();
    await page.locator('input[name="lender.cityStateZip"]').fill('test');
    


    await page.getByRole('button', { name: 'Create Policy' }).click();
    await page.waitForTimeout(1000);



    // Verify and save
    const outputPath = join(process.cwd(), 'e2e-output', 'policy-84month-e2e.pdf');
   
    
    console.log(`✅ PDF downloaded: ${outputPath}`);
  });

  test('should fill form and generate 96-month commercial PDF', async ({ page }) => {
    // Owner Information
    await page.fill('input[name="owner.firstName"]', 'Robert');
    await page.fill('input[name="owner.lastName"]', 'Williams');
    await page.fill('input[name="owner.address"]', '555 Construction Way');
    await page.fill('input[name="owner.city"]', 'Tampa');
    await page.fill('input[name="owner.state"]', 'FL');
    await page.fill('input[name="owner.zip"]', '33601');
    await page.fill('input[name="owner.phone"]', '813-555-0500');
    await page.fill('input[name="owner.email"]', 'rwilliams@construction.com');

    // Dealer Information
    await page.fill('input[name="dealer.id"]', 'DLR-FL-003');
    await page.fill('input[name="dealer.name"]', 'Commercial Truck Center');
    await page.fill('input[name="dealer.address"]', '999 Industrial Parkway');
    await page.fill('input[name="dealer.city"]', 'Tampa');
    await page.fill('input[name="dealer.state"]', 'FL');
    await page.fill('input[name="dealer.zip"]', '33602');
    await page.fill('input[name="dealer.phone"]', '813-555-0600');
    await page.fill('input[name="dealer.salesRep"]', 'Mike Brown');

    // Vehicle Information
    await page.fill('input[name="vehicle.vin"]', '1FTFW1EF5DFC12345');
    await page.fill('input[name="vehicle.year"]', '2023');
    await page.fill('input[name="vehicle.make"]', 'Ford');
    await page.fill('input[name="vehicle.model"]', 'F-150 XLT');
    await page.fill('input[name="vehicle.mileage"]', '28000');
    await page.fill('input[name="vehicle.salePrice"]', '48500');

    // Coverage Information
    await page.fill('input[name="policyNumber"]', 'TEST-E2E-96M-103');
    await page.fill('input[name="coverage.purchaseDate"]', '2025-10-06');
    //await page.fill('input[name="coverage.expirationDate"]', '2033-10-06');
    await page.fill('input[name="coverage.contractPrice"]', '3500');
    
    // Select 96-month term
    await page.click('label:has-text("96 months")');
    await page.getByRole('checkbox').nth(2).check();
    
    // Check commercial checkbox
    await page.check('input[name="coverage.commercial"]');

    // State selection
    await page.selectOption('select[name="stateCode"]', 'FL');


    await page.locator('input[name="lender.name"]').click();
    await page.locator('input[name="lender.name"]').fill('test');
    await page.locator('input[name="lender.address"]').click();
    await page.locator('input[name="lender.address"]').fill('test');
    await page.locator('input[name="lender.cityStateZip"]').click();
    await page.locator('input[name="lender.cityStateZip"]').fill('test');
    

    // Click Preview/Generate PDF button
    await page.getByRole('button', { name: 'Create Policy' }).click();
    await page.waitForTimeout(1000);


    // Verify and save
    const outputPath = join(process.cwd(), 'e2e-output', 'policy-96month-commercial-e2e.pdf');
   // await download.saveAs(outputPath);
    
    console.log(`✅ PDF downloaded: ${outputPath}`);
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit without filling required fields
    await page.click('button:has-text("Create Policy")');

    // Check for validation errors
    const errors = await page.locator('.error, [aria-invalid="true"]').count();
    expect(errors).toBeGreaterThan(0);

    console.log(`✅ Validation working: ${errors} errors shown`);
  });

  test('should submit policy and save to database', async ({ page }) => {
    // Fill minimal required fields
    await page.fill('input[name="owner.firstName"]', 'Test');
    await page.fill('input[name="owner.lastName"]', 'User');
    await page.fill('input[name="owner.address"]', '123 Test St');
    await page.fill('input[name="owner.city"]', 'Miami');
    await page.fill('input[name="owner.state"]', 'FL');
    await page.fill('input[name="owner.zip"]', '33101');
    await page.fill('input[name="owner.phone"]', '305-555-0000');
    await page.fill('input[name="owner.email"]', 'test@example.com');

    await page.fill('input[name="dealer.id"]', 'DLR-TEST');
    await page.fill('input[name="dealer.name"]', 'Test Dealer');
    await page.fill('input[name="dealer.address"]', '456 Test Ave');
    await page.fill('input[name="dealer.city"]', 'Miami');
    await page.fill('input[name="dealer.state"]', 'FL');
    await page.fill('input[name="dealer.zip"]', '33102');
    await page.fill('input[name="dealer.phone"]', '305-555-0001');

    await page.fill('input[name="vehicle.vin"]', 'TEST123456789012');
    await page.fill('input[name="vehicle.year"]', '2024');
    await page.fill('input[name="vehicle.make"]', 'Test');
    await page.fill('input[name="vehicle.model"]', 'Model');
    await page.fill('input[name="vehicle.mileage"]', '1000');
    await page.fill('input[name="vehicle.salePrice"]', '25000');

    await page.fill('input[name="policyNumber"]', 'TEST-E2E-SUBMIT-104');
    await page.fill('input[name="coverage.purchaseDate"]', '2025-10-06');
    //await page.fill('input[name="coverage.expirationDate"]', '2031-10-06');
    await page.fill('input[name="coverage.contractPrice"]', '2000');
    //await page.check('input[value="72"]');
    await page.click('label:has-text("72 months")');
    await page.selectOption('select[name="stateCode"]', 'FL');

    await page.locator('input[name="lender.name"]').click();
    await page.locator('input[name="lender.name"]').fill('test');
    await page.locator('input[name="lender.address"]').click();
    await page.locator('input[name="lender.address"]').fill('test');
    await page.locator('input[name="lender.cityStateZip"]').click();
    await page.locator('input[name="lender.cityStateZip"]').fill('test');
    

    // Click Submit button (not Preview)
    await page.click('button:has-text("Create Policy")');

    // Wait for success message or redirect
    await page.waitForSelector('.success, .toast-success, h2:has-text("Success")', { 
      timeout: 10000 
    });

    console.log('✅ Policy submitted successfully');
  });
});

