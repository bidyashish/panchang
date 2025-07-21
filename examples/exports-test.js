#!/usr/bin/env node

/**
 * Test Exports - Verify all main functions work correctly
 * 
 * This script tests the main exported functions to ensure they work properly
 */

const { 
    getPanchanga, 
    getPanchangaReport, 
    getCurrentPlanets, 
    getAyanamsa, 
    getSpecificAyanamsa,
    AstronomicalCalculator 
} = require('../dist/index.js');

console.log('🧪 Testing Package Exports...\n');

const testDate = new Date('2025-01-18T12:00:00Z');
const latitude = 12.972;
const longitude = 77.594;
const timezone = 'Asia/Kolkata';

let testsPassed = 0;
let testsFailed = 0;

function testFunction(name, testFn) {
    try {
        const result = testFn();
        console.log(`✅ ${name}: PASSED`);
        testsPassed++;
        return result;
    } catch (error) {
        console.log(`❌ ${name}: FAILED - ${error.message}`);
        testsFailed++;
        return null;
    }
}

// Test 1: getPanchanga
testFunction('getPanchanga', () => {
    const panchanga = getPanchanga(testDate, latitude, longitude, timezone);
    if (!panchanga || !panchanga.vara || !panchanga.tithi) {
        throw new Error('Invalid panchanga data');
    }
    return panchanga;
});

// Test 2: getPanchangaReport
testFunction('getPanchangaReport', () => {
    const report = getPanchangaReport(testDate, latitude, longitude, timezone);
    if (!report || typeof report !== 'string') {
        throw new Error('Invalid report format');
    }
    return report;
});

// Test 3: getCurrentPlanets
testFunction('getCurrentPlanets', () => {
    const planets = getCurrentPlanets(testDate, 1);
    if (!planets || !Array.isArray(planets) || planets.length === 0) {
        throw new Error('No planetary data');
    }
    return planets;
});

// Test 4: getAyanamsa
testFunction('getAyanamsa', () => {
    const ayanamsa = getAyanamsa(testDate);
    if (!ayanamsa || !Array.isArray(ayanamsa) || ayanamsa.length === 0) {
        throw new Error('No ayanamsa data');
    }
    return ayanamsa;
});

// Test 5: getSpecificAyanamsa
testFunction('getSpecificAyanamsa', () => {
    const lahiri = getSpecificAyanamsa(1, testDate);
    if (!lahiri || !lahiri.name || !lahiri.degree) {
        throw new Error('Invalid ayanamsa data');
    }
    return lahiri;
});

// Test 6: AstronomicalCalculator class
testFunction('AstronomicalCalculator', () => {
    const calculator = new AstronomicalCalculator();
    const panchanga = calculator.calculatePanchanga({
        date: testDate,
        location: { latitude, longitude, timezone }
    });
    calculator.cleanup();
    
    if (!panchanga || !panchanga.vara) {
        throw new Error('Invalid calculator output');
    }
    return panchanga;
});

console.log('\n📊 Test Results:');
console.log(`   Passed: ${testsPassed}`);
console.log(`   Failed: ${testsFailed}`);
console.log(`   Total: ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
    console.log('\n🎉 All tests passed! Package is working correctly.');
} else {
    console.log('\n⚠️  Some tests failed. Please check the implementation.');
    process.exit(1);
}
