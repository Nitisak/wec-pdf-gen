import type { QuoteCreate } from '@wec/shared';
import { generateQuotePdf } from '../generator/generateQuotePdf.js';
import { getDatabase } from '../../db/index.js';
import { quote as quoteTable } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

const db = getDatabase();

export async function createQuote(payload: QuoteCreate) {
  console.log('Creating quote:', payload.quoteNumber);
  console.log('Payload:', JSON.stringify(payload, null, 2));
  // Generate the quote PDF
  const pdfBuffer = await generateQuotePdf(payload);
  
  // Convert PDF to base64 for direct return (no S3 storage)
  const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
  console.log(`✓ Quote PDF generated (${pdfBuffer.length} bytes)`);

  // Parse dates
  const issueDate = payload.issueDate 
    ? new Date(payload.issueDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];
  
  const validUntil = new Date(payload.validUntil).toISOString().split('T')[0];

  // Insert quote record into database (without pdfKey)
  const [quoteRecord] = await db.insert(quoteTable).values({
    quoteNumber: payload.quoteNumber,
    productVersion: payload.productVersion,
    stateCode: payload.stateCode,
    termMonths: payload.coverage.termMonths || 999,
    commercial: payload.coverage.commercial || false,
    basePrice: String(payload.pricing.basePrice),
    subtotal: String(payload.pricing.subtotal),
    total: String(payload.pricing.total),
    issueDate,
    validUntil,
    payload: payload as any
  }).returning();

  console.log(`✓ Quote record created: ${quoteRecord.id}`);

  return {
    id: quoteRecord.id,
    quoteNumber: quoteRecord.quoteNumber,
    pdfBase64, // Return PDF as base64 instead of URL
    issueDate: quoteRecord.issueDate,
    validUntil: quoteRecord.validUntil,
    total: quoteRecord.total
  };
}

export async function getQuote(quoteNumber: string) {
  const [quoteRecord] = await db
    .select()
    .from(quoteTable)
    .where(eq(quoteTable.quoteNumber, quoteNumber))
    .limit(1);

  if (!quoteRecord) {
    throw new Error(`Quote not found: ${quoteNumber}`);
  }

  // Regenerate PDF on-demand from stored payload
  const pdfBuffer = await generateQuotePdf(quoteRecord.payload as QuoteCreate);
  const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
  console.log(`✓ Quote PDF regenerated for ${quoteNumber} (${pdfBuffer.length} bytes)`);

  return {
    id: quoteRecord.id,
    quoteNumber: quoteRecord.quoteNumber,
    productVersion: quoteRecord.productVersion,
    stateCode: quoteRecord.stateCode,
    termMonths: quoteRecord.termMonths,
    commercial: quoteRecord.commercial,
    basePrice: quoteRecord.basePrice,
    subtotal: quoteRecord.subtotal,
    total: quoteRecord.total,
    issueDate: quoteRecord.issueDate,
    validUntil: quoteRecord.validUntil,
    pdfBase64, // Return regenerated PDF as base64
    payload: quoteRecord.payload,
    createdAt: quoteRecord.createdAt
  };
}

export async function listQuotes(filters?: {
  stateCode?: string;
  productVersion?: string;
  limit?: number;
  offset?: number;
}) {
  let query = db.select().from(quoteTable);

  if (filters?.stateCode) {
    query = query.where(eq(quoteTable.stateCode, filters.stateCode)) as any;
  }

  if (filters?.productVersion) {
    query = query.where(eq(quoteTable.productVersion, filters.productVersion)) as any;
  }

  const quotes = await query
    .limit(filters?.limit || 50)
    .offset(filters?.offset || 0)
    .orderBy(quoteTable.createdAt);

  return quotes.map((q: any) => ({
    id: q.id,
    quoteNumber: q.quoteNumber,
    productVersion: q.productVersion,
    stateCode: q.stateCode,
    total: q.total,
    issueDate: q.issueDate,
    validUntil: q.validUntil,
    createdAt: q.createdAt
  }));
}

