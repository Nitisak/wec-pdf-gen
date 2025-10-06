#!/usr/bin/env tsx
import { fillAcroForm } from '../apps/api/src/modules/policies/filler/fillAcroForm.js';
import { PDFDocument } from 'pdf-lib';
import { getS3Object } from '../apps/api/src/modules/storage/s3.js';
import { writeFileSync } from 'fs';
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

async function testTermCheckbox() {
  console.log('🔍 Testing Term Checkbox Logic\n');

  // Your exact payload
  const payload: PolicyCreate = {
    policyNumber: "POLx100001",
    stateCode: "FL",
    productVersion: "WEC-PS-VSC-09-2025",
    owner: {
      firstName: "Atester",
      lastName: "Btester",
      address: "9/97 , Baan Klang Muang Kalpapruek",
      city: "Bangkok",
      state: "FL",
      zip: "10160",
      phone: "3524388149",
      email: "nitisak.mooltreesri@gmail.com"
    },
    dealer: {
      id: "WEC10001",
      name: "OCALATRACTOR",
      address: "9/97 , Baan Klang Muang Kalpapruek",
      city: "Bangkok",
      state: "AL",
      zip: "10160",
      phone: "3524388149",
      salesRep: "Mooi"
    },
    vehicle: {
      vin: "12TEST919",
      year: "2023",
      make: "Kubota",
      model: "TECT1001",
      mileage: 1000,
      salePrice: 9999.96
    },
    coverage: {
      termMonths: 96,
      commercial: true,
      contractPrice: 1050,
      purchaseDate: "2025-10-06",
      expirationDate: "2108-01-06"
    },
    lender: {
      name: "AcTractor",
      address: "1719 Sw 27th Pl",
      cityStateZip: "Ocala"
    }
  };

  console.log('📋 Payload Summary:');
  console.log(`   Policy Number: ${payload.policyNumber}`);
  console.log(`   Term Months: ${payload.coverage.termMonths}`);
  console.log(`   Commercial: ${payload.coverage.commercial}`);
  console.log();

  // Step 1: Check what the mapping produces
  console.log('🗺️  Step 1: Checking Field Mapping');
  const { toAcroFields } = await import('../apps/api/src/modules/policies/filler/mapping.js');
  const fields = toAcroFields(payload);
  
  console.log(`   Term_72m: ${fields.Term_72m}`);
  console.log(`   Term_84m: ${fields.Term_84m}`);
  console.log(`   Term_96m: ${fields.Term_96m}`);
  console.log(`   LossCode_COMMERCIAL: ${fields.LossCode_COMMERCIAL}`);
  console.log();

  // Step 2: Load template and inspect checkbox fields
  console.log('📄 Step 2: Inspecting PDF Template Checkboxes');
  const pdfBytes = await getS3Object(process.env.PDF_TEMPLATE_KEY!);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  
  const allFields = form.getFields();
  const checkboxFields = allFields.filter(field => {
    const name = field.getName();
    return name.includes('Term_') || name.includes('COMMERCIAL');
  });

  console.log(`   Found ${checkboxFields.length} term/commercial checkboxes:`);
  checkboxFields.forEach(field => {
    const name = field.getName();
    console.log(`   - ${name}`);
  });
  console.log();

  // Step 3: Try to fill the form
  console.log('✏️  Step 3: Filling Form with Debug Output');
  console.log();
  
  const filledPdf = await fillAcroForm(payload);
  
  const outputPath = join(process.cwd(), 'test-pdfs', 'term-checkbox-test.pdf');
  writeFileSync(outputPath, filledPdf);
  
  console.log();
  console.log(`✅ Test PDF saved: ${outputPath}`);
  console.log();

  // Step 4: Read back the filled PDF and check checkbox states
  console.log('🔍 Step 4: Verifying Checkbox States in Generated PDF');
  const filledDoc = await PDFDocument.load(filledPdf);
  const filledForm = filledDoc.getForm();
  
  const termFields = ['Term_72m', 'Term_84m', 'Term_96m', 'LossCode_COMMERCIAL'];
  
  for (const fieldName of termFields) {
    try {
      const checkbox = filledForm.getCheckBox(fieldName);
      const isChecked = checkbox.isChecked();
      const symbol = isChecked ? '✓' : '✗';
      console.log(`   ${symbol} ${fieldName}: ${isChecked ? 'CHECKED' : 'UNCHECKED'}`);
    } catch (error) {
      console.log(`   ⚠️  ${fieldName}: Field not found or not a checkbox`);
    }
  }
  console.log();

  // Summary
  console.log('📊 Summary:');
  console.log(`   Expected: Term_96m should be CHECKED (termMonths = 96)`);
  console.log(`   Expected: LossCode_COMMERCIAL should be CHECKED (commercial = true)`);
  console.log(`   Expected: Term_72m and Term_84m should be UNCHECKED`);
}

// Run the test
testTermCheckbox().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

