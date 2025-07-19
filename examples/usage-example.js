/**
 * Usage examples for the Panchang package
 * 
 * This file demonstrates how to use the package in other projects
 */

// If using in another project, you would import like this:
// const { getPanchanga, getPanchangaReport, AstronomicalCalculator } = require('@bidyashish/panchang');

// For this example, we'll use the local build
const { getPanchanga, getPanchangaReport, AstronomicalCalculator } = require('../dist/index');

console.log('🌟 Astronomical Calculator - Usage Examples\n');

// Example 1: Quick Panchanga calculation using convenience function
console.log('=== Example 1: Quick Panchanga Calculation ===');

const date = new Date('2013-01-18T12:00:00Z');
const latitude = 12.972; // Bangalore, India
const longitude = 77.594;
const timezone = 'Asia/Kolkata';

try {
    const panchanga = getPanchanga(date, latitude, longitude, timezone);
    
    console.log(`Date: ${panchanga.date.toDateString()}`);
    console.log(`Vara: ${panchanga.vara.name}`);
    console.log(`Tithi: ${panchanga.tithi.name} (${panchanga.tithi.percentage.toFixed(1)}% complete)`);
    console.log(`Paksha: ${panchanga.tithi.paksha}`);
    console.log(`Nakshatra: ${panchanga.nakshatra.name} - Pada ${panchanga.nakshatra.pada}`);
    console.log(`Yoga: ${panchanga.yoga.name}`);
    console.log(`Karana: ${panchanga.karana.name}`);
    console.log(`Moon Phase: ${panchanga.moonPhase}`);
    
    if (panchanga.sunrise && panchanga.sunset) {
        console.log(`Sunrise: ${panchanga.sunrise.toLocaleTimeString()}`);
        console.log(`Sunset: ${panchanga.sunset.toLocaleTimeString()}`);
    }
    
    if (panchanga.rahuKaal?.start && panchanga.rahuKaal?.end) {
        console.log(`Rahu Kaal: ${panchanga.rahuKaal.start.toLocaleTimeString()} - ${panchanga.rahuKaal.end.toLocaleTimeString()}`);
    }
    
} catch (error) {
    console.error('Error calculating Panchanga:', error);
}

console.log('\n=== Example 2: Formatted Report ===');

try {
    const report = getPanchangaReport(date, latitude, longitude, timezone);
    console.log(report);
} catch (error) {
    console.error('Error generating report:', error);
}

console.log('\n=== Example 3: Using AstronomicalCalculator Class ===');

try {
    const calculator = new AstronomicalCalculator();
    
    // Calculate for multiple locations
    const locations = [
        { name: 'Bangalore, India', lat: 12.972, lon: 77.594, tz: 'Asia/Kolkata' },
        { name: 'New York, USA', lat: 40.7128, lon: -74.0060, tz: 'America/New_York' },
        { name: 'London, UK', lat: 51.5074, lon: -0.1278, tz: 'Europe/London' }
    ];
    
    locations.forEach(location => {
        console.log(`\n--- ${location.name} ---`);
        
        const panchanga = calculator.calculatePanchanga({
            date: date,
            location: {
                latitude: location.lat,
                longitude: location.lon,
                timezone: location.tz
            }
        });
        
        console.log(`Tithi: ${panchanga.tithi.name}`);
        console.log(`Nakshatra: ${panchanga.nakshatra.name}`);
        console.log(`Yoga: ${panchanga.yoga.name}`);
        
        if (panchanga.sunrise) {
            console.log(`Sunrise: ${panchanga.sunrise.toLocaleString('en-US', { timeZone: location.tz })}`);
        }
    });
    
    // Calculate planetary positions
    console.log('\n--- Planetary Positions ---');
    const positions = calculator.calculatePlanetaryPositions(date, ['Sun', 'Moon', 'Mars', 'Jupiter']);
    
    Object.entries(positions).forEach(([body, pos]) => {
        console.log(`${body}: ${pos.siderealLongitude.toFixed(2)}° (sidereal)`);
    });
    
    // Clean up
    calculator.cleanup();
    
} catch (error) {
    console.error('Error with calculator:', error);
}

console.log('\n=== Example 4: Current Date Panchanga ===');

try {
    const now = new Date();
    const currentPanchanga = getPanchanga(now, latitude, longitude, timezone);
    
    console.log(`\nToday's Panchanga (${now.toDateString()}):`);
    console.log(`Vara: ${currentPanchanga.vara.name}`);
    console.log(`Tithi: ${currentPanchanga.tithi.name} (${currentPanchanga.tithi.paksha} Paksha)`);
    console.log(`Nakshatra: ${currentPanchanga.nakshatra.name}`);
    console.log(`Yoga: ${currentPanchanga.yoga.name}`);
    console.log(`Karana: ${currentPanchanga.karana.name}`);
    
} catch (error) {
    console.error('Error calculating current Panchanga:', error);
}

console.log('\n✅ Examples completed!');
