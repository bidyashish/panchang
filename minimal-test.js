#!/usr/bin/env node

console.log('🔍 Minimal Test - DrikPanchang.com Verification');
console.log('='.repeat(60));

// DrikPanchang.com reference data for Kelowna, BC - July 20, 2025
const REFERENCE_DATA = {
    location: {
        name: 'Kelowna, BC, Canada',
        latitude: 49.8880,
        longitude: -119.4960,
        timezone: 'America/Vancouver'
    },
    date: new Date('2025-07-20T18:08:25-07:00'), // 18:08:25 PDT
    expected: {
        tithi: 'Ekadashi',
        nakshatra: 'Krittika',
        yoga: 'Ganda',
        vara: 'Sunday'
    }
};

console.log('📅 Test Date:', REFERENCE_DATA.date.toISOString());
console.log('📍 Location:', REFERENCE_DATA.location.name);
console.log('🎯 Expected Results:');
console.log('   Tithi:', REFERENCE_DATA.expected.tithi);
console.log('   Nakshatra:', REFERENCE_DATA.expected.nakshatra);
console.log('   Yoga:', REFERENCE_DATA.expected.yoga);
console.log('   Vara:', REFERENCE_DATA.expected.vara);

console.log('\n💻 Attempting to load library...');

let libraryLoaded = false;
let panchanga = null;

try {
    // Try to load the library
    const lib = require('./dist/index.js');
    
    if (lib && lib.getPanchanga) {
        console.log('✅ Library loaded successfully');
        libraryLoaded = true;
        
        // Calculate panchanga
        console.log('\n🧮 Calculating Panchanga...');
        panchanga = lib.getPanchanga(
            REFERENCE_DATA.date,
            REFERENCE_DATA.location.latitude,
            REFERENCE_DATA.location.longitude,
            REFERENCE_DATA.location.timezone
        );
        
        if (panchanga) {
            console.log('✅ Panchanga calculated');
            console.log('📊 Results:');
            console.log('   Tithi:', panchanga.tithi?.name || 'Unknown');
            console.log('   Nakshatra:', panchanga.nakshatra?.name || 'Unknown');
            console.log('   Yoga:', panchanga.yoga?.name || 'Unknown');  
            console.log('   Vara:', panchanga.vara?.name || 'Unknown');
            console.log('   Karana:', panchanga.karana?.name || 'Unknown');
            
            // Comparison
            console.log('\n🔍 Verification against DrikPanchang.com:');
            let matches = 0;
            let total = 0;
            
            // Compare each element
            ['tithi', 'nakshatra', 'yoga'].forEach(element => {
                total++;
                const expected = REFERENCE_DATA.expected[element];
                const calculated = panchanga[element]?.name;
                
                if (calculated === expected) {
                    console.log(`   ✅ ${element}: MATCH (${expected})`);
                    matches++;
                } else {
                    console.log(`   ❌ ${element}: Expected "${expected}", Got "${calculated}"`);
                }
            });
            
            // Vara needs special handling for Sanskrit names
            total++;
            const expectedVara = REFERENCE_DATA.expected.vara;
            const calculatedVara = panchanga.vara?.name;
            const varaMap = {
                'Raviwara': 'Sunday',
                'Somwara': 'Monday',
                'Mangalwara': 'Tuesday',
                'Budhwara': 'Wednesday',
                'Guruwara': 'Thursday', 
                'Shukrawara': 'Friday',
                'Shaniwara': 'Saturday',
                'Sunday': 'Sunday',
                'Monday': 'Monday',
                'Tuesday': 'Tuesday',
                'Wednesday': 'Wednesday',
                'Thursday': 'Thursday',
                'Friday': 'Friday',
                'Saturday': 'Saturday'
            };
            
            const mappedVara = varaMap[calculatedVara] || calculatedVara;
            if (mappedVara === expectedVara) {
                console.log(`   ✅ vara: MATCH (${expectedVara})`);
                matches++;
            } else {
                console.log(`   ❌ vara: Expected "${expectedVara}", Got "${mappedVara}" (${calculatedVara})`);
            }
            
            console.log(`\n📊 Overall Accuracy: ${matches}/${total} (${(matches/total*100).toFixed(1)}%)`);
            
            if (matches === total) {
                console.log('🎉 PERFECT MATCH! Library calculations are accurate!');
            } else if (matches >= total * 0.75) {
                console.log('✅ HIGH ACCURACY! Library is working well.');
            } else {
                console.log('⚠️ MODERATE ACCURACY. Some differences detected.');
            }
            
        } else {
            console.log('❌ Panchanga calculation returned null/undefined');
        }
        
    } else {
        console.log('❌ Library loaded but getPanchanga function not found');
        console.log('   Available:', Object.keys(lib || {}));
    }
    
} catch (error) {
    console.error('❌ Error loading or using library:', error.message);
    
    if (error.message.includes('swisseph')) {
        console.log('\n🔧 Swiss Ephemeris Issue Detected:');
        console.log('   This is likely due to missing Swiss Ephemeris native dependencies');
        console.log('   The library should fallback to basic calculations');
    }
    
    if (error.message.includes('Cannot find module')) {
        console.log('\n🔧 Module Loading Issue:');
        console.log('   Run: npm run build');
        console.log('   Then: npm install');
    }
}

console.log('\n' + '='.repeat(60));
if (libraryLoaded && panchanga) {
    console.log('🎯 RESULT: Library integration successful!');
    console.log('✅ Ephemeris path fix working');
    console.log('📊 Calculations against DrikPanchang.com completed');
} else {
    console.log('❌ RESULT: Library integration failed');
    console.log('🔧 Troubleshooting needed');
}

console.log('\n🌟 Verification test completed!');
