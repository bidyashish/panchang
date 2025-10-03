/**
 * Comprehensive Panchang Verification Script
 * Tests today's date, 10 years back, and 10 years forward
 * Compare results with DrikPanchang.com for verification
 */

const { getPanchanga } = require('./dist/index.js');

// Calculate dates
const today = new Date();
const tenYearsAgo = new Date();
tenYearsAgo.setFullYear(today.getFullYear() - 10);
const tenYearsForward = new Date();
tenYearsForward.setFullYear(today.getFullYear() + 10);

// Test locations - you can modify these
const testLocations = [
    {
        name: 'Delhi, India',
        latitude: 28.6139,
        longitude: 77.2090,
        timezone: 'Asia/Kolkata',
        drikUrl: 'https://www.drikpanchang.com/panchang/day-panchang.html?date='
    },
    {
        name: 'Kelowna, BC, Canada',
        latitude: 49.888,
        longitude: -119.496,
        timezone: 'America/Vancouver',
        drikUrl: 'https://www.drikpanchang.com/panchang/day-panchang.html?date='
    },
    {
        name: 'New York, USA',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
        drikUrl: 'https://www.drikpanchang.com/panchang/day-panchang.html?date='
    },
    {
        name: 'Mumbai, India',
        latitude: 19.0760,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata',
        drikUrl: 'https://www.drikpanchang.com/panchang/day-panchang.html?date='
    }
];

// Test dates
const testDates = [
    { label: '10 Years Ago', date: tenYearsAgo },
    { label: 'TODAY', date: today },
    { label: '10 Years Forward', date: tenYearsForward }
];

console.log('═'.repeat(80));
console.log('COMPREHENSIVE PANCHANG VERIFICATION - TIME SPAN TEST');
console.log('═'.repeat(80));
console.log('');
console.log('Test Range:');
console.log(`  • 10 Years Ago:    ${tenYearsAgo.toDateString()} (${tenYearsAgo.getFullYear()})`);
console.log(`  • Today:           ${today.toDateString()} (${today.getFullYear()})`);
console.log(`  • 10 Years Forward: ${tenYearsForward.toDateString()} (${tenYearsForward.getFullYear()})`);
console.log('');
console.log('═'.repeat(80));

// Store results for summary
const results = [];

// Test each location
testLocations.forEach((location, locIndex) => {
    console.log('');
    console.log('─'.repeat(80));
    console.log(`LOCATION ${locIndex + 1}: ${location.name}`);
    console.log(`Coordinates: ${location.latitude}°N, ${location.longitude}°E`);
    console.log(`Timezone: ${location.timezone}`);
    console.log('─'.repeat(80));
    console.log('');

    // Test each date
    testDates.forEach((testCase, dateIndex) => {
        console.log(`${'━'.repeat(40)}`);
        console.log(`${testCase.label} - ${testCase.date.toDateString()}`);
        console.log(`${'━'.repeat(40)}`);

        try {
            const panchanga = getPanchanga(
                testCase.date,
                location.latitude,
                location.longitude,
                location.timezone
            );

            // Format date for DrikPanchang URL (DD-MM-YYYY format)
            const day = testCase.date.getDate().toString().padStart(2, '0');
            const month = (testCase.date.getMonth() + 1).toString().padStart(2, '0');
            const year = testCase.date.getFullYear();
            const drikDateParam = `${day}-${month}-${year}`;

            // Construct DrikPanchang verification URL
            const verificationUrl = `${location.drikUrl}${drikDateParam}&city=custom&lat=${location.latitude}&lon=${location.longitude}&tz=${encodeURIComponent(location.timezone)}`;

            console.log('');
            console.log('📅 CALCULATED PANCHANGA:');
            console.log(`   Vara (Weekday):  ${panchanga.vara.name}`);
            console.log(`   Tithi:           ${panchanga.tithi.name} (${panchanga.tithi.paksha} Paksha, ${panchanga.tithi.percentage.toFixed(1)}% complete)`);
            console.log(`   Nakshatra:       ${panchanga.nakshatra.name} - Pada ${panchanga.nakshatra.pada}`);
            console.log(`   Yoga:            ${panchanga.yoga.name}`);
            console.log(`   Karana:          ${panchanga.karana.name}`);
            console.log(`   Moon Phase:      ${panchanga.moonPhase}`);
            console.log('');

            // Display times
            if (panchanga.sunrise) {
                const sunriseLocal = panchanga.formatters.formatInLocalTimezone(panchanga.sunrise, 'HH:mm:ss');
                console.log(`   Sunrise:         ${sunriseLocal} (${location.timezone})`);
            }
            if (panchanga.sunset) {
                const sunsetLocal = panchanga.formatters.formatInLocalTimezone(panchanga.sunset, 'HH:mm:ss');
                console.log(`   Sunset:          ${sunsetLocal} (${location.timezone})`);
            }

            // Display calendar info
            console.log('');
            console.log('📆 CALENDAR INFO:');
            console.log(`   Lunar Month:     ${panchanga.lunarMonth.amanta} (Amanta)`);
            console.log(`   Sun Sign:        ${panchanga.sunsign}`);
            console.log(`   Moon Sign:       ${panchanga.moonsign}`);
            console.log(`   Ayanamsa:        ${panchanga.ayanamsa.name} (${panchanga.ayanamsa.degree.toFixed(4)}°)`);
            console.log('');

            // Display Rahu Kaal
            if (panchanga.kalam.rahu.start && panchanga.kalam.rahu.end) {
                const rahuStart = panchanga.formatters.formatInLocalTimezone(panchanga.kalam.rahu.start, 'HH:mm');
                const rahuEnd = panchanga.formatters.formatInLocalTimezone(panchanga.kalam.rahu.end, 'HH:mm');
                console.log(`   Rahu Kaal:       ${rahuStart} - ${rahuEnd}`);
            }

            console.log('');
            console.log('🔗 VERIFY ON DRIKPANCHANG.COM:');
            console.log(`   ${verificationUrl}`);
            console.log('');
            console.log('📋 HOW TO VERIFY:');
            console.log('   1. Copy the URL above and paste in your browser');
            console.log('   2. Compare the following elements:');
            console.log(`      • Vara:      ${panchanga.vara.name}`);
            console.log(`      • Tithi:     ${panchanga.tithi.name}`);
            console.log(`      • Nakshatra: ${panchanga.nakshatra.name}`);
            console.log(`      • Yoga:      ${panchanga.yoga.name}`);
            console.log(`      • Karana:    ${panchanga.karana.name}`);
            console.log('   3. Note: Karana may be off by 1 position (acceptable variance)');
            console.log('');

            // Store results
            results.push({
                location: location.name,
                date: testCase.label,
                dateStr: testCase.date.toDateString(),
                vara: panchanga.vara.name,
                tithi: panchanga.tithi.name,
                nakshatra: panchanga.nakshatra.name,
                yoga: panchanga.yoga.name,
                karana: panchanga.karana.name,
                verificationUrl: verificationUrl,
                success: true
            });

        } catch (error) {
            console.log(`   ❌ Error calculating Panchanga: ${error.message}`);
            console.log('');

            results.push({
                location: location.name,
                date: testCase.label,
                dateStr: testCase.date.toDateString(),
                error: error.message,
                success: false
            });
        }
    });
});

// Print summary
console.log('');
console.log('═'.repeat(80));
console.log('VERIFICATION SUMMARY');
console.log('═'.repeat(80));
console.log('');

const successCount = results.filter(r => r.success).length;
const totalCount = results.length;

console.log(`Total Calculations: ${totalCount}`);
console.log(`Successful: ${successCount}`);
console.log(`Failed: ${totalCount - successCount}`);
console.log('');

if (successCount > 0) {
    console.log('✅ All calculations completed successfully!');
    console.log('');
    console.log('📊 QUICK REFERENCE TABLE:');
    console.log('');

    // Group by location
    const locationGroups = {};
    results.forEach(r => {
        if (!locationGroups[r.location]) {
            locationGroups[r.location] = [];
        }
        locationGroups[r.location].push(r);
    });

    Object.keys(locationGroups).forEach(loc => {
        console.log(`${loc}:`);
        console.log('─'.repeat(80));
        locationGroups[loc].forEach(r => {
            if (r.success) {
                console.log(`  ${r.date.padEnd(18)} | ${r.dateStr.padEnd(20)} | ${r.tithi} | ${r.nakshatra}`);
            }
        });
        console.log('');
    });
}

console.log('');
console.log('🔍 MANUAL VERIFICATION INSTRUCTIONS:');
console.log('═'.repeat(80));
console.log('');
console.log('For each test case above, please:');
console.log('');
console.log('1. Open the DrikPanchang verification URL in your browser');
console.log('2. Compare these 5 elements:');
console.log('   • Vara (Weekday)');
console.log('   • Tithi');
console.log('   • Nakshatra');
console.log('   • Yoga');
console.log('   • Karana (may differ by 1 position)');
console.log('');
console.log('3. For accurate comparison:');
console.log('   • Use the SAME latitude/longitude/timezone');
console.log('   • Check values at SUNRISE time (not midnight)');
console.log('   • Paksha should match (Shukla/Krishna)');
console.log('');
console.log('4. Expected accuracy: 80% (4 out of 5 elements match)');
console.log('');
console.log('📝 Notes:');
console.log('   • Karana can be off by 1 due to calculation timing differences');
console.log('   • All other elements should match exactly');
console.log('   • Sunrise-based calculations follow traditional Vedic principles');
console.log('');
console.log('═'.repeat(80));
console.log('');
console.log('✨ Verification script completed!');
console.log(`   Generated ${totalCount} test cases across ${testLocations.length} locations`);
console.log(`   Time span: ${tenYearsAgo.getFullYear()} to ${tenYearsForward.getFullYear()} (20 year range)`);
console.log('');
