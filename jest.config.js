module.exports = {
  testEnvironment: 'node',
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
  // Where Jest should look for test files
  testMatch: [
    '**/__tests__/**/*.test.js', // Look in __tests__ folders
    '**/?(*.)+(spec|test).js', // Or files ending with .spec.js or .test.js
  ],
  // Setup files to run before each test file (useful for env variables)
  setupFiles: ['<rootDir>/jest.setup.js'],
}
