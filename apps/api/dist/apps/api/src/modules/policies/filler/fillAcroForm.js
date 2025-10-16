import { PDFDocument } from 'pdf-lib';
import { getS3Object } from '../../storage/s3.js';
import { toAcroFields } from './mapping.js';
// Signature overlay constants
const SIGN_X = 360;
const SIGN_Y = 120;
const SIGN_W = 140;
const SIGN_H = 40;
export async function fillAcroForm(payload) {
    // Use the new fillable PDF template (ContractPSVSCTemplate_HT_v07_01.pdf)
    const templateKey = process.env.PDF_TEMPLATE_KEY || 'templates/ContractPSVSCTemplate_HT_v07_01.pdf';
    const pdfBytes = await getS3Object(templateKey);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    //console.log(`fillAcroForm payload ${payload}`);
    const fields = toAcroFields(payload);
    console.log(`fillAcroForm fields ${JSON.stringify(fields)}`);
    // Fill text and checkbox fields
    for (const [name, value] of Object.entries(fields)) {
        try {
            // Try to get field to check if it exists
            const field = form.getFieldMaybe(name);
            if (!field) {
                console.warn(`Field not found: ${name}`);
                continue;
            }
            // Try as text field first
            try {
                const textField = form.getTextField(name);
                textField.setText(String(value));
                textField.enableReadOnly(); // Make field read-only
                continue;
            }
            catch (e) {
                // Not a text field
            }
            // Try as checkbox
            try {
                const checkbox = form.getCheckBox(name);
                if (value === 'On') {
                    checkbox.check();
                    console.log(`✓ Checked: ${name}`);
                }
                else {
                    checkbox.uncheck();
                    console.log(`  Unchecked: ${name} ${value}`);
                }
                checkbox.enableReadOnly(); // Make checkbox read-only
                continue;
            }
            catch (e) {
                // Not a checkbox either
            }
            console.warn(`Unknown field type for: ${name}`);
        }
        catch (error) {
            console.warn(`Failed to fill field ${name}:`, error);
        }
    }
    // Signature overlay (if provided) - add to both Dealer Copy (page 1) and Customer Copy (page 3)
    if (payload.customerSignaturePngBase64) {
        try {
            const pngBytes = Buffer.from(payload.customerSignaturePngBase64, 'base64');
            const png = await pdfDoc.embedPng(pngBytes);
            const pages = pdfDoc.getPages();
            // Add signature to page 1 (Dealer Copy)
            if (pages.length >= 1) {
                const page1 = pages[0];
                page1.drawImage(png, {
                    x: SIGN_X,
                    y: SIGN_Y,
                    width: SIGN_W,
                    height: SIGN_H
                });
                console.log('✓ Signature added to Page 1 (Dealer Copy)');
            }
            // Add signature to page 3 (Customer Copy)
            if (pages.length >= 3) {
                const page3 = pages[2];
                page3.drawImage(png, {
                    x: SIGN_X,
                    y: SIGN_Y,
                    width: SIGN_W,
                    height: SIGN_H
                });
                console.log('✓ Signature added to Page 3 (Customer Copy)');
            }
        }
        catch (error) {
            console.warn('Failed to embed signature:', error);
        }
    }
    form.updateFieldAppearances();
    // Log page information
    const pageCount = pdfDoc.getPageCount();
    console.log(`✓ PDF generated with ${pageCount} pages`);
    console.log(`  Page 1: Dealer Copy`);
    if (pageCount >= 2)
        console.log(`  Page 2: Internal (blank)`);
    if (pageCount >= 3)
        console.log(`  Page 3: Customer Copy`);
    return await pdfDoc.save();
}
