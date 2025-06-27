import express from 'express';
import { IAuthService } from '../core/interfaces/authService';

export function setupAuthentication(app: express.Application, authService: IAuthService): void {
  // API route used for ADB2C token validation
  app.post('/api/auth/validate', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      const { valid, userId } = await authService.validateToken(token);
      
      if (!valid) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      const user = await authService.getUserFromToken(token);
      
      return res.status(200).json({ valid, user });
    } catch (error) {
      return res.status(500).json({ error: 'Authentication error' });
    }
  });
  
  // Endpoint for initial user creation/update after ADB2C login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      const user = await authService.upsertUser(token);
      
      return res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({ error: 'Login error' });
    }
  });
}