/** @type {import('jest').Config} */
module.exports = {
    preset: 'jest-expo',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testMatch: [
        '<rootDir>/**/__tests__/**/*.[jt]s?(x)',
        '<rootDir>/**/*.(spec|test).[jt]s?(x)',
    ],
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/android/',
        '<rootDir>/ios/',
    ],
};
