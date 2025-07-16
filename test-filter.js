// Test script to verify the filtering logic
const { parseColumnFilters } = require("./apps/server/src/utils/filterParser");

// Test the filter parsing with the exact input from the user's error
const testFilter = {
  title: {
    operator: "contains",
    value: "buzz",
  },
};

console.log("Test Input:", JSON.stringify(testFilter, null, 2));

try {
  const result = parseColumnFilters(testFilter);
  console.log("Parsed Result:", JSON.stringify(result, null, 2));
} catch (error) {
  console.error("Error:", error.message);
}
