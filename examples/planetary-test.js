#!/usr/bin/env node

/**
 * Simple Planetary Positions Test
 * 
 * Tests the getCurrentPlanets function with basic validation
 */

const { getCurrentPlanets, getSpecificAyanamsa } = require('../../dist/index.js');

console.log('🧪 Testing getCurrentPlanets Function');
console.log('=' .repeat(40));

try {
    const testDate = new Date('2024-01-01T12:00:00Z');
    console.log(`\n📅 Test Date: ${testDate.toISOString()}`);

    // Test 1: Basic functionality
    console.log('\n🔬 Test 1: Basic Functionality');
    const planets = getCurrentPlanets(testDate);
    
    console.log(`✓ Successfully retrieved ${planets.length} planetary positions`);
    
    // Validate structure
    planets.forEach((planet, index) => {
        console.log(`\n${index + 1}. ${planet.planet}:`);
        console.log(`   Longitude: ${planet.longitude.toFixed(2)}° (${typeof planet.longitude})`);
        console.log(`   Latitude: ${planet.latitude.toFixed(2)}° (${typeof planet.latitude})`);
        console.log(`   Rashi: ${planet.rashi.name} (${planet.rashi.rashi}) - ${planet.rashi.element}`);
        console.log(`   Nakshatra: ${planet.nakshatra.name} (${planet.nakshatra.nakshatra}), Pada: ${planet.nakshatra.pada}`);
        
        // Validate data types and ranges
        if (typeof planet.longitude !== 'number' || planet.longitude < 0 || planet.longitude >= 360) {
            console.log(`   ⚠️  Warning: Longitude out of range`);
        }
        if (typeof planet.rashi.rashi !== 'number' || planet.rashi.rashi < 1 || planet.rashi.rashi > 12) {
            console.log(`   ⚠️  Warning: Rashi number out of range`);
        }
        if (typeof planet.nakshatra.nakshatra !== 'number' || planet.nakshatra.nakshatra < 1 || planet.nakshatra.nakshatra > 27) {
            console.log(`   ⚠️  Warning: Nakshatra number out of range`);
        }
        if (typeof planet.nakshatra.pada !== 'number' || planet.nakshatra.pada < 1 || planet.nakshatra.pada > 4) {
            console.log(`   ⚠️  Warning: Pada out of range`);
        }
    });

    // Test 2: Different ayanamsa systems
    console.log('\n🔬 Test 2: Different Ayanamsa Systems');
    
    const ayanamsaIds = [1, 3, 5]; // Lahiri, Raman, KP
    ayanamsaIds.forEach(id => {
        const ayanamsa = getSpecificAyanamsa(id, testDate);
        const planetsWithAyanamsa = getCurrentPlanets(testDate, id);
        
        if (ayanamsa) {
            console.log(`\n${ayanamsa.name} (ID: ${id}): ${ayanamsa.degree.toFixed(4)}°`);
            console.log(`Sun position: ${planetsWithAyanamsa[0].longitude.toFixed(4)}°`);
        }
    });

    // Test 3: Current date
    console.log('\n🔬 Test 3: Current Date');
    const currentPlanets = getCurrentPlanets();
    console.log(`✓ Current positions calculated for ${currentPlanets.length} planets`);
    
    const sun = currentPlanets.find(p => p.planet === 'Sun');
    const moon = currentPlanets.find(p => p.planet === 'Moon');
    
    if (sun && moon) {
        console.log(`Sun: ${sun.rashi.name} ${sun.rashi.degree.toFixed(1)}°, ${sun.nakshatra.name} ${sun.nakshatra.pada}`);
        console.log(`Moon: ${moon.rashi.name} ${moon.rashi.degree.toFixed(1)}°, ${moon.nakshatra.name} ${moon.nakshatra.pada}`);
    }

    console.log('\n✅ All tests completed successfully!');
    
} catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\nStack trace:', error.stack);
}
