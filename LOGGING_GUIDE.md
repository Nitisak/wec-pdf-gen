# WeCover API - Logging Guide

The WeCover API uses **Fastify's built-in logger** (powered by [Pino](https://getpino.io/)), which provides structured, high-performance JSON logging.

---

## Table of Contents
1. [Configuration](#configuration)
2. [Log Levels](#log-levels)
3. [How to Write Logs](#how-to-write-logs)
4. [Examples by Module](#examples-by-module)
5. [Structured Logging](#structured-logging)
6. [Best Practices](#best-practices)
7. [Viewing Logs](#viewing-logs)

---

## Configuration

### Environment Variable
Set the log level in `.env`:

```bash
# Development
LOG_LEVEL=debug

# Production
LOG_LEVEL=info
```

### Fastify Logger Setup
In `apps/api/src/index.ts`:

```typescript
const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});
```

---

## Log Levels

| Level   | When to Use                                          | Example                                      |
|---------|------------------------------------------------------|----------------------------------------------|
| `trace` | Very detailed debugging (rarely used)                | Function entry/exit points                   |
| `debug` | Debugging information                                | Variable values, intermediate steps          |
| `info`  | Normal application flow ✅                           | Request started, PDF generated               |
| `warn`  | Warning conditions (non-critical)                    | Missing optional field, fallback used        |
| `error` | Error conditions (critical) ⚠️                       | PDF generation failed, database error        |
| `fatal` | Application crash (very rare)                        | Cannot connect to database on startup        |

---

## How to Write Logs

### 1. **In Routes (Access via `request.log`)**

```typescript
// apps/api/src/routes/policies.routes.ts
import { FastifyInstance } from 'fastify';

export async function policiesRoutes(fastify: FastifyInstance) {
  fastify.post('/policies', async (request, reply) => {
    // Info log
    request.log.info('Policy creation started');
    
    // Log with context
    request.log.info({ policyNumber: payload.policyNumber }, 'Creating policy');
    
    try {
      const result = await createPolicy(payload, dryRun);
      
      // Success log
      request.log.info({ 
        policyNumber: result.policyNumber, 
        id: result.id 
      }, 'Policy created successfully');
      
      return reply.code(200).send(result);
    } catch (error) {
      // Error log
      request.log.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        policyNumber: payload.policyNumber
      }, 'Policy creation failed');
      
      return reply.code(500).send({ error: 'Policy creation failed' });
    }
  });
}
```

### 2. **In Services (Access via `fastify` instance)**

You need to pass the logger from routes to services, or import the Fastify instance.

#### Option A: Pass Logger as Parameter

```typescript
// apps/api/src/modules/policies/service/policies.service.ts
import type { FastifyBaseLogger } from 'fastify';

export async function createPolicy(
  payload: PolicyCreate, 
  dryRun: boolean = false,
  logger?: FastifyBaseLogger
) {
  logger?.info({ policyNumber: payload.policyNumber }, 'Assembling PDF');
  
  try {
    const pdfBuffer = await assemblePolicyPdf(payload);
    logger?.info({ size: pdfBuffer.length }, 'PDF assembled successfully');
    
    return { id, policyNumber, pdfUrl };
  } catch (error) {
    logger?.error({ error }, 'PDF assembly failed');
    throw error;
  }
}
```

Then in routes:
```typescript
const result = await createPolicy(payload, dryRun, request.log);
```

#### Option B: Create a Shared Logger Instance

```typescript
// apps/api/src/utils/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info'
});
```

Then import in services:
```typescript
import { logger } from '../../utils/logger.js';

logger.info('Service started');
```

### 3. **In Background Jobs or CLI Scripts**

```typescript
// packages/cli/seed-templates.ts
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info'
});

logger.info('Starting template seeding');

try {
  await seedTemplates();
  logger.info('Templates seeded successfully');
} catch (error) {
  logger.error({ error }, 'Seeding failed');
  process.exit(1);
}
```

---

## Examples by Module

### **Policy Creation Service**

```typescript
// apps/api/src/modules/policies/service/policies.service.ts
import type { FastifyBaseLogger } from 'fastify';

export async function createPolicy(
  payload: PolicyCreate, 
  dryRun: boolean = false,
  logger?: FastifyBaseLogger
) {
  const startTime = Date.now();
  
  logger?.info({ 
    policyNumber: payload.policyNumber,
    stateCode: payload.stateCode,
    termMonths: payload.coverage.termMonths,
    commercial: payload.coverage.commercial,
    dryRun 
  }, 'Policy creation started');
  
  try {
    // Step 1: Fill AcroForm
    logger?.debug('Filling AcroForm');
    const filledForm = await fillAcroForm(payload);
    logger?.debug({ size: filledForm.length }, 'AcroForm filled');
    
    // Step 2: Render Terms
    logger?.debug({ productVersion: payload.productVersion }, 'Rendering terms PDF');
    const termsPdf = await renderTermsToPdf(payload.productVersion, payload.policyNumber);
    logger?.debug({ size: termsPdf.length }, 'Terms PDF rendered');
    
    // Step 3: Render Disclosures
    logger?.debug({ stateCode: payload.stateCode }, 'Rendering disclosure PDF');
    const disclosurePdf = await renderDisclosureToPdf(payload.stateCode);
    logger?.debug({ size: disclosurePdf.length }, 'Disclosure PDF rendered');
    
    // Step 4: Merge
    logger?.debug('Merging PDFs');
    const mergedPdf = await mergePdfs([filledForm, termsPdf, disclosurePdf]);
    
    const duration = Date.now() - startTime;
    logger?.info({ 
      policyNumber: payload.policyNumber,
      pdfSize: mergedPdf.length,
      durationMs: duration
    }, 'Policy created successfully');
    
    return { id: 'xxx', policyNumber: payload.policyNumber, pdfUrl: 'xxx' };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger?.error({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      policyNumber: payload.policyNumber,
      durationMs: duration
    }, 'Policy creation failed');
    
    throw error;
  }
}
```

### **AcroForm Filler**

```typescript
// apps/api/src/modules/policies/filler/fillAcroForm.ts
import type { FastifyBaseLogger } from 'fastify';

export async function fillAcroForm(
  payload: PolicyCreate,
  logger?: FastifyBaseLogger
): Promise<Uint8Array> {
  logger?.debug({ 
    policyNumber: payload.policyNumber,
    templateKey: process.env.PDF_TEMPLATE_KEY 
  }, 'Loading PDF template');
  
  const pdfBytes = await getS3Object(process.env.PDF_TEMPLATE_KEY!);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = toAcroFields(payload);

  let fieldsFilledCount = 0;
  let fieldsFailedCount = 0;
  
  for (const [name, value] of Object.entries(fields)) {
    try {
      const field = form.getFieldMaybe(name);
      if (!field) {
        logger?.warn({ fieldName: name }, 'Field not found in template');
        fieldsFailedCount++;
        continue;
      }

      // Try as text field
      try {
        const textField = form.getTextField(name);
        textField.setText(String(value));
        fieldsFilledCount++;
        continue;
      } catch (e) {
        // Not a text field
      }

      // Try as checkbox
      try {
        const checkbox = form.getCheckBox(name);
        if (value === 'On') {
          checkbox.check();
          logger?.debug({ fieldName: name }, 'Checkbox checked');
        } else {
          checkbox.uncheck();
        }
        fieldsFilledCount++;
        continue;
      } catch (e) {
        // Not a checkbox either
      }

      logger?.warn({ fieldName: name }, 'Unknown field type');
      fieldsFailedCount++;
    } catch (error) {
      logger?.warn({ 
        fieldName: name, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 'Failed to fill field');
      fieldsFailedCount++;
    }
  }

  logger?.info({ 
    filled: fieldsFilledCount, 
    failed: fieldsFailedCount,
    total: Object.keys(fields).length
  }, 'AcroForm fields processed');

  // Signature overlay
  if (payload.customerSignaturePngBase64) {
    try {
      logger?.debug('Embedding customer signature');
      const pngBytes = Buffer.from(payload.customerSignaturePngBase64, 'base64');
      const png = await pdfDoc.embedPng(pngBytes);
      const page = pdfDoc.getPages()[0];
      
      page.drawImage(png, { 
        x: SIGN_X, 
        y: SIGN_Y, 
        width: SIGN_W, 
        height: SIGN_H 
      });
      logger?.info('Customer signature embedded');
    } catch (error) {
      logger?.warn({ error }, 'Failed to embed signature');
    }
  }

  form.updateFieldAppearances();
  return await pdfDoc.save();
}
```

### **S3 Storage**

```typescript
// apps/api/src/modules/storage/s3.ts
import type { FastifyBaseLogger } from 'fastify';

export async function putS3Object(
  key: string, 
  body: Uint8Array,
  logger?: FastifyBaseLogger
): Promise<void> {
  logger?.debug({ 
    key, 
    size: body.length,
    bucket: process.env.S3_BUCKET 
  }, 'Uploading to S3');
  
  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: body,
      ContentType: 'application/pdf'
    }));
    
    logger?.info({ key, size: body.length }, 'S3 upload successful');
  } catch (error) {
    logger?.error({ 
      key, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 'S3 upload failed');
    throw error;
  }
}
```

---

## Structured Logging

Always include context objects for better searchability:

### ✅ Good - Structured
```typescript
logger.info({ 
  policyNumber: 'WEC-2025-001',
  stateCode: 'FL',
  termMonths: 72,
  durationMs: 1234
}, 'Policy created');
```

**Output:**
```json
{
  "level": 30,
  "time": 1696600000000,
  "msg": "Policy created",
  "policyNumber": "WEC-2025-001",
  "stateCode": "FL",
  "termMonths": 72,
  "durationMs": 1234
}
```

### ❌ Bad - Unstructured
```typescript
logger.info(`Policy created: WEC-2025-001 for FL in 1234ms`);
```

---

## Best Practices

### 1. **Include Request Context**
```typescript
request.log.info({ 
  reqId: request.id,
  policyNumber: payload.policyNumber,
  userAgent: request.headers['user-agent']
}, 'Processing request');
```

### 2. **Log Performance Metrics**
```typescript
const start = Date.now();
// ... operation
logger.info({ 
  operation: 'pdfGeneration',
  durationMs: Date.now() - start 
}, 'Operation completed');
```

### 3. **Don't Log Sensitive Data**
```typescript
// ❌ Bad
logger.info({ customerEmail: payload.owner.email }, 'Policy created');

// ✅ Good
logger.info({ 
  customerEmailHash: hash(payload.owner.email) 
}, 'Policy created');
```

### 4. **Use Appropriate Levels**
```typescript
// Info for normal flow
logger.info('Policy created');

// Warn for recoverable issues
logger.warn('Template not found, using default');

// Error for failures
logger.error({ error }, 'PDF generation failed');
```

### 5. **Child Loggers for Request Tracing**
```typescript
const childLogger = request.log.child({ 
  policyNumber: payload.policyNumber 
});

childLogger.info('Step 1: Filling form');
childLogger.info('Step 2: Rendering terms');
// All logs will include policyNumber
```

---

## Viewing Logs

### Development (Docker Compose)
```bash
# View all logs
docker-compose logs -f

# View only API logs
docker-compose logs -f api

# Filter by level (requires jq)
docker-compose logs -f api | grep '"level":50'  # Errors only
```

### Production (with Pino Pretty)
```bash
# Install pino-pretty
npm install -g pino-pretty

# Pipe logs through pino-pretty
docker-compose logs -f api | pino-pretty
```

### Search Logs
```bash
# Find all policy creation logs
docker-compose logs api | grep "Policy created"

# Find logs for specific policy
docker-compose logs api | grep "WEC-2025-001"

# Find errors only
docker-compose logs api | grep '"level":50'
```

### Export Logs
```bash
# Save logs to file
docker-compose logs --no-color api > api-logs-$(date +%Y%m%d).log

# Last 100 lines
docker-compose logs --tail=100 api
```

---

## Environment-Specific Configuration

### Development
```bash
LOG_LEVEL=debug
```

### Staging
```bash
LOG_LEVEL=info
```

### Production
```bash
LOG_LEVEL=warn
```

---

## Quick Reference

```typescript
// In routes
request.log.info({ context }, 'Message');
request.log.error({ error }, 'Error message');

// In services (pass logger from route)
logger?.info({ context }, 'Message');
logger?.debug({ details }, 'Debug info');
logger?.warn({ warning }, 'Warning message');
logger?.error({ error, stack }, 'Error message');

// Structured logging
logger.info({ 
  key: 'value',
  nested: { data: 'here' }
}, 'Human-readable message');

// Child logger
const child = logger.child({ policyNumber: 'WEC-001' });
child.info('Step 1');  // Auto includes policyNumber
child.info('Step 2');  // Auto includes policyNumber
```

---

## Example: Full Request Logging

```typescript
// apps/api/src/routes/policies.routes.ts
fastify.post('/policies', async (request, reply) => {
  const startTime = Date.now();
  const payload = request.body as PolicyCreate;
  
  // Log request start
  request.log.info({ 
    policyNumber: payload.policyNumber,
    stateCode: payload.stateCode,
    termMonths: payload.coverage.termMonths
  }, 'Policy creation request received');
  
  try {
    const result = await createPolicy(payload, dryRun, request.log);
    
    // Log success
    request.log.info({ 
      policyNumber: result.policyNumber,
      id: result.id,
      durationMs: Date.now() - startTime
    }, 'Policy creation completed');
    
    return reply.code(200).send(result);
    
  } catch (error) {
    // Log error
    request.log.error({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      policyNumber: payload.policyNumber,
      durationMs: Date.now() - startTime
    }, 'Policy creation failed');
    
    return reply.code(500).send({ 
      error: 'Policy creation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
```

---

## Correlation IDs

Fastify automatically generates request IDs. Use them for tracing:

```typescript
request.log.info({ 
  reqId: request.id,  // Auto-generated unique ID
  policyNumber: payload.policyNumber 
}, 'Processing');
```

All logs for that request will include the same `reqId`.

