import { ConfidentialClientApplication, AuthenticationResult } from '@azure/msal-node';
import { IAuthService } from '../core/interfaces/authService';
import { IUserRepository } from '../core/interfaces/userRepository';
import { User } from '@blog/shared/src/models/User';
import { logger } from '../utils/logger';

export class AuthService implements IAuthService {
  private msalInstance: ConfidentialClientApplication;
  
  constructor(
    private userRepository: IUserRepository,
    private tenantId: string,
    private clientId: string,
    private clientSecret: string
  ) {
    // Get additional ADB2C configuration from environment
    const adb2cDomainName = process.env.ADBC2_DOMAIN_NAME || '';
    const adb2cTenantName = process.env.ADB2C_TENANT_NAME || '';
    const adb2cSignUpSignInPolicyName = process.env.ADB2C_SIGNUP_SIGNIN_POLICY_NAME || '';
    
    // Construct the authority URL using ADB2C specific format
    const authorityUrl = `https://${adb2cDomainName}/${adb2cTenantName}/${adb2cSignUpSignInPolicyName}`;
    
    this.msalInstance = new ConfidentialClientApplication({
      auth: {
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        authority: authorityUrl,
        knownAuthorities: [adb2cDomainName] // Add the domain as a known authority
      }
    });
    
    logger.info(`Configured ADB2C authority: ${authorityUrl}`);
  }

  async validateToken(token: string): Promise<{ valid: boolean; userId?: string }> {
    try {
      // Validate the token with Azure AD B2C
      const tokenClaims = await this.verifyToken(token);
      
      if (!tokenClaims) {
        return { valid: false };
      }
      
      const identityId = tokenClaims.oid || tokenClaims.sub;
      
      if (!identityId) {
        return { valid: false };
      }
      
      // Find user by identity ID
      const user = await this.userRepository.findByIdentityId(identityId);
      
      if (!user) {
        return { valid: false };
      }
      
      return { valid: true, userId: user.id };
    } catch (error) {
      logger.error('Token validation error', error);
      return { valid: false };
    }
  }

  async getUserFromToken(token: string): Promise<User | null> {
    try {
      const tokenClaims = await this.verifyToken(token);
      
      if (!tokenClaims) {
        return null;
      }
      
      const identityId = tokenClaims.oid || tokenClaims.sub;
      
      if (!identityId) {
        return null;
      }
      
      return await this.userRepository.findByIdentityId(identityId);
    } catch (error) {
      logger.error('Error getting user from token', error);
      return null;
    }
  }

  async upsertUser(token: string): Promise<User> {
    try {
      const tokenClaims = await this.verifyToken(token);
      
      if (!tokenClaims) {
        throw new Error('Invalid token');
      }
      
      const identityId = tokenClaims.oid || tokenClaims.sub;
      const email = tokenClaims.emails?.[0] || tokenClaims.email;
      const displayName = tokenClaims.name || tokenClaims.given_name;
      
      if (!identityId || !email || !displayName) {
        throw new Error('Missing required claims in token');
      }
      
      return await this.userRepository.upsertByIdentityId(identityId, {
        email,
        displayName
      });
    } catch (error) {
      logger.error('Error upserting user', error);
      throw error;
    }
  }

  private async verifyToken(token: string): Promise<any> {
    try {
      // Here we'd normally validate the JWT token
      // For simplicity, we're assuming the token is valid and extracting claims
      // In a production environment, use proper JWT verification
      
      // Mock implementation - in real life, use a JWT validation library
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        return null;
      }
      
      const payload = Buffer.from(tokenParts[1], 'base64').toString();
      return JSON.parse(payload);
    } catch (error) {
      logger.error('Token verification error', error);
      return null;
    }
  }
}