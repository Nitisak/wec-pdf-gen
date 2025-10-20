import { PolicyCreateSchema } from '@wec/shared/policySchemas';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { createPolicy, getPolicy } from '../modules/policies/service/policies.service.js';
export async function policiesRoutes(fastify) {
    // Create policy
    fastify.post('/policies', {
        schema: {
            body: zodToJsonSchema(PolicyCreateSchema, 'PolicyCreateSchema'),
            response: {
                200: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        policyNumber: { type: 'string' },
                        pdfUrl: { type: 'string' }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const payload = request.body;
            const dryRun = request.query?.dryRun === 'true';
            console.log('Policy creation payload:', payload);
            console.log('Dry run mode:', dryRun);
            const result = await createPolicy(payload, dryRun);
            return reply.code(200).send(result);
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                error: 'Policy creation failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // Get policy
    fastify.get('/policies/:id', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        policyNumber: { type: 'string' },
                        pdfUrl: { type: 'string' }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            const result = await getPolicy(id);
            return reply.code(200).send(result);
        }
        catch (error) {
            fastify.log.error(error);
            if (error instanceof Error && error.message === 'Policy not found') {
                return reply.code(404).send({ error: 'Policy not found' });
            }
            return reply.code(500).send({
                error: 'Failed to retrieve policy',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
}
