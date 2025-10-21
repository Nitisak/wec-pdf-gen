import type { FastifyInstance } from 'fastify';
import { QuoteCreateSchema } from '@wec/shared';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { createQuote, getQuote, listQuotes } from '../modules/quotes/service/quotes.service.js';

export default async function quotesRoutes(fastify: FastifyInstance) {
  // Create a new quote
  fastify.post('/quotes', {
    schema: {
      description: 'Generate a new insurance quote PDF',
      tags: ['quotes'],
      body: zodToJsonSchema(QuoteCreateSchema, 'QuoteCreateSchema'),
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            quoteNumber: { type: 'string' },
            pdfBase64: { type: 'string', description: 'PDF content as base64 string' },
            issueDate: { type: 'string' },
            validUntil: { type: 'string' },
            total: { type: 'string' }
          }
        }
      }
    },
    handler: async (request, reply) => {
      const payload = QuoteCreateSchema.parse(request.body);
      const result = await createQuote(payload);
      return reply.code(200).send(result);
    }
  });

  // Get quote by quote number
  fastify.get('/quotes/:quoteNumber', {
    schema: {
      description: 'Get quote details by quote number',
      tags: ['quotes'],
      params: {
        type: 'object',
        properties: {
          quoteNumber: { type: 'string' }
        },
        required: ['quoteNumber']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            quoteNumber: { type: 'string' },
            productVersion: { type: 'string' },
            stateCode: { type: 'string' },
            termMonths: { type: 'number' },
            commercial: { type: 'boolean' },
            basePrice: { type: 'string' },
            subtotal: { type: 'string' },
            total: { type: 'string' },
            issueDate: { type: 'string' },
            validUntil: { type: 'string' },
            pdfBase64: { type: 'string', description: 'PDF content as base64 string' },
            payload: { type: 'object' },
            createdAt: { type: 'string' }
          }
        }
      }
    },
    handler: async (request, reply) => {
      const { quoteNumber } = request.params as { quoteNumber: string };
      const quote = await getQuote(quoteNumber);
      return reply.code(200).send(quote);
    }
  });

  // List quotes with optional filters
  fastify.get('/quotes', {
    schema: {
      description: 'List all quotes with optional filters',
      tags: ['quotes'],
      querystring: {
        type: 'object',
        properties: {
          stateCode: { type: 'string' },
          productVersion: { type: 'string' },
          limit: { type: 'number', default: 50 },
          offset: { type: 'number', default: 0 }
        }
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              quoteNumber: { type: 'string' },
              productVersion: { type: 'string' },
              stateCode: { type: 'string' },
              total: { type: 'string' },
              issueDate: { type: 'string' },
              validUntil: { type: 'string' },
              createdAt: { type: 'string' }
            }
          }
        }
      }
    },
    handler: async (request, reply) => {
      const filters = request.query as {
        stateCode?: string;
        productVersion?: string;
        limit?: number;
        offset?: number;
      };
      const quotes = await listQuotes(filters);
      return reply.code(200).send(quotes);
    }
  });
}

