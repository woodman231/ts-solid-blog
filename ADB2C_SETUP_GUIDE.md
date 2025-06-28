# Azure AD B2C Setup Guide

## Overview

For a client-server architecture with Azure AD B2C, you need **two separate app registrations**:

1. **Server App Registration** (API/Backend)
2. **Client App Registration** (SPA/Frontend)

## 1. Server App Registration (API)

### Basic Configuration

- **Application Type**: Web Application
- **Name**: Your API name (e.g., "Blog API")
- **Redirect URI**: Not needed for API

### API Permissions

- **Microsoft Graph**:
  - `User.Read` (optional, for basic profile info)

### Expose an API

1. Go to "Expose an API" section
2. Set Application ID URI (usually `api://{client-id}` or custom like `https://yourdomain.com/api`)
3. Add scope:
   - **Scope name**: `access_as_user`
   - **Admin consent display name**: "Access the API as the user"
   - **Admin consent description**: "Allow the application to access the API on behalf of the signed-in user"
   - **User consent display name**: "Access the API as you"
   - **User consent description**: "Allow the application to access the API on your behalf"
   - **State**: Enabled

### Certificates & Secrets

- Create a client secret (save this value - you'll need it for `ADB2C_CLIENT_SECRET`)

### App Roles (Optional)

- Define any roles your application needs

## 2. Client App Registration (SPA)

### Basic Configuration

- **Application Type**: Single-page application (SPA)
- **Name**: Your frontend app name (e.g., "Blog Client")
- **Redirect URI**: Your frontend URL(s) (e.g., `http://localhost:3000`, `https://yourdomain.com`)

### Authentication

- **Platform**: Single-page application
- **Redirect URIs**: Add all your frontend URLs
- **Logout URL**: Your frontend logout URL
- **Implicit grant**: Not needed for modern SPAs

### API Permissions

1. Click "Add a permission"
2. Go to "My APIs" tab
3. Select your **Server App Registration**
4. Select **Delegated permissions**
5. Check `access_as_user`
6. Click "Add permissions"
7. **Grant admin consent** for the permissions

## 3. Environment Variables

### Client (.env.local in your frontend)

```env
VITE_ADB2C_CLIENT_ID=<your-client-app-registration-client-id>
VITE_ADB2C_SERVER_CLIENT_ID=<your-server-app-registration-client-id>
VITE_ADB2C_DOMAIN_NAME=<your-b2c-tenant>.b2clogin.com
VITE_ADB2C_TENANT_NAME=<your-b2c-tenant>
VITE_ADB2C_SIGNIN_POLICY=B2C_1_signin_signup
```

### Server (.env in your backend)

```env
ADB2C_CLIENT_ID=<your-server-app-registration-client-id>
ADB2C_CLIENT_SECRET=<your-server-app-registration-client-secret>
ADB2C_TENANT_ID=<your-b2c-tenant-id>
ADB2C_DOMAIN_NAME=<your-b2c-tenant>.b2clogin.com
ADB2C_TENANT_NAME=<your-b2c-tenant>
ADB2C_SIGNUP_SIGNIN_POLICY_NAME=B2C_1_signin_signup
```

## 4. User Flows

Create a sign-up/sign-in user flow:

1. Go to "User flows" in your B2C tenant
2. Create "Sign up and sign in" flow
3. Name it `B2C_1_signin_signup` (or update your env vars accordingly)
4. Configure identity providers (Local accounts, social providers, etc.)
5. Configure user attributes and claims

## 5. Key Points

### Scopes

- **Client requests**: `api://{server-client-id}/access_as_user`
- **Server validates**: Audience should be the server's client ID

### Token Flow

1. Client authenticates with B2C using client app registration
2. Client requests access token with scope `api://{server-client-id}/access_as_user`
3. Client sends access token to server in Authorization header
4. Server validates token signature and audience
5. Server extracts user info from token claims

### Claims Mapping

In your user flow, ensure these claims are included in tokens:

- `sub` or `oid` (user identifier)
- `email` or `emails`
- `name` or `given_name`

## 6. Testing

1. Test client authentication flow
2. Verify access token contains correct audience (`aud` claim = server client ID)
3. Test server token validation
4. Verify user creation/update flow

## Common Issues

### Invalid Audience

- Ensure server validates `aud` claim matches server client ID
- Client must request scope with server client ID, not client client ID

### CORS Issues

- Configure CORS in your server for your client domain
- B2C endpoints support CORS by default

### Token Validation

- Use proper JWKS endpoint for your user flow
- Verify issuer matches your B2C policy endpoint

### Missing Claims

- Check user flow configuration for included claims
- Some claims might be in different fields (`emails` vs `email`)

## 7. Troubleshooting

### JWKS Endpoint Issues

If you're getting `ECONNREFUSED 127.0.0.1:443` errors, it means the server can't reach the Azure AD B2C JWKS endpoint.

**Common Issues:**

1. **Incorrect JWKS URI Format**
   - Correct: `https://{tenant}.b2clogin.com/{tenant}.onmicrosoft.com/{policy}/discovery/v2.0/keys`
   - Wrong: `https://{tenant}.b2clogin.com/{tenant}/{policy}/discovery/v2.0/keys`

2. **Environment Variables**
   - `ADB2C_DOMAIN_NAME` should be like `yourtenant.b2clogin.com`
   - `ADB2C_TENANT_NAME` should be like `yourtenant` (without .onmicrosoft.com)
   - `ADB2C_TENANT_ID` should be the GUID from Azure Portal

3. **Test JWKS Endpoint**
   ```bash
   cd apps/server
   node test-jwks.js
   ```

### Token Verification Issues

1. **Audience Mismatch**
   - Server validates `aud` claim = server's client ID
   - Client requests scope with server's client ID

2. **Issuer Mismatch**
   - Expected: `https://{tenant}.b2clogin.com/{tenant-guid}/v2.0/`
   - Check token payload for actual issuer

3. **Key ID (kid) Not Found**
   - Token's `kid` must match one in JWKS endpoint
   - Policy might be using different signing keys

### Network Issues

1. **Firewall/Proxy**
   - Ensure server can reach `*.b2clogin.com`
   - Check corporate firewall rules

2. **DNS Resolution**
   - Verify `{tenant}.b2clogin.com` resolves correctly
   - Try `nslookup {tenant}.b2clogin.com`
