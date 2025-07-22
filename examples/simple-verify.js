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
    console.log(result)
    console.log('\n📊 DETAILED LIBRARY DATA:');
    console.log('=====================================');
    
    // VARA (Weekday) Details
    console.log('\n🗓️  VARA (WEEKDAY) DATA:');
    console.log(`   Name: ${result.vara.name}`);
    console.log(`   Number: ${result.vara.number}`);
    console.log(`   Full vara object:`, JSON.stringify(result.vara, null, 2));
    
    // TITHI Details  
    console.log('\n🌙 TITHI DATA:');
    console.log(`   Name: ${result.tithi.name}`);
    console.log(`   Number: ${result.tithi.number}`);
    console.log(`   Paksha: ${result.tithi.paksha}`);
    console.log(`   Percentage: ${result.tithi.percentage ? result.tithi.percentage.toFixed(1) + '%' : 'N/A'}`);
    console.log(`   End Time: ${result.tithi.endTime ? result.tithi.endTime.toISOString() : 'N/A'} UTC`);
    console.log(`   Full tithi object:`, JSON.stringify(result.tithi, null, 2));
    
    // NAKSHATRA Details
    console.log('\n⭐ NAKSHATRA DATA:');
    console.log(`   Name: ${result.nakshatra.name}`);
    console.log(`   Number: ${result.nakshatra.number}`);
    console.log(`   Pada: ${result.nakshatra.pada}`);
    console.log(`   Lord: ${result.nakshatra.lord || 'N/A'}`);
    console.log(`   Percentage: ${result.nakshatra.percentage ? result.nakshatra.percentage.toFixed(1) + '%' : 'N/A'}`);
    console.log(`   End Time: ${result.nakshatra.endTime ? result.nakshatra.endTime.toISOString() : 'N/A'} UTC`);
    console.log(`   Full nakshatra object:`, JSON.stringify(result.nakshatra, null, 2));
    
    // YOGA Details
    console.log('\n🧘 YOGA DATA:');
    console.log(`   Name: ${result.yoga.name}`);
    console.log(`   Number: ${result.yoga.number}`);
    console.log(`   Percentage: ${result.yoga.percentage ? result.yoga.percentage.toFixed(1) + '%' : 'N/A'}`);
    console.log(`   End Time: ${result.yoga.endTime ? result.yoga.endTime.toISOString() : 'N/A'} UTC`);
    console.log(`   Full yoga object:`, JSON.stringify(result.yoga, null, 2));
    
    // KARANA Details
    console.log('\n🔄 KARANA DATA:');
    console.log(`   Name: ${result.karana.name}`);
    console.log(`   Number: ${result.karana.number}`);
    console.log(`   Type: ${result.karana.type || 'N/A'}`);
    console.log(`   End Time: ${result.karana.endTime ? result.karana.endTime.toISOString() : 'N/A'} UTC`);
    console.log(`   Full karana object:`, JSON.stringify(result.karana, null, 2));
    
    // Additional Calculated Data
    console.log('\n🌍 ADDITIONAL CALCULATED DATA:');
    console.log(`   Moon Phase: ${result.moonPhase || 'N/A'}`);
    console.log(`   Sunrise: ${result.sunrise ? result.sunrise.toISOString() : 'N/A'} UTC`);
    console.log(`   Sunset: ${result.sunset ? result.sunset.toISOString() : 'N/A'} UTC`);
    if (result.rahuKaal) {
        console.log(`   Rahu Kaal: ${result.rahuKaal.start ? result.rahuKaal.start.toISOString() : 'N/A'} - ${result.rahuKaal.end ? result.rahuKaal.end.toISOString() : 'N/A'} UTC`);
    }
    
    console.log('\n📊 SUMMARY RESULTS:');
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
    
    // Show complete result object for debugging
    console.log('\n🔍 COMPLETE LIBRARY RESULT OBJECT:');
    console.log('=====================================');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n✨ Verification complete!');
    
} catch (error) {
    console.error('❌ Error during verification:', error.message);
    process.exit(1);
}
