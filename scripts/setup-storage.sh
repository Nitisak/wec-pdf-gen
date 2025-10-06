#!/bin/bash

# Setup Storage and Seed Templates
# This script creates the MinIO bucket and uploads templates

set -e

echo "Setting up MinIO storage..."

# Install MinIO client if not present
if ! command -v mc &> /dev/null; then
    echo "Installing MinIO client..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install minio/stable/mc 2>/dev/null || {
            echo "Downloading mc binary..."
            curl -O https://dl.min.io/client/mc/release/darwin-amd64/mc
            chmod +x mc
            sudo mv mc /usr/local/bin/
        }
    else
        curl -O https://dl.min.io/client/mc/release/linux-amd64/mc
        chmod +x mc
        sudo mv mc /usr/local/bin/
    fi
fi

# Configure MinIO client
echo "Configuring MinIO client..."
mc alias set local http://localhost:9000 minioadmin minioadmin

# Create bucket if it doesn't exist
echo "Creating bucket 'wecover-pdfs'..."
mc mb local/wecover-pdfs --ignore-existing

# Upload PDF template
echo "Uploading PDF template..."
PDF_FILE="assets/ContractPSVSCTemplate_HT_v07_Form1.pdf"
if [ -f "$PDF_FILE" ]; then
    mc cp "$PDF_FILE" local/wecover-pdfs/templates/ContractPSVSCTemplate_HT_v07_Form.pdf
    echo "✓ PDF template uploaded"
else
    echo "⚠ Warning: PDF template not found at $PDF_FILE"
fi

# Verify upload
echo ""
echo "Verifying uploads..."
mc ls local/wecover-pdfs/templates/ --recursive

echo ""
echo "✓ Storage setup complete!"
echo ""
echo "Now run the seed script to upload HTML templates:"
echo "  pnpm --filter @wec/cli seed:templates"


