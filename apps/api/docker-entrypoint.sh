#!/bin/sh
set -e

echo "Starting WeCover API..."

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
until nc -z postgres 5432; do
  sleep 1
done
echo "PostgreSQL is ready"

# Wait for MinIO
echo "Waiting for MinIO..."
until nc -z minio 9000; do
  sleep 1
done
echo "MinIO is ready"

# Run migrations
echo "Running database migrations..."
node migrations/run.js || echo "Migration failed or already applied"

# Start the application
echo "Starting API server..."
exec node dist/apps/api/src/index.js
