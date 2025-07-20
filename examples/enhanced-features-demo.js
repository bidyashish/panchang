/**
 * Complete demonstration of the new getAyanamsa function and location names
 * Shows the enhanced Panchanga calculator features
 */

const { getPanchanga, getPanchangaReport, getAyanamsa, getSpecificAyanamsa, AstronomicalCalculator } = require('../dist/index.js');

console.log('🌟 Enhanced Astronomical Calculator - New Features Demo\n');

try {
    const testDate = new Date('2025-07-19T12:00:00Z');
    const location = {
        name: 'Varanasi, Uttar Pradesh, India',
        latitude: 25.3176,
        longitude: 82.9739,
        timezone: 'Asia/Kolkata'
    };
    
    console.log('=== ✨ NEW FEATURE 1: Ayanamsa Systems ===\n');
    
    // Show popular ayanamsa systems
    const popularAyanamsas = ['Lahiri', 'Krishnamurti', 'Raman', 'Fagan/Bradley', 'Yukteshwar'];
    
    console.log(`📅 Ayanamsa values for ${testDate.toDateString()}:\n`);
    console.log('System'.padEnd(15) + ' | ' + 'Degree'.padEnd(12) + ' | Description');
    console.log('-'.repeat(60));
    
    popularAyanamsas.forEach(systemName => {
        const ayanamsa = getSpecificAyanamsa(systemName, testDate);
        if (ayanamsa) {
            const name = ayanamsa.name.padEnd(15);
            const degree = `${ayanamsa.degree.toFixed(6)}°`.padEnd(12);
            const description = ayanamsa.description;
            console.log(`${name}| ${degree}| ${description}`);
        }
    });
    
    console.log(`\n🔢 Total ayanamsa systems available: ${getAyanamsa(testDate).length}`);
    console.log('\n' + '='.repeat(70) + '\n');
    
    console.log('=== ✨ NEW FEATURE 2: Location Names in Reports ===\n');
    
    // Demonstrate location name in Panchanga report
    const reportWithLocationName = getPanchangaReport(
        testDate,
        location.latitude,
        location.longitude,
        location.timezone,
        location.name
    );
    
    console.log(reportWithLocationName);
    console.log('\n' + '='.repeat(70) + '\n');
    
    console.log('=== 🔗 COMBINED FEATURES: Calculator with Both New Features ===\n');
    
    const calculator = new AstronomicalCalculator();
    
    try {
        // Get Panchanga with location name
        const panchanga = calculator.calculatePanchanga({
            date: testDate,
            location: {
                latitude: location.latitude,
                longitude: location.longitude,
                timezone: location.timezone,
                name: location.name
            }
        });
        
        // Get ayanamsa information
        const lahiri = calculator.getSpecificAyanamsa('Lahiri', testDate);
        const krishnamurti = calculator.getSpecificAyanamsa('Krishnamurti', testDate);
        
        console.log('📍 Enhanced Panchanga Summary:');
        console.log(`Location: ${location.name}`);
        console.log(`Date: ${panchanga.date.toDateString()}`);
        console.log(`Vara: ${panchanga.vara.name}`);
        console.log(`Tithi: ${panchanga.tithi.name} (${panchanga.tithi.percentage.toFixed(1)}% complete)`);
        console.log(`Nakshatra: ${panchanga.nakshatra.name}`);
        console.log(`Yoga: ${panchanga.yoga.name}`);
        console.log(`Karana: ${panchanga.karana.name}`);
        console.log(`Moon Phase: ${panchanga.moonPhase}`);
        
        if (lahiri && krishnamurti) {
            console.log('\n🌟 Ayanamsa Context:');
            console.log(`Lahiri Ayanamsa: ${lahiri.degree.toFixed(6)}°`);
            console.log(`Krishnamurti Ayanamsa: ${krishnamurti.degree.toFixed(6)}°`);
            console.log(`Difference: ${Math.abs(lahiri.degree - krishnamurti.degree).toFixed(6)}°`);
        }
        
    } finally {
        calculator.cleanup();
    }
    
    console.log('\n' + '='.repeat(70) + '\n');
    
    console.log('=== 📊 HISTORICAL COMPARISON ===\n');
    
    // Show how ayanamsa has changed over time
    const historicalDates = [
        { date: new Date('1900-01-01'), label: '1900 (Past)' },
        { date: new Date('2000-01-01'), label: '2000 (Y2K)' },
        { date: new Date('2025-07-19'), label: '2025 (Today)' },
        { date: new Date('2050-01-01'), label: '2050 (Future)' }
    ];
    
    console.log('Year'.padEnd(15) + ' | ' + 'Lahiri Ayanamsa'.padEnd(15) + ' | Change from 1900');
    console.log('-'.repeat(55));
    
    const baseYear = getSpecificAyanamsa('Lahiri', historicalDates[0].date);
    
    historicalDates.forEach(({ date, label }) => {
        const ayanamsa = getSpecificAyanamsa('Lahiri', date);
        if (ayanamsa && baseYear) {
            const change = ayanamsa.degree - baseYear.degree;
            const yearLabel = label.padEnd(15);
            const degreeValue = `${ayanamsa.degree.toFixed(6)}°`.padEnd(15);
            const changeValue = change > 0 ? `+${change.toFixed(6)}°` : `${change.toFixed(6)}°`;
            console.log(`${yearLabel}| ${degreeValue}| ${changeValue}`);
        }
    });
    
    console.log('\n✅ Enhanced calculator demo completed successfully!\n');
    console.log('🚀 New Features Summary:');
    console.log('   1. ✨ getAyanamsa() - Access to 40+ ayanamsa systems');
    console.log('   2. ✨ getSpecificAyanamsa() - Query specific ayanamsa by name or ID');
    console.log('   3. ✨ Location names in reports - Better formatted output');
    console.log('   4. ✨ Historical ayanamsa comparison - Track precession over time');
    console.log('\n🎯 Perfect for:');
    console.log('   • Vedic astrologers needing different ayanamsa systems');
    console.log('   • Researchers studying precession');
    console.log('   • Applications requiring professional report formatting');
    console.log('   • Historical astronomical calculations');
    
} catch (error) {
    console.error('❌ Error in enhanced features demo:', error);
    process.exit(1);
}
