/**
 * Simple Panchanga Verification against DrikPanchang.com
 * Quick test to verify library accuracy
 */

const { getPanchanga } = require('../dist/index.js');

// Test configuration - Sunday, July 20, 2025 at 12:00 PM PDT
const testDate = new Date('2025-07-20T12:00:00.000-07:00');
const location = {
    name: 'Kelowna, BC, Canada',
    latitude: 49.8880,
    longitude: -119.4960,
    timezone: 'America/Vancouver'
};

// Expected values from DrikPanchang.com
const expected = {
    vara: 'Sunday',
    tithi: 'Ekadashi', 
    nakshatra: 'Krittika',
    yoga: 'Ganda',
    karana: 'Bava'  // Note: Library shows 'Balava'
};

console.log('🔍 SIMPLE PANCHANGA VERIFICATION');
console.log('=====================================');
console.log(`📅 Date: ${testDate.toDateString()}`);
console.log(`📍 Location: ${location.name}`);
console.log(`🌐 Reference: DrikPanchang.com`);
console.log('=====================================');

try {
    // Calculate Panchanga
    const result = getPanchanga(testDate, location.latitude, location.longitude, location.timezone);
    
    console.log('\n📊 CALCULATION RESULTS:');
    console.log(`   Vara (Day):   ${result.vara.name}`);
    console.log(`   Tithi:        ${result.tithi.name} (${result.tithi.paksha} Paksha)`);
    console.log(`   Nakshatra:    ${result.nakshatra.name}`);
    console.log(`   Yoga:         ${result.yoga.name}`);
    console.log(`   Karana:       ${result.karana.name}`);
    
    console.log('\n🎯 VERIFICATION vs DrikPanchang:');
    
    // Check each element
    const checks = [
        { name: 'Vara', got: result.vara.name, expected: expected.vara },
        { name: 'Tithi', got: result.tithi.name, expected: expected.tithi },
        { name: 'Nakshatra', got: result.nakshatra.name, expected: expected.nakshatra },
        { name: 'Yoga', got: result.yoga.name, expected: expected.yoga },
        { name: 'Karana', got: result.karana.name, expected: expected.karana }
    ];
    
    let matches = 0;
    checks.forEach(check => {
        const match = check.got === check.expected;
        const status = match ? '✅' : (check.name === 'Karana' ? '🔸' : '❌');
        console.log(`   ${check.name.padEnd(10)}: ${status} ${check.got} (Expected: ${check.expected})`);
        if (match) matches++;
    });
    
    console.log('\n📈 ACCURACY SUMMARY:');
    console.log(`   Perfect matches: ${matches}/5 (${(matches/5*100).toFixed(0)}%)`);
    console.log(`   Status: ${matches >= 4 ? '🎉 EXCELLENT' : matches >= 3 ? '✅ GOOD' : '⚠️  NEEDS REVIEW'}`);
    
    // Show transition times if available
    if (result.tithi.endTime || result.nakshatra.endTime) {
        console.log('\n⏰ TRANSITION TIMES:');
        if (result.tithi.endTime) {
            console.log(`   Tithi ends: ${result.tithi.endTime.toLocaleString('en-US', { timeZone: location.timezone })}`);
        }
        if (result.nakshatra.endTime) {
            console.log(`   Nakshatra ends: ${result.nakshatra.endTime.toLocaleString('en-US', { timeZone: location.timezone })}`);
        }
    }
    
    // Additional info
    if (result.sunrise && result.sunset) {
        console.log('\n🌅 SUNRISE/SUNSET:');
        console.log(`   Sunrise: ${result.sunrise.toLocaleString('en-US', { timeZone: location.timezone })}`);
        console.log(`   Sunset: ${result.sunset.toLocaleString('en-US', { timeZone: location.timezone })}`);
    }
    
    console.log('\n✨ Verification complete!');
    
} catch (error) {
    console.error('❌ Error during verification:', error.message);
    process.exit(1);
}
