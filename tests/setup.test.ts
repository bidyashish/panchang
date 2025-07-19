import { beforeAll, afterAll, describe, test, expect } from 'vitest';

describe('Test Setup', () => {
    beforeAll(() => {
        // Setup code for the testing environment
        console.log('Setting up test environment...');
        
        // Set any global test configurations
        process.env.NODE_ENV = 'test';
    });

    afterAll(() => {
        // Cleanup code after tests are done
        console.log('Cleaning up test environment...');
    });

    test('environment should be properly configured', () => {
        expect(process.env.NODE_ENV).toBe('test');
    });

    test('required modules should be loadable', () => {
        expect(() => require('../dist/calculations/ephemeris')).not.toThrow();
        expect(() => require('../dist/calculations/planetary')).not.toThrow();
        expect(() => require('../dist/utils/index')).not.toThrow();
    });
});