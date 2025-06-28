/**
 * Simple test script to verify Azure AD B2C JWKS endpoint is accessible
 * Run this with: node test-jwks.js
 */

const https = require("https");

// Read environment variables
require("dotenv").config();

const adb2cDomainName = process.env.ADB2C_DOMAIN_NAME;
const adb2cTenantName = process.env.ADB2C_TENANT_NAME;
const adb2cSignUpSignInPolicyName = process.env.ADB2C_SIGNUP_SIGNIN_POLICY_NAME;

if (!adb2cDomainName || !adb2cTenantName || !adb2cSignUpSignInPolicyName) {
  console.error("Missing required environment variables:");
  console.error("- ADB2C_DOMAIN_NAME:", adb2cDomainName);
  console.error("- ADB2C_TENANT_NAME:", adb2cTenantName);
  console.error(
    "- ADB2C_SIGNUP_SIGNIN_POLICY_NAME:",
    adb2cSignUpSignInPolicyName
  );
  process.exit(1);
}

// Construct JWKS URIs to test
const jwksUris = [
  // Standard B2C format
  `https://${adb2cDomainName}/${adb2cTenantName}.onmicrosoft.com/${adb2cSignUpSignInPolicyName}/discovery/v2.0/keys`,
  // Alternative format (if tenant name is different)
  `https://${adb2cDomainName}/${adb2cTenantName}/${adb2cSignUpSignInPolicyName}/discovery/v2.0/keys`,
  // OpenID Connect discovery endpoint
  `https://${adb2cDomainName}/${adb2cTenantName}.onmicrosoft.com/${adb2cSignUpSignInPolicyName}/v2.0/.well-known/openid-configuration`,
];

async function testEndpoint(url) {
  return new Promise((resolve, reject) => {
    console.log(`\nTesting: ${url}`);

    const req = https.get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log(`Status: ${res.statusCode}`);

        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            if (url.includes(".well-known/openid-configuration")) {
              console.log("OpenID Discovery successful");
              console.log("JWKS URI from discovery:", parsed.jwks_uri);
              console.log("Issuer:", parsed.issuer);
            } else {
              console.log("JWKS endpoint successful");
              console.log(
                "Number of keys:",
                parsed.keys ? parsed.keys.length : 0
              );
            }
            resolve({ success: true, data: parsed });
          } catch (e) {
            console.log("Response is not valid JSON");
            resolve({ success: false, error: "Invalid JSON" });
          }
        } else {
          console.log("Error response:", data);
          resolve({ success: false, status: res.statusCode, error: data });
        }
      });
    });

    req.on("error", (error) => {
      console.log("Request failed:", error.message);
      resolve({ success: false, error: error.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log("Request timed out");
      resolve({ success: false, error: "Timeout" });
    });
  });
}

async function main() {
  console.log("Testing Azure AD B2C JWKS endpoints...");
  console.log("Environment:");
  console.log("- ADB2C_DOMAIN_NAME:", adb2cDomainName);
  console.log("- ADB2C_TENANT_NAME:", adb2cTenantName);
  console.log(
    "- ADB2C_SIGNUP_SIGNIN_POLICY_NAME:",
    adb2cSignUpSignInPolicyName
  );

  for (const uri of jwksUris) {
    await testEndpoint(uri);
  }

  console.log("\nTest completed.");
}

main().catch(console.error);
