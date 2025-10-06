#!/usr/bin/env tsx
import { fillAcroForm } from '../apps/api/src/modules/policies/filler/fillAcroForm.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
import type { PolicyCreate } from '../packages/shared/policySchemas.js';

// Load environment variables
dotenv.config({ path: join(process.cwd(), 'apps/api/.env') });

// Ensure required env vars
if (!process.env.S3_ENDPOINT) {
  process.env.S3_ENDPOINT = 'http://localhost:9000';
  process.env.S3_ACCESS_KEY = 'minioadmin';
  process.env.S3_SECRET_KEY = 'minioadmin';
  process.env.S3_BUCKET = 'wecover-pdfs';
  process.env.S3_REGION = 'us-east-1';
  process.env.PDF_TEMPLATE_KEY = 'templates/ContractPSVSCTemplate_HT_v07_Form.pdf';
}

async function generateTestPDFs() {
  const outputDir = join(process.cwd(), 'test-pdfs');
  mkdirSync(outputDir, { recursive: true });

  console.log('🔄 Generating test PDFs...\n');

  // Test 1: 72-month term
  const policy72m: PolicyCreate = {
    policyNumber: 'WEC-2025-72M-001',
    owner: {
      firstName: 'John',
      lastName: 'Smith',
      address: '123 Main Street',
      city: 'Miami',
      state: 'FL',
      zip: '33101',
      phone: '305-555-0100',
      email: 'john.smith@example.com'
    },
    coOwner: {
      name: 'Jane Smith',
      address: '123 Main Street',
      city: 'Miami',
      state: 'FL',
      zip: '33101',
      phone: '305-555-0101',
      email: 'jane.smith@example.com'
    },
    dealer: {
      id: 'DLR-FL-001',
      name: 'Sunshine Auto Sales',
      address: '456 Dealer Boulevard',
      city: 'Miami',
      state: 'FL',
      zip: '33102',
      phone: '305-555-0200',
      salesRep: 'Bob Johnson'
    },
    vehicle: {
      vin: '1HGCM82633A123456',
      year: '2023',
      make: 'Honda',
      model: 'Accord EX-L',
      mileage: 15000,
      salePrice: 28500.00
    },
    coverage: {
      productVersion: 'WEC-PS-VSC-09-2025',
      termMonths: 72,
      purchaseDate: '2025-10-06',
      expirationDate: '2031-10-06',
      contractPrice: 2500.00,
      commercial: false
    },
    lender: {
      name: 'First National Bank of Florida',
      address: '789 Bank Street',
      cityStateZip: 'Miami, FL 33103'
    }
  };

  console.log('📄 Generating 72-month term policy...');
  const pdf72m = await fillAcroForm(policy72m);
  const path72m = join(outputDir, 'policy-72month.pdf');
  writeFileSync(path72m, pdf72m);
  console.log(`✅ Saved: ${path72m}\n`);

  // Test 2: 84-month term
  const policy84m: PolicyCreate = {
    policyNumber: 'WEC-2025-84M-002',
    owner: {
      firstName: 'Maria',
      lastName: 'Garcia',
      address: '789 Oak Avenue',
      city: 'Orlando',
      state: 'FL',
      zip: '32801',
      phone: '407-555-0300',
      email: 'maria.garcia@example.com'
    },
    dealer: {
      id: 'DLR-FL-002',
      name: 'Central Florida Motors',
      address: '321 Auto Park Drive',
      city: 'Orlando',
      state: 'FL',
      zip: '32802',
      phone: '407-555-0400'
    },
    vehicle: {
      vin: '5YJ3E1EA5JF123456',
      year: '2024',
      make: 'Tesla',
      model: 'Model 3',
      mileage: 2500,
      salePrice: 42000.00
    },
    coverage: {
      productVersion: 'WEC-PS-VSC-09-2025',
      termMonths: 84,
      purchaseDate: '2025-10-06',
      expirationDate: '2032-10-06',
      contractPrice: 2800.00,
      commercial: false
    }
  };

  console.log('📄 Generating 84-month term policy...');
  const pdf84m = await fillAcroForm(policy84m);
  const path84m = join(outputDir, 'policy-84month.pdf');
  writeFileSync(path84m, pdf84m);
  console.log(`✅ Saved: ${path84m}\n`);

  // Test 3: 96-month commercial
  const policy96mCommercial: PolicyCreate = {
    policyNumber: 'WEC-2025-96M-003',
    owner: {
      firstName: 'Robert',
      lastName: 'Williams',
      address: '555 Construction Way',
      city: 'Tampa',
      state: 'FL',
      zip: '33601',
      phone: '813-555-0500',
      email: 'rwilliams@construction.com'
    },
    dealer: {
      id: 'DLR-FL-003',
      name: 'Commercial Truck Center',
      address: '999 Industrial Parkway',
      city: 'Tampa',
      state: 'FL',
      zip: '33602',
      phone: '813-555-0600',
      salesRep: 'Mike Brown'
    },
    vehicle: {
      vin: '1FTFW1EF5DFC12345',
      year: '2023',
      make: 'Ford',
      model: 'F-150 XLT',
      mileage: 28000,
      salePrice: 48500.00
    },
    coverage: {
      productVersion: 'WEC-PS-VSC-09-2025',
      termMonths: 96,
      purchaseDate: '2025-10-06',
      expirationDate: '2033-10-06',
      contractPrice: 3500.00,
      commercial: true
    },
    lender: {
      name: 'Tampa Bay Credit Union',
      address: '111 Finance Street',
      cityStateZip: 'Tampa, FL 33603'
    }
  };

  console.log('📄 Generating 96-month commercial policy...');
  const pdf96m = await fillAcroForm(policy96mCommercial);
  const path96m = join(outputDir, 'policy-96month-commercial.pdf');
  writeFileSync(path96m, pdf96m);
  console.log(`✅ Saved: ${path96m}\n`);

  // Test 4: With signature
  const redPixelPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  
  const policyWithSig: PolicyCreate = {
    policyNumber: 'WEC-2025-SIG-004',
    owner: {
      firstName: 'Emily',
      lastName: 'Davis',
      address: '222 Signature Lane',
      city: 'Jacksonville',
      state: 'FL',
      zip: '32201',
      phone: '904-555-0700',
      email: 'emily.davis@example.com'
    },
    dealer: {
      id: 'DLR-FL-004',
      name: 'Jacksonville Auto Gallery',
      address: '444 Premium Drive',
      city: 'Jacksonville',
      state: 'FL',
      zip: '32202',
      phone: '904-555-0800'
    },
    vehicle: {
      vin: 'WBAPL5G50ANP12345',
      year: '2024',
      make: 'BMW',
      model: '330i',
      mileage: 5000,
      salePrice: 52000.00
    },
    coverage: {
      productVersion: 'WEC-PS-VSC-09-2025',
      termMonths: 72,
      purchaseDate: '2025-10-06',
      expirationDate: '2031-10-06',
      contractPrice: 2900.00,
      commercial: false
    },
    customerSignaturePngBase64: redPixelPng
  };

  console.log('📄 Generating policy with signature...');
  const pdfSig = await fillAcroForm(policyWithSig);
  const pathSig = join(outputDir, 'policy-with-signature.pdf');
  writeFileSync(pathSig, pdfSig);
  console.log(`✅ Saved: ${pathSig}\n`);

  console.log('✨ All test PDFs generated successfully!');
  console.log(`📁 Output directory: ${outputDir}`);
}

// Run the script
generateTestPDFs().catch((error) => {
  console.error('❌ Error generating PDFs:', error);
  process.exit(1);
});

