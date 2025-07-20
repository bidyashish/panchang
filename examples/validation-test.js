#!/usr/bin/env node

/**
 * Quick validation of the new getCurrentPlanets function
 */

const { getCurrentPlanets } = require('../dist/index.js');

console.log('🔍 Quick Validation of getCurrentPlanets');
console.log('=' .repeat(45));

// Test with a known date
const testDate = new Date('2024-06-21T12:00:00Z'); // Summer solstice
console.log(`Test Date: ${testDate.toISOString()}`);

try {
    const planets = getCurrentPlanets(testDate);
    
    console.log(`\n✅ Successfully retrieved ${planets.length} planetary positions\n`);
    
    // Quick validation
    let allValid = true;
    
    planets.forEach((planet, index) => {
        const issues = [];
        
        // Validate longitude
        if (planet.longitude < 0 || planet.longitude >= 360) {
            issues.push(`longitude ${planet.longitude} out of range`);
        }
        
        // Validate rashi
        if (planet.rashi.rashi < 1 || planet.rashi.rashi > 12) {
            issues.push(`rashi ${planet.rashi.rashi} out of range`);
        }
        if (planet.rashi.degree < 0 || planet.rashi.degree >= 30) {
            issues.push(`rashi degree ${planet.rashi.degree} out of range`);
        }
        
        // Validate nakshatra
        if (planet.nakshatra.nakshatra < 1 || planet.nakshatra.nakshatra > 27) {
            issues.push(`nakshatra ${planet.nakshatra.nakshatra} out of range`);
        }
        if (planet.nakshatra.pada < 1 || planet.nakshatra.pada > 4) {
            issues.push(`pada ${planet.nakshatra.pada} out of range`);
        }
        
        // Validate consistency: longitude should match rashi calculation
        const expectedLongitude = (planet.rashi.rashi - 1) * 30 + planet.rashi.degree;
        if (Math.abs(expectedLongitude - planet.longitude) > 0.01) {
            issues.push(`longitude/rashi mismatch: expected ${expectedLongitude.toFixed(4)}, got ${planet.longitude.toFixed(4)}`);
        }
        
        if (issues.length > 0) {
            console.log(`❌ ${planet.planet}: ${issues.join(', ')}`);
            allValid = false;
        } else {
            console.log(`✅ ${planet.planet}: ${planet.rashi.name} ${planet.rashi.degree.toFixed(1)}°, ${planet.nakshatra.name} (${planet.nakshatra.pada})`);
        }
    });
    
    if (allValid) {
        console.log('\n🎉 All validations passed! Function is working correctly.');
    } else {
        console.log('\n⚠️ Some validation issues found.');
    }
    
    // Test with current date
    console.log('\n--- Testing with current date ---');
    const currentPlanets = getCurrentPlanets();
    console.log(`Current date results: ${currentPlanets.length} planets`);
    
    const sun = currentPlanets.find(p => p.planet === 'Sun');
    if (sun) {
        console.log(`Current Sun position: ${sun.rashi.name} ${sun.rashi.degree.toFixed(2)}°`);
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
}
