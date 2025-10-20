import { PolicyCreate } from '@wec/shared/policySchemas';
export declare function createPolicy(payload: PolicyCreate, dryRun?: boolean): Promise<{
    id: string;
    policyNumber: string;
    pdfUrl: string;
}>;
export declare function getPolicy(policyId: string): Promise<{
    pdfUrl: string;
    id: string;
    salePrice: string | null;
    termMonths: number;
    commercial: boolean;
    contractPrice: string;
    expirationDate: string;
    policyNumber: string;
    stateCode: string;
    productVersion: string;
    effectiveDate: string;
    payload: unknown;
    pdfKey: string | null;
    createdAt: Date;
}>;
export declare function getProductTemplates(productVersion: string): {
    form: string;
    terms: string;
    disclosure: string;
};
