# Docker Module Resolution Fixes

## Summary
Successfully resolved Docker build and runtime issues related to ES module resolution and TypeScript compilation in a pnpm monorepo workspace.

## Issues Fixed

### 1. Incorrect Entry Point Path
**Problem:** 
```
Error: Cannot find module '/app/apps/api/dist/index.js'
```

**Root Cause:** TypeScript compilation outputs nested directory structure (`dist/apps/api/src/index.js`) due to monorepo workspace configuration.

**Solution:** Updated `docker-entrypoint.sh` to point to the correct compiled file path:
```bash
exec node dist/apps/api/src/index.js
```

---

### 2. ES Module Resolution for Shared Package
**Problem:**
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/app/apps/api/node_modules/@wec/shared/policySchemas'
```

**Root Cause:** The shared package (`@wec/shared`) was:
- Pointing to TypeScript source files (`.ts`) instead of compiled JavaScript (`.js`)
- Missing proper ES module exports configuration
- Not being compiled during the Docker build process

**Solution:**

#### A. Updated `packages/shared/package.json`:
```json
{
  "name": "@wec/shared",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/policySchemas.js",
  "types": "./dist/policySchemas.d.ts",
  "exports": {
    "./policySchemas": {
      "import": "./dist/policySchemas.js",
      "types": "./dist/policySchemas.d.ts"
    }
  },
  "scripts": {
    "build": "tsc"
  }
}
```

#### B. Created `packages/shared/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["policySchemas.ts"],
  "exclude": ["node_modules", "dist"]
}
```

#### C. Updated `apps/api/Dockerfile` to build shared package:
```dockerfile
# Build shared package first
WORKDIR /app/packages/shared
RUN pnpm build

# Build the API application
WORKDIR /app/apps/api
RUN pnpm build
```

---

### 3. Fastify Schema Validation Error
**Problem:**
```
FastifyError: Failed building the validation schema for POST: /api/policies, 
due to error schema is invalid: data/required must be array
```

**Root Cause:** Passing a Zod schema directly to Fastify's `schema.body` when Fastify expects JSON Schema format.

**Solution:** Convert Zod schema to JSON Schema using `zod-to-json-schema`:

Updated `apps/api/src/routes/policies.routes.ts`:
```typescript
import { zodToJsonSchema } from 'zod-to-json-schema';

fastify.post('/policies', {
  schema: {
    body: zodToJsonSchema(PolicyCreateSchema, 'PolicyCreateSchema'),
    // ...
  }
}, async (request, reply) => {
  // ...
});
```

---

## Verification

All services are now running successfully:

```bash
$ docker-compose ps
NAME           STATUS                    PORTS
wec-api        Up (healthy)              0.0.0.0:5173->5173/tcp
wec-minio      Up (healthy)              0.0.0.0:9000-9001->9000-9001/tcp
wec-postgres   Up (healthy)              0.0.0.0:5432->5432/tcp
```

```bash
$ curl http://localhost:5173/health
{
  "status": "ok",
  "timestamp": "2025-10-06T04:02:48.530Z"
}
```

---

## Key Takeaways

1. **ES Modules in Monorepos**: Shared packages must export compiled `.js` files, not `.ts` source files, for runtime module resolution to work.

2. **TypeScript Build Order**: When using workspace dependencies, build the dependencies before the consuming package.

3. **Fastify + Zod Integration**: Always convert Zod schemas to JSON Schema using `zodToJsonSchema()` when using them in Fastify route schemas.

4. **Docker Entry Points**: Verify compiled output paths match the entry point specified in Docker configuration, especially with TypeScript's `outDir` and monorepo `rootDir` settings.

---

## Files Modified

- `apps/api/docker-entrypoint.sh` - Updated node entry point path
- `packages/shared/package.json` - Added ES module exports and build script
- `packages/shared/tsconfig.json` - **Created** TypeScript config for shared package
- `apps/api/Dockerfile` - Added shared package build step
- `apps/api/src/routes/policies.routes.ts` - Added Zod to JSON Schema conversion

---

*Last updated: 2025-10-06*


