#!/usr/bin/env node

/**
 * Test Runner - Run all examples and tests
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Running All Examples and Tests');
console.log('='.repeat(50));

// Check if dist directory exists
const distPath = path.join(__dirname, '../dist');
if (!fs.existsSync(distPath)) {
    console.log('❌ Project not built. Run: npm run build');
    process.exit(1);
}

const tests = [
    {
        name: 'Exports Test',
        file: 'exports-test.js',
        description: 'Test all exported functions'
    },
    {
        name: 'Validation Test',
        file: 'validation-test.js',
        description: 'Validate calculations against reference data'
    },
    {
        name: 'Usage Examples',
        file: 'usage-example.js',
        description: 'Basic usage patterns'
    },
    {
        name: 'Ayanamsa Demo',
        file: 'ayanamsa-example.js',
        description: 'Ayanamsa systems demonstration'
    },
    {
        name: 'Planetary Positions',
        file: 'planetary-positions-example.js',
        description: 'Planetary calculations'
    },
    {
        name: 'Location Names',
        file: 'location-name-example.js',
        description: 'Location name functionality'
    },
    {
        name: 'Enhanced Features',
        file: 'enhanced-features-demo.js',
        description: 'Advanced features demo'
    },
    {
        name: 'Complete Report',
        file: 'complete-astrological-report.js',
        description: 'Full astrological report'
    }
];

let passed = 0;
let failed = 0;

for (const test of tests) {
    console.log(`\n🔍 Running: ${test.name}`);
    console.log(`📄 File: ${test.file}`);
    console.log(`📝 Description: ${test.description}`);
    console.log('-'.repeat(40));
    
    try {
        const startTime = Date.now();
        execSync(`node ${test.file}`, { 
            cwd: __dirname, 
            stdio: 'pipe',
            timeout: 30000 // 30 second timeout
        });
        const duration = Date.now() - startTime;
        
        console.log(`✅ ${test.name}: PASSED (${duration}ms)`);
        passed++;
    } catch (error) {
        console.log(`❌ ${test.name}: FAILED`);
        console.log(`Error: ${error.message}`);
        failed++;
    }
}

console.log('\n' + '='.repeat(50));
console.log('📊 Test Results Summary');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total: ${passed + failed}`);

if (failed === 0) {
    console.log('\n🎉 All tests passed! Library is working correctly.');
    process.exit(0);
} else {
    console.log('\n⚠️  Some tests failed. Check the output above.');
    process.exit(1);
}
