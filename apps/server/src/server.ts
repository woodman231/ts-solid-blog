import express from 'express';
import http from 'http';
import cors from 'cors';
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
import { CategoryRepository } from './repositories/categoryRepository';
import { UserService } from './services/userService';
import { PostService } from './services/postService';
import { CategoryService } from './services/categoryService';
import { AuthService } from './services/authService';
import { IAuthService } from './core/interfaces/authService';

export async function createServer() {
  // Create Express app and HTTP server
  const app = express();
  const httpServer = http.createServer(app);

  // Set up CORS middleware for all routes
  app.use(cors({
    origin: '*', // Allow any origin for now
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false // Set to true if you need cookies/auth headers
  }));

  // Parse JSON bodies
  app.use(express.json());

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
  container.register('categoryRepository', new CategoryRepository(prisma));

  // Register services
  container.register('authService', new AuthService(
    container.get('userRepository'),
    process.env.ADB2C_TENANT_ID || '',
    process.env.ADB2C_CLIENT_ID || '',
    process.env.ADB2C_CLIENT_SECRET || ''
  ));

  container.register('userService', new UserService(container.get('userRepository')));
  container.register('postService', new PostService(container.get('postRepository')));
  container.register('categoryService', new CategoryService(container.get('categoryRepository')));

  // Set up authentication middleware
  setupAuthentication(app, container.get('authService'));

  // Set up socket handlers
  setupSocketHandlers(io, container);

  // API endpoint to get current user's database info
  app.get('/api/user/me', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.substring(7);
      const authService = container.get('authService') as IAuthService;
      const user = await authService.getUserFromToken(token);

      if (!user) {
        return res.status(401).json({ error: 'Invalid token or user not found' });
      }

      res.json({
        id: user.id,
        displayName: user.displayName,
        email: user.email
      });
    } catch (error) {
      logger.error('Error in /api/user/me:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Health check endpoint
  app.get('/health', (_, res) => res.status(200).send('OK'));

  // Handle connection errors
  pubClient.on('error', (err) => logger.error('Redis Pub Client Error:', err));
  subClient.on('error', (err) => logger.error('Redis Sub Client Error:', err));

  return httpServer;
}