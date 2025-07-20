/**
 * Example demonstrating the getAyanamsa function
 * Shows all available ayanamsa systems with their current degrees
 */

const { getAyanamsa, getSpecificAyanamsa, AstronomicalCalculator } = require('../dist/index.js');

console.log('=== Ayanamsa Systems Example ===\n');

try {
    // Get all ayanamsa systems for current date
    const currentDate = new Date();
    console.log(`📅 Date: ${currentDate.toDateString()}\n`);
    
    const allAyanamsas = getAyanamsa(currentDate);
    
    console.log(`🌟 Found ${allAyanamsas.length} ayanamsa systems:\n`);
    
    // Display all ayanamsa systems in a formatted table
    console.log('ID'.padEnd(3) + ' | ' + 'Name'.padEnd(25) + ' | ' + 'Degree'.padEnd(10) + ' | Description');
    console.log('-'.repeat(90));
    
    allAyanamsas.forEach(ayanamsa => {
        const id = ayanamsa.id.toString().padEnd(3);
        const name = ayanamsa.name.padEnd(25);
        const degree = `${ayanamsa.degree.toFixed(6)}°`.padEnd(10);
        const description = ayanamsa.description;
        
        console.log(`${id}| ${name}| ${degree}| ${description}`);
    });
    
    console.log('\n=== Popular Ayanamsa Systems ===\n');
    
    // Get specific popular ayanamsa systems
    const popularSystems = ['Lahiri', 'Krishnamurti', 'Raman', 'Fagan/Bradley'];
    
    popularSystems.forEach(systemName => {
        const ayanamsa = getSpecificAyanamsa(systemName, currentDate);
        if (ayanamsa) {
            console.log(`🔸 ${ayanamsa.name}: ${ayanamsa.degree.toFixed(6)}°`);
            console.log(`   ${ayanamsa.description}\n`);
        }
    });
    
    console.log('=== Historical Comparison ===\n');
    
    // Compare Lahiri ayanamsa over different years
    const historicalDates = [
        new Date('1900-01-01'),
        new Date('1950-01-01'), 
        new Date('2000-01-01'),
        new Date('2025-01-01')
    ];
    
    console.log('Lahiri Ayanamsa Historical Values:');
    historicalDates.forEach(date => {
        const lahiri = getSpecificAyanamsa('Lahiri', date);
        if (lahiri) {
            console.log(`📆 ${date.getFullYear()}: ${lahiri.degree.toFixed(6)}°`);
        }
    });
    
    console.log('\n=== Using AstronomicalCalculator Class ===\n');
    
    // Demonstrate usage through the main calculator class
    const calculator = new AstronomicalCalculator();
    
    try {
        const testDate = new Date('2013-01-18T12:00:00Z'); // Reference date from tests
        console.log(`📅 Test Date: ${testDate.toISOString()}\n`);
        
        // Get top 5 ayanamsa systems by degree value
        const top5 = calculator.getAyanamsa(testDate).slice(0, 5);
        
        console.log('🔝 Top 5 Ayanamsa Systems (by degree):');
        top5.forEach((ayanamsa, index) => {
            console.log(`${index + 1}. ${ayanamsa.name}: ${ayanamsa.degree.toFixed(6)}°`);
        });
        
        console.log('\n🎯 Specific System Lookup:');
        const krishnamurti = calculator.getSpecificAyanamsa('Krishnamurti', testDate);
        if (krishnamurti) {
            console.log(`${krishnamurti.name} (ID: ${krishnamurti.id}): ${krishnamurti.degree.toFixed(6)}°`);
        }
        
        const byId = calculator.getSpecificAyanamsa(5, testDate); // Krishnamurti by ID
        if (byId) {
            console.log(`By ID ${byId.id}: ${byId.name} = ${byId.degree.toFixed(6)}°`);
        }
        
    } finally {
        calculator.cleanup();
    }
    
    console.log('\n✅ Ayanamsa example completed successfully!');
    
} catch (error) {
    console.error('❌ Error in ayanamsa example:', error);
    process.exit(1);
}
