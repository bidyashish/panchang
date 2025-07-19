const { Ephemeris } = require('./dist/calculations/ephemeris');
const { Planetary } = require('./dist/calculations/planetary');
const { Panchanga } = require('./dist/panchanga/index');

console.log('=== Panchanga Validation Test ===\n');

// Test date from Python reference: 2013-01-18
const testDate = new Date('2013-01-18T12:00:00Z');
console.log(`Test date: ${testDate.toISOString()}`);

// Bangalore location from Python reference
const bangalore = { latitude: 12.972, longitude: 77.594, timezone: 'Asia/Kolkata' };

try {
    const ephemeris = new Ephemeris();
    const planetary = new Planetary();
    const panchanga = new Panchanga();

    // Test at sunrise time as per Python reference
    const sunrise = ephemeris.calculateSunrise(testDate, bangalore);
    console.log(`Calculated sunrise: ${sunrise?.toISOString()}`);
    
    // Test both at noon and sunrise
    const testTimes = [
        { time: testDate, label: 'Noon UTC' },
        { time: sunrise || testDate, label: 'Sunrise' },
        { time: new Date('2013-01-18T06:00:00Z'), label: 'Sunrise approx' }
    ];

    testTimes.forEach(({ time, label }) => {
        console.log(`\n=== Testing at ${label} (${time.toISOString()}) ===`);
        
        const sunPos = ephemeris.calculateSiderealPosition(time, 'Sun');
        const moonPos = ephemeris.calculateSiderealPosition(time, 'Moon');

        console.log(`Sun sidereal longitude: ${sunPos.longitude.toFixed(6)}°`);
        console.log(`Moon sidereal longitude: ${moonPos.longitude.toFixed(6)}°`);

        const tithi = planetary.calculateTithi(sunPos.longitude, moonPos.longitude);
        const nakshatra = ephemeris.calculateNakshatra(moonPos.longitude);
        const yoga = planetary.calculateYoga(sunPos.longitude, moonPos.longitude);
        const karana = planetary.calculateKarana(sunPos.longitude, moonPos.longitude);

        console.log(`Tithi: ${tithi.name} (${tithi.tithi}) - Expected: Saptami (7)`);
        console.log(`Nakshatra: ${nakshatra.name} (${nakshatra.nakshatra}) - Expected: Revati (27)`);
        console.log(`Yoga: ${yoga.name} (${yoga.yoga}) - Expected: Siddha (21)`);
        console.log(`Karana: ${karana.name} (${karana.karana}) - Expected: Vanija (14)`);

        const moonPhase = (moonPos.longitude - sunPos.longitude + 360) % 360;
        console.log(`Moon phase: ${moonPhase.toFixed(6)}°, Tithi calc: ${Math.ceil(moonPhase / 12)}`);
    });

    // Test Vara (day-independent)
    const panchangaData = panchanga.calculatePanchanga(testDate, bangalore);
    console.log(`\nVara: ${panchangaData.vara.name} (${panchangaData.vara.vara}) - Expected: Friday (5)`);

} catch (error) {
    console.error('Error:', error);
}
