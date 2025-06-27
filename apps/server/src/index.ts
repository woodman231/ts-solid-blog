import 'dotenv/config';
import { createServer } from './server';
import { logger } from './utils/logger';

// Bootstrap the server
async function bootstrap() {
  try {
    const server = await createServer();
    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || '0.0.0.0';
    
    server.listen(port, host, () => {
      logger.info(`Server running at http://${host}:${port}`);
    });
    
    // Handle termination
    const shutdown = async () => {
      logger.info('Shutting down server...');
      server.close();
      process.exit(0);
    };
    
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

bootstrap();