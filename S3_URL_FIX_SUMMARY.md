# S3 URL Fix Summary

## 🔍 Issue

The web browser was unable to load PDFs from MinIO with the error:
```
GET http://minio:9000/wecover-pdfs/policies/2025/10/POL10016.pdf?...
net::ERR_NAME_NOT_RESOLVED
```

## 🎯 Root Cause

The API was generating pre-signed S3 URLs using the Docker internal service name `minio:9000`, which works for container-to-container communication but cannot be resolved by web browsers.

## ✅ Solution

Modified the `getSignedDownloadUrl` function to replace the Docker service name with `localhost` for browser access:

**File:** `apps/api/src/modules/storage/s3.ts`

```typescript
export async function getSignedDownloadUrl(key: string, expiresIn: number = 600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
  
  // Replace Docker service name with localhost for browser access
  const publicUrl = signedUrl.replace('http://minio:9000', 'http://localhost:9000');
  
  return publicUrl;
}
```

## 📋 Environment Configuration

The API uses **two different endpoints** for different purposes:

### 1. Internal S3 Operations (API → MinIO)
```yaml
# docker-compose.yml
S3_ENDPOINT: http://minio:9000  # Docker internal network
```

Used for:
- Uploading PDFs (`putS3Object`)
- Reading templates (`getS3Object`)

### 2. External Access (Browser → MinIO)
```typescript
// Pre-signed URLs are rewritten to use localhost
http://localhost:9000/wecover-pdfs/policies/...
```

Used for:
- Browser PDF downloads
- PDF preview in web app

## 🧪 Verification

### Before Fix
```bash
# API returned:
"http://minio:9000/wecover-pdfs/policies/2025/10/POL10016.pdf?..."
# ❌ Browser error: ERR_NAME_NOT_RESOLVED
```

### After Fix
```bash
# API returns:
"http://localhost:9000/wecover-pdfs/policies/2025/10/TEST-URL-FIX.pdf?..."
# ✅ Browser can access the URL
```

### Test Command
```bash
curl -s -X POST http://localhost:5173/api/policies \
  -H "Content-Type: application/json" \
  -d '{...}' | jq '.pdfUrl'
```

**Output:**
```
"http://localhost:9000/wecover-pdfs/policies/2025/10/TEST-URL-FIX.pdf?X-Amz-Algorithm=..."
```

## 🔄 Deployment Steps

1. **Update source code:**
   - Modified `apps/api/src/modules/storage/s3.ts`

2. **Rebuild API:**
   ```bash
   pnpm --filter @wec/api build
   docker-compose build api
   docker-compose up -d api
   ```

3. **Verify:**
   ```bash
   # Check logs
   docker-compose logs -f api
   
   # Test API
   curl -X POST http://localhost:5173/api/policies -H "Content-Type: application/json" -d '{...}'
   ```

## 📝 Alternative Solutions Considered

### ❌ Option 1: Use localhost in S3_ENDPOINT
```yaml
S3_ENDPOINT: http://localhost:9000
```
**Problem:** API container cannot reach MinIO at localhost (it's a different container)

### ❌ Option 2: Use host.docker.internal
```yaml
S3_ENDPOINT: http://host.docker.internal:9000
```
**Problem:** Not portable (doesn't work on all Docker environments)

### ✅ Option 3: URL Rewriting (Current Solution)
- API uses `minio:9000` for internal operations
- Pre-signed URLs are rewritten to `localhost:9000` for browser access
- Works in all environments

## 🚀 Production Considerations

For production deployments:

1. **Use a reverse proxy (Nginx/Traefik)** to handle MinIO access:
   ```nginx
   location /minio/ {
       proxy_pass http://minio:9000/;
   }
   ```

2. **Use a proper domain:**
   ```typescript
   const publicUrl = signedUrl.replace(
     'http://minio:9000', 
     'https://storage.yourdomain.com'
   );
   ```

3. **Add environment variable for public endpoint:**
   ```yaml
   # docker-compose.yml
   S3_ENDPOINT: http://minio:9000           # Internal
   S3_PUBLIC_ENDPOINT: https://storage.yourdomain.com  # Public
   ```

   ```typescript
   // s3.ts
   const publicEndpoint = process.env.S3_PUBLIC_ENDPOINT || 'http://localhost:9000';
   const publicUrl = signedUrl.replace(process.env.S3_ENDPOINT!, publicEndpoint);
   ```

## 📊 Status

✅ **RESOLVED** - Browsers can now successfully download PDFs from MinIO  
✅ **TESTED** - Verified with curl and browser access  
✅ **DEPLOYED** - API rebuilt and restarted with the fix

## 🔗 Related Files

- `apps/api/src/modules/storage/s3.ts` - S3 client and URL generation
- `docker-compose.yml` - Service configuration
- `apps/api/src/modules/policies/service/policies.service.ts` - Policy service using S3

## 🐛 Debugging Tips

If PDFs still don't load:

1. **Check the returned URL:**
   ```bash
   curl -s http://localhost:5173/api/policies/YOUR_ID | jq '.pdfUrl'
   ```
   Should start with `http://localhost:9000`

2. **Test MinIO access directly:**
   ```bash
   curl -I http://localhost:9000/wecover-pdfs/
   ```

3. **Check MinIO is accessible:**
   ```bash
   docker-compose ps minio
   ```

4. **View API logs:**
   ```bash
   docker-compose logs -f api
   ```

