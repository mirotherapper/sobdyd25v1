const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node', // Use node environment to avoid jsdom ES module issues
  
  // Transform ES modules - allow ALL node_modules to be transformed
  transformIgnorePatterns: [
    // Allow all node_modules to be transformed
    '^.+\\.js$' // Don't transform plain JS files, only TS/TSX
  ],
  
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
  },
  
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/test/**/*',
  ],
  
  // Increase timeout for integration tests
  testTimeout: 15000,
  
  // Handle module resolution issues
  resolver: undefined, // Let Next.js handle resolution
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
