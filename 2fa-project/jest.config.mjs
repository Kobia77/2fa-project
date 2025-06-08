/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  preset: "ts-jest",
  setupFiles: ["./jest.polyfills.js"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  // Ignore all node_modules
  transformIgnorePatterns: ["/node_modules/"],
  // Don't look for tests in node_modules
  testPathIgnorePatterns: ["/node_modules/"],
};

export default config;
