import { FastifyInstance } from 'fastify';
import { eq, and, desc } from 'drizzle-orm';
import { getDatabase } from '../modules/db/index.js';
import { htmlTemplate } from '../modules/db/schema.js';
import { putS3Object } from '../modules/storage/s3.js';

export async function templatesRoutes(fastify: FastifyInstance) {
  // List terms templates
  fastify.get('/templates/terms', async (request, reply) => {
    try {
      const db = getDatabase();
      
      const templates = await db
        .select()
        .from(htmlTemplate)
        .where(eq(htmlTemplate.kind, 'terms'))
        .orderBy(desc(htmlTemplate.createdAt));
      
      return reply.code(200).send(templates);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ 
        error: 'Failed to list terms templates',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // List disclosure templates
  fastify.get('/templates/disclosures', async (request, reply) => {
    try {
      const db = getDatabase();
      
      const templates = await db
        .select()
        .from(htmlTemplate)
        .where(eq(htmlTemplate.kind, 'disclosure'))
        .orderBy(desc(htmlTemplate.createdAt));
      
      return reply.code(200).send(templates);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ 
        error: 'Failed to list disclosure templates',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Upload terms template
  fastify.post('/templates/terms', {
    schema: {
      body: {
        type: 'object',
        required: ['productVersion', 'versionTag', 'htmlContent'],
        properties: {
          productVersion: { type: 'string' },
          versionTag: { type: 'string' },
          language: { type: 'string', default: 'en-US' },
          htmlContent: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { productVersion, versionTag, language = 'en-US', htmlContent } = request.body as any;
      
      const db = getDatabase();
      
      // Upload HTML to S3
      const s3Key = `templates/terms/${productVersion}/${versionTag}/${language}.html`;
      await putS3Object(s3Key, new TextEncoder().encode(htmlContent), 'text/html');
      
      // Insert template record
      const [template] = await db.insert(htmlTemplate).values({
        kind: 'terms',
        productVersion,
        language,
        versionTag,
        s3Key
      }).returning();
      
      return reply.code(201).send(template);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ 
        error: 'Failed to upload terms template',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Upload disclosure template
  fastify.post('/templates/disclosures', {
    schema: {
      body: {
        type: 'object',
        required: ['stateCode', 'versionTag', 'htmlContent'],
        properties: {
          stateCode: { type: 'string' },
          versionTag: { type: 'string' },
          language: { type: 'string', default: 'en-US' },
          htmlContent: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { stateCode, versionTag, language = 'en-US', htmlContent } = request.body as any;
      
      const db = getDatabase();
      
      // Upload HTML to S3
      const s3Key = `templates/disclosures/${stateCode}/${versionTag}/${language}.html`;
      await putS3Object(s3Key, new TextEncoder().encode(htmlContent), 'text/html');
      
      // Insert template record
      const [template] = await db.insert(htmlTemplate).values({
        kind: 'disclosure',
        stateCode,
        language,
        versionTag,
        s3Key
      }).returning();
      
      return reply.code(201).send(template);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ 
        error: 'Failed to upload disclosure template',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
