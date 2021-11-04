module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{js,ts}"],
  coverageDirectory: "reports/coverage/",
  coveragePathIgnorePatterns: [
    "<rootDir>/src/index.ts",
    "<rootDir>/src/server.ts",
    "<rootDir>/node_modules/",
    "<rootDir>/dist/",
  ],
  modulePaths: ["<rootDir>/src/"],
  reporters: ["default", ["jest-junit", { outputDirectory: "reports/tests/" }]],
  roots: ["<rootDir>/tests"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/"],
  testTimeout: 25000,
  transform: { "\\.ts$": ["ts-jest"] },
};
