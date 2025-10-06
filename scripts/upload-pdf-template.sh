#!/bin/bash

set -e

echo "=== Uploading PDF Template to MinIO ==="

# Wait for MinIO to be ready
echo "Waiting for MinIO to be ready..."
sleep 5

# Configure mc alias
docker exec wec-minio mc alias set myminio http://localhost:9000 minioadmin minioadmin

# Upload the PDF template
echo "Uploading PDF template..."
docker cp assets/ContractPSVSCTemplate_HT_v07_Form1.pdf wec-minio:/tmp/template.pdf
docker exec wec-minio chmod 644 /tmp/template.pdf
docker exec wec-minio sh -c "mc cp /tmp/template.pdf myminio/wecover-pdfs/templates/ContractPSVSCTemplate_HT_v07_Form.pdf"

# Verify
echo "Verifying upload..."
docker exec wec-minio mc ls myminio/wecover-pdfs/templates/

echo "✅ PDF template uploaded successfully!"

