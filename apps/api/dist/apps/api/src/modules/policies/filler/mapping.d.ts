import { PolicyCreate } from '@wec/shared/policySchemas';
/**
 * Maps PolicyCreate payload to AcroForm field names based on product version
 */
export declare const toAcroFields: (p: PolicyCreate) => Record<string, string>;
