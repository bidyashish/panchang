#!/usr/bin/env node

console.log('🔍 Quick Library Test');
console.log('====================');

try {
    console.log('1. Loading library...');
    const { 
        getPanchanga, 
        getPanchangaReport, 
        getCurrentPlanets, 
        getAyanamsa, 
        getSpecificAyanamsa,
        AstronomicalCalculator 
    } = require('./dist/index.js');
    
    console.log('✅ Library loaded successfully');
    console.log('   Available functions: getPanchanga, getPanchangaReport, getCurrentPlanets, getAyanamsa, getSpecificAyanamsa, AstronomicalCalculator');
    
    console.log('\n2. Testing getPanchanga for Kelowna, BC...');
    const date = new Date('2025-07-20T18:08:25-07:00'); // July 20, 2025, 6:08 PM PDT
    const latitude = 49.8880; // Kelowna coordinates
    const longitude = -119.4960;
    const timezone = 'America/Vancouver';
    
    const panchanga = getPanchanga(date, latitude, longitude, timezone);
    
    console.log('✅ Panchanga calculated successfully');
    console.log('   Results:');
    console.log('   - Tithi:', panchanga.tithi?.name || 'Unknown');
    console.log('   - Nakshatra:', panchanga.nakshatra?.name || 'Unknown');
    console.log('   - Yoga:', panchanga.yoga?.name || 'Unknown');
    console.log('   - Vara:', panchanga.vara?.name || 'Unknown');
    console.log('   - Karana:', panchanga.karana?.name || 'Unknown');
    
    console.log('\n3. Comparing with DrikPanchang.com reference...');
    const expected = {
        tithi: 'Ekadashi',
        nakshatra: 'Krittika',
        yoga: 'Ganda',
        vara: 'Sunday',
    };
    
    let matches = 0;
    let total = 0;
    
    // Tithi comparison
    total++;
    if (panchanga.tithi?.name === expected.tithi) {
        console.log('   ✅ Tithi: MATCH (' + expected.tithi + ')');
        matches++;
    } else {
        console.log('   ❌ Tithi: Expected', expected.tithi, 'Got', panchanga.tithi?.name);
    }
    
    // Nakshatra comparison
    total++;
    if (panchanga.nakshatra?.name === expected.nakshatra) {
        console.log('   ✅ Nakshatra: MATCH (' + expected.nakshatra + ')');
        matches++;
    } else {
        console.log('   ❌ Nakshatra: Expected', expected.nakshatra, 'Got', panchanga.nakshatra?.name);
    }
    
    // Yoga comparison
    total++;
    if (panchanga.yoga?.name === expected.yoga) {
        console.log('   ✅ Yoga: MATCH (' + expected.yoga + ')');
        matches++;
    } else {
        console.log('   ❌ Yoga: Expected', expected.yoga, 'Got', panchanga.yoga?.name);
    }
    
    // Vara comparison - need to map Sanskrit to English
    total++;
    const varaMap = {
        'Raviwara': 'Sunday',
        'Sunday': 'Sunday',
        // Add other mappings as needed
    };
    const calculatedVara = varaMap[panchanga.vara?.name] || panchanga.vara?.name;
    
    if (calculatedVara === expected.vara) {
        console.log('   ✅ Vara: MATCH (' + expected.vara + ')');
        matches++;
    } else {
        console.log('   ❌ Vara: Expected', expected.vara, 'Got', calculatedVara);
    }
    
    console.log('\n📊 Verification Summary:');
    console.log('   Matches:', matches + '/' + total, '(' + (matches/total*100).toFixed(1) + '%)');
    
    if (matches === total) {
        console.log('🎉 Perfect match with DrikPanchang.com!');
        console.log('✅ Library is working correctly');
        console.log('🎯 Ephemeris path fix successful');
    } else if (matches >= total * 0.75) {
        console.log('✅ Good accuracy - Library is working well');
        console.log('📝 Minor differences are normal between calculation systems');
    } else {
        console.log('⚠️  Significant differences detected');
        console.log('🔧 May need ayanamsa or calculation method adjustment');
    }
    
    console.log('\n🌟 Quick test complete!');
    
} catch (error) {
    console.error('❌ Error:', error.message);
    console.error('   Stack:', error.stack);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if "npm run build" completed successfully');
    console.log('2. Verify Swiss Ephemeris dependency: npm install swisseph');
    console.log('3. Check ephemeris data files in ephe/ directory');
}
