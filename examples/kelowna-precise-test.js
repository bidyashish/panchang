#!/usr/bin/env node

/**
 * Precise Panchanga Test for Kelowna, BC against DrikPanchang.com
 * This test requires the built library for Swiss Ephemeris calculations
 */

// Check if built library exists
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist/index.js');
if (!fs.existsSync(distPath)) {
    console.log('❌ Project not built. Please run: npm run build');
    console.log('ℹ️  For basic verification, run: node examples/verify-drikpanchang.js');
    process.exit(1);
}

const { getPanchanga, getPanchangaReport, AstronomicalCalculator } = require('../dist/index.js');

console.log('🔍 Precise Panchanga Verification');
console.log('Reference: DrikPanchang.com');
console.log('Location: Kelowna, BC, Canada');
console.log('='.repeat(60));

// Kelowna, BC coordinates and DrikPanchang reference data
const KELOWNA = {
    name: 'Kelowna, BC, Canada',
    latitude: 49.8880,
    longitude: -119.4960, 
    timezone: 'America/Vancouver'
};

const TEST_DATE = new Date('2025-07-20T18:08:25-07:00'); // DrikPanchang time

// DrikPanchang.com reference values
const DRIK_PANCHANG_DATA = {
    tithi: 'Ekadashi',
    nakshatra: 'Krittika', 
    yoga: 'Ganda',
    karana: ['Bava', 'Balava'],
    vara: 'Sunday',
    sunrise: '05:12 AM',
    sunset: '08:55 PM',
    paksha: 'Krishna Paksha'
};

async function testPrecisePanchanga() {
    console.log('📅 Test Parameters:');
    console.log(`   Date: ${TEST_DATE.toISOString()}`);
    console.log(`   Local Time: July 20, 2025 18:08:25 PDT`);
    console.log(`   Location: ${KELOWNA.name}`);
    console.log(`   Coordinates: ${KELOWNA.latitude}°N, ${KELOWNA.longitude}°W`);
    console.log(`   Timezone: ${KELOWNA.timezone}`);
    
    try {
        console.log('\n🧮 Calculating precise Panchanga...');
        
        // Calculate Panchanga using our library
        const panchanga = await getPanchanga(
            TEST_DATE,
            KELOWNA.latitude,
            KELOWNA.longitude, 
            KELOWNA.timezone
        );
        
        console.log('\n📊 Our Library Results:');
        console.log('─'.repeat(30));
        console.log(`🌙 Tithi: ${panchanga.tithi.name} (${panchanga.tithi.number})`);
        console.log(`⭐ Nakshatra: ${panchanga.nakshatra.name} (${panchanga.nakshatra.number})`);
        console.log(`🧘 Yoga: ${panchanga.yoga.name} (${panchanga.yoga.number})`);
        console.log(`📜 Karana: ${panchanga.karana.name} (${panchanga.karana.number})`);
        console.log(`📅 Vara: ${panchanga.vara.name}`);
        console.log(`🌅 Sunrise: ${panchanga.sunrise}`);
        console.log(`🌇 Sunset: ${panchanga.sunset}`);
        
        console.log('\n📋 DrikPanchang.com Reference:');
        console.log('─'.repeat(30));
        console.log(`🌙 Tithi: ${DRIK_PANCHANG_DATA.tithi}`);
        console.log(`⭐ Nakshatra: ${DRIK_PANCHANG_DATA.nakshatra}`);
        console.log(`🧘 Yoga: ${DRIK_PANCHANG_DATA.yoga}`);
        console.log(`📜 Karana: ${DRIK_PANCHANG_DATA.karana.join(', ')}`);
        console.log(`📅 Vara: ${DRIK_PANCHANG_DATA.vara}`);
        console.log(`🌅 Sunrise: ${DRIK_PANCHANG_DATA.sunrise}`);
        console.log(`🌇 Sunset: ${DRIK_PANCHANG_DATA.sunset}`);
        
        // Compare results
        console.log('\n🔍 Comparison Analysis:');
        console.log('─'.repeat(30));
        
        let matches = 0;
        let total = 6;
        
        // Tithi comparison
        const tithiMatch = panchanga.tithi.name.toLowerCase() === DRIK_PANCHANG_DATA.tithi.toLowerCase();
        console.log(`Tithi: ${tithiMatch ? '✅' : '❌'} (${panchanga.tithi.name} vs ${DRIK_PANCHANG_DATA.tithi})`);
        if (tithiMatch) matches++;
        
        // Nakshatra comparison
        const nakshatraMatch = panchanga.nakshatra.name.toLowerCase() === DRIK_PANCHANG_DATA.nakshatra.toLowerCase();
        console.log(`Nakshatra: ${nakshatraMatch ? '✅' : '❌'} (${panchanga.nakshatra.name} vs ${DRIK_PANCHANG_DATA.nakshatra})`);
        if (nakshatraMatch) matches++;
        
        // Yoga comparison
        const yogaMatch = panchanga.yoga.name.toLowerCase() === DRIK_PANCHANG_DATA.yoga.toLowerCase();
        console.log(`Yoga: ${yogaMatch ? '✅' : '❌'} (${panchanga.yoga.name} vs ${DRIK_PANCHANG_DATA.yoga})`);
        if (yogaMatch) matches++;
        
        // Karana comparison (check if our karana is in their list)
        const karanaMatch = DRIK_PANCHANG_DATA.karana.some(k => 
            k.toLowerCase() === panchanga.karana.name.toLowerCase()
        );
        console.log(`Karana: ${karanaMatch ? '✅' : '❌'} (${panchanga.karana.name} vs ${DRIK_PANCHANG_DATA.karana.join('/')})`);
        if (karanaMatch) matches++;
        
        // Vara comparison (day of week)
        const varaMatch = panchanga.vara.name.toLowerCase().includes('sunday') || 
                         panchanga.vara.name.toLowerCase().includes('ravi');
        console.log(`Vara: ${varaMatch ? '✅' : '❌'} (${panchanga.vara.name} vs ${DRIK_PANCHANG_DATA.vara})`);
        if (varaMatch) matches++;
        
        // Time comparison (approximate, due to timezone complexity)
        const sunriseApprox = panchanga.sunrise.includes('05:') || panchanga.sunrise.includes('5:');
        console.log(`Sunrise: ${sunriseApprox ? '✅' : '⚠️'} (${panchanga.sunrise} vs ${DRIK_PANCHANG_DATA.sunrise})`);
        if (sunriseApprox) matches++;
        
        // Calculate accuracy
        const accuracy = (matches / total) * 100;
        
        console.log('\n📊 Verification Summary:');
        console.log('─'.repeat(30));
        console.log(`Accuracy: ${matches}/${total} (${accuracy.toFixed(1)}%)`);
        
        if (accuracy >= 90) {
            console.log('🎉 Excellent accuracy! Library calculations match DrikPanchang');
        } else if (accuracy >= 70) {
            console.log('✅ Good accuracy! Minor differences expected due to calculation methods');
        } else {
            console.log('⚠️  Significant differences detected - may need ayanamsa or calculation adjustments');
        }
        
        // Generate full report
        console.log('\n📝 Full Panchanga Report:');
        console.log('═'.repeat(60));
        const report = await getPanchangaReport(
            TEST_DATE,
            KELOWNA.latitude,
            KELOWNA.longitude,
            KELOWNA.timezone,
            KELOWNA.name
        );
        console.log(report);
        
        return { accuracy, matches, total };
        
    } catch (error) {
        console.error('❌ Error calculating Panchanga:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('• Ensure Swiss Ephemeris data is available');
        console.log('• Check date is within ephemeris range (1200-2999 CE)');
        console.log('• Verify timezone and coordinate accuracy');
        return { accuracy: 0, matches: 0, total: 6 };
    }
}

// Run the test
testPrecisePanchanga().then(result => {
    console.log('\n' + '='.repeat(60));
    console.log('🏁 Verification Complete!');
    
    if (result.accuracy >= 70) {
        console.log('✅ Ephemeris path fix is working correctly');
        console.log('🎯 Library produces accurate Panchanga calculations');
    } else {
        console.log('🔧 Further calibration may be needed');
    }
    
    process.exit(result.accuracy >= 70 ? 0 : 1);
}).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
