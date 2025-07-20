/**
 * Example demonstrating location names in Panchanga reports
 * Shows how to include location names in the generated reports
 */

const { getPanchanga, getPanchangaReport, AstronomicalCalculator } = require('../../dist/index.js');

console.log('=== Location Name in Panchanga Reports Example ===\n');

try {
    const testDate = new Date('2025-07-19T12:00:00Z');
    
    console.log('🌍 Testing with different locations and names:\n');
    
    // Define test locations with names
    const locations = [
        {
            name: 'New Delhi, India',
            latitude: 28.6139,
            longitude: 77.2090,
            timezone: 'Asia/Kolkata'
        },
        {
            name: 'Mumbai, Maharashtra',
            latitude: 19.0760,
            longitude: 72.8777,
            timezone: 'Asia/Kolkata'
        },
        {
            name: 'New York City, USA',
            latitude: 40.7128,
            longitude: -74.0060,
            timezone: 'America/New_York'
        },
        {
            name: 'London, United Kingdom',
            latitude: 51.5074,
            longitude: -0.1278,
            timezone: 'Europe/London'
        },
        {
            name: 'Tokyo, Japan',
            latitude: 35.6762,
            longitude: 139.6503,
            timezone: 'Asia/Tokyo'
        }
    ];
    
    // Test using the convenience function with location names
    console.log('=== Using getPanchangaReport() with location names ===\n');
    
    const delhiReport = getPanchangaReport(
        testDate, 
        locations[0].latitude, 
        locations[0].longitude, 
        locations[0].timezone,
        locations[0].name  // Location name parameter
    );
    
    console.log(delhiReport);
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test without location name for comparison
    const noNameReport = getPanchangaReport(
        testDate, 
        locations[1].latitude, 
        locations[1].longitude, 
        locations[1].timezone
        // No location name provided
    );
    
    console.log('Report without location name:');
    console.log(noNameReport);
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test using AstronomicalCalculator class with location names
    console.log('=== Using AstronomicalCalculator class with location names ===\n');
    
    const calculator = new AstronomicalCalculator();
    
    try {
        locations.forEach((location, index) => {
            console.log(`📍 Location ${index + 1}: ${location.name}`);
            
            const report = calculator.generatePanchangaReport({
                date: testDate,
                location: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    timezone: location.timezone,
                    name: location.name
                }
            });
            
            console.log(report);
            console.log('\n' + '-'.repeat(50) + '\n');
        });
        
        // Test with coordinates only (no name)
        console.log('📍 Test without location name:');
        const noNameTestReport = calculator.generatePanchangaReport({
            date: testDate,
            location: {
                latitude: 12.972,
                longitude: 77.594,
                timezone: 'Asia/Kolkata'
                // No name field
            }
        });
        
        console.log(noNameTestReport);
        
    } finally {
        calculator.cleanup();
    }
    
    console.log('\n✅ Location name example completed successfully!');
    console.log('\n📝 Summary:');
    console.log('- When location name is provided, it appears in the report header');
    console.log('- Coordinates are shown as "Coordinates:" when name is present');
    console.log('- When no name is provided, only coordinates are shown as "Location:"');
    
} catch (error) {
    console.error('❌ Error in location name example:', error);
    process.exit(1);
}
