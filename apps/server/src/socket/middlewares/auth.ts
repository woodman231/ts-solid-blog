import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { IAuthService } from '../../core/interfaces/authService';
import { logger } from '../../utils/logger';

export async function socketAuthMiddleware(
  socket: Socket,
  next: (err?: ExtendedError) => void,
  authService: IAuthService
): Promise<void> {
  try {
    // Get auth token from handshake
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication error: Token not provided'));
    }

    // Validate token
    const { valid, userId } = await authService.validateToken(token);

    if (!valid || !userId) {
      return next(new Error('Authentication error: Invalid token'));
    }

    // Store user ID in socket data for later use
    socket.data.userId = userId;

    next();
  } catch (error) {
    logger.error('Socket auth middleware error', error);
    next(new Error('Authentication error'));
  }
}