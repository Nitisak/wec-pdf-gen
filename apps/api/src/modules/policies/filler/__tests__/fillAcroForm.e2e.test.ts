import { describe, it, expect, beforeAll } from 'vitest';
import { fillAcroForm } from '../fillAcroForm.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { PDFDocument } from 'pdf-lib';
import type { PolicyCreate } from '@wec/shared/policySchemas';

describe('fillAcroForm E2E Test', () => {
  const testOutputDir = join(process.cwd(), 'test-output');

  beforeAll(() => {
    // Create test output directory
    mkdirSync(testOutputDir, { recursive: true });
  });

  it('should fill PDF form with all fields and generate valid PDF', async () => {
    // Arrange: Create test policy data
    const testPolicy: PolicyCreate = {
      policyNumber: 'TEST-2025-001',
      productVersion: 'WEC-PS-VSC-09-2025',
      stateCode: 'FL',
      owner: {
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main Street',
        city: 'Miami',
        state: 'FL',
        zip: '33101',
        phone: '305-555-0100',
        email: 'john.doe@example.com'
      },
      coOwner: {
        name: 'Jane Doe',
        address: '123 Main Street',
        city: 'Miami',
        state: 'FL',
        zip: '33101',
        phone: '305-555-0101',
        email: 'jane.doe@example.com'
      },
      dealer: {
        id: 'DLR-001',
        name: 'Premium Auto Sales',
        address: '456 Dealer Ave',
        city: 'Miami',
        state: 'FL',
        zip: '33102',
        phone: '305-555-0200',
        salesRep: 'Bob Smith'
      },
      vehicle: {
        vin: '1HGCM82633A123456',
        year: '2023',
        make: 'Honda',
        model: 'Accord',
        mileage: 15000,
        salePrice: 28500.00
      },
      coverage: {
        termMonths: 72,
        purchaseDate: '2025-10-06',
        expirationDate: '2031-10-06',
        contractPrice: 2500.00,
        commercial: false
      },
      lender: {
        name: 'First National Bank',
        address: '789 Bank Street',
        cityStateZip: 'Miami, FL 33103'
      }
    };

    // Act: Fill the PDF form
    const pdfBytes = await fillAcroForm(testPolicy);

    // Assert: Verify PDF was generated
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(0);

    // Save PDF to file for manual inspection
    const outputPath = join(testOutputDir, 'test-policy-72m.pdf');
    writeFileSync(outputPath, pdfBytes);
    console.log(`✓ PDF saved to: ${outputPath}`);

    // Verify PDF structure
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    expect(fields.length).toBeGreaterThan(0);
    console.log(`✓ PDF has ${fields.length} form fields`);

    // Verify specific fields are filled
    const contractNumber = form.getTextField('Text_Contract_Number');
    expect(contractNumber.getText()).toBe('TEST-2025-001');

    const ownerFirstName = form.getTextField('Text_Owner_Firstname');
    expect(ownerFirstName.getText()).toBe('John');

    const vehicleVin = form.getTextField('Text_Vehicle_ID');
    expect(vehicleVin.getText()).toBe('1HGCM82633A123456');

    // Verify checkbox is checked
    const term72Checkbox = form.getCheckBox('Term_72m');
    expect(term72Checkbox.isChecked()).toBe(true);

    const term84Checkbox = form.getCheckBox('Term_84m');
    expect(term84Checkbox.isChecked()).toBe(false);

    const term96Checkbox = form.getCheckBox('Term_96m');
    expect(term96Checkbox.isChecked()).toBe(false);

    console.log('✓ 72-month term checkbox is correctly checked');
  }, 30000); // 30 second timeout

  it('should correctly check 84-month term', async () => {
    const testPolicy: PolicyCreate = {
      policyNumber: 'TEST-2025-002',
      productVersion: 'WEC-PS-VSC-09-2025',
      stateCode: 'FL',
      owner: {
        firstName: 'Alice',
        lastName: 'Johnson',
        address: '789 Oak Lane',
        city: 'Orlando',
        state: 'FL',
        zip: '32801',
        phone: '407-555-0100',
        email: 'alice.j@example.com'
      },
      dealer: {
        id: 'DLR-002',
        name: 'Quality Motors',
        address: '321 Auto Blvd',
        city: 'Orlando',
        state: 'FL',
        zip: '32802',
        phone: '407-555-0200'
      },
      vehicle: {
        vin: '2T1BURHE8JC123456',
        year: '2024',
        make: 'Toyota',
        model: 'Corolla',
        mileage: 5000,
        salePrice: 24000.00
      },
      coverage: {
        termMonths: 84,
        purchaseDate: '2025-10-06',
        expirationDate: '2032-10-06',
        contractPrice: 2800.00,
        commercial: false
      }
    };

    const pdfBytes = await fillAcroForm(testPolicy);
    const outputPath = join(testOutputDir, 'test-policy-84m.pdf');
    writeFileSync(outputPath, pdfBytes);

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    const term72Checkbox = form.getCheckBox('Term_72m');
    expect(term72Checkbox.isChecked()).toBe(false);

    const term84Checkbox = form.getCheckBox('Term_84m');
    expect(term84Checkbox.isChecked()).toBe(true);

    const term96Checkbox = form.getCheckBox('Term_96m');
    expect(term96Checkbox.isChecked()).toBe(false);

    console.log('✓ 84-month term checkbox is correctly checked');
  }, 30000);

  it('should correctly check commercial checkbox', async () => {
    const testPolicy: PolicyCreate = {
      policyNumber: 'TEST-2025-003',
      productVersion: 'WEC-PS-VSC-09-2025',
      stateCode: 'FL',
      owner: {
        firstName: 'Bob',
        lastName: 'Builder',
        address: '555 Construction Way',
        city: 'Tampa',
        state: 'FL',
        zip: '33601',
        phone: '813-555-0100',
        email: 'bob@builders.com'
      },
      dealer: {
        id: 'DLR-003',
        name: 'Commercial Trucks Inc',
        address: '999 Truck Lane',
        city: 'Tampa',
        state: 'FL',
        zip: '33602',
        phone: '813-555-0200'
      },
      vehicle: {
        vin: '1FTFW1EF5DFC12345',
        year: '2023',
        make: 'Ford',
        model: 'F-150',
        mileage: 25000,
        salePrice: 45000.00
      },
      coverage: {
        termMonths: 96,
        purchaseDate: '2025-10-06',
        expirationDate: '2033-10-06',
        contractPrice: 3200.00,
        commercial: true
      }
    };

    const pdfBytes = await fillAcroForm(testPolicy);
    const outputPath = join(testOutputDir, 'test-policy-commercial.pdf');
    writeFileSync(outputPath, pdfBytes);

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    const commercialCheckbox = form.getCheckBox('LossCode_COMMERCIAL');
    expect(commercialCheckbox.isChecked()).toBe(true);

    const term96Checkbox = form.getCheckBox('Term_96m');
    expect(term96Checkbox.isChecked()).toBe(true);

    console.log('✓ Commercial checkbox is correctly checked');
    console.log('✓ 96-month term checkbox is correctly checked');
  }, 30000);

  it('should handle signature overlay', async () => {
    // Create a simple base64 PNG (1x1 red pixel)
    const redPixelPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    const testPolicy: PolicyCreate = {
      policyNumber: 'TEST-2025-004',
      productVersion: 'WEC-PS-VSC-09-2025',
      stateCode: 'FL',
      owner: {
        firstName: 'Signed',
        lastName: 'Customer',
        address: '111 Signature St',
        city: 'Jacksonville',
        state: 'FL',
        zip: '32201',
        phone: '904-555-0100',
        email: 'signed@example.com'
      },
      dealer: {
        id: 'DLR-004',
        name: 'Signature Auto',
        address: '222 Deal Ave',
        city: 'Jacksonville',
        state: 'FL',
        zip: '32202',
        phone: '904-555-0200'
      },
      vehicle: {
        vin: 'JM1BK32F781234567',
        year: '2024',
        make: 'Mazda',
        model: 'CX-5',
        mileage: 10000,
        salePrice: 32000.00
      },
      coverage: {
        termMonths: 72,
        purchaseDate: '2025-10-06',
        expirationDate: '2031-10-06',
        contractPrice: 2600.00,
        commercial: false
      },
      customerSignaturePngBase64: redPixelPng
    };

    const pdfBytes = await fillAcroForm(testPolicy);
    const outputPath = join(testOutputDir, 'test-policy-with-signature.pdf');
    writeFileSync(outputPath, pdfBytes);

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    console.log('✓ PDF with signature overlay created');
  }, 30000);
});


