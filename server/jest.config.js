export default {
  testEnvironment: 'node',
  collectCoverageFrom: ['**/*.js', '!**/node_modules/**', '!**/scripts/**', '!**/config/logger.js'],
  transform: {},
  setupFiles: ['<rootDir>/tests/setupEnv.js'],
};