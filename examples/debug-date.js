#!/usr/bin/env node

/**
 * Debug date handling in the library
 */

const { getPanchanga } = require('../dist/index.js');

// Test with the exact same date from verify-drikpanchang.js
const testDate = new Date('2025-07-20T12:00:00.000-07:00');

console.log('🔍 Debug Date Handling');
console.log('='.repeat(50));
console.log('Original date string: 2025-07-20T12:00:00.000-07:00');
console.log('Parsed Date object:', testDate);
console.log('Date.toISOString():', testDate.toISOString());
console.log('Date UTC string:', testDate.toISOString());
console.log('Date.getDay() (0=Sunday):', testDate.getDay());
console.log('Date in Vancouver timezone:', testDate.toLocaleString('en-US', { timeZone: 'America/Vancouver' }));

// Test location (Kelowna)
const location = {
    latitude: 49.8880,
    longitude: -119.4960,
    timezone: 'America/Vancouver'
};

console.log('\n🧮 Calling getPanchanga...');
try {
    const result = getPanchanga(testDate, location.latitude, location.longitude, location.timezone);
    
    console.log('\n📊 Library Result:');
    console.log('Result date:', result.date);
    console.log('Result date ISO:', result.date.toISOString());
    console.log('Result vara:', result.vara);
    console.log('Expected vara for July 20, 2025 (Sunday):', 'Sunday');
    
    // Check if dates match
    if (result.date.toISOString() === testDate.toISOString()) {
        console.log('✅ Date preserved correctly');
    } else {
        console.log('❌ Date was modified!');
        console.log('Expected:', testDate.toISOString());
        console.log('Got:', result.date.toISOString());
    }
    
    // Check vara
    if (result.vara.name === 'Sunday') {
        console.log('✅ Vara calculated correctly for Sunday');
    } else {
        console.log('❌ Vara incorrect!');
        console.log('Expected: Sunday');
        console.log('Got:', result.vara.name);
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
}
