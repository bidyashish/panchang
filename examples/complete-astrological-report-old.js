#!/usr/bin/env node

/**
 * Complete Astrological Report Example
 * 
 * This example demonstrates the full power of the astronomical calculator
 * by combining Panchanga data, Ayanamsa information, and planetary positions
 * with Nakshatra and Rashi details for a comprehensive astrological analysis.
 */

const { 
    getPanchangaReport, 
    getCurrentPlanets, 
    getAyanamsa, 
    getSpecificAyanamsa 
} = require('../dist/index.js');

console.log('🌟 Complete Astrological Report');
console.log('=' .repeat(60));

// Configuration
const date = new Date();
const location = {
    latitude: 28.6139,   // New Delhi
    longitude: 77.2090,
    timezone: 'Asia/Kolkata',
    name: 'New Delhi, India'
};

console.log(`\n📅 Date: ${date.toLocaleDateString('en-IN', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
})}`);
console.log(`📍 Location: ${location.name} (${location.latitude}°N, ${location.longitude}°E)`);

try {
    // Generate Panchanga Report
    console.log('\n' + '='.repeat(30) + ' PANCHANGA ' + '='.repeat(30));
    const panchangaReport = getPanchangaReport(
        date, 
        location.latitude, 
        location.longitude, 
        location.timezone,
        location.name
    );
    console.log(panchangaReport);
    
    // Show Ayanamsa Information
    console.log('\n' + '='.repeat(29) + ' AYANAMSA ' + '='.repeat(29));
    const currentAyanamsa = getSpecificAyanamsa(1, date);
    if (currentAyanamsa) {
        console.log(`🔭 Current Ayanamsa System: ${currentAyanamsa.name}`);
        console.log(`   Value: ${currentAyanamsa.degree.toFixed(6)}°`);
        console.log(`   Description: ${currentAyanamsa.description}`);
    }
    
    // Compare multiple ayanamsa systems
    console.log('\n📊 Ayanamsa Comparison:');
    const ayanamsaComparison = [1, 3, 5, 27]; // Lahiri, Raman, KP, Galactic Center
    ayanamsaComparison.forEach(id => {
        const ayanamsa = getSpecificAyanamsa(id, date);
        if (ayanamsa) {
            console.log(`   ${ayanamsa.name.padEnd(20)}: ${ayanamsa.degree.toFixed(4)}°`);
        }
    });
    
    // Planetary Positions
    console.log('\n' + '='.repeat(26) + ' PLANETARY POSITIONS ' + '='.repeat(26));
    const planets = getCurrentPlanets(date, 1); // Using Lahiri
    
    console.log('\n🌌 Detailed Planetary Analysis:');
    console.log('-'.repeat(75));
    
    planets.forEach(planet => {
        const emoji = getPlanetEmoji(planet.planet);
        console.log(`\n${emoji} ${planet.planet.toUpperCase()}:`);
        console.log(`   Position: ${planet.longitude.toFixed(4)}° (Sidereal)`);
        console.log(`   Rashi: ${planet.rashi.name} (${planet.rashi.rashi}) - ${planet.rashi.element} Sign`);
        console.log(`   Degree in Rashi: ${planet.rashi.degree.toFixed(2)}°`);
        console.log(`   Rashi Lord: ${planet.rashi.ruler}`);
        console.log(`   Nakshatra: ${planet.nakshatra.name} (${planet.nakshatra.nakshatra})`);
        console.log(`   Pada: ${planet.nakshatra.pada}/4`);
        console.log(`   Nakshatra Lord: ${planet.nakshatra.ruler}`);
        console.log(`   Deity: ${planet.nakshatra.deity}`);
        console.log(`   Symbol: ${planet.nakshatra.symbol}`);
        
        // Add strength analysis
        const strength = analyzePlanetStrength(planet);
        console.log(`   Strength: ${strength.level} ${strength.indicator}`);
        if (strength.note) {
            console.log(`   Note: ${strength.note}`);
        }
    });
    
    // Astrological Insights
    console.log('\n' + '='.repeat(27) + ' ASTROLOGICAL INSIGHTS ' + '='.repeat(27));
    
    // Conjunctions
    const conjunctions = findConjunctions(planets);
    if (conjunctions.length > 0) {
        console.log('\n🔗 Planetary Conjunctions:');
        conjunctions.forEach(conj => {
            console.log(`   • ${conj.planets.join(' + ')} in ${conj.rashi} (${conj.degrees.toFixed(1)}° orb)`);
        });
    }
    
    // Element distribution
    console.log('\n🌊 Elemental Balance:');
    const elements = analyzeElements(planets);
    Object.entries(elements).forEach(([element, data]) => {
        const percentage = (data.count / planets.length * 100).toFixed(1);
        console.log(`   ${element.padEnd(6)}: ${data.count} planets (${percentage}%) - ${data.planets.join(', ')}`);
    });
    
    // Nakshatra rulers
    console.log('\n⭐ Nakshatra Lord Distribution:');
    const nakshatraLords = analyzeNakshatraLords(planets);
    Object.entries(nakshatraLords).forEach(([lord, data]) => {
        if (data.count > 1) {
            console.log(`   ${lord}: ${data.planets.join(', ')} (${data.count} planets)`);
        }
    });
    
    // Special combinations
    console.log('\n🎯 Special Observations:');
    const observations = findSpecialCombinations(planets);
    observations.forEach(obs => {
        console.log(`   • ${obs}`);
    });
    
    console.log('\n' + '='.repeat(73));
    console.log('🙏 This report combines traditional Panchanga calculations with');
    console.log('   precise planetary positions for comprehensive astrological analysis.');
    console.log('✨ Generated using Swiss Ephemeris for maximum accuracy.');
    
} catch (error) {
    console.error('\n❌ Error generating report:', error.message);
}

// Helper Functions

function getPlanetEmoji(planet) {
    const emojis = {
        'Sun': '☉', 'Moon': '☽', 'Mercury': '☿', 'Venus': '♀',
        'Mars': '♂', 'Jupiter': '♃', 'Saturn': '♄'
    };
    return emojis[planet] || '🌟';
}

function analyzePlanetStrength(planet) {
    // Exaltation signs
    const exaltation = {
        'Sun': 'Mesha', 'Moon': 'Vrishabha', 'Mercury': 'Kanya',
        'Venus': 'Meena', 'Mars': 'Makara', 'Jupiter': 'Karka', 'Saturn': 'Tula'
    };
    
    // Own signs
    const ownSigns = {
        'Sun': ['Simha'], 'Moon': ['Karka'], 'Mercury': ['Mithuna', 'Kanya'],
        'Venus': ['Vrishabha', 'Tula'], 'Mars': ['Mesha', 'Vrishchika'],
        'Jupiter': ['Dhanu', 'Meena'], 'Saturn': ['Makara', 'Kumbha']
    };
    
    if (exaltation[planet.planet] === planet.rashi.name) {
        return { level: 'Excellent', indicator: '⭐⭐⭐', note: 'Exalted - Maximum strength' };
    } else if (ownSigns[planet.planet]?.includes(planet.rashi.name)) {
        return { level: 'Very Good', indicator: '⭐⭐', note: 'Own sign - Strong' };
    } else if (planet.rashi.ruler === planet.planet) {
        return { level: 'Good', indicator: '⭐', note: 'Comfortable position' };
    } else {
        return { level: 'Average', indicator: '○', note: null };
    }
}

function findConjunctions(planets, orbLimit = 10) {
    const conjunctions = [];
    const rashiGroups = {};
    
    // Group by rashi
    planets.forEach(planet => {
        if (!rashiGroups[planet.rashi.name]) {
            rashiGroups[planet.rashi.name] = [];
        }
        rashiGroups[planet.rashi.name].push(planet);
    });
    
    // Find conjunctions within orb limit
    Object.entries(rashiGroups).forEach(([rashi, groupPlanets]) => {
        if (groupPlanets.length > 1) {
            // Calculate max orb within group
            const positions = groupPlanets.map(p => p.rashi.degree);
            const maxDiff = Math.max(...positions) - Math.min(...positions);
            
            if (maxDiff <= orbLimit) {
                conjunctions.push({
                    rashi: rashi,
                    planets: groupPlanets.map(p => p.planet),
                    degrees: maxDiff
                });
            }
        }
    });
    
    return conjunctions;
}

function analyzeElements(planets) {
    const elements = { Fire: { count: 0, planets: [] }, Earth: { count: 0, planets: [] }, 
                     Air: { count: 0, planets: [] }, Water: { count: 0, planets: [] } };
    
    planets.forEach(planet => {
        const element = planet.rashi.element;
        elements[element].count++;
        elements[element].planets.push(planet.planet);
    });
    
    return elements;
}

function analyzeNakshatraLords(planets) {
    const lords = {};
    
    planets.forEach(planet => {
        const lord = planet.nakshatra.ruler;
        if (!lords[lord]) {
            lords[lord] = { count: 0, planets: [] };
        }
        lords[lord].count++;
        lords[lord].planets.push(planet.planet);
    });
    
    return lords;
}

function findSpecialCombinations(planets) {
    const observations = [];
    
    // Find planets in same nakshatra
    const nakshatraGroups = {};
    planets.forEach(planet => {
        if (!nakshatraGroups[planet.nakshatra.name]) {
            nakshatraGroups[planet.nakshatra.name] = [];
        }
        nakshatraGroups[planet.nakshatra.name].push(planet.planet);
    });
    
    Object.entries(nakshatraGroups).forEach(([nakshatra, planetList]) => {
        if (planetList.length > 1) {
            observations.push(`${planetList.join(' & ')} are together in ${nakshatra} nakshatra`);
        }
    });
    
    // Check for retrogrades (simplified - would need velocity data)
    // observations.push('All planets are in direct motion (retrograde analysis requires velocity data)');
    
    // Element dominance
    const elements = analyzeElements(planets);
    const maxElement = Object.entries(elements).reduce((max, [element, data]) => 
        data.count > max.count ? { element, count: data.count } : max, { element: '', count: 0 });
    
    if (maxElement.count >= 3) {
        observations.push(`${maxElement.element} element dominance with ${maxElement.count} planets`);
    }
    
    return observations;
}
