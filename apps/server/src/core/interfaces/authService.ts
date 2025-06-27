import { User } from '@blog/shared/src/models/User';

export interface IAuthService {
  validateToken(token: string): Promise<{ valid: boolean; userId?: string }>;
  getUserFromToken(token: string): Promise<User | null>;
  upsertUser(token: string): Promise<User>;
}