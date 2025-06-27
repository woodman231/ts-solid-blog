import { Server as SocketServer, Socket } from 'socket.io';
import { Container } from '../core/container';
import { IAuthService } from '../core/interfaces/authService';
import { IUserService } from '../core/interfaces/userService';
import { IPostService } from '../core/interfaces/postService';
import { logger } from '../utils/logger';
import { socketAuthMiddleware } from './middlewares/auth';
import { setupEventHandlers } from './handlers';

export function setupSocketHandlers(io: SocketServer, container: Container): void {
  // Get services from container
  const authService = container.get<IAuthService>('authService');
  const userService = container.get<IUserService>('userService');
  const postService = container.get<IPostService>('postService');
  
  // Apply auth middleware
  io.use((socket, next) => socketAuthMiddleware(socket, next, authService));
  
  // Handle connections
  io.on('connection', async (socket: Socket) => {
    try {
      // Get user from authenticated socket
      const userId = socket.data.userId;
      const user = await userService.getUserById(userId);
      
      logger.info(`User connected: ${user?.displayName} (${userId})`);
      
      // Set up event handlers
      setupEventHandlers(socket, { userService, postService });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`User disconnected: ${user?.displayName} (${userId})`);
      });
      
    } catch (error) {
      logger.error('Error handling socket connection', error);
      socket.disconnect(true);
    }
  });
}