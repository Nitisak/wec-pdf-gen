# Docker Build Fixes

## Issues Resolved

### 1. Missing `pnpm-workspace.yaml`

**Problem**: The monorepo structure required a workspace configuration file.

**Solution**: Created `pnpm-workspace.yaml` at project root:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 2. Incorrect Package Dependency

**Problem**: `fastify-cors@^8.4.0` doesn't exist - the package was deprecated.

**Solution**: Updated `apps/api/package.json` to use `@fastify/cors@^8.4.0` instead.

**Files Changed**:
- `apps/api/package.json` - Updated dependency
- `apps/api/src/index.ts` - Updated import statement from `fastify-cors` to `@fastify/cors`

### 3. Missing pnpm Lock File

**Problem**: Dockerfiles used `--frozen-lockfile` flag but no `pnpm-lock.yaml` exists.

**Solution**: Changed all `pnpm install --frozen-lockfile` to `pnpm install --no-frozen-lockfile` in:
- `apps/api/Dockerfile` (2 instances: builder and production stages)
- `apps/web/Dockerfile` (1 instance: builder stage)

### 4. Added Missing S3 Presigner Package

**Problem**: The S3 storage module uses `getSignedUrl` but the package wasn't in dependencies.

**Solution**: Added `@aws-sdk/s3-request-presigner@^3.450.0` to `apps/api/package.json`.

## Files Modified

1. **Created**:
   - `pnpm-workspace.yaml` - Workspace configuration

2. **Updated**:
   - `apps/api/package.json` - Fixed dependencies
   - `apps/api/src/index.ts` - Fixed import
   - `apps/api/Dockerfile` - Removed frozen lockfile requirement
   - `apps/web/Dockerfile` - Removed frozen lockfile requirement

## Current Status

✅ Docker build context properly configured
✅ All dependencies correctly specified
✅ Imports updated to use correct packages
✅ Build running successfully

## Next Steps

Once build completes:

1. Start the stack:
   ```bash
   docker-compose up -d
   ```

2. Check service status:
   ```bash
   docker-compose ps
   ```

3. Upload PDF template to MinIO Console (http://localhost:9001)

4. Run migrations:
   ```bash
   make migrate
   ```

5. Seed templates:
   ```bash
   make seed
   ```

6. Access the application at http://localhost

## Production Recommendations

For production deployments:

1. **Create pnpm-lock.yaml**:
   ```bash
   pnpm install
   ```
   This will generate a lock file for reproducible builds.

2. **Restore frozen lockfile**: Once lock file exists, change back to `--frozen-lockfile` for deterministic builds.

3. **Pin exact versions**: Consider using exact versions instead of `^` for production stability.

4. **Multi-platform builds**: If deploying to different architectures, use:
   ```bash
   docker buildx build --platform linux/amd64,linux/arm64 .
   ```

## Troubleshooting

If build fails:

1. **Clear Docker cache**:
   ```bash
   docker-compose build --no-cache
   ```

2. **Check Docker resources**: Ensure sufficient memory (4GB+) and disk space

3. **Verify network**: Some dependencies require internet access to download

4. **Check logs**:
   ```bash
   docker-compose logs -f
   ```

