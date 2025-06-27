import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { PrismaClient } from '@prisma/client';
import { setupAuthentication } from './auth';
import { setupSocketHandlers } from './socket';
import { logger } from './utils/logger';
import { Container } from './core/container';
import { UserRepository } from './repositories/userRepository';
import { PostRepository } from './repositories/postRepository';
import { UserService } from './services/userService';
import { PostService } from './services/postService';
import { AuthService } from './services/authService';

export async function createServer() {
  // Create Express app and HTTP server
  const app = express();
  const httpServer = http.createServer(app);

  // Set up Redis clients
  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();
  await Promise.all([pubClient.connect(), subClient.connect()]);

  // Create Socket.io server with Redis adapter
  const io = new SocketServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    adapter: createAdapter(pubClient, subClient)
  });

  // Set up Prisma client
  const prisma = new PrismaClient();
  
  // Set up dependency injection container
  const container = new Container();
  
  // Register repositories
  container.register('userRepository', new UserRepository(prisma));
  container.register('postRepository', new PostRepository(prisma));
  
  // Register services
  container.register('authService', new AuthService(
    container.get('userRepository'),
    process.env.ADB2C_TENANT_ID || '',
    process.env.ADB2C_CLIENT_ID || '',
    process.env.ADB2C_CLIENT_SECRET || ''
  ));
  
  container.register('userService', new UserService(container.get('userRepository')));
  container.register('postService', new PostService(
    container.get('postRepository'),
    container.get('userRepository')
  ));

  // Set up authentication middleware
  setupAuthentication(app, container.get('authService'));
  
  // Set up socket handlers
  setupSocketHandlers(io, container);

  // Health check endpoint
  app.get('/health', (_, res) => res.status(200).send('OK'));

  // Handle connection errors
  pubClient.on('error', (err) => logger.error('Redis Pub Client Error:', err));
  subClient.on('error', (err) => logger.error('Redis Sub Client Error:', err));
  
  return httpServer;
}