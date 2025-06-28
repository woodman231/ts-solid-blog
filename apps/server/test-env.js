// Simple env test
require("dotenv").config();

console.log("Environment Variables:");
console.log("ADB2C_DOMAIN_NAME:", process.env.ADB2C_DOMAIN_NAME);
console.log("ADB2C_TENANT_NAME:", process.env.ADB2C_TENANT_NAME);
console.log(
  "ADB2C_SIGNUP_SIGNIN_POLICY_NAME:",
  process.env.ADB2C_SIGNUP_SIGNIN_POLICY_NAME
);

// Build JWKS URI
const domain = process.env.ADB2C_DOMAIN_NAME;
const tenant = process.env.ADB2C_TENANT_NAME;
const policy = process.env.ADB2C_SIGNUP_SIGNIN_POLICY_NAME;

if (domain && tenant && policy) {
  const policyLower = policy.toLowerCase();
  const jwksUri = `https://${domain}/${tenant}.onmicrosoft.com/${policyLower}/discovery/v2.0/keys`;
  console.log("Generated JWKS URI:", jwksUri);
} else {
  console.log("Missing environment variables - cannot generate JWKS URI");
}
