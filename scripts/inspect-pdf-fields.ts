import { PDFDocument } from 'pdf-lib';
import { readFileSync } from 'fs';
import { join } from 'path';

async function inspectPdfFields() {
  const pdfPath = join(process.cwd(), 'assets/ContractPSVSCTemplate_HT_v07_Form1.pdf');
  const pdfBytes = readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  
  const fields = form.getFields();
  
  console.log(`\nTotal fields: ${fields.length}\n`);
  console.log('Field Names and Types:\n');
  console.log('='.repeat(80));
  
  fields.forEach(field => {
    const name = field.getName();
    const type = field.constructor.name;
    console.log(`${name.padEnd(50)} | ${type}`);
  });
  
  console.log('='.repeat(80));
  
  // Look specifically for term-related fields
  console.log('\nTerm/checkbox related fields:\n');
  fields.forEach(field => {
    const name = field.getName();
    if (name.toLowerCase().includes('term') || 
        name.toLowerCase().includes('72') || 
        name.toLowerCase().includes('84') || 
        name.toLowerCase().includes('96') ||
        name.toLowerCase().includes('month')) {
      console.log(`  - ${name} (${field.constructor.name})`);
    }
  });
  
  // Look for commercial/loss code fields
  console.log('\nCommercial/LossCode related fields:\n');
  fields.forEach(field => {
    const name = field.getName();
    if (name.toLowerCase().includes('commercial') || 
        name.toLowerCase().includes('loss') ||
        name.toLowerCase().includes('farm')) {
      console.log(`  - ${name} (${field.constructor.name})`);
    }
  });
}

inspectPdfFields().catch(console.error);

