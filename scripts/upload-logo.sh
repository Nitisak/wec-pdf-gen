#!/bin/bash
# Upload WeCoverUSA logo to MinIO

echo "📤 Uploading WeCoverUSA logo to MinIO..."

# Upload logo
docker exec wec-minio mc cp /tmp/logo.png myminio/wecover-pdfs/templates/logo.png 2>/dev/null || \
docker cp assets/00_Logos/logo.png wec-minio:/tmp/logo.png && \
docker exec wec-minio mc cp /tmp/logo.png myminio/wecover-pdfs/templates/logo.png

echo "✅ Logo uploaded successfully to templates/logo.png"

# Verify upload
docker exec wec-minio mc ls myminio/wecover-pdfs/templates/ | grep logo.png

echo "✅ Logo upload complete!"

