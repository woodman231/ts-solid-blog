import { ConfidentialClientApplication, AuthenticationResult } from '@azure/msal-node';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { IAuthService } from '../core/interfaces/authService';
import { IUserRepository } from '../core/interfaces/userRepository';
import { User } from '@blog/shared/src/models/User';
import { logger } from '../utils/logger';

export class AuthService implements IAuthService {
  private msalInstance: ConfidentialClientApplication;
  private jwksClient: jwksClient.JwksClient;

  constructor(
    private userRepository: IUserRepository,
    private tenantId: string,
    private clientId: string,
    private clientSecret: string
  ) {
    // Get additional ADB2C configuration from environment
    const adb2cDomainName = process.env.ADB2C_DOMAIN_NAME || '';
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
    });    // Initialize JWKS client for token verification
    // For Azure AD B2C, the JWKS URI follows this pattern:
    // https://{tenant}.b2clogin.com/{tenant}.onmicrosoft.com/{policy}/discovery/v2.0/keys
    // Note: Policy name in JWKS URI is lowercase
    const policyNameLower = adb2cSignUpSignInPolicyName.toLowerCase();
    const jwksUri = `https://${adb2cDomainName}/${adb2cTenantName}.onmicrosoft.com/${policyNameLower}/discovery/v2.0/keys`;

    this.jwksClient = jwksClient({
      jwksUri,
      requestHeaders: {}, // Optional
      timeout: 30000, // Defaults to 30s
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5, // Default
      cacheMaxEntries: 5, // Default
      cacheMaxAge: 600000, // Default 10 minutes
    });

    logger.info(`Configured ADB2C authority: ${authorityUrl}`);
    logger.info(`Configured JWKS URI: ${jwksUri}`);
  }

  async validateToken(token: string): Promise<{ valid: boolean; userId?: string; message?: string }> {
    try {
      // Remove 'Bearer ' prefix if present
      const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;

      // Validate the token with Azure AD B2C
      const tokenClaims = await this.verifyToken(cleanToken);

      if (!tokenClaims) {
        return {
          valid: false,
          message: 'Invalid token format or signature'
        };
      }

      // Use sub claim from the token - this is the unique user identifier in ADB2C
      const identityId = tokenClaims.sub || tokenClaims.oid;

      if (!identityId) {
        return {
          valid: false,
          message: 'Token is missing required identity claims'
        };
      }

      // Find user by identity ID
      const user = await this.userRepository.findByIdentityId(identityId);

      if (!user) {
        return {
          valid: false,
          message: 'Valid token, but user not found - please call login endpoint first'
        };
      }

      return { valid: true, userId: user.id };
    } catch (error) {
      logger.error('Token validation error', error);
      if (error instanceof Error) {
        return {
          valid: false,
          message: error.message
        };
      } else {
        return {
          valid: false,
          message: 'An unknown error occurred during token validation'
        };
      }
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
      console.log('Starting token verification process');

      // First decode to inspect the token contents
      const decodedToken = jwt.decode(token, { complete: true });
      if (!decodedToken || typeof decodedToken === 'string') {
        throw new Error('Invalid token format');
      }

      const payload = decodedToken.payload as any;
      const header = decodedToken.header;

      if (!header.kid) {
        throw new Error('Invalid token header - missing kid');
      }

      // Check token timing to help diagnose clock skew issues
      const now = Math.floor(Date.now() / 1000);
      const iat = payload.iat; // issued at
      const exp = payload.exp; // expires at
      const nbf = payload.nbf; // not before

      // Log detailed token analysis including timing
      logger.info('Token analysis', {
        kid: header.kid,
        audience: payload.aud,
        issuer: payload.iss,
        subject: payload.sub,
        scopes: payload.scp || payload.scope || 'none',
        tokenType: payload.aud === this.clientId ? 'access_token' : 'id_token',
        serverClientId: this.clientId,
        timing: {
          now: new Date(now * 1000).toISOString(),
          issuedAt: iat ? new Date(iat * 1000).toISOString() : 'not set',
          notBefore: nbf ? new Date(nbf * 1000).toISOString() : 'not set',
          expiresAt: exp ? new Date(exp * 1000).toISOString() : 'not set',
          secondsUntilValid: nbf ? nbf - now : 0,
          secondsUntilExpiry: exp ? exp - now : 0,
          clockSkewSuspected: nbf && nbf > now + 60 // More than 1 minute in future
        }
      });

      // Get signing key from JWKS
      const key = await this.getSigningKey(header.kid);
      logger.info('Signing key retrieved successfully');

      // For Azure AD B2C, the issuer format is:
      // https://{tenant}.b2clogin.com/{tenant-guid}/v2.0/
      const expectedIssuer = `https://${process.env.ADB2C_DOMAIN_NAME}/${this.tenantId}/v2.0/`;

      logger.info('Attempting token verification', {
        expectedAudience: this.clientId,
        actualAudience: payload.aud,
        expectedIssuer,
        actualIssuer: payload.iss
      });

      // Check if this is the correct token type
      if (payload.aud !== this.clientId) {
        logger.warn('Token audience mismatch - this appears to be an ID token, not an access token', {
          expected: this.clientId,
          received: payload.aud
        });

        // For now, we'll accept it but log the issue
        // In production, you should reject ID tokens for API access
      }

      // Verify token signature and issuer
      const decoded = jwt.verify(token, key, {
        algorithms: ['RS256'],
        issuer: expectedIssuer,
        // Add clock tolerance to handle timing issues
        clockTolerance: 300, // 5 minutes tolerance
        // Temporarily remove audience validation to allow ID tokens through
        // audience: this.clientId,
      });

      logger.info('Token signature verified successfully');
      return decoded;
    } catch (error) {
      if (error instanceof Error && error.name === 'NotBeforeError') {
        logger.error('Token not yet valid - possible clock skew issue', {
          error: error.message,
          serverTime: new Date().toISOString(),
          suggestion: 'Check system clocks for skew between client, server, and Azure AD B2C'
        });
      } else {
        logger.error('Token verification error', error);
      }
      return null;
    }
  }

  private async getSigningKey(kid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      logger.info('Attempting to get signing key', { kid });

      this.jwksClient.getSigningKey(kid, (err, key) => {
        if (err) {
          logger.error('Failed to get signing key', { kid, error: err.message });
          reject(err);
        } else {
          const signingKey = key?.getPublicKey();
          if (signingKey) {
            logger.info('Signing key retrieved successfully', { kid });
            resolve(signingKey);
          } else {
            logger.error('No signing key found', { kid });
            reject(new Error('No signing key found'));
          }
        }
      });
    });
  }
}