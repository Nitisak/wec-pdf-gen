export declare function getTermsTemplate(productVersion: string, language?: string): Promise<{
    id: string;
    stateCode: string | null;
    productVersion: string | null;
    createdAt: Date;
    kind: string;
    language: string;
    versionTag: string;
    s3Key: string;
}>;
export declare function getDisclosureTemplate(stateCode: string, language?: string): Promise<{
    id: string;
    stateCode: string | null;
    productVersion: string | null;
    createdAt: Date;
    kind: string;
    language: string;
    versionTag: string;
    s3Key: string;
}>;
export declare function renderTermsToPdf(productVersion: string, policyNumber: string, language?: string): Promise<Uint8Array>;
export declare function renderDisclosureToPdf(stateCode: string, language?: string): Promise<Uint8Array>;
