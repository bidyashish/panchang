import { AstronomicalCalculator } from '../src/index';
import * as fs from 'fs';
import * as path from 'path';

async function testTodaysPanchang() {
    console.log('🔮 Testing Today\'s Panchanga Calculation');
    console.log('='.repeat(50));
    
    // Test date: July 20, 2025
    const today = new Date('2025-07-20T12:00:00Z');
    
    // Test location: Bangalore, India
    const latitude = 12.972;
    const longitude = 77.594;
    const timezone = 'Asia/Kolkata';
    
    console.log(`📅 Date: ${today.toISOString()}`);
    console.log(`📍 Location: Bangalore, India (${latitude}°N, ${longitude}°E)`);
    console.log(`⏰ Timezone: ${timezone}`);
    console.log();
    
    // First, let's check if ephemeris files are available
    console.log('🔍 Checking ephemeris files...');
    const epheDir = path.join(__dirname, '../ephe');
    
    if (fs.existsSync(epheDir)) {
        const files = fs.readdirSync(epheDir).filter(f => f.endsWith('.se1'));
        console.log(`✅ Found ${files.length} ephemeris files in ephe/:`);
        files.forEach(file => {
            const stats = fs.statSync(path.join(epheDir, file));
            console.log(`  - ${file} (${Math.round(stats.size / 1024)}KB)`);
        });
    } else {
        console.log('❌ Ephemeris directory not found at:', epheDir);
    }
    console.log();
    
    try {
        console.log('🧮 Initializing astronomical calculator...');
        const calculator = new AstronomicalCalculator();
        
        console.log('📊 Calculating Panchanga...');
        const panchanga = calculator.calculatePanchanga({
            date: today,
            location: {
                latitude,
                longitude,
                timezone
            }
        });
        
        console.log('✅ Panchanga Results:');
        console.log('─'.repeat(30));
        console.log(`🌙 Tithi: ${panchanga.tithi.name} (${panchanga.tithi.number})`);
        console.log(`⭐ Nakshatra: ${panchanga.nakshatra.name} (${panchanga.nakshatra.number})`);
        console.log(`🧘 Yoga: ${panchanga.yoga.name} (${panchanga.yoga.number})`);
        console.log(`📜 Karana: ${panchanga.karana.name} (${panchanga.karana.number})`);
        console.log(`📅 Vara: ${panchanga.vara.name} (${panchanga.vara.number})`);
        console.log(`🌅 Sunrise: ${panchanga.sunrise}`);
        console.log(`🌇 Sunset: ${panchanga.sunset}`);
        
        // Test planetary positions
        console.log('\n🪐 Testing planetary positions...');
        const planetaryPositions = calculator.calculatePlanetaryPositions(today);
        
        console.log('📍 Planetary Positions (Sidereal):');
        Object.entries(planetaryPositions).forEach(([planet, position]) => {
            console.log(`  ${planet}: ${(position as any).siderealLongitude?.toFixed(2)}°`);
        });
        
        console.log('\n🎉 All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during calculation:', error.message);
        console.error('Stack trace:', error.stack);
        
        console.log('\n🔧 Debug info:');
        console.log('- Swiss Ephemeris path resolution in use');
        console.log('- Ensure ephemeris data files are in ephe/ directory');
        console.log('- Check that the calculation date is within ephemeris range');
    }
}

testTodaysPanchang().catch(console.error);
