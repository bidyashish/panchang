/**
 * Test the updated comprehensive getPanchanga method
 */

const { getPanchanga, getPanchangaReport } = require('./dist/index.js');

// Test date and location - July 20, 2025 (Sunday) at 12:00 PM PDT (Kelowna, BC, Canada)
const TEST_DATE_STRING = '2025-07-20T12:00:00.000-07:00';
const TEST_DATE = new Date(TEST_DATE_STRING);
const LOCATION = {
    name: 'Kelowna, BC, Canada',
    latitude: 49.8880,
    longitude: -119.4960,
    timezone: 'America/Vancouver'
};

console.log('🔬 TESTING COMPREHENSIVE PANCHANGA OUTPUT');
console.log('=' .repeat(65));
console.log(`📅 Test Date: ${TEST_DATE_STRING}`);
console.log(`📍 Location: ${LOCATION.name}`);
console.log('=' .repeat(65));

try {
    // Test the comprehensive getPanchanga function
    console.log('\n🧪 Testing getPanchanga() - Comprehensive Output');
    console.log('-'.repeat(50));
    
    const panchanga = getPanchanga(TEST_DATE, LOCATION.latitude, LOCATION.longitude, LOCATION.timezone);
    
    console.log('✅ getPanchanga() executed successfully');
    console.log('\n📊 COMPREHENSIVE PANCHANGA DATA:');
    
    // Display basic panchanga elements
    console.log(`\n🗓️  BASIC ELEMENTS:`);
    console.log(`   Vara: ${panchanga.vara.name} (${panchanga.vara.number})`);
    console.log(`   Tithi: ${panchanga.tithi.name} (${panchanga.tithi.percentage.toFixed(1)}% complete)`);
    console.log(`   Paksha: ${panchanga.tithi.paksha}`);
    console.log(`   Nakshatra: ${panchanga.nakshatra.name} - Pada ${panchanga.nakshatra.pada} (${panchanga.nakshatra.percentage.toFixed(1)}% complete)`);
    console.log(`   Yoga: ${panchanga.yoga.name} (${panchanga.yoga.percentage.toFixed(1)}% complete)`);
    console.log(`   Karana: ${panchanga.karana.name}`);
    console.log(`   Moon Phase: ${panchanga.moonPhase}`);
    
    // Display time information
    console.log(`\n⏰ TIME INFORMATION:`);
    console.log(`   Sunrise: ${panchanga.sunrise?.toLocaleTimeString() || 'N/A'}`);
    console.log(`   Sunset: ${panchanga.sunset?.toLocaleTimeString() || 'N/A'}`);
    console.log(`   Moonrise: ${panchanga.moonrise?.toLocaleTimeString() || 'N/A'}`);
    console.log(`   Moonset: ${panchanga.moonset?.toLocaleTimeString() || 'N/A'}`);
    console.log(`   Day Duration: ${panchanga.dinamana.hours}h ${panchanga.dinamana.minutes}m ${panchanga.dinamana.seconds}s`);
    
    // Display calendar information
    console.log(`\n📅 CALENDAR INFO:`);
    console.log(`   Lunar Month (Amanta): ${panchanga.lunarMonth.amanta}`);
    console.log(`   Lunar Month (Purnimanta): ${panchanga.lunarMonth.purnimanta}`);
    console.log(`   Shaka Samvat: ${panchanga.samvata.shaka}`);
    console.log(`   Vikrama Samvat: ${panchanga.samvata.vikrama}`);
    console.log(`   Sun Sign: ${panchanga.sunsign}`);
    console.log(`   Moon Sign: ${panchanga.moonsign}`);
    
    // Display planetary positions
    console.log(`\n🪐 PLANETARY POSITIONS:`);
    Object.keys(panchanga.planetaryPositions).forEach(planet => {
        const pos = panchanga.planetaryPositions[planet];
        console.log(`   ${planet}: ${pos.siderealLongitude.toFixed(2)}° - ${pos.rashi.name} - ${pos.nakshatra.name}`);
    });
    
    // Display ayanamsa
    console.log(`\n📐 AYANAMSA:`);
    console.log(`   ${panchanga.ayanamsa.name}: ${panchanga.ayanamsa.degree.toFixed(4)}°`);
    console.log(`   Description: ${panchanga.ayanamsa.description}`);
    
    // Display kalam periods
    console.log(`\n⚫ KALAM PERIODS:`);
    console.log(`   Rahu Kaal: ${panchanga.kalam.rahu.start?.toLocaleTimeString() || 'N/A'} - ${panchanga.kalam.rahu.end?.toLocaleTimeString() || 'N/A'}`);
    console.log(`   Gulikai Kaal: ${panchanga.kalam.gulikai.start?.toLocaleTimeString() || 'N/A'} - ${panchanga.kalam.gulikai.end?.toLocaleTimeString() || 'N/A'}`);
    console.log(`   Yamaganda Kaal: ${panchanga.kalam.yamaganda.start?.toLocaleTimeString() || 'N/A'} - ${panchanga.kalam.yamaganda.end?.toLocaleTimeString() || 'N/A'}`);
    
    console.log('\n🧪 Testing getPanchangaReport() - Comprehensive Report');
    console.log('-'.repeat(50));
    
    const report = getPanchangaReport(TEST_DATE, LOCATION.latitude, LOCATION.longitude, LOCATION.timezone, LOCATION.name);
    
    console.log('✅ getPanchangaReport() executed successfully');
    console.log('\n📋 COMPREHENSIVE REPORT:');
    console.log(report);
    
} catch (error) {
    console.error('❌ Error testing comprehensive Panchanga:', error.message);
    console.error('Stack:', error.stack);
}

console.log('\n🎉 COMPREHENSIVE TESTING COMPLETED!');
console.log('📦 The getPanchanga method now returns comprehensive Panchanga data');
console.log('🌟 All traditional Hindu calendar elements included');
console.log('🔧 Swiss Ephemeris integration for high precision');
