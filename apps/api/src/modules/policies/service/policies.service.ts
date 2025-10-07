import { eq } from 'drizzle-orm';
import { getDatabase } from '../../db/index.js';
import { policy, htmlTemplate } from '../../db/schema.js';
import { PolicyCreate } from '@wec/shared/policySchemas';
import { fillAcroForm } from '../filler/fillAcroForm.js';
import { mergePdfs } from '../assembler/merge.js';
import { putS3Object, generatePolicyPdfKey, getSignedDownloadUrl, getS3Object } from '../../storage/s3.js';

export async function createPolicy(payload: PolicyCreate, dryRun: boolean = false) {
  const db = getDatabase();
  
  // Generate policy number if not provided
  const policyNumber = payload.policyNumber || generatePolicyNumber(payload.stateCode);
  
  // Calculate dates
  const purchaseDate = new Date(payload.coverage.purchaseDate);
  const expirationDate = new Date(payload.coverage.expirationDate);
  
  // Create policy record
  const policyRecord = {
    policyNumber,
    productVersion: payload.productVersion,
    stateCode: payload.stateCode,
    termMonths: payload.coverage.termMonths,
    commercial: payload.coverage.commercial,
    effectiveDate: purchaseDate.toISOString().split('T')[0],
    expirationDate: expirationDate.toISOString().split('T')[0],
    contractPrice: payload.coverage.contractPrice.toString(),
    salePrice: payload.vehicle.salePrice?.toString() || null,
    payload: payload as any,
    pdfKey: null as string | null
  };

  if (!dryRun) {
    // Insert policy record
    const [insertedPolicy] = await db.insert(policy).values(policyRecord).returning();
    
    try {
      // Generate PDF
      const pdfBuffer = await assemblePolicyPdf(payload);
      
      // Upload to S3
      const year = purchaseDate.getFullYear().toString();
      const month = (purchaseDate.getMonth() + 1).toString().padStart(2, '0');
      const pdfKey = generatePolicyPdfKey(policyNumber, year, month);
      
      await putS3Object(pdfKey, pdfBuffer);
      
      // Update policy with PDF key
      await db.update(policy)
        .set({ pdfKey })
        .where(eq(policy.id, insertedPolicy.id));
      
      // Generate signed URL
      const pdfUrl = await getSignedDownloadUrl(pdfKey);
      
      return {
        id: insertedPolicy.id,
        policyNumber,
        pdfUrl
      };
    } catch (error) {
      // Clean up policy record if PDF generation fails
      await db.delete(policy).where(eq(policy.id, insertedPolicy.id));
      throw error;
    }
  } else {
    // Dry run - just generate PDF without persisting
    const pdfBuffer = await assemblePolicyPdf(payload);
    const pdfUrl = `data:application/pdf;base64,${Buffer.from(pdfBuffer).toString('base64')}`;
    
    return {
      id: 'dry-run',
      policyNumber,
      pdfUrl
    };
  }
}

export async function getPolicy(policyId: string) {
  const db = getDatabase();
  
  const [policyRecord] = await db
    .select()
    .from(policy)
    .where(eq(policy.id, policyId))
    .limit(1);
  
  if (!policyRecord) {
    throw new Error('Policy not found');
  }
  
  if (!policyRecord.pdfKey) {
    throw new Error('Policy PDF not found');
  }
  
  const pdfUrl = await getSignedDownloadUrl(policyRecord.pdfKey);
  
  return {
    ...policyRecord,
    pdfUrl
  };
}

async function assemblePolicyPdf(payload: PolicyCreate): Promise<Uint8Array> {
  // 1. Fill AcroForm
  console.log(`assemblePolicyPdf payload  ${payload}`);
  const filledForm = await fillAcroForm(payload);
  
  // 2. Load Terms PDF (static PDF file, no rendering needed)
  const termsPdf = await loadTermsPdf();
  
  // 3. Load Disclosure PDF (static PDF file, no rendering needed)
  const disclosurePdf = await loadDisclosurePdf();
  
  // 4. Merge PDFs in order: Filled Form → Terms → Disclosures
  const mergedPdf = await mergePdfs([filledForm, termsPdf, disclosurePdf]);
  
  return mergedPdf;
}

function generatePolicyNumber(stateCode: string): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `WEC-${stateCode}-2025-${timestamp}${random}`;
}

async function loadTermsPdf(): Promise<Uint8Array> {
  // Load the static Terms PDF from S3
  const termsKey = process.env.PDF_TERMS_KEY || 'templates/ContractPSVSCTemplate_HT_v07_02.pdf';
  return await getS3Object(termsKey);
}

async function loadDisclosurePdf(): Promise<Uint8Array> {
  // Load the static Disclosure PDF from S3
  const disclosureKey = process.env.PDF_DISCLOSURE_KEY || 'templates/ContractPSVSCTemplate_HT_v07_03.pdf';
  return await getS3Object(disclosureKey);
}
