# Three-Page Form Handling Summary

## PDF Structure

**`ContractPSVSCTemplate_HT_v07_01.pdf`** contains 3 pages:
- **Page 1**: Dealer Copy (filled with form data)
- **Page 2**: Internal page (typically left blank)
- **Page 3**: Customer Copy (filled with same form data as Page 1)

## How AcroForm Filling Works

### Automatic Field Synchronization
When a PDF has form fields with the **same name** on multiple pages, filling that field once automatically fills it on **all pages**.

For example:
- If `Text_Owner_Firstname` exists on Page 1 and Page 3
- Setting it once will show the value on both pages

### Our Current Implementation

The code in `fillAcroForm.ts`:
1. **Fills all form fields once** - automatically appears on all relevant pages
2. **Adds signature overlay to both Page 1 and Page 3** - ensures signatures appear on both Dealer and Customer copies

```typescript
// Form fields are filled once and auto-sync
for (const [name, value] of Object.entries(fields)) {
  const textField = form.getTextField(name);
  textField.setText(String(value));
}

// Signatures are overlaid on specific pages
if (payload.customerSignaturePngBase64) {
  // Page 1 (Dealer Copy)
  pages[0].drawImage(png, { x: 360, y: 120, width: 140, height: 40 });
  
  // Page 3 (Customer Copy)  
  if (pages.length >= 3) {
    pages[2].drawImage(png, { x: 360, y: 120, width: 140, height: 40 });
  }
}
```

## Final Merged PDF Structure

After merging all three PDF templates, the final policy PDF contains:

1. **Pages 1-3**: From `ContractPSVSCTemplate_HT_v07_01.pdf`
   - Page 1: Filled Dealer Copy
   - Page 2: Internal (blank)
   - Page 3: Filled Customer Copy
   
2. **Pages 4-X**: From `ContractPSVSCTemplate_HT_v07_02.pdf`
   - Contract Terms (static PDF)
   
3. **Pages X+1-Y**: From `ContractPSVSCTemplate_HT_v07_03.pdf`
   - State Disclosure (static PDF)

## Verification

### Check if Page 3 is Being Filled

If you find that Page 3 (Customer Copy) is not being filled, it could mean:

1. **Different Field Names**: Page 3 fields might have different names (e.g., `Text_Owner_Firstname_Customer` vs `Text_Owner_Firstname`)
   
2. **Solution**: Update `mapping.ts` to include both sets of field names:
   ```typescript
   export const toAcroFields = (p: PolicyCreate) => ({
     // Page 1 fields (Dealer Copy)
     Text_Owner_Firstname: p.owner.firstName,
     // ... other fields
     
     // Page 3 fields (Customer Copy) - if they have different names
     Text_Owner_Firstname_Customer: p.owner.firstName,
     // ... other fields with _Customer suffix
   });
   ```

### How to Inspect Field Names

To check what field names exist in the PDF:

```bash
# From your local machine (requires pdf-lib)
cd apps/api
npm run build
node -e "
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function listFields() {
  const pdf = fs.readFileSync('../../assets/001_Contract 2/ContractPSVSCTemplate_HT_v07_01.pdf');
  const doc = await PDFDocument.load(pdf);
  const form = doc.getForm();
  const fields = form.getFields();
  
  console.log('Total fields:', fields.length);
  fields.forEach(f => console.log(' -', f.getName()));
}

listFields();
"
```

## Current Status

✅ **What's Working**:
- Form fields are being filled correctly
- Signatures are added to Page 1
- Code is ready to add signatures to Page 3 when the PDF has 3 pages
- All three PDFs merge correctly in final output

⚠️ **What Needs Verification**:
- Whether `ContractPSVSCTemplate_HT_v07_01.pdf` actually has 3 pages (currently showing as 1 page in logs)
- Whether Page 3 fields have the same names as Page 1 or different names
- Correct signature coordinates for Page 3

## Next Steps

If Page 3 is not being filled:

1. **Inspect the PDF** to confirm it has 3 pages and identify field names
2. **Update mapping.ts** if Page 3 fields have different names
3. **Adjust signature coordinates** for Page 3 if needed (may be different from Page 1)
4. **Test with actual PDF viewer** (not just logs) to see all pages

## Testing

```bash
# Generate a test PDF
curl -s -X POST 'http://localhost:5173/api/policies?dryRun=true' \
  -H "Content-Type: application/json" \
  -d '{...policy data...}' | jq -r '.pdfUrl' > test.txt

# Extract base64 and save as PDF
cat test.txt | sed 's/data:application\/pdf;base64,//' | base64 -d > test_policy.pdf

# Open and verify all pages are filled
open test_policy.pdf
```

## Notes

- The base fillable template (`_01.pdf`) having only 1 page vs 3 pages affects how we handle signatures
- If it's truly 3 pages, the current code will handle it correctly
- If it's 1 page that gets printed 3 times, then only the first instance needs filling
- **Always test with the actual PDF viewer** to see the final result, not just console logs

