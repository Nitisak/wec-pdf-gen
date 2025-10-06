import { PDFDocument } from 'pdf-lib';
import { getS3Object } from '../../storage/s3.js';
import { toAcroFields } from './mapping.js';
// Signature overlay constants
const SIGN_X = 360;
const SIGN_Y = 120;
const SIGN_W = 140;
const SIGN_H = 40;
export async function fillAcroForm(payload) {
    const pdfBytes = await getS3Object(process.env.PDF_TEMPLATE_KEY);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    console.log(`fillAcroForm payload ${payload}`);
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
                    checkbox.enableReadOnly(); // Lock the checkbox state
                    console.log(`✓ Checked: ${name}`);
                }
                else {
                    checkbox.uncheck();
                    console.log(`  Unchecked: ${name} ${value}`);
                }
                if (name === 'Term_72m' && value === '72') {
                    checkbox.check();
                    //checkbox.enableReadOnly(); // Lock the checkbox state
                    console.log(`✓ Checked: ${name}`);
                }
                if (name === 'Term_84m' && value === '84') {
                    checkbox.check();
                    // checkbox.enableReadOnly(); // Lock the checkbox state
                    console.log(`✓ Checked: ${name}`);
                }
                if (name === 'Term_96m' && value === '96') {
                    checkbox.check();
                    // checkbox.enableReadOnly(); // Lock the checkbox state
                    console.log(`✓ Checked: ${name}`);
                }
                checkbox.enableReadOnly(); // Lock the checkbox state
                console.log(`✓ Checked: ${name}`);
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
    // Signature overlay (if provided)
    if (payload.customerSignaturePngBase64) {
        try {
            const pngBytes = Buffer.from(payload.customerSignaturePngBase64, 'base64');
            const png = await pdfDoc.embedPng(pngBytes);
            const page = pdfDoc.getPages()[0];
            page.drawImage(png, {
                x: SIGN_X,
                y: SIGN_Y,
                width: SIGN_W,
                height: SIGN_H
            });
        }
        catch (error) {
            console.warn('Failed to embed signature:', error);
        }
    }
    form.updateFieldAppearances();
    return await pdfDoc.save();
}
