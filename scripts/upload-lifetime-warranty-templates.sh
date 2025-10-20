#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "=== Uploading Lifetime Warranty PDF Templates to MinIO ==="

# Wait for MinIO to be ready
echo "Waiting for MinIO to be ready..."
until docker exec wec_minio curl -f http://localhost:9000/minio/health/live > /dev/null 2>&1; do
  printf '.'
  sleep 1
done
echo ""
echo "MinIO is ready!"

# Copy PDF template files into the MinIO container's /tmp directory
echo "Copying PDF files to MinIO container..."
docker cp "assets/002_LifeTimeWarranty/AGVSC_LifeTime_V04_01_Form.pdf" wec_minio:/tmp/lifetime_01.pdf
docker cp "assets/002_LifeTimeWarranty/AGVSC_LifeTime_V04_02_Contract.pdf" wec_minio:/tmp/lifetime_02.pdf
docker cp "assets/002_LifeTimeWarranty/AGVSC_LifeTime_V04_03_State.pdf" wec_minio:/tmp/lifetime_03.pdf

# Upload the PDF templates to MinIO
echo "Uploading fillable PDF template (01)..."
docker exec wec_minio mc cp /tmp/lifetime_01.pdf myminio/wecover-pdfs/templates/AGVSC_LifeTime_V04_01_Form.pdf

echo "Uploading Contract and Terms PDF (02)..."
docker exec wec_minio mc cp /tmp/lifetime_02.pdf myminio/wecover-pdfs/templates/AGVSC_LifeTime_V04_02_Contract.pdf

echo "Uploading State Disclosure PDF (03)..."
docker exec wec_minio mc cp /tmp/lifetime_03.pdf myminio/wecover-pdfs/templates/AGVSC_LifeTime_V04_03_State.pdf

# Verify uploads
echo ""
echo "Verifying uploads..."
docker exec wec_minio mc ls myminio/wecover-pdfs/templates/ | grep "AGVSC_LifeTime"

echo ""
echo "✅ All Lifetime Warranty PDF templates uploaded successfully!"

