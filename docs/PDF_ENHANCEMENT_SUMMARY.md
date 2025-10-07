# PDF Enhancement Summary

## Overview
Enhanced the PDF generation pipeline to use three separate PDF files instead of rendering HTML to PDF for Terms and Disclosures.

## Changes Made

### 1. New PDF Template Structure

The system now uses three separate PDF files:

1. **`ContractPSVSCTemplate_HT_v07_01.pdf`** - Fillable AcroForm PDF
   - Used as the base template for filling customer, vehicle, dealer, and coverage information
   - Contains all the form fields (text inputs and checkboxes)
   - Location: `templates/ContractPSVSCTemplate_HT_v07_01.pdf` in MinIO

2. **`ContractPSVSCTemplate_HT_v07_02.pdf`** - Contract Terms (Static PDF)
   - Contains the policy terms and conditions
   - No longer rendered from HTML, uses pre-designed PDF
   - Location: `templates/ContractPSVSCTemplate_HT_v07_02.pdf` in MinIO

3. **`ContractPSVSCTemplate_HT_v07_03.pdf`** - State Disclosure (Static PDF)
   - Contains state-specific disclosure information
   - No longer rendered from HTML, uses pre-designed PDF
   - Location: `templates/ContractPSVSCTemplate_HT_v07_03.pdf` in MinIO

### 2. Code Changes

#### `apps/api/src/modules/policies/service/policies.service.ts`
- **Removed dependencies**: No longer imports `renderTermsToPdf` and `renderDisclosureToPdf`
- **Added helper functions**:
  - `loadTermsPdf()`: Loads the static Terms PDF from S3
  - `loadDisclosurePdf()`: Loads the static Disclosure PDF from S3
- **Updated `assemblePolicyPdf()`**: Now loads static PDFs instead of rendering HTML

```typescript
async function assemblePolicyPdf(payload: PolicyCreate): Promise<Uint8Array> {
  // 1. Fill AcroForm
  const filledForm = await fillAcroForm(payload);
  
  // 2. Load Terms PDF (static PDF file, no rendering needed)
  const termsPdf = await loadTermsPdf();
  
  // 3. Load Disclosure PDF (static PDF file, no rendering needed)
  const disclosurePdf = await loadDisclosurePdf();
  
  // 4. Merge PDFs in order: Filled Form → Terms → Disclosures
  const mergedPdf = await mergePdfs([filledForm, termsPdf, disclosurePdf]);
  
  return mergedPdf;
}
```

#### `apps/api/src/modules/policies/filler/fillAcroForm.ts`
- Updated to use the new fillable template key: `ContractPSVSCTemplate_HT_v07_01.pdf`
- Falls back to environment variable `PDF_TEMPLATE_KEY` if set

#### `apps/api/env.example`
Added new environment variables:
```env
PDF_TEMPLATE_KEY=templates/ContractPSVSCTemplate_HT_v07_01.pdf
PDF_TERMS_KEY=templates/ContractPSVSCTemplate_HT_v07_02.pdf
PDF_DISCLOSURE_KEY=templates/ContractPSVSCTemplate_HT_v07_03.pdf
```

### 3. Upload Script

Created `scripts/upload-new-templates.sh` to upload the three new PDF files to MinIO:
```bash
./scripts/upload-new-templates.sh
```

This script:
- Uploads all three PDF files to MinIO
- Places them in the `templates/` directory
- Verifies successful upload

## Benefits

1. **Better Design Control**: Terms and Disclosures are now professionally designed PDFs with exact layout control
2. **Faster Generation**: No need to render HTML to PDF using Playwright (significant performance improvement)
3. **Simplified Dependencies**: No longer need Playwright for HTML rendering (though still installed)
4. **Consistent Output**: Static PDFs ensure consistent appearance across all generated policies
5. **Easier Updates**: To update Terms or Disclosures, simply replace the PDF file in MinIO

## Migration Steps

To migrate an existing deployment:

1. **Upload the new PDF templates**:
   ```bash
   ./scripts/upload-new-templates.sh
   ```

2. **Rebuild and restart the API**:
   ```bash
   docker-compose build api
   docker-compose up -d api
   ```

3. **Test PDF generation**:
   ```bash
   curl -s -X POST 'http://localhost:5173/api/policies?dryRun=true' \
     -H "Content-Type: application/json" \
     -d '{
       "policyNumber":"TEST-001",
       "productVersion":"WEC-PS-VSC-09-2025",
       "stateCode":"FL",
       "owner":{...},
       "dealer":{...},
       "vehicle":{...},
       "coverage":{...}
     }' | jq -r '.pdfUrl'
   ```

## File Structure

```
assets/001_Contract 2/
├── ContractPSVSCTemplate_HT_v07_01.pdf  (919 KB) - Fillable form
├── ContractPSVSCTemplate_HT_v07_02.pdf  (662 KB) - Contract Terms
└── ContractPSVSCTemplate_HT_v07_03.pdf  (696 KB) - State Disclosure

MinIO (wecover-pdfs bucket):
└── templates/
    ├── ContractPSVSCTemplate_HT_v07_01.pdf
    ├── ContractPSVSCTemplate_HT_v07_02.pdf
    └── ContractPSVSCTemplate_HT_v07_03.pdf
```

## Testing

The system has been tested and verified to:
- ✅ Successfully fill the AcroForm with customer data
- ✅ Correctly set term checkboxes (72m, 84m, 96m)
- ✅ Merge all three PDFs in the correct order
- ✅ Generate valid PDF output
- ✅ Handle both dry-run and persisted policy creation

## Notes

- The old HTML templates in `assets/html-templates/` are no longer used but kept for reference
- Playwright is still installed and can be used for other purposes if needed
- The system still supports the HTML rendering functions but they are not called in the main pipeline

