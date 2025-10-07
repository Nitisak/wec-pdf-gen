#!/bin/bash

set -e

echo "=== Uploading New PDF Templates to MinIO ==="

# Wait for MinIO to be ready
echo "Waiting for MinIO to be ready..."
sleep 3

# Configure mc alias
docker exec wec-minio mc alias set myminio http://localhost:9000 minioadmin minioadmin

# Upload the three PDF templates
echo "Uploading fillable PDF template (01)..."
docker cp assets/001_Contract\ 2/ContractPSVSCTemplate_HT_v07_01.pdf wec-minio:/tmp/template_01.pdf
docker exec wec-minio chmod 644 /tmp/template_01.pdf
docker exec wec-minio mc cp /tmp/template_01.pdf myminio/wecover-pdfs/templates/ContractPSVSCTemplate_HT_v07_01.pdf

echo "Uploading Terms PDF (02)..."
docker cp assets/001_Contract\ 2/ContractPSVSCTemplate_HT_v07_02.pdf wec-minio:/tmp/template_02.pdf
docker exec wec-minio chmod 644 /tmp/template_02.pdf
docker exec wec-minio mc cp /tmp/template_02.pdf myminio/wecover-pdfs/templates/ContractPSVSCTemplate_HT_v07_02.pdf

echo "Uploading Disclosure PDF (03)..."
docker cp assets/001_Contract\ 2/ContractPSVSCTemplate_HT_v07_03.pdf wec-minio:/tmp/template_03.pdf
docker exec wec-minio chmod 644 /tmp/template_03.pdf
docker exec wec-minio mc cp /tmp/template_03.pdf myminio/wecover-pdfs/templates/ContractPSVSCTemplate_HT_v07_03.pdf

# Verify
echo "Verifying uploads..."
docker exec wec-minio mc ls myminio/wecover-pdfs/templates/

echo "✅ All PDF templates uploaded successfully!"

