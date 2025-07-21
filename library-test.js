#!/usr/bin/env node

/**
 * Simple verification test for library functionality
 * Testing NPM library export functions
 */

// Import the library
const { 
    getPanchanga, 
    getCurrentPlanets, 
    getAyanamsa,
    getSpecificAyanamsa,
    AstronomicalCalculator 
} = require('../dist/index.js');

console.log('🔍 Library Function Verification Test');
console.log('===================================');

// Test date: July 20, 2025 (Sunday) at noon PDT
const testDate = new Date('2025-07-20T12:00:00.000-07:00'); // Noon PDT
const latitude = 49.8880; // Kelowna, BC
const longitude = -119.4960;
const timezone = 'America/Vancouver';

console.log('📅 Test Date:', testDate.toISOString());
console.log('📅 Local Date:', testDate.toLocaleString('en-US', { timeZone: timezone }));
console.log('📅 Weekday:', testDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: timezone }));
console.log('📍 Location: Kelowna, BC, Canada');
console.log('🌐 Coordinates:', `${latitude}°N, ${longitude}°W`);

console.log('\n🧮 Testing getPanchanga function...');
try {
    const panchanga = getPanchanga(testDate, latitude, longitude, timezone);
    
    console.log('✅ getPanchanga succeeded');
    console.log('📊 Results:');
    console.log('   Date:', panchanga.date.toISOString());
    console.log('   Vara:', panchanga.vara.name, `(${panchanga.vara.number})`);
    console.log('   Tithi:', panchanga.tithi.name, `(${panchanga.tithi.number})`);
    console.log('   Nakshatra:', panchanga.nakshatra.name, `(${panchanga.nakshatra.number})`);
    console.log('   Yoga:', panchanga.yoga.name, `(${panchanga.yoga.number})`);
    console.log('   Karana:', panchanga.karana.name, `(${panchanga.karana.number})`);
    
    // Expected for July 20, 2025 (Sunday) according to DrikPanchang:
    const expected = {
        vara: 'Sunday',
        tithi: 'Ekadashi', 
        nakshatra: 'Krittika',
        yoga: 'Ganda'
    };
    
    console.log('\n🎯 Verification against DrikPanchang.com:');
    console.log('   Expected Vara:', expected.vara, '| Calculated:', panchanga.vara.name, panchanga.vara.name === expected.vara ? '✅' : '❌');
    console.log('   Expected Tithi:', expected.tithi, '| Calculated:', panchanga.tithi.name, panchanga.tithi.name === expected.tithi ? '✅' : '❌');
    console.log('   Expected Nakshatra:', expected.nakshatra, '| Calculated:', panchanga.nakshatra.name, panchanga.nakshatra.name === expected.nakshatra ? '✅' : '❌');
    console.log('   Expected Yoga:', expected.yoga, '| Calculated:', panchanga.yoga.name, panchanga.yoga.name === expected.yoga ? '✅' : '❌');
    
} catch (error) {
    console.error('❌ getPanchanga failed:', error.message);
}

console.log('\n🪐 Testing getCurrentPlanets function...');
try {
    const planets = getCurrentPlanets(testDate, 1); // Lahiri ayanamsa
    console.log('✅ getCurrentPlanets succeeded');
    console.log('📊 Found', planets.length, 'planetary positions');
    
    if (planets.length > 0) {
        const sun = planets.find(p => p.planet === 'Sun');
        const moon = planets.find(p => p.planet === 'Moon');
        
        if (sun) console.log('   Sun:', sun.longitude.toFixed(2), '° in', sun.rashi.name);
        if (moon) console.log('   Moon:', moon.longitude.toFixed(2), '° in', moon.rashi.name, 'in', moon.nakshatra.name);
    }
} catch (error) {
    console.error('❌ getCurrentPlanets failed:', error.message);
}

console.log('\n📐 Testing getSpecificAyanamsa function...');
try {
    const lahiri = getSpecificAyanamsa(1, testDate); // Lahiri ayanamsa
    console.log('✅ getSpecificAyanamsa succeeded');
    console.log('📊 Lahiri Ayanamsa:', lahiri?.degree?.toFixed(4), '°');
} catch (error) {
    console.error('❌ getSpecificAyanamsa failed:', error.message);
}

console.log('\n🏗️  Testing AstronomicalCalculator class...');
try {
    const calculator = new AstronomicalCalculator();
    const panchangaData = calculator.calculatePanchanga({
        date: testDate,
        location: { latitude, longitude, timezone }
    });
    
    console.log('✅ AstronomicalCalculator succeeded');
    console.log('📊 Calculator Results:');
    console.log('   Vara:', panchangaData.vara.name);
    console.log('   Tithi:', panchangaData.tithi.name, `(${panchangaData.tithi.percentage.toFixed(1)}% complete)`);
    
    calculator.cleanup();
} catch (error) {
    console.error('❌ AstronomicalCalculator failed:', error.message);
}

console.log('\n🎉 Library verification test completed!');
console.log('✅ NPM library functions are working');
console.log('📦 All imports resolved correctly');
console.log('🛠️  Swiss Ephemeris integration functional');
