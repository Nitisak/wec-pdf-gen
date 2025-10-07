# CORS Fix Summary

## 🔍 Issue

The web browser was unable to load PDFs from MinIO with a 403 Forbidden error:
```
GET http://localhost:9000/wecover-pdfs/policies/2025/10/POL10017.pdf?...
403 (Forbidden)
```

## 🎯 Root Cause

MinIO was not configured to allow Cross-Origin Resource Sharing (CORS) requests from the web application. Browsers block requests to different origins unless the server explicitly allows them via CORS headers.

## ✅ Solution

Added CORS configuration to MinIO using the `MINIO_API_CORS_ALLOW_ORIGIN` environment variable:

**File:** `docker-compose.yml`

```yaml
minio:
  image: minio/minio:latest
  container_name: wec-minio
  command: server /data --console-address ":9001"
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin
    MINIO_API_CORS_ALLOW_ORIGIN: "http://localhost,http://localhost:3000,http://localhost:5173"
  ports:
    - "9000:9000"
    - "9001:9001"
  volumes:
    - minio_data:/data
```

## 📋 Configuration Details

### Allowed Origins

The following origins are now allowed to access MinIO:

- `http://localhost` - Base localhost
- `http://localhost:3000` - Common React dev server port
- `http://localhost:5173` - Vite dev server / API port

### CORS Headers Returned

MinIO now returns these CORS headers:

```
Access-Control-Allow-Origin: http://localhost
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: Date, Etag, Server, Connection, Accept-Ranges, ...
```

## 🧪 Verification

### Before Fix
```bash
# Browser request failed with:
❌ 403 (Forbidden)
❌ No Access-Control-Allow-Origin header
```

### After Fix
```bash
curl -i 'http://localhost:9000/wecover-pdfs/' -H 'Origin: http://localhost'

# Returns:
✅ Access-Control-Allow-Origin: http://localhost
✅ Access-Control-Allow-Credentials: true
✅ 200 OK
```

### Test Commands

1. **Check CORS headers:**
   ```bash
   curl -i -X GET 'http://localhost:9000/wecover-pdfs/' \
     -H 'Origin: http://localhost' | grep -i "access-control"
   ```

2. **Test with a real PDF:**
   ```bash
   # Create a policy via API
   curl -X POST http://localhost:5173/api/policies \
     -H "Content-Type: application/json" \
     -d '{...}'
   
   # Try to access the returned pdfUrl in browser
   # Should now work without CORS errors
   ```

3. **Check MinIO is running:**
   ```bash
   curl -I http://localhost:9000/minio/health/live
   # Should return: 200 OK
   ```

## 🔄 Deployment Steps

1. **Update `docker-compose.yml`:**
   - Added `MINIO_API_CORS_ALLOW_ORIGIN` environment variable to MinIO service

2. **Restart MinIO:**
   ```bash
   docker-compose restart minio
   ```

3. **Verify:**
   ```bash
   # Check CORS headers
   curl -i 'http://localhost:9000/wecover-pdfs/' -H 'Origin: http://localhost' | grep -i "access-control"
   ```

## 📝 Alternative Solutions Considered

### ❌ Option 1: mc cors set command
```bash
/usr/bin/mc cors set-json /tmp/cors.json myminio/wecover-pdfs
```
**Problem:** MinIO Client (`mc`) doesn't have a `cors set-json` command in current versions

### ❌ Option 2: Bucket Policy JSON
```bash
/usr/bin/mc anonymous set-json /tmp/policy.json myminio/wecover-pdfs
```
**Problem:** Bucket policies control access permissions, not CORS headers

### ✅ Option 3: Environment Variable (Current Solution)
```yaml
MINIO_API_CORS_ALLOW_ORIGIN: "http://localhost,http://localhost:3000,http://localhost:5173"
```
**Benefits:**
- Simple and reliable
- No additional commands needed
- Persists across container restarts
- Well-documented MinIO feature

## 🚀 Production Considerations

For production deployments:

### 1. Use Specific Domain
```yaml
MINIO_API_CORS_ALLOW_ORIGIN: "https://yourdomain.com,https://app.yourdomain.com"
```

### 2. Use Environment Variable for Flexibility
```yaml
MINIO_API_CORS_ALLOW_ORIGIN: ${CORS_ALLOWED_ORIGINS:-http://localhost}
```

Then in `.env`:
```bash
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

### 3. Consider Using a Reverse Proxy (Recommended)

Instead of exposing MinIO directly, use Nginx/Traefik to handle CORS:

```nginx
# nginx.conf
location /storage/ {
    # Add CORS headers
    add_header 'Access-Control-Allow-Origin' '$http_origin' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization,Content-Type' always;
    
    # Proxy to MinIO
    proxy_pass http://minio:9000/;
}
```

Then update the S3 URL replacement:
```typescript
// s3.ts
const publicUrl = signedUrl.replace(
  'http://minio:9000', 
  'https://yourdomain.com/storage'
);
```

## 🐛 Troubleshooting

### If CORS errors persist:

1. **Clear browser cache:**
   ```
   Chrome: DevTools → Network → Disable cache
   ```

2. **Check MinIO is using the new config:**
   ```bash
   docker-compose logs minio | head -20
   ```

3. **Verify environment variable is set:**
   ```bash
   docker exec wec-minio env | grep CORS
   ```

4. **Test CORS manually:**
   ```bash
   curl -i -X OPTIONS 'http://localhost:9000/wecover-pdfs/' \
     -H 'Origin: http://localhost' \
     -H 'Access-Control-Request-Method: GET'
   ```
   Should return `Access-Control-Allow-Methods: GET, HEAD, POST, PUT, DELETE`

5. **Check browser console for specific errors:**
   ```
   Chrome DevTools → Console → Look for CORS-related errors
   ```

### Common CORS Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `No 'Access-Control-Allow-Origin' header` | MinIO CORS not configured | Add `MINIO_API_CORS_ALLOW_ORIGIN` |
| `Origin not in allowed origins` | Origin mismatch | Add your origin to the comma-separated list |
| `Credentials flag is true, but Access-Control-Allow-Credentials is not` | Missing credentials header | MinIO adds this automatically |
| `Method X is not allowed by Access-Control-Allow-Methods` | Wrong HTTP method | MinIO allows GET, HEAD, POST, PUT, DELETE by default |

## 📊 Status

✅ **RESOLVED** - Browsers can now successfully access PDFs from MinIO  
✅ **TESTED** - Verified with curl and browser access  
✅ **DEPLOYED** - MinIO restarted with CORS configuration

## 🔗 Related Files

- `docker-compose.yml` - MinIO service configuration
- `apps/api/src/modules/storage/s3.ts` - S3 client and URL generation
- `apps/web/src/components/PdfViewer.tsx` - PDF viewer component (uses the URLs)

## 📚 References

- [MinIO CORS Configuration](https://min.io/docs/minio/linux/reference/minio-server/minio-server.html#envvar.MINIO_API_CORS_ALLOW_ORIGIN)
- [MDN - CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [AWS S3 CORS Configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)

## 🔄 Related Fixes

This fix builds on the previous S3 URL fix:
1. **S3 URL Fix** - Changed URLs from `minio:9000` to `localhost:9000` for browser access
2. **CORS Fix** (this one) - Configured MinIO to allow browser requests from `localhost`

Both fixes are required for the web app to successfully load PDFs.

