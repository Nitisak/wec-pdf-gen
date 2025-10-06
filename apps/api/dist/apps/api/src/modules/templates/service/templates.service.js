import { eq, and, desc } from 'drizzle-orm';
import { getDatabase } from '../../db/index.js';
import { htmlTemplate } from '../../db/schema.js';
import { getS3Object } from '../../storage/s3.js';
import { renderHtmlToPdf } from '../../policies/renderer/renderHtmlToPdf.js';
export async function getTermsTemplate(productVersion, language = 'en-US') {
    const db = getDatabase();
    const template = await db
        .select()
        .from(htmlTemplate)
        .where(and(eq(htmlTemplate.kind, 'terms'), eq(htmlTemplate.productVersion, productVersion), eq(htmlTemplate.language, language)))
        .orderBy(desc(htmlTemplate.createdAt))
        .limit(1);
    if (template.length === 0) {
        throw new Error(`No terms template found for product version: ${productVersion}`);
    }
    return template[0];
}
export async function getDisclosureTemplate(stateCode, language = 'en-US') {
    const db = getDatabase();
    const template = await db
        .select()
        .from(htmlTemplate)
        .where(and(eq(htmlTemplate.kind, 'disclosure'), eq(htmlTemplate.stateCode, stateCode), eq(htmlTemplate.language, language)))
        .orderBy(desc(htmlTemplate.createdAt))
        .limit(1);
    if (template.length === 0) {
        throw new Error(`No disclosure template found for state: ${stateCode}`);
    }
    return template[0];
}
export async function renderTermsToPdf(productVersion, policyNumber, language = 'en-US') {
    const template = await getTermsTemplate(productVersion, language);
    const htmlContent = await getS3Object(template.s3Key);
    const html = new TextDecoder().decode(htmlContent);
    // Replace template variables
    const processedHtml = html
        .replace(/\{\{productVersion\}\}/g, productVersion)
        .replace(/\{\{policyNumber\}\}/g, policyNumber);
    return await renderHtmlToPdf(processedHtml);
}
export async function renderDisclosureToPdf(stateCode, language = 'en-US') {
    const template = await getDisclosureTemplate(stateCode, language);
    const htmlContent = await getS3Object(template.s3Key);
    const html = new TextDecoder().decode(htmlContent);
    return await renderHtmlToPdf(html);
}
