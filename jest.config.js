const nextJest = require("next/jest")

// Create a custom Jest config using Next.js' config loader
const createJestConfig = nextJest({
  dir: "./", // Path to your Next.js app (where next.config.js and .env live)
})

/** @type {import('jest').Config} */
const customJestConfig = {
  // Run setup before each test
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Jest environment for React/Next.js components
  testEnvironment: "jest-environment-jsdom",

  // Ignore these folders from test discovery
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],

  // Allow `@/` imports to map to the root
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // Collect coverage only from app code
  collectCoverageFrom: [
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "app/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
}

module.exports = createJestConfig(customJestConfig)
