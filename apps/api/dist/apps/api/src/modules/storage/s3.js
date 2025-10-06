import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
const s3Client = new S3Client({
    endpoint: process.env.S3_ENDPOINT || 'http://127.0.0.1:9000',
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin'
    },
    forcePathStyle: true // Required for MinIO
});
const BUCKET = process.env.S3_BUCKET || 'wecover-pdfs';
const PUBLIC_ENDPOINT = process.env.S3_PUBLIC_ENDPOINT || 'http://localhost:9000';
export async function getS3Object(key) {
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: key
    });
    const response = await s3Client.send(command);
    if (!response.Body) {
        throw new Error(`No body found for S3 object: ${key}`);
    }
    const chunks = [];
    const stream = response.Body;
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }
    return result;
}
export async function putS3Object(key, body, contentType) {
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType || 'application/pdf'
    });
    await s3Client.send(command);
}
export async function getSignedDownloadUrl(key, expiresIn = 600) {
    // Since the bucket is set to public, return a direct URL
    // No signature needed for public buckets
    return `${PUBLIC_ENDPOINT}/${BUCKET}/${key}`;
}
export function generatePolicyPdfKey(policyNumber, year, month) {
    return `policies/${year}/${month}/${policyNumber}.pdf`;
}
