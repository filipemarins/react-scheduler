module.exports = {
  setupFilesAfterEnv: ['./tests/jest.setup.js'],
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!lodash-es)'],
};
