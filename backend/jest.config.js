export default {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }],
  },
  moduleNameMapper: {
    '^#controllers/(.*)\\.js$': '<rootDir>/src/controllers/$1.ts',
    '^#config/(.*)\\.js$': '<rootDir>/src/config/$1.ts',
    '^#routes/(.*)\\.js$': '<rootDir>/src/routes/$1.ts',
    '^#lib/(.*)\\.js$': '<rootDir>/src/lib/$1.ts',
    '^#models/(.*)\\.js$': '<rootDir>/src/models/$1.ts',
    '^#emails/(.*)\\.js$': '<rootDir>/src/emails/$1.ts',
    '^#middleware/(.*)\\.js$': '<rootDir>/src/middleware/$1.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/*.test.ts'],
};
