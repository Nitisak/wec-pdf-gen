import Fastify from 'fastify';
import cors from '@fastify/cors';
import { policiesRoutes } from './routes/policies.routes.js';
import { templatesRoutes } from './routes/templates.routes.js';
import { closeDatabase } from './modules/db/index.js';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});

// Register plugins
await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || true,
  credentials: true
});

// Register routes
await fastify.register(policiesRoutes, { prefix: '/api' });
await fastify.register(templatesRoutes, { prefix: '/api' });

// Health check
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  fastify.log.info(`Received ${signal}, shutting down gracefully`);
  try {
    await fastify.close();
    await closeDatabase();
    process.exit(0);
  } catch (error) {
    fastify.log.error(error, 'Error during shutdown');
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '5173');
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    fastify.log.info(`Server listening on ${host}:${port}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
