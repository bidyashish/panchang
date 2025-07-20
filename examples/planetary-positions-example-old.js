#!/usr/bin/env node

/**
 * Example: Getting Current Planetary Positions with Nakshatra and Rashi
 * 
 * This example demonstrates how to get current planetary positions
 * with their corresponding Nakshatra (lunar mansion) and Rashi (zodiac sign)
 * information using the Vedic sidereal system.
 */

const { getCurrentPlanets, getSpecificAyanamsa } = require('../../dist/index.js');

console.log('🌟 Planetary Positions with Nakshatra and Rashi Information');
console.log('=' .repeat(60));

// Get current planetary positions
const now = new Date();
console.log(`\n📅 Date: ${now.toLocaleString()}`);

try {
    // Get planetary positions using Lahiri ayanamsa (default)
    const planets = getCurrentPlanets(now, 1);
    
    // Show which ayanamsa system is being used
    const ayanamsa = getSpecificAyanamsa(1, now);
    console.log(`\n🔭 Ayanamsa: ${ayanamsa.name} (${ayanamsa.degree.toFixed(6)}°)`);
    
    console.log('\n🌌 Planetary Positions:');
    console.log('-'.repeat(80));
    
    planets.forEach(planet => {
        console.log(`\n${getEmoji(planet.planet)} ${planet.planet}:`);
        console.log(`  Sidereal Longitude: ${planet.longitude.toFixed(4)}°`);
        console.log(`  Latitude: ${planet.latitude.toFixed(4)}°`);
        
        console.log(`  🏠 Rashi: ${planet.rashi.name} (${planet.rashi.rashi}) - ${planet.rashi.element} sign`);
        console.log(`    Position in Rashi: ${planet.rashi.degree.toFixed(2)}°`);
        console.log(`    Rashi Ruler: ${planet.rashi.ruler}`);
        
        console.log(`  ⭐ Nakshatra: ${planet.nakshatra.name} (${planet.nakshatra.nakshatra})`);
        console.log(`    Pada: ${planet.nakshatra.pada}/4`);
        console.log(`    Position in Nakshatra: ${planet.nakshatra.degree.toFixed(2)}°`);
        console.log(`    Nakshatra Ruler: ${planet.nakshatra.ruler}`);
        console.log(`    Deity: ${planet.nakshatra.deity}`);
        console.log(`    Symbol: ${planet.nakshatra.symbol}`);
    });

    console.log('\n📊 Summary Table:');
    console.log('-'.repeat(80));
    console.log('Planet    | Rashi          | Nakshatra      | Pada | Ruler');
    console.log('-'.repeat(80));
    
    planets.forEach(planet => {
        const planetName = planet.planet.padEnd(9);
        const rashiName = planet.rashi.name.padEnd(14);
        const nakshatraName = planet.nakshatra.name.padEnd(14);
        const pada = planet.nakshatra.pada.toString();
        const ruler = planet.nakshatra.ruler;
        
        console.log(`${planetName} | ${rashiName} | ${nakshatraName} | ${pada}    | ${ruler}`);
    });

    // Show some interesting combinations
    console.log('\n🔍 Astrological Insights:');
    console.log('-'.repeat(40));
    
    // Find planets in same rashi
    const rashiGroups = {};
    planets.forEach(planet => {
        const rashiName = planet.rashi.name;
        if (!rashiGroups[rashiName]) {
            rashiGroups[rashiName] = [];
        }
        rashiGroups[rashiName].push(planet.planet);
    });
    
    Object.entries(rashiGroups).forEach(([rashi, planetList]) => {
        if (planetList.length > 1) {
            console.log(`• Conjunction in ${rashi}: ${planetList.join(', ')}`);
        }
    });
    
    // Find planets in same nakshatra
    const nakshatraGroups = {};
    planets.forEach(planet => {
        const nakshatraName = planet.nakshatra.name;
        if (!nakshatraGroups[nakshatraName]) {
            nakshatraGroups[nakshatraName] = [];
        }
        nakshatraGroups[nakshatraName].push(planet.planet);
    });
    
    Object.entries(nakshatraGroups).forEach(([nakshatra, planetList]) => {
        if (planetList.length > 1) {
            console.log(`• Same Nakshatra (${nakshatra}): ${planetList.join(', ')}`);
        }
    });

} catch (error) {
    console.error('❌ Error calculating planetary positions:', error.message);
    console.log('\n💡 Tips:');
    console.log('• Make sure the Swiss Ephemeris data is available');
    console.log('• Check that the date is within the ephemeris range');
    console.log('• Try running with a different date if issues persist');
}

function getEmoji(planet) {
    const emojis = {
        'Sun': '☉',
        'Moon': '☽',
        'Mercury': '☿',
        'Venus': '♀',
        'Mars': '♂',
        'Jupiter': '♃',
        'Saturn': '♄'
    };
    return emojis[planet] || '🌟';
}

console.log('\n' + '='.repeat(60));
console.log('✨ This example shows planetary positions in the sidereal system');
console.log('   with traditional Vedic astrological information.');
console.log('📚 For more examples, check the other files in the examples/ directory');
