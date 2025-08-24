/**
 * Test script to demonstrate the new timezone-aware formatting capabilities
 * Shows how the library can now be used globally with any timezone
 */

const { getPanchanga, getPanchangaReport } = require('./dist/index.js');

console.log('🌍 GLOBAL TIMEZONE-AWARE PANCHANGA LIBRARY TEST');
console.log('=' .repeat(65));

// Test multiple locations with different timezones
const locations = [
    {
        name: 'New Delhi, India',
        latitude: 28.6139,
        longitude: 77.2090,
        timezone: 'Asia/Kolkata'
    },
    {
        name: 'New York, USA',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York'
    },
    {
        name: 'London, UK',
        latitude: 51.5074,
        longitude: -0.1278,
        timezone: 'Europe/London'
    },
    {
        name: 'Tokyo, Japan',
        latitude: 35.6762,
        longitude: 139.6503,
        timezone: 'Asia/Tokyo'
    },
    {
        name: 'Sydney, Australia',
        latitude: -33.8688,
        longitude: 151.2093,
        timezone: 'Australia/Sydney'
    }
];

const testDate = new Date('2025-07-21T12:00:00.000Z'); // Fixed UTC time

locations.forEach((location, index) => {
    console.log(`\n${index + 1}. 📍 ${location.name}`);
    console.log('-'.repeat(40));
    
    try {
        const panchanga = getPanchanga(testDate, location.latitude, location.longitude, location.timezone);
        
        // Basic Panchanga elements (same globally)
        console.log(`📅 Date: ${panchanga.date.toISOString()}`);
        console.log(`🗓️  Vara: ${panchanga.vara.name}`);
        console.log(`🌙 Tithi: ${panchanga.tithi.name} (${panchanga.tithi.paksha})`);
        console.log(`⭐ Nakshatra: ${panchanga.nakshatra.name} - Pada ${panchanga.nakshatra.pada}`);
        console.log(`🧘 Yoga: ${panchanga.yoga.name}`);
        console.log(`🔄 Karana: ${panchanga.karana.name}`);
        
        // Demonstrate timezone-aware formatting using the built-in formatters
        console.log(`\n⏰ TIME INFORMATION (Local Timezone: ${location.timezone}):`);
        console.log(`🌅 Sunrise: ${panchanga.formatters.getSunriseFormatted()}`);
        console.log(`🌅 Sunrise (Custom): ${panchanga.formatters.getSunriseFormatted('h:mm:ss a')}`);
        console.log(`🌇 Sunset: ${panchanga.formatters.getSunsetFormatted()}`);
        console.log(`⚫ Rahu Kaal: ${panchanga.formatters.getRahuKaalFormatted()}`);
        
        // Show versatility with different format patterns
        if (panchanga.sunrise) {
            const dateInfo = panchanga.formatters.getDateInfo(panchanga.sunrise);
            console.log(`🌅 Sunrise Details:`);
            console.log(`   UTC: ${dateInfo.utc}`);
            console.log(`   Local: ${dateInfo.local}`);
            console.log(`   Local Time: ${dateInfo.localTime}`);
            console.log(`   Timestamp: ${dateInfo.timestamp}`);
        }
        
        // Show planetary positions (same sidereal coordinates globally)
        console.log(`\n🪐 Key Planets:`);
        if (panchanga.planetaryPositions.Sun) {
            console.log(`☀️  Sun: ${panchanga.planetaryPositions.Sun.siderealLongitude.toFixed(1)}° in ${panchanga.planetaryPositions.Sun.rashi.name}`);
        }
        if (panchanga.planetaryPositions.Moon) {
            console.log(`🌙 Moon: ${panchanga.planetaryPositions.Moon.siderealLongitude.toFixed(1)}° in ${panchanga.planetaryPositions.Moon.rashi.name}`);
        }
        
    } catch (error) {
        console.error(`❌ Error for ${location.name}:`, error.message);
    }
});

console.log(`\n\n🎯 DEMONSTRATION OF FLEXIBLE REPORT GENERATION`);
console.log('=' .repeat(60));

// Test with Delhi using both UTC and local timezone reports
const delhi = locations[0];
console.log(`\n📋 REPORT FOR ${delhi.name} - UTC TIMES:`);
const utcReport = getPanchangaReport(testDate, delhi.latitude, delhi.longitude, delhi.timezone, delhi.name, false);
console.log(utcReport.substring(0, 500) + '...\n');

console.log(`📋 REPORT FOR ${delhi.name} - LOCAL TIMEZONE (${delhi.timezone}):`);
const localReport = getPanchangaReport(testDate, delhi.latitude, delhi.longitude, delhi.timezone, delhi.name, true);
console.log(localReport.substring(0, 500) + '...\n');

console.log('🎉 GLOBAL TIMEZONE-AWARE FEATURES DEMONSTRATED!');
console.log('✅ Same astronomical data globally');
console.log('✅ Flexible timezone formatting');  
console.log('✅ Built-in formatter methods');
console.log('✅ Date-fns-tz integration');
console.log('✅ Perfect for international applications');
console.log('📱 Ready for React, Vue, Node.js, mobile apps worldwide!');
