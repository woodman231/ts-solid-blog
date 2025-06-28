// Test specific JWKS URI
const https = require("https");

const jwksUri =
  "https://opsystempilot.b2clogin.com/opsystempilot.onmicrosoft.com/b2c_1_signup_signin/discovery/v2.0/keys";

console.log("Testing JWKS URI:", jwksUri);

const req = https.get(jwksUri, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("Status:", res.statusCode);

    if (res.statusCode === 200) {
      try {
        const parsed = JSON.parse(data);
        console.log(
          "Success! Number of keys:",
          parsed.keys ? parsed.keys.length : 0
        );
        if (parsed.keys && parsed.keys.length > 0) {
          console.log("First key ID:", parsed.keys[0].kid);
        }
      } catch (e) {
        console.log("Error parsing JSON:", e.message);
      }
    } else {
      console.log("Error response:", data);
    }
  });
});

req.on("error", (error) => {
  console.log("Request failed:", error.message);
});

req.setTimeout(10000, () => {
  req.destroy();
  console.log("Request timed out");
});
