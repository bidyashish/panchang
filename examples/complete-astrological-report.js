#!/usr/bin/env node/** * Complete Astrological Report Generator *  * Combines all features of the astronomical calculator: * - Comprehensive Panchanga calculation * - Ayanamsa system analysis * - Planetary positions with Nakshatra and Rashi * - Astrological insights and analysis * - Professional report formatting *  * @author Astronomical Calculator Team * @version 2.0.0 */const {     getPanchangaReport,     getCurrentPlanets,     getAyanamsa,     getSpecificAyanamsa } = require('../dist/index.js');const { CONFIG, FORMAT, EMOJI, ERROR_HANDLER, ANALYZER } = require('./common-utils.js');/** * Main execution function */async function generateCompleteReport() {    console.log(FORMAT.section('🌟 COMPLETE ASTROLOGICAL REPORT', 70));    console.log();        // Configuration    const date = new Date();    const location = CONFIG.LOCATIONS.NEW_DELHI; // Default location        console.log(`${EMOJI.GENERAL.calendar} Date: ${FORMAT.date(date)}`);    console.log(`${EMOJI.GENERAL.location} Location: ${location.name}`);    console.log(`${EMOJI.GENERAL.info} Coordinates: ${FORMAT.coordinate(location.latitude, location.longitude)}`);    console.log(`${EMOJI.GENERAL.info} Timezone: ${location.timezone}`);    console.log();        try {        // Section 1: Panchanga Report        await generatePanchangaSection(date, location);                // Section 2: Ayanamsa Analysis        await generateAyanamsaSection(date);                // Section 3: Planetary Positions        await generatePlanetarySection(date);                // Section 4: Astrological Analysis        await generateAstrologicalAnalysis(date);                // Section 5: Report Summary        await generateReportSummary();                ERROR_HANDLER.success('Complete astrological report generated successfully!');            } catch (error) {        console.error(`${EMOJI.GENERAL.error} Report generation failed:`, error.message);        process.exit(1);    }}/** * Generate Panchanga section */async function generatePanchangaSection(date, location) {    console.log(FORMAT.section('PANCHANGA CALCULATION', 60));    console.log();        const result = await ERROR_HANDLER.wrap(async () => {        const panchangaReport = getPanchangaReport(            date,             location.latitude,             location.longitude,             location.timezone,            location.name        );                if (!panchangaReport) {            throw new Error('Failed to generate Panchanga report');        }                // Clean up and format the report        const cleanReport = panchangaReport            .split('\n')            .map(line => line.trim())            .filter(line => line.length > 0)            .join('\n');                console.log(cleanReport);        console.log();                return panchangaReport;            }, 'Panchanga report generation');        return result;}/** * Generate Ayanamsa analysis section */async function generateAyanamsaSection(date) {    console.log(FORMAT.section('AYANAMSA SYSTEM ANALYSIS', 60));    console.log();        const result = await ERROR_HANDLER.wrap(async () => {        // Get current ayanamsa        const currentAyanamsa = getSpecificAyanamsa(1, date); // Lahiri        if (currentAyanamsa) {            console.log(`${EMOJI.GENERAL.telescope} Primary Ayanamsa System: ${currentAyanamsa.name}`);            console.log(`   Value: ${currentAyanamsa.degree.toFixed(6)}°`);            console.log(`   Description: ${currentAyanamsa.description}`);            console.log();        }                // Compare popular systems        console.log(FORMAT.subsection('Popular Ayanamsa Comparison'));                const popularSystems = CONFIG.POPULAR_AYANAMSAS.slice(0, 4);        const widths = [18, 15, 45];                console.log(FORMAT.tableRow(['System', 'Value (°)', 'Description'], widths));        console.log(FORMAT.tableSeparator(widths));                const ayanamsaResults = [];                for (const systemName of popularSystems) {            const ayanamsa = getSpecificAyanamsa(systemName, date);            if (ayanamsa) {                const row = [                    ayanamsa.name,                    ayanamsa.degree.toFixed(6),                    ayanamsa.description.substring(0, 42) + '...'                ];                console.log(FORMAT.tableRow(row, widths));                ayanamsaResults.push(ayanamsa);            }        }                // Show degree differences        if (ayanamsaResults.length > 1) {            console.log();            console.log(FORMAT.subsection('Degree Variations'));                        const baseSystem = ayanamsaResults[0];            ayanamsaResults.slice(1).forEach(system => {                const diff = system.degree - baseSystem.degree;                const sign = diff >= 0 ? '+' : '';                console.log(`   ${system.name} vs ${baseSystem.name}: ${sign}${diff.toFixed(6)}°`);            });        }                console.log();        return ayanamsaResults;            }, 'Ayanamsa analysis');        return result;}/** * Generate planetary positions section */async function generatePlanetarySection(date) {    console.log(FORMAT.section('PLANETARY POSITIONS', 60));    console.log();        const result = await ERROR_HANDLER.wrap(async () => {        const planets = getCurrentPlanets(date, 1); // Using Lahiri                if (!planets || planets.length === 0) {            throw new Error('No planetary positions available');        }                console.log(`${EMOJI.GENERAL.star} Sidereal Planetary Positions (${planets.length} planets):`);        console.log();                // Detailed planetary information        planets.forEach(planet => {            const emoji = EMOJI.PLANETS[planet.planet] || '🌟';            const elementEmoji = EMOJI.ELEMENTS[planet.rashi.element] || '';                        console.log(`${emoji} ${planet.planet.toUpperCase()}:`);            console.log(`   Longitude: ${planet.longitude.toFixed(4)}° | Latitude: ${planet.latitude.toFixed(4)}°`);            console.log(`   ${elementEmoji} Rashi: ${planet.rashi.name} (${planet.rashi.rashi}) - ${planet.rashi.degree.toFixed(2)}° in sign`);            console.log(`   ⭐ Nakshatra: ${planet.nakshatra.name} (${planet.nakshatra.nakshatra}) - Pada ${planet.nakshatra.pada}/4`);            console.log(`   Rulers: Rashi - ${planet.rashi.ruler} | Nakshatra - ${planet.nakshatra.ruler}`);            console.log(`   Deity: ${planet.nakshatra.deity} | Symbol: ${planet.nakshatra.symbol}`);                        // Add strength assessment            const strength = assessPlanetaryStrength(planet);            console.log(`   Strength: ${strength.level} ${strength.indicator}`);            if (strength.note) {                console.log(`   Note: ${strength.note}`);            }            console.log();        });                // Summary table        console.log(FORMAT.subsection('Quick Reference Table'));                const tableWidths = [12, 14, 16, 6, 14];        console.log(FORMAT.tableRow(['Planet', 'Rashi', 'Nakshatra', 'Pada', 'Strength'], tableWidths));        console.log(FORMAT.tableSeparator(tableWidths));                planets.forEach(planet => {            const strength = assessPlanetaryStrength(planet);            const row = [                planet.planet,                planet.rashi.name,                planet.nakshatra.name,                planet.nakshatra.pada.toString(),                strength.level            ];            console.log(FORMAT.tableRow(row, tableWidths));        });                console.log();        return planets;            }, 'planetary positions analysis');        return result;}/** * Generate comprehensive astrological analysis */async function generateAstrologicalAnalysis(date) {    console.log(FORMAT.section('ASTROLOGICAL ANALYSIS', 60));    console.log();        const result = await ERROR_HANDLER.wrap(async () => {        const planets = getCurrentPlanets(date, 1);                if (!planets) {            throw new Error('Could not retrieve planetary data for analysis');        }                // 1. Conjunction Analysis        const conjunctions = ANALYZER.findConjunctions(planets);        if (conjunctions.length > 0) {            console.log(`${EMOJI.GENERAL.star} Planetary Conjunctions:`);            conjunctions.forEach(conj => {                const orb = conj.orb.toFixed(1);                console.log(`   • ${conj.planets.join(' conjunct ')} in ${conj.rashi} (${orb}° orb)`);                                // Add interpretation                if (conj.planets.length === 2) {                    const interpretation = interpretConjunction(conj.planets[0], conj.planets[1]);                    if (interpretation) {                        console.log(`     ${interpretation}`);                    }                }            });            console.log();        } else {            console.log(`${EMOJI.GENERAL.info} No close planetary conjunctions found.`);            console.log();        }                // 2. Elemental Analysis        console.log(`${EMOJI.GENERAL.earth} Elemental Distribution:`);        const elements = ANALYZER.analyzeElements(planets);
        
        Object.entries(elements).forEach(([element, data]) => {
            const percentage = (data.count / planets.length * 100).toFixed(1);
            const elementEmoji = EMOJI.ELEMENTS[element] || '';
            const bar = '█'.repeat(Math.round(data.count * 3)) + '░'.repeat(Math.round((7 - data.count) * 3));
            
            console.log(`   ${elementEmoji} ${element.padEnd(6)}: ${data.count}/7 (${percentage}%) ${bar}`);
            console.log(`     Planets: ${data.planets.join(', ')}`);
        });
        
        // Element dominance interpretation
        const dominantElement = Object.entries(elements).reduce((max, [element, data]) => 
            data.count > max.count ? { element, count: data.count } : max, { element: '', count: 0 });
        
        if (dominantElement.count >= 3) {
            console.log(`   ${EMOJI.GENERAL.info} ${dominantElement.element} element dominance suggests ${interpretElementDominance(dominantElement.element)}`);
        }
        console.log();
        
        // 3. Nakshatra Analysis
        const nakshatraGroups = ANALYZER.findNakshatraGroups(planets);
        if (nakshatraGroups.length > 0) {
            console.log(`${EMOJI.GENERAL.star} Nakshatra Groupings:`);
            nakshatraGroups.forEach(([nakshatra, planetList]) => {
                console.log(`   • ${planetList.join(' & ')} in ${nakshatra} nakshatra`);
                
                // Add nakshatra characteristics
                const characteristics = getNakshatraCharacteristics(nakshatra);
                if (characteristics) {
                    console.log(`     Influence: ${characteristics}`);
                }
            });
            console.log();
        }
        
        // 4. Special Yogas and Combinations
        console.log(`${EMOJI.GENERAL.star} Special Observations:`);
        const specialObservations = generateSpecialObservations(planets);
        if (specialObservations.length > 0) {
            specialObservations.forEach(obs => {
                console.log(`   • ${obs}`);
            });
        } else {
            console.log(`   • No special planetary combinations detected at this time`);
        }
        console.log();
        
        // 5. Rashi Lord Analysis
        console.log(`${EMOJI.GENERAL.telescope} Rashi Lord Distribution:`);
        const rashiLords = {};
        planets.forEach(planet => {
            const lord = planet.rashi.ruler;
            if (!rashiLords[lord]) {
                rashiLords[lord] = [];
            }
            rashiLords[lord].push(planet.planet);
        });
        
        Object.entries(rashiLords).forEach(([lord, planetList]) => {
            console.log(`   ${lord}: ${planetList.join(', ')} (${planetList.length} planet${planetList.length > 1 ? 's' : ''})`);
        });
        console.log();
        
        return {
            conjunctions,
            elements,
            nakshatraGroups,
            specialObservations,
            rashiLords
        };
        
    }, 'astrological analysis');
    
    return result;
}

/**
 * Generate report summary
 */
async function generateReportSummary() {
    console.log(FORMAT.section('REPORT SUMMARY', 60));
    console.log();
    
    console.log(`${EMOJI.GENERAL.success} Report Generation Completed`);
    console.log();
    console.log('📋 This comprehensive astrological report includes:');
    console.log('   • Traditional Panchanga calculations');
    console.log('   • Precise planetary positions using Swiss Ephemeris');
    console.log('   • Sidereal zodiac with Lahiri ayanamsa');
    console.log('   • Nakshatra and Rashi analysis');
    console.log('   • Astrological insights and interpretations');
    console.log();
    console.log('🔬 Technical Details:');
    console.log('   • Coordinate system: Sidereal');
    console.log('   • Ephemeris: Swiss Ephemeris (high precision)');
    console.log('   • Ayanamsa: Lahiri (Chitrapaksha) - Indian Government standard');
    console.log('   • Calendar: Gregorian with timezone conversion');
    console.log();
    console.log('⚠️ Disclaimer:');
    console.log('   This report is generated for educational and informational purposes.');
    console.log('   Astrological interpretations are based on traditional principles.');
    console.log('   For professional consultation, consult a qualified astrologer.');
    console.log();
    console.log(FORMAT.section('END OF REPORT', 60));
}

/**
 * Assess planetary strength for interpretation
 */
function assessPlanetaryStrength(planet) {
    // Exaltation signs
    const exaltations = {
        'Sun': 'Mesha', 'Moon': 'Vrishabha', 'Mercury': 'Kanya',
        'Venus': 'Meena', 'Mars': 'Makara', 'Jupiter': 'Karka', 'Saturn': 'Tula'
    };
    
    // Own signs
    const ownSigns = {
        'Sun': ['Simha'], 'Moon': ['Karka'], 'Mercury': ['Mithuna', 'Kanya'],
        'Venus': ['Vrishabha', 'Tula'], 'Mars': ['Mesha', 'Vrishchika'],
        'Jupiter': ['Dhanu', 'Meena'], 'Saturn': ['Makara', 'Kumbha']
    };
    
    // Debilitation signs
    const debilitations = {
        'Sun': 'Tula', 'Moon': 'Vrishchika', 'Mercury': 'Meena',
        'Venus': 'Kanya', 'Mars': 'Karka', 'Jupiter': 'Makara', 'Saturn': 'Mesha'
    };
    
    const rashiName = planet.rashi.name;
    
    if (exaltations[planet.planet] === rashiName) {
        return { 
            level: 'Excellent', 
            indicator: '⭐⭐⭐', 
            note: 'Exalted - Maximum strength and positive expression' 
        };
    } else if (ownSigns[planet.planet]?.includes(rashiName)) {
        return { 
            level: 'Very Good', 
            indicator: '⭐⭐', 
            note: 'Own sign - Strong and comfortable position' 
        };
    } else if (debilitations[planet.planet] === rashiName) {
        return { 
            level: 'Weak', 
            indicator: '○○○', 
            note: 'Debilitated - Challenges in expression, needs support' 
        };
    } else if (planet.rashi.ruler === planet.planet) {
        return { 
            level: 'Good', 
            indicator: '⭐', 
            note: 'Friendly territory - Comfortable expression' 
        };
    } else {
        return { 
            level: 'Average', 
            indicator: '○', 
            note: null 
        };
    }
}

/**
 * Interpret planetary conjunctions
 */
function interpretConjunction(planet1, planet2) {
    const conjunctionMeanings = {
        'Sun-Moon': 'New Moon conjunction - Fresh beginnings, unity of consciousness',
        'Sun-Mercury': 'Combust Mercury - Communication and intellect influenced by ego',
        'Sun-Venus': 'Combust Venus - Relationships and values influenced by pride',
        'Moon-Mercury': 'Emotional intelligence - Good for communication and learning',
        'Moon-Venus': 'Emotional harmony - Favorable for relationships and creativity',
        'Mercury-Venus': 'Artistic communication - Excellent for writing and arts',
        'Mars-Saturn': 'Disciplined action - Potential for both achievement and frustration',
        'Jupiter-Saturn': 'Wisdom meets discipline - Major cycle conjunction'
    };
    
    const key1 = `${planet1}-${planet2}`;
    const key2 = `${planet2}-${planet1}`;
    
    return conjunctionMeanings[key1] || conjunctionMeanings[key2] || null;
}

/**
 * Interpret elemental dominance
 */
function interpretElementDominance(element) {
    const interpretations = {
        'Fire': 'dynamic energy, leadership qualities, and pioneering spirit',
        'Earth': 'practical nature, stability, and material focus',
        'Air': 'intellectual approach, communication skills, and adaptability',
        'Water': 'emotional depth, intuition, and sensitivity'
    };
    
    return interpretations[element] || 'balanced elemental nature';
}

/**
 * Get nakshatra characteristics
 */
function getNakshatraCharacteristics(nakshatra) {
    const characteristics = {
        'Ashwini': 'Healing abilities, speed, pioneering nature',
        'Bharani': 'Creativity, restraint, life-death cycles',
        'Krittika': 'Purification, sharp intellect, leadership',
        'Rohini': 'Beauty, fertility, material growth',
        'Mrigashira': 'Seeking, curiosity, gentle nature',
        'Ardra': 'Transformation, emotional intensity, renewal',
        'Punarvasu': 'Renewal, optimism, return to origins',
        'Pushya': 'Nourishment, spiritual growth, protection',
        'Ashlesha': 'Hypnotic power, wisdom, mysticism'
    };
    
    return characteristics[nakshatra] || null;
}

/**
 * Generate special observations
 */
function generateSpecialObservations(planets) {
    const observations = [];
    
    // Check for retrograde motion (simplified)
    // Note: Actual retrograde calculation would require velocity data
    
    // Check for planets near rashi boundaries
    const boundaryPlanets = planets.filter(planet => 
        planet.rashi.degree <= 3 || planet.rashi.degree >= 27
    );
    
    if (boundaryPlanets.length > 0) {
        observations.push(`${boundaryPlanets.length} planet(s) near rashi boundaries (sandhi): ${boundaryPlanets.map(p => p.planet).join(', ')}`);
    }
    
    // Check for multiple planets in one rashi (stellium)
    const rashiCounts = {};
    planets.forEach(planet => {
        rashiCounts[planet.rashi.name] = (rashiCounts[planet.rashi.name] || 0) + 1;
    });
    
    Object.entries(rashiCounts).forEach(([rashi, count]) => {
        if (count >= 3) {
            observations.push(`Stellium in ${rashi} with ${count} planets - concentrated energy`);
        }
    });
    
    // Check for planets in gandanta (junction points)
    const gandantaNakshatras = ['Ashlesha', 'Jyeshtha', 'Revati'];
    const gandantaPlanets = planets.filter(planet => 
        gandantaNakshatras.includes(planet.nakshatra.name) && 
        (planet.nakshatra.degree >= 10 || planet.nakshatra.degree <= 3.33)
    );
    
    if (gandantaPlanets.length > 0) {
        observations.push(`Gandanta influence detected: ${gandantaPlanets.map(p => p.planet).join(', ')}`);
    }
    
    return observations;
}

// Execute if run directly
if (require.main === module) {
    generateCompleteReport().catch(error => {
        console.error(`${EMOJI.GENERAL.error} Fatal error:`, error);
        process.exit(1);
    });
}

// Export for use as module
module.exports = {
    generateCompleteReport,
    generatePanchangaSection,
    generateAyanamsaSection,
    generatePlanetarySection,
    generateAstrologicalAnalysis,
    generateReportSummary
};
