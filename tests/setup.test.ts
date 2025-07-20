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
        expect(() => require('../dist/index.js')).not.toThrow();
        
        // Test that the main exported functions are available
        const panchang = require('../dist/index.js');
        expect(panchang).toHaveProperty('getPanchanga');
        expect(panchang).toHaveProperty('Ephemeris');
        expect(typeof panchang.getPanchanga).toBe('function');
    });
});