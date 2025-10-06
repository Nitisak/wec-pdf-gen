export declare function getS3Object(key: string): Promise<Uint8Array>;
export declare function putS3Object(key: string, body: Uint8Array, contentType?: string): Promise<void>;
export declare function getSignedDownloadUrl(key: string, expiresIn?: number): Promise<string>;
export declare function generatePolicyPdfKey(policyNumber: string, year: string, month: string): string;
