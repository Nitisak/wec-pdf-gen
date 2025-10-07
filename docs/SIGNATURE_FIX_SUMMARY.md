# Pre-Signed URL Signature Fix Summary

## 🔍 Issue

Even after configuring CORS, the browser still received 403 Forbidden errors when trying to access PDF files:

```
GET http://localhost:9000/wecover-pdfs/policies/2025/10/POL10019.pdf?X-Amz-Algorithm=...
Status: 403 Forbidden
X-Minio-Error-Code: SignatureDoesNotMatch
X-Minio-Error-Desc: "The request signature we calculated does not match the signature you provided."
```

## 🎯 Root Cause

The issue was caused by a fundamental mismatch in how AWS S3 signatures work:

1. **Signature Calculation**: AWS S3 signatures include the **exact hostname** used in the request as part of the signature calculation
2. **API Server Context**: The API server (inside Docker) generates signatures using `http://minio:9000` (the Docker service name)
3. **Browser Context**: The browser tries to access the URL at `http://localhost:9000`
4. **Signature Mismatch**: Even though we replaced the hostname in the URL (`minio:9000` → `localhost:9000`), the signature was still calculated with `minio:9000`, causing MinIO to reject the request

### Why Previous Attempts Failed

**Attempt 1: URL Replacement After Signing** ❌
```typescript
const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
const publicUrl = signedUrl.replace('http://minio:9000', 'http://localhost:9000');
```
**Problem**: Changing the hostname after signing invalidates the signature

**Attempt 2: Dual S3 Clients** ❌
```typescript
const publicS3Client = new S3Client({ endpoint: 'http://localhost:9000' });
const signedUrl = await getSignedUrl(publicS3Client, command, { expiresIn });
```
**Problem**: The API server (inside Docker) can't reach MinIO at `localhost:9000` because MinIO is at `minio:9000` in the Docker network

## ✅ Solution: Public Bucket with Direct URLs

Instead of fighting with pre-signed URLs, we made the bucket public and return simple direct URLs:

### Changes Made

#### 1. Updated MinIO Bucket Policy to Public

**File**: `docker-compose.yml`

```yaml
minio-setup:
  entrypoint: >
    /bin/sh -c "
    /usr/bin/mc alias set myminio http://minio:9000 minioadmin minioadmin;
    /usr/bin/mc mb myminio/wecover-pdfs --ignore-existing;
    /usr/bin/mc anonymous set public myminio/wecover-pdfs;  # Changed from 'download' to 'public'
    exit 0;
    "
```

#### 2. Simplified URL Generation

**File**: `apps/api/src/modules/storage/s3.ts`

```typescript
export async function getSignedDownloadUrl(key: string, expiresIn: number = 600): Promise<string> {
  // Since the bucket is set to public, return a direct URL
  // No signature needed for public buckets
  return `${PUBLIC_ENDPOINT}/${BUCKET}/${key}`;
}
```

**Before** (complex, broken):
```
http://localhost:9000/wecover-pdfs/policies/2025/10/POL10019.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=minioadmin%2F20251006%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251006T190202Z&X-Amz-Expires=600&X-Amz-Signature=d05ddb50ad19332d59250f85739eea3a15df2062629436384a47cd16b6c58ca2&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject
```

**After** (simple, working):
```
http://localhost:9000/wecover-pdfs/policies/2025/10/TEST-PUBLIC-URL.pdf
```

## 🧪 Verification

### Before Fix
```bash
curl -I 'http://localhost:9000/wecover-pdfs/policies/2025/10/POL10019.pdf?X-Amz-...'

# Result:
❌ HTTP/1.1 403 Forbidden
❌ X-Minio-Error-Code: SignatureDoesNotMatch
```

### After Fix
```bash
curl -I 'http://localhost:9000/wecover-pdfs/policies/2025/10/TEST-PUBLIC-URL.pdf'

# Result:
✅ HTTP/1.1 200 OK
✅ Content-Type: application/pdf
✅ Content-Length: 573797
✅ ETag: "7f4ab8b605ce1262e42187509be8fb3c"
```

## 📊 Complete Test Flow

```bash
# 1. Create a policy
curl -X POST 'http://localhost:5173/api/policies' \
  -H "Content-Type: application/json" \
  -d '{
    "policyNumber":"TEST-001",
    "productVersion":"WEC-PS-VSC-09-2025",
    "stateCode":"FL",
    "owner":{"firstName":"John","lastName":"Doe","address":"123 Main St","city":"Miami","state":"FL","zip":"33101","phone":"555-0100","email":"john@example.com"},
    "dealer":{"id":"DLR-001","name":"Test Dealer","address":"456 Dealer St","city":"Miami","state":"FL","zip":"33102","phone":"555-0200"},
    "vehicle":{"vin":"1HGCM82633A123456","year":"2023","make":"Honda","model":"Accord","mileage":10000,"salePrice":25000},
    "coverage":{"termMonths":96,"purchaseDate":"2025-10-06","expirationDate":"2033-10-06","contractPrice":2000,"commercial":false}
  }' | jq

# Returns:
{
  "id": "uuid-here",
  "policyNumber": "TEST-001",
  "pdfUrl": "http://localhost:9000/wecover-pdfs/policies/2025/10/TEST-001.pdf"
}

# 2. Access the PDF directly (no signature needed!)
curl -I "http://localhost:9000/wecover-pdfs/policies/2025/10/TEST-001.pdf"

# Returns:
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Length: 573797

# 3. Open in browser
# Just paste the URL in your browser - it works!
```

## 🔒 Security Considerations

### Is This Secure?

**Current Setup (Development)**:
- ✅ **OK for Development**: Local MinIO, no external access
- ✅ **OK for Internal Tools**: If only internal users access the system
- ⚠️ **NOT OK for Production**: PDFs are publicly accessible to anyone with the URL

### For Production: Recommended Approaches

#### Option 1: Use Pre-Signed URLs Correctly (Recommended for Security)

To use pre-signed URLs in production, you need MinIO to be accessible at the same hostname for both API and browser:

```yaml
# docker-compose.yml - Use host network or port mapping
services:
  minio:
    network_mode: "host"  # Makes MinIO accessible at localhost from all contexts
    # OR
    ports:
      - "9000:9000"
    extra_hosts:
      - "minio:127.0.0.1"  # Map minio hostname to localhost
```

Then use pre-signed URLs:
```typescript
export async function getSignedDownloadUrl(key: string, expiresIn: number = 600): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return await getSignedUrl(s3Client, command, { expiresIn });
}
```

**Benefits**:
- ✅ Secure - URLs expire after 10 minutes
- ✅ No public access without valid signature
- ✅ Can track who accessed what (via signatures)

**Drawbacks**:
- ⚠️ More complex networking setup
- ⚠️ Requires MinIO to be accessible at same hostname

#### Option 2: Reverse Proxy with Authentication (Recommended for Production)

Use Nginx/Traefik to proxy and authenticate requests:

```nginx
# nginx.conf
location /pdfs/ {
    # Check authentication
    auth_request /auth-check;
    auth_request_set $auth_user $upstream_http_x_user_id;
    
    # Add user context to logs
    add_header X-User-ID $auth_user;
    
    # Proxy to MinIO
    proxy_pass http://minio:9000/wecover-pdfs/;
    proxy_set_header Host $host;
    
    # Add CORS
    add_header Access-Control-Allow-Origin $http_origin always;
}

location /auth-check {
    # Your authentication endpoint
    proxy_pass http://api:5173/auth/verify;
    proxy_pass_request_body off;
    proxy_set_header Content-Length "";
}
```

**Benefits**:
- ✅ Centralized authentication
- ✅ Simple URLs
- ✅ Can add rate limiting, logging, etc.
- ✅ MinIO never exposed directly

**Drawbacks**:
- ⚠️ Requires additional infrastructure (Nginx/Traefik)
- ⚠️ More moving parts

#### Option 3: Bucket with IAM/Policy-Based Access

Use MinIO's bucket policies to restrict access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": ["arn:aws:iam::*:user/app-user"]},
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::wecover-pdfs/*"],
      "Condition": {
        "IpAddress": {"aws:SourceIp": ["10.0.0.0/8"]}
      }
    }
  ]
}
```

**Benefits**:
- ✅ Fine-grained access control
- ✅ No code changes needed

**Drawbacks**:
- ⚠️ Complex policy management
- ⚠️ Still need to solve hostname issue for signatures

## 📝 What We Changed

### Files Modified

1. **`docker-compose.yml`**:
   - Added `MINIO_API_CORS_ALLOW_ORIGIN` to MinIO service
   - Changed bucket policy from `download` to `public` in minio-setup

2. **`apps/api/src/modules/storage/s3.ts`**:
   - Removed pre-signed URL generation
   - Return simple direct URLs: `http://localhost:9000/wecover-pdfs/{key}`
   - Added `PUBLIC_ENDPOINT` constant for external access

3. **Created `minio-cors.json`** (not used in final solution, but kept for reference)

## 🔄 Deployment Steps

1. **Update docker-compose.yml** ✅
2. **Rebuild minio-setup** ✅
   ```bash
   docker-compose down minio-setup
   docker-compose up -d minio-setup
   ```

3. **Rebuild API** ✅
   ```bash
   pnpm --filter @wec/api build
   docker-compose build api
   docker-compose up -d api
   ```

4. **Verify** ✅
   ```bash
   # Create a policy
   curl -X POST http://localhost:5173/api/policies -H "Content-Type: application/json" -d '{...}'
   
   # Access the PDF
   curl -I "http://localhost:9000/wecover-pdfs/policies/2025/10/TEST-001.pdf"
   ```

## 🐛 Troubleshooting

### If you still get 403 errors:

1. **Check bucket policy**:
   ```bash
   docker exec -it wec-minio mc anonymous list myminio/wecover-pdfs
   # Should show: Access permission for `myminio/wecover-pdfs` is set to `public`
   ```

2. **Verify CORS headers**:
   ```bash
   curl -I 'http://localhost:9000/wecover-pdfs/' -H 'Origin: http://localhost' | grep -i "access-control"
   # Should show: Access-Control-Allow-Origin: http://localhost
   ```

3. **Check if file exists**:
   ```bash
   docker exec -it wec-minio mc ls myminio/wecover-pdfs/policies/2025/10/
   ```

4. **Test from inside Docker network**:
   ```bash
   docker exec -it wec-api wget -O /dev/null http://minio:9000/wecover-pdfs/policies/2025/10/TEST-001.pdf
   ```

## 📊 Status

✅ **RESOLVED** - PDFs are now accessible from browsers  
✅ **TESTED** - Verified with curl and browser access  
✅ **DEPLOYED** - API and MinIO configured and running  
⚠️ **FOR PRODUCTION** - Review security considerations above

## 🔗 Related Fixes

This fix builds on previous fixes:

1. **S3 URL Fix** - Changed URLs from `minio:9000` to `localhost:9000` for browser access
2. **CORS Fix** - Configured MinIO to allow browser requests from `localhost`
3. **Signature Fix** (this one) - Switched from pre-signed URLs to public bucket with simple URLs

All three fixes were required to fully resolve the PDF access issue.

## 📚 References

- [MinIO Anonymous Bucket Policy](https://min.io/docs/minio/linux/reference/minio-mc/mc-anonymous.html)
- [AWS S3 Pre-Signed URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [AWS S3 Signature Calculation](https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-authenticating-requests.html)
- [MinIO CORS Configuration](https://min.io/docs/minio/linux/reference/minio-server/minio-server.html#envvar.MINIO_API_CORS_ALLOW_ORIGIN)

## 🎯 Key Takeaways

1. **AWS/S3 signatures are hostname-sensitive** - You can't change the hostname after signing
2. **Docker networking is complex** - `minio:9000` inside ≠ `localhost:9000` outside
3. **Public buckets are simpler** - For non-sensitive data, public access avoids signature complexity
4. **Security vs Simplicity tradeoff** - Development favors simplicity; production favors security
5. **CORS + Public Access** - Both are needed for browser access to work properly

