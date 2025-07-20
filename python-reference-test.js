#!/usr/bin/env node
/**
 * Comprehensive test against Python reference implementation
 * Tests key calculations for accuracy and ayanamsa flexibility
 */

const { getPanchanga, getPanchangaReport, AstronomicalCalculator } = require('./dist/index.js');

// Test dates from Python reference implementation
const testCases = [
    {
        name: "Python Reference Date1 - July 15, 2009",
        date: new Date('2009-07-15T12:00:00Z'),
        location: { lat: 12.972, lng: 77.594, tz: 'Asia/Kolkata', name: 'Bangalore' },
        expected: {
            // Expected values from Python reference (approximate)
            vara: 3, // Wednesday
            // These values may vary slightly based on exact implementation
        }
    },
    {
        name: "Python Reference Date2 - January 18, 2013", 
        date: new Date('2013-01-18T12:00:00Z'),
        location: { lat: 12.972, lng: 77.594, tz: 'Asia/Kolkata', name: 'Bangalore' },
        expected: {
            vara: 5, // Friday
            // Expected: Saptami, Revati, Siddha from Python reference
        }
    },
    {
        name: "Python Reference Date3 - June 9, 1985",
        date: new Date('1985-06-09T12:00:00Z'),
        location: { lat: 12.972, lng: 77.594, tz: 'Asia/Kolkata', name: 'Bangalore' },
        expected: {
            vara: 0, // Sunday
        }
    },
    {
        name: "Helsinki Test - January 18, 2013",
        date: new Date('2013-01-18T12:00:00Z'), 
        location: { lat: 60.17, lng: 24.935, tz: 'Europe/Helsinki', name: 'Helsinki' },
        expected: {
            vara: 5, // Friday
        }
    }
];

async function testPythonReference() {
    console.log('🔮 COMPREHENSIVE PYTHON REFERENCE VALIDATION\n');
    
    // Test different ayanamsa systems
    const ayanamsaSystems = [
        { id: 1, name: 'Lahiri' },
        { id: 0, name: 'Fagan/Bradley' }, 
        { id: 5, name: 'Krishnamurti' },
        { id: 3, name: 'Raman' }
    ];
    
    console.log('=== AYANAMSA SYSTEM COMPARISON ===');
    for (const system of ayanamsaSystems) {
        const calculator = new AstronomicalCalculator(system.id);
        const testDate = new Date('2025-01-01T12:00:00Z');
        
        const ayanamsaInfo = calculator.getSpecificAyanamsa(system.name, testDate);
        console.log(`${system.name} (ID: ${system.id}): ${ayanamsaInfo?.degree.toFixed(6)}°`);
        
        calculator.cleanup();
    }
    
    console.log('\n=== PANCHANGA CALCULATIONS WITH DIFFERENT AYANAMSA ===');
    
    for (const testCase of testCases) {
        console.log(`\n--- ${testCase.name} ---`);
        
        for (const system of ayanamsaSystems) {
            console.log(`\n🌟 Using ${system.name} Ayanamsa:`);
            
            try {
                const panchanga = await getPanchanga(
                    testCase.date, 
                    testCase.location.lat, 
                    testCase.location.lng, 
                    testCase.location.tz,
                    system.id
                );
                
                console.log(`  📅 Vara: ${panchanga.vara.name} (${panchanga.vara.number})`);
                console.log(`  🌙 Tithi: ${panchanga.tithi.name} (${panchanga.tithi.number}) - ${panchanga.tithi.percentage.toFixed(1)}%`);
                console.log(`  📦 Paksha: ${panchanga.tithi.paksha}`);
                console.log(`  ⭐ Nakshatra: ${panchanga.nakshatra.name} (${panchanga.nakshatra.number}) - Pada ${panchanga.nakshatra.pada}`);
                console.log(`  🔗 Yoga: ${panchanga.yoga.name} (${panchanga.yoga.number})`);
                console.log(`  ⚡ Karana: ${panchanga.karana.name} (${panchanga.karana.number})`);
                console.log(`  🌙 Moon Phase: ${panchanga.moonPhase}`);
                
                // Verify Vara matches expected (this should be consistent across ayanamsa)
                if (testCase.expected.vara !== undefined) {
                    const varaMatches = panchanga.vara.number === testCase.expected.vara;
                    console.log(`  ✅ Vara Check: ${varaMatches ? 'PASS' : 'FAIL'} (Expected: ${testCase.expected.vara}, Got: ${panchanga.vara.number})`);
                }
                
                // Test Rahu Kalam
                if (panchanga.rahuKaal && panchanga.rahuKaal.start && panchanga.rahuKaal.end) {
                    console.log(`  👹 Rahu Kaal: ${panchanga.rahuKaal.start.toLocaleTimeString()} - ${panchanga.rahuKaal.end.toLocaleTimeString()}`);
                }
                
            } catch (error) {
                console.error(`  ❌ Error calculating Panchanga: ${error.message}`);
            }
        }
    }
    
    console.log('\n=== DETAILED PYTHON-STYLE CALCULATION TEST ===');
    
    // Test specific case with detailed output matching Python reference
    const detailTestDate = new Date('2013-01-18T06:00:00Z'); // Sunrise time
    const bangalore = { lat: 12.972, lng: 77.594, tz: 'Asia/Kolkata' };
    
    console.log('Testing Python reference case: 2013-01-18 Bangalore at sunrise');
    console.log('Expected from Python: Vara=Friday, Tithi=Saptami, Nakshatra=Revati, Yoga=Siddha\n');
    
    const calculator = new AstronomicalCalculator(1); // Lahiri ayanamsa
    
    try {
        const panchanga = calculator.calculatePanchanga({
            date: detailTestDate,
            location: { 
                latitude: bangalore.lat, 
                longitude: bangalore.lng, 
                timezone: bangalore.tz 
            }
        });
        
        console.log('🔮 CALCULATED RESULTS:');
        console.log(`Vara: ${panchanga.vara.name} (${panchanga.vara.number})`);
        console.log(`Tithi: ${panchanga.tithi.name} (${panchanga.tithi.number}) - ${panchanga.tithi.percentage.toFixed(1)}% complete`);
        console.log(`Paksha: ${panchanga.tithi.paksha}`);
        console.log(`Nakshatra: ${panchanga.nakshatra.name} (${panchanga.nakshatra.number}) - Pada ${panchanga.nakshatra.pada}`);
        console.log(`Yoga: ${panchanga.yoga.name} (${panchanga.yoga.number})`);
        console.log(`Karana: ${panchanga.karana.name} (${panchanga.karana.number})`);
        console.log(`Moon Phase: ${panchanga.moonPhase}`);
        
        if (panchanga.sunrise && panchanga.sunset) {
            console.log(`Sunrise: ${panchanga.sunrise.toLocaleString('en-US', { timeZone: bangalore.tz })}`);
            console.log(`Sunset: ${panchanga.sunset.toLocaleString('en-US', { timeZone: bangalore.tz })}`);
        }
        
        if (panchanga.rahuKaal && panchanga.rahuKaal.start && panchanga.rahuKaal.end) {
            console.log(`Rahu Kaal: ${panchanga.rahuKaal.start.toLocaleString('en-US', { timeZone: bangalore.tz })} - ${panchanga.rahuKaal.end.toLocaleString('en-US', { timeZone: bangalore.tz })}`);
        }
        
        // Validation checks
        console.log('\n🧪 VALIDATION CHECKS:');
        console.log(`Vara = Friday: ${panchanga.vara.name === 'Friday' ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Tithi Range (1-15): ${panchanga.tithi.number >= 1 && panchanga.tithi.number <= 15 ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Nakshatra Range (1-27): ${panchanga.nakshatra.number >= 1 && panchanga.nakshatra.number <= 27 ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Pada Range (1-4): ${panchanga.nakshatra.pada >= 1 && panchanga.nakshatra.pada <= 4 ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Yoga Range (1-27): ${panchanga.yoga.number >= 1 && panchanga.yoga.number <= 27 ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Karana Range (1-60): ${panchanga.karana.number >= 1 && panchanga.karana.number <= 60 ? '✅ PASS' : '❌ FAIL'}`);
        
        // Test ayanamsa flexibility
        console.log('\n🔄 AYANAMSA FLEXIBILITY TEST:');
        const currentAyanamsa = calculator.getCurrentAyanamsa();
        console.log(`Current Ayanamsa: ${currentAyanamsa} (Lahiri)`);
        
        // Switch to Fagan/Bradley
        calculator.setAyanamsa(0);
        const panchangaFagan = calculator.calculatePanchanga({
            date: detailTestDate,
            location: { 
                latitude: bangalore.lat, 
                longitude: bangalore.lng, 
                timezone: bangalore.tz 
            }
        });
        
        console.log(`After switching to Fagan/Bradley:`);
        console.log(`  Current Ayanamsa: ${calculator.getCurrentAyanamsa()} (Fagan/Bradley)`);
        console.log(`  Nakshatra: ${panchangaFagan.nakshatra.name} (${panchangaFagan.nakshatra.number})`);
        console.log(`  Same Vara: ${panchanga.vara.name === panchangaFagan.vara.name ? '✅ YES' : '❌ NO'} (Should be same)`);
        console.log(`  Different Nakshatra: ${panchanga.nakshatra.name !== panchangaFagan.nakshatra.name ? '✅ YES' : '❌ NO'} (Should be different due to ayanamsa)`);
        
    } catch (error) {
        console.error(`❌ Error in detailed test: ${error.message}`);
    } finally {
        calculator.cleanup();
    }
    
    console.log('\n✅ Python reference validation completed!');
}

// Run the test
testPythonReference().catch(console.error);